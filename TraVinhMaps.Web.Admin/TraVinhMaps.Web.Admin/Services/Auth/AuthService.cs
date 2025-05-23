using Newtonsoft.Json;
using System.Text;
using TraVinhMaps.Web.Admin.Models.Auth;

namespace TraVinhMaps.Web.Admin.Services.Auth
{
    public class AuthService : IAuthService
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IConfiguration _configuration;
        private readonly ILogger<AuthService> _logger;
        private const string _apiUrl = "/api/auth";

        public AuthService(
            IHttpClientFactory httpClientFactory,
            IConfiguration configuration,
            ILogger<AuthService> logger)
        {
            _httpClientFactory = httpClientFactory;
            _configuration = configuration;
            _logger = logger;
        }

        public Task<bool> ChangePassword(string oldPassword, string newPassword)
        {
            throw new NotImplementedException();
        }

        public async Task<TokenResponse> ForgotPassword(string email)
        {
            try
            {
                if (string.IsNullOrEmpty(email))
                {
                    _logger.LogWarning("Attempted password reset with empty email");
                    return null;
                }

                var client = _httpClientFactory.CreateClient("ApiClient");
                var requestContent = new StringContent("", Encoding.UTF8, "application/json");

                _logger.LogInformation("Requesting password reset for: {Email}", email);
                var response = await client.PostAsync($"{_apiUrl}/forgot-password?identifier={email}", requestContent);


                if (response.IsSuccessStatusCode)
                {
                    _logger.LogInformation("Password reset request successful for: {Email}", email);
                    var responseContent = await response.Content.ReadAsStringAsync();
                    var result = JsonConvert.DeserializeObject<TokenResponse>(responseContent);
                    return result;
                }
                else
                {
                    _logger.LogWarning("Password reset request failed ");
                    return null;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Exception in ForgotPassword");
                return null;
            }
        }

        public async Task<TokenResponse> LoginInitial(LoginViewModel loginViewModel)
        {
            try
            {
                if (loginViewModel == null)
                {
                    _logger.LogWarning("Login attempt with null model");
                    return null;
                }

                var client = _httpClientFactory.CreateClient("ApiClient");
                var content = new StringContent(JsonConvert.SerializeObject(loginViewModel), Encoding.UTF8, "application/json");

                _logger.LogInformation("Attempting login for user: {Username}", loginViewModel.Identifier);
                var response = await client.PostAsync($"{_apiUrl}/login-admin", content);

                var responseContent = await response.Content.ReadAsStringAsync();

                if (response.IsSuccessStatusCode)
                {
                    var tokenResponse = JsonConvert.DeserializeObject<TokenResponse>(responseContent);
                    if (tokenResponse == null)
                    {
                        _logger.LogError("Failed to deserialize token response");
                        return null;
                    }

                    return tokenResponse;
                }
                else
                {
                    _logger.LogWarning("Login failed with status code: {StatusCode}, Response: {Response}",
                        response.StatusCode, responseContent);

                    // Try to parse error message from response
                    try
                    {
                        var errorResponse = JsonConvert.DeserializeObject<TokenResponse>(responseContent);
                        return null;
                    }
                    catch
                    {
                        return null;
                    }
                }
            }
            catch (Exception ex)
            {
                return null;
            }
        }

        public async Task<bool> ResendOtp(string token)
        {
            try
            {
                if (string.IsNullOrEmpty(token))
                {
                    _logger.LogWarning("Attempted OTP resend with missing token");
                    return false;
                }

                var client = _httpClientFactory.CreateClient("ApiClient");
                client.DefaultRequestHeaders.Add("id", token);

                var content = new StringContent("", Encoding.UTF8, "application/json");

                _logger.LogInformation("Resending OTP for token: {TokenPrefix}...", token.Substring(0, Math.Min(8, token.Length)));
                var response = await client.PostAsync($"{_apiUrl}/resend-otp-admin", content);

                var responseContent = await response.Content.ReadAsStringAsync();

                if (response.IsSuccessStatusCode)
                {
                    return true;
                }
                else
                {
                    _logger.LogWarning("OTP resend failed with status code: {StatusCode}, Response: {Response}",
                        response.StatusCode, responseContent);
                    return false;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Exception in ResendOtp");
                return false;
            }
        }

        public async Task<AuthenData> VerifyOtp(string token, string otpCode)
        {
            try
            {
                if (string.IsNullOrEmpty(token) || string.IsNullOrEmpty(otpCode))
                {
                    _logger.LogWarning("Attempted OTP verification with missing token or code");
                    return null;
                }

                var client = _httpClientFactory.CreateClient("ApiClient");
                client.DefaultRequestHeaders.Add("id", token);

                var content = new StringContent("", Encoding.UTF8, "application/json");

                _logger.LogInformation("Verifying OTP for token: {TokenPrefix}...", token.Substring(0, Math.Min(8, token.Length)));
                var response = await client.PostAsync($"{_apiUrl}/confirm-otp-admin?otp={otpCode}", content);

                var responseContent = await response.Content.ReadAsStringAsync();

                if (response.IsSuccessStatusCode)
                {
                    try
                    {
                        var authResponse = JsonConvert.DeserializeObject<AuthenticationResponse>(responseContent);
                        if (authResponse?.Data == null)
                        {
                            _logger.LogError("Received null data in auth response");
                            return null;
                        }

                        var result = JsonConvert.DeserializeObject<AuthenData>(authResponse.Data);
                        if (string.IsNullOrEmpty(result?.SessionId) || string.IsNullOrEmpty(result?.RefreshToken))
                        {
                            _logger.LogError("Missing required token data in response");
                            return null;
                        }

                        return result;
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error deserializing verification response");
                        return null;
                    }
                }
                else
                {
                    _logger.LogWarning("OTP verification failed with status code: {StatusCode}, Response: {Response}",
                        response.StatusCode, responseContent);
                    return null;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Exception in VerifyOtp");
                return null;
            }
        }

        public Task<bool> Logout()
        {
            throw new NotImplementedException();
        }

        public async Task<bool> Logout(string sessionId)
        {
            try
            {
                if (string.IsNullOrEmpty(sessionId))
                {
                    _logger.LogWarning("Attempted logout with null sessionId");
                    return false;
                }

                var client = _httpClientFactory.CreateClient("ApiClient");
                client.DefaultRequestHeaders.Add("sessionId", sessionId);

                _logger.LogInformation("Sending logout request to API");
                var response = await client.GetAsync($"{_apiUrl}/logout");

                if (response.IsSuccessStatusCode)
                {
                    _logger.LogInformation("Logout successful");
                    return true;
                }
                else
                {
                    var responseContent = await response.Content.ReadAsStringAsync();
                    _logger.LogWarning("Logout failed with status code: {StatusCode}, Response: {Response}",
                        response.StatusCode, responseContent);
                    return false;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Exception in Logout");
                return false;
            }
        }

        public async Task<bool> ResetPassword(string identifier, string newPassword)
        {
            try
            {
                if (string.IsNullOrEmpty(identifier) || string.IsNullOrEmpty(newPassword))
                {
                    _logger.LogWarning("Attempted password reset with missing token or password");
                    return false;
                }

                var client = _httpClientFactory.CreateClient("ApiClient");
                var resetRequest = new
                {
                    Identifier = identifier,
                    NewPassword = newPassword
                };

                var content = new StringContent(JsonConvert.SerializeObject(resetRequest), Encoding.UTF8, "application/json");

                var response = await client.PostAsync($"{_apiUrl}/reset-password", content);

                var responseContent = await response.Content.ReadAsStringAsync();

                if (response.IsSuccessStatusCode)
                {
                    _logger.LogInformation("Password reset successful");
                    return true;
                }
                else
                {
                    _logger.LogWarning("Password reset failed with status code: {StatusCode}, Response: {Response}",
                        response.StatusCode, responseContent);
                    return false;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Exception in ResetPassword");
                return false;
            }
        }

        public async Task<bool> VerifyOtpForgotPassword(string token, string otpCode)
        {
            try
            {
                if (string.IsNullOrEmpty(token) || string.IsNullOrEmpty(otpCode))
                {
                    _logger.LogWarning("Attempted password reset OTP verification with missing token or code");
                    return false;
                }

                var client = _httpClientFactory.CreateClient("ApiClient");
                client.DefaultRequestHeaders.Add("id", token);

                var content = new StringContent("", Encoding.UTF8, "application/json");

                _logger.LogInformation("Verifying password reset OTP for token: {TokenPrefix}...", token.Substring(0, Math.Min(8, token.Length)));
                var response = await client.PostAsync($"{_apiUrl}/confirm-otp-forgot-password?otpCode={otpCode}", content);

                var responseContent = await response.Content.ReadAsStringAsync();

                if (response.IsSuccessStatusCode)
                {
                    return true;
                }
                else
                {
                    return false;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Exception in VerifyOtpForgotPassword");
                return false;
            }
        }

        public async Task<string> RequestEmailAuthentication(string email)
        {
            try
            {
                if (string.IsNullOrEmpty(email))
                {
                    _logger.LogWarning("Attempted email authentication with empty email");
                    return null;
                }

                var client = _httpClientFactory.CreateClient("ApiClient");
                var requestContent = new StringContent("", Encoding.UTF8, "application/json");

                _logger.LogInformation("Requesting email authentication for: {Email}", email);
                var response = await client.PostAsync($"{_apiUrl}/login-email-authen-admin?email={email}", requestContent);

                if (response.IsSuccessStatusCode)
                {
                    _logger.LogInformation("Email authentication request successful for: {Email}", email);
                    var responseContent = await response.Content.ReadAsStringAsync();
                    var result = JsonConvert.DeserializeObject<TokenResponse>(responseContent);
                    if (result == null)
                    {
                        _logger.LogError("Failed to deserialize email authentication response");
                        return null;
                    }
                    var token = JsonConvert.DeserializeObject<ContextData>(result.Data);
                    return token.Token;
                }
                else
                {
                    _logger.LogWarning("Email authentication request failed");
                    return null;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Exception in RequestEmailAuthentication");
                return null;
            }
        }
    }
}