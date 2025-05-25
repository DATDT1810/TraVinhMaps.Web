using TraVinhMaps.Web.Admin.Models.Auth;

namespace TraVinhMaps.Web.Admin.Services.Auth
{
    public interface IAuthService
    {
        Task<TokenResponse> LoginInitial(LoginViewModel loginViewModel);
        Task<AuthenData> VerifyOtp(string token, string otpCode);
        Task<bool> ResendOtp(string token);
        Task<bool> Logout(string sessionId);
        Task<TokenResponse> ForgotPassword(string email);
        Task<bool> ResetPassword(string token, string newPassword)
        Task<bool> VerifyOtpForgotPassword(string token, string otpCode);
        Task<string> RequestEmailAuthentication(string email);
    }
}