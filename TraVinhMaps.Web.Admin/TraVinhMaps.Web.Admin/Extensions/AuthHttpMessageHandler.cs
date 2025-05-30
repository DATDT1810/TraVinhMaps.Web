using System.Net;
using TraVinhMaps.Web.Admin.Services.Auth;

namespace TraVinhMaps.Web.Admin.Extensions
{
    public class AuthHttpMessageHandler : DelegatingHandler
    {
        private readonly ITokenService _tokenService;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger<AuthHttpMessageHandler> _logger;
        private static readonly HttpRequestOptionsKey<bool> RetryFlagKey = new("X-Retry-Attempted");
        private static readonly SemaphoreSlim _refreshSemaphore = new(1, 1);

        public AuthHttpMessageHandler(
            ITokenService tokenService,
            IHttpContextAccessor httpContextAccessor,
            ILogger<AuthHttpMessageHandler> logger)
        {
            _tokenService = tokenService;
            _httpContextAccessor = httpContextAccessor;
            _logger = logger;
        }

        protected override async Task<HttpResponseMessage> SendAsync(
            HttpRequestMessage request, CancellationToken cancellationToken)
        {
            var httpContext = _httpContextAccessor.HttpContext;
            if (httpContext == null)
            {
                _logger.LogWarning("HttpContext is null in AuthHttpMessageHandler");
                return await base.SendAsync(request, cancellationToken);
            }

            // Add session ID to request headers
            await AddAuthenticationHeaders(request, httpContext);

            var response = await base.SendAsync(request, cancellationToken);

            // Handle 401 Unauthorized responses
            if (response.StatusCode == HttpStatusCode.Unauthorized &&
                ShouldAttemptTokenRefresh(request))
            {
                var refreshedResponse = await HandleUnauthorizedResponse(request, httpContext, cancellationToken);
                if (refreshedResponse != null)
                {
                    response.Dispose();
                    return refreshedResponse;
                }
            }

            return response;
        }

        private async Task AddAuthenticationHeaders(HttpRequestMessage request, HttpContext httpContext)
        {
            var sessionId = _tokenService.GetSessionId(httpContext);
            if (!string.IsNullOrEmpty(sessionId))
            {
                // Remove existing sessionId header if present
                request.Headers.Remove("sessionId");
                request.Headers.Add("sessionId", sessionId);

                _logger.LogDebug("Added sessionId header to request: {RequestUri}", request.RequestUri);
            }
            else
            {
                _logger.LogWarning("No sessionId available for request: {RequestUri}", request.RequestUri);
            }
        }

        private static bool ShouldAttemptTokenRefresh(HttpRequestMessage request)
        {
            // Don't retry if we've already attempted a refresh
            return !request.Options.TryGetValue(RetryFlagKey, out var hasRetried) || !hasRetried;
        }

        private async Task<HttpResponseMessage?> HandleUnauthorizedResponse(
            HttpRequestMessage originalRequest,
            HttpContext httpContext,
            CancellationToken cancellationToken)
        {
            // Use semaphore to prevent concurrent refresh attempts
            await _refreshSemaphore.WaitAsync(cancellationToken);
            try
            {
                _logger.LogInformation("Received 401 Unauthorized for {RequestUri}. Attempting token refresh.",
                    originalRequest.RequestUri);

                // Check if we have a refresh token
                var refreshToken = _tokenService.GetRefreshToken(httpContext);
                if (string.IsNullOrEmpty(refreshToken))
                {
                    _logger.LogWarning("No refresh token available. Cannot refresh authentication.");
                    return null;
                }

                // Double-check if session is now valid (another thread might have refreshed)
                var currentSessionId = _tokenService.GetSessionId(httpContext);
                if (!string.IsNullOrEmpty(currentSessionId))
                {
                    _logger.LogInformation("Session ID is now available after waiting. Retrying request.");
                    return await CreateRetryRequest(originalRequest, currentSessionId, cancellationToken);
                }

                // Attempt token refresh
                bool refreshed = await _tokenService.RefreshTokensIfNeededAsync(httpContext);
                if (!refreshed)
                {
                    _logger.LogWarning("Token refresh failed for request: {RequestUri}", originalRequest.RequestUri);
                    return null;
                }

                // Get the new session ID and retry
                var newSessionId = _tokenService.GetSessionId(httpContext);
                if (!string.IsNullOrEmpty(newSessionId))
                {
                    _logger.LogInformation("Token refreshed successfully. Retrying request: {RequestUri}",
                        originalRequest.RequestUri);
                    return await CreateRetryRequest(originalRequest, newSessionId, cancellationToken);
                }

                _logger.LogError("Token refresh appeared successful but no new sessionId available");
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Exception occurred during token refresh for request: {RequestUri}",
                    originalRequest.RequestUri);
                return null;
            }
            finally
            {
                _refreshSemaphore.Release();
            }
        }

        private async Task<HttpResponseMessage> CreateRetryRequest(
            HttpRequestMessage originalRequest,
            string sessionId,
            CancellationToken cancellationToken)
        {
            // Create a new request (HttpRequestMessage can only be sent once)
            var retryRequest = new HttpRequestMessage(originalRequest.Method, originalRequest.RequestUri);

            // Copy headers (excluding sessionId which we'll add fresh)
            foreach (var header in originalRequest.Headers.Where(h => h.Key != "sessionId"))
            {
                retryRequest.Headers.TryAddWithoutValidation(header.Key, header.Value);
            }

            // Add the new sessionId
            retryRequest.Headers.Add("sessionId", sessionId);

            // Copy content if present
            if (originalRequest.Content != null)
            {
                var contentBytes = await originalRequest.Content.ReadAsByteArrayAsync();
                retryRequest.Content = new ByteArrayContent(contentBytes);

                // Copy content headers
                foreach (var header in originalRequest.Content.Headers)
                {
                    retryRequest.Content.Headers.TryAddWithoutValidation(header.Key, header.Value);
                }
            }

            // Mark that we've attempted a retry to prevent infinite loops
            retryRequest.Options.Set(RetryFlagKey, true);

            return await base.SendAsync(retryRequest, cancellationToken);
        }
    }
}
