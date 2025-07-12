namespace TraVinhMaps.Web.Admin.Services.Auth
{
    public interface ITokenService
    {
        string? GetSessionId(HttpContext? context);
        string? GetRefreshToken(HttpContext? context);
        string? GetRole(HttpContext? context);
        Task<bool> RefreshTokensIfNeededAsync(HttpContext context);
        Task SignOutUserAsync(HttpContext context);
        Task<bool> UpdateTokensInCookieAsync(HttpContext context, string sessionId, string? refreshToken = null);
        bool IsSessionValid(HttpContext context);
        TimeSpan GetSessionTimeRemaining(HttpContext context); 
    }
}