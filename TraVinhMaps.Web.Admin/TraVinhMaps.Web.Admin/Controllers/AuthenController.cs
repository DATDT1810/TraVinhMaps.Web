using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TraVinhMaps.Web.Admin.Models.Auth;
using TraVinhMaps.Web.Admin.Services.Auth;

namespace TraVinhMaps.Web.Admin.Controllers
{
    /// <summary>
    /// Authentication Controller responsible for managing user authentication flows
    /// 
    /// Main Authentication Flows:
    /// 
    /// 1. Regular Login Flow:
    ///    - User enters credentials (Index)
    ///    - System sends OTP (Login action)
    ///    - User verifies OTP (OtpVerification page and VerifyOtp action)
    ///    - User is authenticated and redirected to home
    /// 
    /// 2. Forgot Password Flow:
    ///    - User initiates password reset (ForgotPassword page)
    ///    - User enters email/phone (RequestPasswordReset action)
    ///    - System sends OTP and returns token
    ///    - User verifies OTP (OtpVerification page and VerifyOtp action with isPasswordReset=true)
    ///    - System validates OTP using confirm-otp-forgot-password endpoint
    ///    - User enters new password (ResetPassword page)
    ///    - System updates password (ConfirmResetPassword action)
    ///    - User is redirected to login
    /// 
    /// Token Handling:
    /// - Tokens are stored in TempData for cross-request persistence
    /// 
    /// Error Handling:
    /// - Each step includes proper error handling for invalid inputs
    /// - Server errors are caught and logged with user-friendly messages
    /// </summary>
    [Route("[controller]")]
    public class AuthenController : Controller
    {
        private readonly ILogger<AuthenController> _logger;
        private readonly IAuthService _authService;
        private readonly IDataProtector _dataProtector;
        private const string SessionId = "SessionId";
        private const string RefreshTokenKey = "RefreshToken";

        public AuthenController(
            ILogger<AuthenController> logger,
            IAuthService authService,
            IDataProtectionProvider dataProtectionProvider)
        {
            _logger = logger;
            _authService = authService;
            _dataProtector = dataProtectionProvider.CreateProtector("Auth.TokenProtection");
        }

        [HttpGet]
        public IActionResult Index()
        {
            if (User.Identity.IsAuthenticated)
            {
                return RedirectToAction("Index", "Home");
            }
            return View(new LoginViewModel());
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Login(LoginViewModel model)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return View("Index", model);
                }

                var result = await _authService.LoginInitial(model);
                if (result != null && !string.IsNullOrEmpty(result.Data))
                {
                    // Encrypt the token before storing
                    // var encryptedToken = _dataProtector.Protect(result.Data);

                    // Store using TempData with encrypted values
                    TempData["Token"] = result.Data;
                    TempData["Username"] = model.Identifier;

                    // Redirect to OTP verification page
                    return RedirectToAction("OtpVerification");
                }
                else
                {
                    ModelState.AddModelError("", result?.Message ?? "Invalid username or password");
                    return View("Index", model);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred during login");
                ModelState.AddModelError("", "An error occurred during login. Please try again.");
                return View("Index", model);
            }
        }

        /// <summary>
        /// Displays OTP verification page for both login and password reset flows
        /// - Validates and retrieves necessary data from TempData
        /// </summary>
        [Route("OtpVerification")]
        [HttpGet]
        public IActionResult OtpVerification()
        {
            var encryptedToken = TempData["Token"]?.ToString();
            var username = TempData["Username"]?.ToString();
            var isPasswordReset = TempData["IsPasswordReset"] as bool? ?? false;

            if (string.IsNullOrEmpty(encryptedToken) || string.IsNullOrEmpty(username))
            {
                return RedirectToAction("Index");
            }

            TempData.Keep("Token");
            TempData.Keep("Username");
            TempData.Keep("IsPasswordReset");

            return View(new OtpVerificationViewModel
            {
                Token = encryptedToken,
                UserIdentifier = username
            });
        }

        /// <summary>
        /// Processes OTP verification for both login and password reset flows
        /// - Handles different verification endpoints based on flow
        /// - Redirects to appropriate next step
        /// </summary>
        [HttpPost]
        [Route("VerifyOtp")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> VerifyOtp(OtpVerificationViewModel model)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return View("OtpVerification", model);
                }

                var isPasswordReset = TempData["IsPasswordReset"] as bool? ?? false;

                // Keep these values in case we need to redisplay the form
                TempData.Keep("IsPasswordReset");
                TempData.Keep("Username");

                if (isPasswordReset)
                {
                    // For password reset flow, use the specific forgot password OTP verification endpoint
                    var forgotPasswordResult = await _authService.VerifyOtpForgotPassword(model.Token, model.OtpCode);
                    if (forgotPasswordResult)
                    {
                        // Redirect to password reset page
                        return RedirectToAction("ResetPassword");
                    }
                    else
                    {
                        ModelState.AddModelError("OtpCode", "Invalid OTP code. Please try again.");
                        return View("OtpVerification", model);
                    }
                }
                else
                {
                    // For login flow, continue using the regular OTP verification
                    var result = await _authService.VerifyOtp(model.Token, model.OtpCode);
                    if (result != null)
                    {
                        // Encrypt session tokens before storing
                        string encryptedSessionId = _dataProtector.Protect(result.SessionId);
                        string encryptedRefreshToken = _dataProtector.Protect(result.RefreshToken);

                        // Store encrypted tokens in session
                        HttpContext.Session.SetString(SessionId, encryptedSessionId);
                        HttpContext.Session.SetString(RefreshTokenKey, encryptedRefreshToken);

                        // Create claims and login
                        var claims = new List<Claim>
                        {
                            new Claim(ClaimTypes.Name, TempData["Username"]?.ToString() ?? "User")
                        };

                        var claimsIdentity = new ClaimsIdentity(
                            claims, CookieAuthenticationDefaults.AuthenticationScheme);

                        var authProperties = new AuthenticationProperties
                        {
                            IsPersistent = true,
                            ExpiresUtc = DateTimeOffset.UtcNow.AddHours(24)
                        };

                        await HttpContext.SignInAsync(
                            CookieAuthenticationDefaults.AuthenticationScheme,
                            new ClaimsPrincipal(claimsIdentity),
                            authProperties);

                        return RedirectToAction("Index", "Home");
                    }
                    else
                    {
                        ModelState.AddModelError("OtpCode", "Invalid OTP code. Please try again.");
                        return View("OtpVerification", model);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred during OTP verification");
                ModelState.AddModelError("", "An error occurred during verification. Please try again.");
                return View("OtpVerification", model);
            }
        }

        [HttpPost]
        [Route("logout")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Logout()
        {
            try
            {
                // Clear session data
                HttpContext.Session.Remove(SessionId);
                HttpContext.Session.Remove(RefreshTokenKey);

                // Sign out of auth cookie
                await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);

                return RedirectToAction("Index");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during logout");
                return RedirectToAction("Index");
            }
        }

        [Route("AccessDenied")]
        public IActionResult AccessDenied()
        {
            return View();
        }

        /// <summary>
        /// Initiates the forgot password process by displaying the form
        /// </summary>
        /// <returns>The forgot password view</returns>
        [HttpGet]
        [Route("ForgotPassword")]
        public IActionResult ForgotPassword()
        {
            return View(new ForgotPasswordViewModel());
        }

        /// <summary>
        /// Step 1: Handles the forgot password request
        /// - Takes user's email/phone
        /// - Calls API to send OTP to the user
        /// - Stores token for OTP verification
        /// - Redirects to OTP verification page
        /// </summary>
        [HttpPost]
        [ValidateAntiForgeryToken]
        [Route("RequestPasswordReset")]
        public async Task<IActionResult> RequestPasswordReset(ForgotPasswordViewModel model)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return View("ForgotPassword", model);
                }

                var result = await _authService.ForgotPassword(model.Identifier);
                if (result != null)
                {
                    // Store identifier in TempData to pass to OTP verification
                    TempData["Token"] = result.Data;
                    TempData["Username"] = model.Identifier;
                    TempData["IsPasswordReset"] = true;

                    return RedirectToAction("OtpVerification");
                }
                else
                {
                    ModelState.AddModelError("", "Failed to send verification code. Please try again or contact support.");
                    return View("ForgotPassword", model);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in RequestPasswordReset");
                ModelState.AddModelError("", "An unexpected error occurred. Please try again later.");
                return View("ForgotPassword", model);
            }
        }

        /// <summary>
        /// Step 3: Final step of password reset
        /// - Receives new password and token
        /// - Calls API to reset password
        /// - Redirects to login with success message
        /// </summary>
        [HttpPost]
        [ValidateAntiForgeryToken]
        [Route("ConfirmResetPassword")]
        public async Task<IActionResult> ConfirmResetPassword(ResetPasswordViewModel model)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return View("ResetPassword", model);
                }

                var result = await _authService.ResetPassword(model.UserIdentifier, model.NewPassword);
                if (result)
                {
                    // Clear any password reset related session data
                    TempData.Remove("Token");
                    TempData.Remove("IsPasswordReset");

                    TempData["SuccessMessage"] = "Your password has been reset successfully. Please login with your new credentials.";
                    return RedirectToAction("Index");
                }
                else
                {
                    // Handle potential token expiration failures from API
                    ModelState.AddModelError("", "Failed to reset password. Please try again or request a new reset link.");
                    return View("ResetPassword", model);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in ConfirmResetPassword");
                ModelState.AddModelError("", "An unexpected error occurred. Please try again later.");
                return View("ResetPassword", model);
            }
        }

        /// <summary>
        /// Step 2: Displays the reset password form after OTP verification
        /// - Retrieves and validates token
        /// - Prepopulates form with token and identifier
        /// </summary>
        [HttpGet]
        [Route("ResetPassword")]
        public IActionResult ResetPassword()
        {
            var token = TempData["Token"]?.ToString();
            var userIdentifier = TempData["Username"]?.ToString();

            if (string.IsNullOrEmpty(token) || string.IsNullOrEmpty(userIdentifier))
            {
                TempData["ErrorMessage"] = "Password reset session not found. Please try again.";
                return RedirectToAction("ForgotPassword");
            }

            // Keep the values in TempData for potential form resubmission
            TempData.Keep("Token");
            TempData.Keep("Username");

            var model = new ResetPasswordViewModel
            {
                Token = token,
                UserIdentifier = userIdentifier
            };

            return View(model);
        }
    }
}