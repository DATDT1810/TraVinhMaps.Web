using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Newtonsoft.Json;
using System.Security.Claims;
using TraVinhMaps.Web.Admin.Models.Auth;

namespace TraVinhMaps.Web.Admin.Services.Auth
{
    public class TokenService : ITokenService
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ILogger<TokenService> _logger;
        private readonly IConfiguration _configuration;
        private static readonly SemaphoreSlim _refreshSemaphore = new(1, 1);

        public TokenService(
            IHttpClientFactory httpClientFactory,
            ILogger<TokenService> logger,
            IConfiguration configuration)
        {
            _httpClientFactory = httpClientFactory;
            _logger = logger;
            _configuration = configuration;
        }

        public string? GetSessionId(HttpContext? context)
        {
            if (context?.User?.Identity?.IsAuthenticated != true)
                return null;

            return context.User.FindFirst("sessionId")?.Value;
        }

        public string? GetRefreshToken(HttpContext? context)
        {
            if (context?.User?.Identity?.IsAuthenticated != true)
                return null;

            return context.User.FindFirst("refreshToken")?.Value;
        }

        public async Task<bool> RefreshTokensIfNeededAsync(HttpContext context)
        {
            await _refreshSemaphore.WaitAsync();
            try
            {
                if (IsSessionValid(context))
                {
                    _logger.LogInformation("Session is still valid after waiting, skipping refresh");
                    return true;
                }

                var refreshToken = GetRefreshToken(context);
                if (string.IsNullOrEmpty(refreshToken))
                {
                    _logger.LogWarning("No refresh token available for token refresh");
                    return false;
                }

                var httpClient = _httpClientFactory.CreateClient("ApiClientNoAuth");

                httpClient.DefaultRequestHeaders.Add("refreshToken", $"{refreshToken}");


                var content = new StringContent("", System.Text.Encoding.UTF8, "application/json");

                try
                {
                    var response = await httpClient.PostAsync("/api/auth/refresh-token", content);

                    if (response.IsSuccessStatusCode)
                    {
                        var responseContent = await response.Content.ReadAsStringAsync();
                        var tokenResponse = JsonConvert.DeserializeObject<AuthenData>(responseContent);

                        if (tokenResponse != null && !string.IsNullOrEmpty(tokenResponse.SessionId))
                        {
                            await UpdateTokensInCookieAsync(context, tokenResponse.SessionId, tokenResponse.RefreshToken);
                            _logger.LogInformation("Tokens refreshed successfully");
                            return true;
                        }
                    }
                    else
                    {
                        _logger.LogWarning("Token refresh failed with status: {StatusCode}", response.StatusCode);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Exception occurred during token refresh");
                }

                return false;
            }
            finally
            {
                _refreshSemaphore.Release();
            }
        }

        public async Task<bool> UpdateTokensInCookieAsync(HttpContext context, string sessionId, string? refreshToken = null)
        {
            try
            {
                if (context.User?.Identity?.IsAuthenticated != true)
                {
                    _logger.LogWarning("Cannot update tokens for unauthenticated user");
                    return false;
                }

                var existingClaims = context.User.Claims.Where(c =>
                    c.Type != "sessionId" && c.Type != "refreshToken").ToList();

                var newClaims = new List<Claim>(existingClaims)
            {
                new Claim("sessionId", sessionId),
                new Claim("expiredAt", DateTime.UtcNow.AddHours(24).ToString("o")) // ISO 8601 format
            };

                if (!string.IsNullOrEmpty(refreshToken))
                {
                    newClaims.Add(new Claim("refreshToken", refreshToken));
                }

                var claimsIdentity = new ClaimsIdentity(
                    newClaims, CookieAuthenticationDefaults.AuthenticationScheme);

                var authProperties = new AuthenticationProperties
                {
                    IsPersistent = true,
                    ExpiresUtc = DateTimeOffset.UtcNow.AddHours(24)
                };

                await context.SignInAsync(
                    CookieAuthenticationDefaults.AuthenticationScheme,
                    new ClaimsPrincipal(claimsIdentity),
                    authProperties);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to update tokens in cookie");
                return false;
            }
        }

        public async Task SignOutUserAsync(HttpContext context)
        {
            try
            {
                await context.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
                _logger.LogInformation("User signed out successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to sign out user");
            }
        }

        public bool IsSessionValid(HttpContext context)
        {
            var expiredAtString = context.User.FindFirst("expiredAt")?.Value;
            if (string.IsNullOrEmpty(expiredAtString))
            {
                _logger.LogWarning("No expiredAt claim found for session validation");
                return false;
            }

            if (!DateTime.TryParse(expiredAtString, out var expiredAt))
            {
                _logger.LogWarning("Invalid expiredAt claim format: {ExpiredAt}", expiredAtString);
                return false;
            }

            var isValid = expiredAt > DateTime.UtcNow;

            if (!isValid)
            {
                var sessionId = GetSessionId(context);
                _logger.LogInformation("Session expired for SessionId: {SessionId}, ExpiredAt: {ExpiredAt}",
                    sessionId, expiredAt);
            }

            return isValid;
        }

        public string? GetRole(HttpContext? context)
        {
            return context?.User?.FindFirst(ClaimTypes.Role)?.Value;
        }

        public DateTime? GetSessionExpiryTime(HttpContext context)
        {
            var expiredAtString = context.User?.FindFirst("expiredAt")?.Value;
            return DateTime.TryParse(expiredAtString, out var expiredAt) ? expiredAt : null;
        }

        public TimeSpan GetSessionTimeRemaining(HttpContext context)
        {
            var expiryTime = GetSessionExpiryTime(context);
            if (expiryTime.HasValue)
            {
                var remaining = expiryTime.Value - DateTime.UtcNow;
                return remaining > TimeSpan.Zero ? remaining : TimeSpan.Zero;
            }
            return TimeSpan.Zero;
        }
    }
}
