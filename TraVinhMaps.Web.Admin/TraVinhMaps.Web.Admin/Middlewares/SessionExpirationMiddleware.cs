using TraVinhMaps.Web.Admin.Services.Auth;

namespace TraVinhMaps.Web.Admin.Middlewares
{
    public class SessionExpirationMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<SessionExpirationMiddleware> _logger;
        private static readonly SemaphoreSlim RefreshSemaphore = new(1, 1);
        
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

        public async Task InvokeAsync(HttpContext context , ITokenService tokenService)
        {
            // Skip middleware for excluded paths
            string path = context.Request.Path.Value?.ToLower() ?? "";
            if (ShouldSkipValidation(path))
            {
                await _next(context);
                return;
            }

            // Check if user is authenticated
            if (context.User.Identity?.IsAuthenticated != true)
            {
                await HandleUnauthenticatedUser(context);
                return;
            }

            // Validate session and attempt refresh if needed
            var sessionValidationResult = await ValidateAndRefreshSession(context , tokenService);

            if (sessionValidationResult.IsValid == false)
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

        private async Task<SessionValidationResult> ValidateAndRefreshSession(HttpContext context, ITokenService tokenService)
        {
            string sessionId = tokenService.GetSessionId(context);

            if (string.IsNullOrEmpty(sessionId))
            {
                return SessionValidationResult.Invalid("No session ID found");
            }

            var expiredAtClaim = context.User.FindFirst("expiredAt")?.Value;
            if (string.IsNullOrEmpty(expiredAtClaim))
            {
                return SessionValidationResult.Invalid("No expiry claim found");
            }
            if (!DateTime.TryParse(expiredAtClaim, out var expiredAt))
            {
                return SessionValidationResult.Invalid("Invalid expiry claim format");
            }
            var now = DateTime.UtcNow;
            if (expiredAt > now)
            {
                // Check if session is expiring soon (proactive refresh)
                if (expiredAt <= now.AddHours(2))
                {
                    var refreshTokenResult = tokenService.GetRefreshToken(context);
                    if (!string.IsNullOrEmpty(refreshTokenResult))
                    {
                        _logger.LogInformation("Session expiring soon, attempting proactive refresh. SessionId: {SessionId}", sessionId);
                        _ = Task.Run(async () => await ProactiveRefreshAsync(context , tokenService));
                    }
                }
                return SessionValidationResult.Valid();
            }
            // Session expired, try refresh
            _logger.LogInformation("Session expired at {ExpiredAt} for SessionId: {SessionId}", expiredAt, sessionId);

            var refreshTokenValue = tokenService.GetRefreshToken(context);
            if (string.IsNullOrEmpty(refreshTokenValue))
            {
                return SessionValidationResult.Invalid("Session expired and no refresh token available");
            }

            await RefreshSemaphore.WaitAsync();
            try
            {
                // Double-check session validity after acquiring semaphore
                if (tokenService.IsSessionValid(context))
                {
                    _logger.LogInformation("Session was refreshed by another thread");
                    return SessionValidationResult.Valid();
                }

                _logger.LogInformation("Attempting to refresh session. SessionId: {SessionId}", sessionId);

                var refreshResult = await tokenService.RefreshTokensIfNeededAsync(context);

                if (refreshResult)
                {
                    _logger.LogInformation("Session refreshed successfully");
                    return SessionValidationResult.Valid();
                }

                _logger.LogWarning("Session refresh failed");
                return SessionValidationResult.Invalid("Refresh failed");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Exception during session refresh for SessionId: {SessionId}", sessionId);
                return SessionValidationResult.Invalid($"Refresh exception: {ex.Message}");
            }
            finally
            {
                RefreshSemaphore.Release();
            }
        }

        private async Task ProactiveRefreshAsync(HttpContext context, ITokenService tokenService)
        {
            try
            {
                var refreshResult = await tokenService.RefreshTokensIfNeededAsync(context);
                if (refreshResult)
                {
                    _logger.LogInformation("Proactive session refresh successful");
                }
                else
                {
                    _logger.LogWarning("Proactive session refresh failed");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Proactive refresh failed");
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

        public record SessionValidationResult(bool IsValid, string? ErrorMessage)
        {
            public static SessionValidationResult Valid() => new(true, null);
            public static SessionValidationResult Invalid(string error) => new(false, error);
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
}