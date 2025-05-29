using Microsoft.AspNetCore.Mvc;
using TraVinhMaps.Web.Admin.Services.Auth;

namespace TraVinhMaps.Web.Admin.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SessionController : ControllerBase
    {
        private readonly ITokenService _tokenService;

        public SessionController(ITokenService tokenService)
        {
            _tokenService = tokenService;
        }

        [HttpGet("validate")]
        public async Task<IActionResult> ValidateSession()
        {
            string sessionId = _tokenService.GetSessionId();
            
            if (string.IsNullOrEmpty(sessionId))
            {
                return Unauthorized(new { message = "Session expired" });
            }

            // Try to refresh tokens if needed
            await _tokenService.RefreshTokensIfNeededAsync();
            
            // Check again after refresh attempt
            sessionId = _tokenService.GetSessionId();
            if (string.IsNullOrEmpty(sessionId))
            {
                return Unauthorized(new { message = "Session expired" });
            }

            return Ok(new { valid = true });
        }
    }
} 