using TraVinhMaps.Web.Admin.Services.Auth;

namespace TraVinhMaps.Web.Admin.Extensions
{
    public class SessionExpirationMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<SessionExpirationMiddleware> _logger;

        // Static paths that should be excluded from session validation
        private static readonly HashSet<string> ExcludedPaths = new(StringComparer.OrdinalIgnoreCase)
        {
            "/authen",
            "/api/session",
            "/asset",
            "/css",
            "/js",
            "/lib",
            "/favicon.ico"
        };

        public SessionExpirationMiddleware(RequestDelegate next, ILogger<SessionExpirationMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context, ITokenService tokenService)
        {
            // Skip middleware for excluded paths
            string path = context.Request.Path.Value?.ToLower() ?? "";
            if (ShouldSkipValidation(path))
            {
                await _next(context);
                return;
            }

            // Check if user is authenticated
            if (!context.User.Identity?.IsAuthenticated ?? true)
            {
                await HandleUnauthenticatedUser(context);
                return;
            }

            // Validate session and attempt refresh if needed
            var sessionValidationResult = await ValidateAndRefreshSession(context, tokenService);

            if (!sessionValidationResult)
            {
                await HandleSessionExpired(context, tokenService);
                return;
            }

            // Continue with the request
            await _next(context);
        }

        private static bool ShouldSkipValidation(string path)
        {
            return ExcludedPaths.Any(excludedPath => path.StartsWith(excludedPath));
        }

        private async Task HandleUnauthenticatedUser(HttpContext context)
        {
            if (IsApiRequest(context))
            {
                await WriteApiErrorResponse(context, 401, "Unauthorized");
            }
            else
            {
                context.Response.Redirect("/Authen");
            }
        }

        private async Task<bool> ValidateAndRefreshSession(HttpContext context, ITokenService tokenService)
        {
            string sessionId = tokenService.GetSessionId(context);

            if (!string.IsNullOrEmpty(sessionId))
            {
                return true; // Session is valid
            }

            // Session is invalid, try to refresh if refresh token is available
            var refreshToken = tokenService.GetRefreshToken(context);
            if (string.IsNullOrEmpty(refreshToken))
            {
                _logger.LogWarning("Session expired and no refresh token available");
                return false;
            }

            _logger.LogInformation("Session expired but refresh token is available. Attempting to refresh tokens.");

            try
            {
                bool refreshed = await tokenService.RefreshTokensIfNeededAsync(context);

                if (refreshed)
                {
                    _logger.LogInformation("Token refreshed successfully");
                    return true;
                }
                else
                {
                    _logger.LogWarning("Token refresh failed");
                    return false;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Exception occurred during token refresh in middleware");
                return false;
            }
        }

        private async Task HandleSessionExpired(HttpContext context, ITokenService tokenService)
        {
            _logger.LogWarning("Session expired and token refresh failed. Signing out user.");

            // Sign out the user
            await tokenService.SignOutUserAsync(context);

            if (IsApiRequest(context))
            {
                await WriteApiErrorResponse(context, 401, "Session expired");
            }
            else
            {
                context.Response.Redirect("/Authen");
            }
        }

        private static bool IsApiRequest(HttpContext context)
        {
            return context.Request.Headers.Accept.ToString().Contains("application/json") ||
                   context.Request.Path.StartsWithSegments("/api");
        }

        private static async Task WriteApiErrorResponse(HttpContext context, int statusCode, string message)
        {
            context.Response.StatusCode = statusCode;
            context.Response.ContentType = "application/json";

            var response = new { message, timestamp = DateTimeOffset.UtcNow };
            await context.Response.WriteAsJsonAsync(response);
        }
    }

    // Extension method to add the middleware to the request pipeline
    public static class SessionExpirationMiddlewareExtensions
    {
        public static IApplicationBuilder UseSessionExpiration(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<SessionExpirationMiddleware>();
        }
    }
}