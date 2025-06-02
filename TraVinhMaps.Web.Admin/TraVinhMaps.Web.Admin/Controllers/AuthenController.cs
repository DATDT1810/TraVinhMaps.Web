using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
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
        private readonly IConfiguration _configuration;
        private readonly IHttpClientFactory _httpClientFactory;

        public AuthenController(
            ILogger<AuthenController> logger,
            IAuthService authService,
            IConfiguration configuration,
            IHttpClientFactory httpClientFactory)
        {
            _logger = logger;
            _authService = authService;
            _configuration = configuration;
            _httpClientFactory = httpClientFactory;
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
                    // var encryptedToken = _dataProtector.Protect(result.AuthenData);

                    // Store using TempData with encrypted values
                    TempData["Token"] = result.Data;
                    TempData["Username"] = model.Identifier;
                    TempData["IsRememberMe"] = model.RememberMe;

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
            TempData.Keep("IsRememberMe");

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

                    // Add debugging
                    _logger.LogInformation("OTP verification result: {Result}", result != null ? "Success" : "Failed");
                    if (result != null)
                    {
                        _logger.LogInformation("SessionId: {SessionId}, RefreshToken: {HasRefreshToken}",
                            result.SessionId,
                            !string.IsNullOrEmpty(result.RefreshToken));

                        var isRememberMe = TempData["IsRememberMe"] as bool? ?? false;

                        // Create claims and login
                        var claims = new List<Claim>
                        {
                            new Claim(ClaimTypes.Name, TempData["Username"]?.ToString() ?? "User"),
                            new Claim("sessionId", result.SessionId),
                        };
                        if (isRememberMe)
                        {
                            claims.Add(new Claim("refreshToken", result.RefreshToken));
                        }

                        var claimsIdentity = new ClaimsIdentity(
                            claims, CookieAuthenticationDefaults.AuthenticationScheme);

                        var authProperties = new AuthenticationProperties
                        {
                            IsPersistent = isRememberMe,
                            ExpiresUtc = isRememberMe ? DateTimeOffset.UtcNow.AddHours(24) : null,
                            AllowRefresh = isRememberMe,
                        };

                        try
                        {
                            _logger.LogInformation("Attempting to sign in user with cookie authentication");
                            await HttpContext.SignInAsync(
                                CookieAuthenticationDefaults.AuthenticationScheme,
                                new ClaimsPrincipal(claimsIdentity),
                                authProperties);
                            _logger.LogInformation("SignInAsync completed successfully");
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError(ex, "Error during SignInAsync");
                            ModelState.AddModelError("", "Authentication error occurred. Please try again.");
                            return View("OtpVerification", model);
                        }

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
                // Get the sessionId from claims
                var sessionId = User.FindFirst("sessionId")?.Value;

                // Call the auth service to logout
                var result = await _authService.Logout(sessionId);

                if (!result)
                {
                    ViewData["ErrorMessage"] = "Failed to logout. Please try again.";
                    return RedirectToAction("Index");
                }

                // Sign out of auth cookie
                await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
                TempData.Clear();

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

        /// <summary>
        /// Initiates the Google OAuth2 authentication process
        /// </summary>
        [HttpGet]
        [Route("LoginWithGoogle")]
        public IActionResult LoginWithGoogle()
        {
            var properties = new AuthenticationProperties
            {
                RedirectUri = "/Authen/GoogleCallback",
                // this is for google to show the login page with the email already selected
                Items =
                {
                    { "prompt", "select_account" }
                }
            };

            return Challenge(properties, GoogleDefaults.AuthenticationScheme);
        }

        /// <summary>
        /// Handles the callback from Google OAuth2 authentication
        /// - Extracts the authenticated email
        /// - Calls API to initiate email authentication
        /// - Redirects to OTP verification
        /// </summary>
        [HttpGet]
        [Route("GoogleCallback")]
        public async Task<IActionResult> GoogleCallback()
        {
            try
            {
                // Get the authenticated user information
                var authenticateResult = await HttpContext.AuthenticateAsync(GoogleDefaults.AuthenticationScheme);

                if (!authenticateResult.Succeeded)
                {
                    return RedirectToAction("Index");
                }

                // Extract email from the claims
                var emailClaim = authenticateResult.Principal.FindFirst(ClaimTypes.Email);
                if (emailClaim == null)
                {
                    TempData["ErrorMessage"] = "Could not retrieve email from Google account.";
                    return RedirectToAction("Index");
                }

                var email = emailClaim.Value;

                // Call the API to initiate email authentication
                var result = await _authService.RequestEmailAuthentication(email);

                if (result != null)
                {
                    // Store the token and email for OTP verification
                    TempData["Token"] = result;
                    TempData["Username"] = email;

                    // Sign out of the cookie authentication scheme to prevent automatic cookie creation
                    await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
                    return RedirectToAction("OtpVerification");
                }
                else
                {
                    // Sign out of the cookie authentication scheme to prevent automatic cookie creation
                    await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
                    TempData["ErrorMessage"] = "Failed to authenticate with Google. Please try again.";
                    return RedirectToAction("Index");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during Google authentication callback");
                TempData["ErrorMessage"] = "An unexpected error occurred during Google authentication.";
                return RedirectToAction("Index");
            }
        }
    }
}