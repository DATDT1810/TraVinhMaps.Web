namespace TraVinhMaps.Web.Admin.Services.Auth
{
    public interface ITokenService
    {
        string GetSessionId();
        Task RefreshTokensIfNeededAsync();
        Task StoreTokensAsync(string sessionId, string refreshToken, bool rememberMe);
        Task ClearTokensAsync();
    }
}