using Microsoft.AspNetCore.DataProtection;
using Newtonsoft.Json;
using TraVinhMaps.Web.Admin.Models.Auth;

namespace TraVinhMaps.Web.Admin.Services.Auth
{
    public class TokenService : ITokenService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IHttpClientFactory _clientFactory;
        private readonly IConfiguration _configuration;
        private readonly IDataProtector _dataProtector;
        private const string SessionIdCookieName = "sessionId";
        private const string RefreshTokenCookieName = "refreshToken";

        public TokenService(IHttpContextAccessor httpContextAccessor,
                        IHttpClientFactory clientFactory,
                        IConfiguration configuration,
                        IDataProtectionProvider dataProtectionProvider)
        {
            _httpContextAccessor = httpContextAccessor;
            _clientFactory = clientFactory;
            _configuration = configuration;
            _dataProtector = dataProtectionProvider.CreateProtector("TraVinhMaps.TokenProtection");
        }

        public string GetSessionId()
        {
            if (_httpContextAccessor.HttpContext == null)
            {
                return null;
            }

            if (_httpContextAccessor.HttpContext.Request.Cookies.TryGetValue(SessionIdCookieName, out var encryptedSessionId))
            {
                return _dataProtector.Unprotect(encryptedSessionId);
            }
            return null;
        }

        public async Task RefreshTokensIfNeededAsync()
        {
            // Check if HttpContext is available
            if (_httpContextAccessor.HttpContext == null)
                return;

            // Get sessionId
            var sessionId = GetSessionId();
            if (string.IsNullOrEmpty(sessionId))
                return;

            // Get refreshToken safely
            string refreshToken = null;
            try
            {
                if (_httpContextAccessor.HttpContext.Request.Cookies.TryGetValue(RefreshTokenCookieName, out var encryptedRefreshToken))
                {
                    refreshToken = _dataProtector.Unprotect(encryptedRefreshToken);
                }
            }
            catch (Exception)
            {
                // If token is invalid or tampered with, clear cookies and return
                await ClearTokensAsync();
                return;
            }

            // If no refresh token is available, return
            if (string.IsNullOrEmpty(refreshToken))
                return;

            // Call API to refresh tokens
            try
            {
                var client = _clientFactory.CreateClient("APIClient");
                var response = await client.PostAsJsonAsync("auth/refresh", new { refreshToken });

                if (response.IsSuccessStatusCode)
                {
                    var result = await response.Content.ReadAsStringAsync();
                    // Re-store with same rememberMe preference
                    var data = JsonConvert.DeserializeObject<TokenResponse>(result);
                    var authData = JsonConvert.DeserializeObject<AuthenData>(data.Data);
                    bool rememberMe = _httpContextAccessor.HttpContext.Request.Cookies.ContainsKey(RefreshTokenCookieName);
                    await StoreTokensAsync(authData.SessionId, authData.RefreshToken, rememberMe);
                }
                else
                {
                    // If refresh fails, clear tokens
                    await ClearTokensAsync();
                }
            }
            catch (Exception)
            {
                // If API call fails, clear tokens
                await ClearTokensAsync();
            }
        }

        public async Task StoreTokensAsync(string sessionId, string refreshToken, bool rememberMe)
        {
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Lax
            };

            // Encrypt tokens before storing
            var protectedSessionId = _dataProtector.Protect(sessionId);
            var protectedRefreshToken = _dataProtector.Protect(refreshToken);

            // sessionId cookie - expires in 1 day
            cookieOptions.Expires = DateTimeOffset.Now.AddDays(1);
            _httpContextAccessor.HttpContext.Response.Cookies.Append(SessionIdCookieName, protectedSessionId, cookieOptions);

            // refreshToken - stored based on remember me preference
            if (rememberMe)
            {
                cookieOptions.Expires = DateTimeOffset.Now.AddDays(7);
                _httpContextAccessor.HttpContext.Response.Cookies.Append(RefreshTokenCookieName, protectedRefreshToken, cookieOptions);
            }
        }

        public async Task ClearTokensAsync()
        {
            _httpContextAccessor.HttpContext.Response.Cookies.Delete(SessionIdCookieName);
            _httpContextAccessor.HttpContext.Response.Cookies.Delete(RefreshTokenCookieName);
        }
    }
}