using System.Net;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
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
            if (response.StatusCode == HttpStatusCode.Unauthorized)
            {
                httpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
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

      
    }
}
