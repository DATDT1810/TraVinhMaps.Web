using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using TraVinhMaps.Web.Admin.Services.Auth;

namespace TraVinhMaps.Web.Admin.Extensions
{
    public class SessionExpirationMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<SessionExpirationMiddleware> _logger;

        public SessionExpirationMiddleware(RequestDelegate next, ILogger<SessionExpirationMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context, ITokenService tokenService)
        {
            // Skip middleware for authentication-related paths and static files
            string path = context.Request.Path.Value?.ToLower() ?? "";
            if (path.StartsWith("/authen") || 
                path.StartsWith("/assets") || 
                path.StartsWith("/api/session") ||
                path.StartsWith("/lib"))
            {
                await _next(context);
                return;
            }

            // Check if user is authenticated
            if (!context.User.Identity?.IsAuthenticated ?? true)
            {
                if (context.Request.Headers.Accept.ToString().Contains("application/json"))
                {
                    // For API calls, return 401
                    context.Response.StatusCode = 401;
                    await context.Response.WriteAsJsonAsync(new { message = "Session expired" });
                    return;
                }
                else
                {
                    // For normal requests, redirect to login
                    context.Response.Redirect("/Authen");
                    return;
                }
            }

            // Check session validity
            string sessionId = tokenService.GetSessionId();
            if (string.IsNullOrEmpty(sessionId))
            {
                // Session expired, sign out
                await context.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);

                if (context.Request.Headers.Accept.ToString().Contains("application/json"))
                {
                    // For API calls, return 401
                    context.Response.StatusCode = 401;
                    await context.Response.WriteAsJsonAsync(new { message = "Session expired" });
                    return;
                }
                else
                {
                    // For normal requests, redirect to login
                    context.Response.Redirect("/Authen");
                    return;
                }
            }

            // Continue with the request
            await _next(context);
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