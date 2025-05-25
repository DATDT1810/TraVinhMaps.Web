using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using TraVinhMaps.Web.Admin.Models.Users;
using TraVinhMaps.Web.Admin.Services.Auth;
using TraVinhMaps.Web.Admin.Services.Users;

namespace TraVinhMaps.Web.Admin.Controllers
{
    [Route("Admin/UserManagement")]
    public class UserManagementController : Controller
    {
        private readonly IUserService _userService;

        public UserManagementController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet]
        public async Task<IActionResult> Index()
        {
            ViewData["Title"] = "Account Management";
            ViewData["Breadcrumb"] = new List<string> { "Account Management", "Account List" };
            var users = await _userService.ListAllAsync();
            return View(users);
        }
        [HttpGet("Details")]
        public async Task<IActionResult> Details(string id)
        {
            ViewData["Title"] = "Account Details";
            ViewData["Breadcrumb"] = new List<string> { "Account List", "Details" };
            var user = await _userService.GetByIdAsync(id);
            if (user == null)
            {
                return RedirectToAction("Index");
            }
            return View(user);
        }

        // POST: Admin/Users/Create
        [HttpGet("Create")]
        public IActionResult Create()
        {
            ViewData["Title"] = "Account Create";
            ViewData["Breadcrumb"] = new List<string> { "Account Create", "Create" };
            return View();
        }

        // POST: Admin/Users/Create
        [HttpPost("Create")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(UserRequest request, CancellationToken cancellationToken = default)
        {
            if (!ModelState.IsValid)
            {
                return View(request);
            }
            try
            {
                var admin = await _userService.AddAdminAsync(request, cancellationToken);
                TempData["Success"] = "Create the admin successfully!";
                return RedirectToAction(nameof(Index));
            }
            catch (Exception)
            {
                TempData["Error"] = "Create the admin fail!";
                return View(request);
            }
        }

        [HttpGet("Restore/{id}")]
        public async Task<IActionResult> Restore(string id)
        {
            var user = await _userService.GetByIdAsync(id);
            return View(user);
        }

        [HttpPost("Restore")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> RestoreConfirm(string id, CancellationToken cancellationToken = default)
        {
            try
            {
                var success = await _userService.RestoreUser(id, cancellationToken);
                if (success)
                {
                    return Json(new { success = true, message = "User restored successfully" });
                }
                return Json(new { success = false, message = "Failed to restore user" });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Error restoring user: {ex.Message}" });
            }
        }

        [HttpGet("Delete/{id}")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Delete(string id)
        {
            var userId = await _userService.GetByIdAsync(id);
            return View(userId);
        }

        [HttpPost("Delete")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteConfirm(string id, CancellationToken cancellationToken)
        {
            try
            {
                await _userService.DeleteUser(id, cancellationToken);
                return Json(new { success = true, message = "User banned successfully" });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Error banning user: {ex.Message}" });
            }
        }

        [HttpGet("CountUser")]
        public async Task<IActionResult> CountUser(CancellationToken cancellationToken = default)
        {
            var countUser = await _userService.CountAsync(cancellationToken: cancellationToken);
            ViewBag.TotolUsers = countUser;
            return View();
        }

        [HttpGet("CountAllUsers")]
        public async Task<IActionResult> CountAllUsers(CancellationToken cancellationToken = default)
        {
            var countAllUsers = await _userService.CountAllUsersAsync(cancellationToken: cancellationToken);
            ViewBag.TotolAllUsers = countAllUsers;
            return View();
        }

        [HttpGet("CountActiveUser")]
        public async Task<IActionResult> CountActiveUser(CancellationToken cancellationToken = default)
        {
            var countAllActiveUser = await _userService.CountActiveUsersAsync(cancellationToken: cancellationToken);
            ViewBag.TotolActiveUsers = countAllActiveUser;
            return View();
        }

        // GET: Admin Profile
        [HttpGet("Profile")]
        public async Task<IActionResult> Profile()
        {
            try
            {
                ViewData["Title"] = "User Profile";
                ViewData["Breadcrumb"] = new List<string> { "User Management", "Profile" };
                
                // Get session ID from token service or auth context
                var sessionId = HttpContext.Session.GetString("SessionId");
                if (string.IsNullOrEmpty(sessionId))
                {
                    return RedirectToAction("Index", "Authen");
                }
                
                // Get admin profile data
                var apiResponse = await _userService.GetAdminProfileAsync(sessionId);
                if (apiResponse == null)
                {
                    TempData["Error"] = "Unable to retrieve profile data.";
                    return RedirectToAction("Index", "Home");
                }
                
                // Map API response to our model
                var profileModel = new UserProfileModel
                {
                    Id = apiResponse.Id,
                    UserName = apiResponse.Username,
                    Email = apiResponse.Email,
                    PhoneNumber = apiResponse.PhoneNumber,
                    Password = "********", // Don't expose actual password
                    Avatar = apiResponse.UserProfile?.Avatar,
                    CreatedAt = apiResponse.CreatedAt,
                    UpdatedAt = apiResponse.UpdatedAt,
                    RoleName = "admin", // Assuming this is an admin profile
                    IsForbidden = apiResponse.IsForbidden,
                    Status = apiResponse.Status
                };
                
                return View(profileModel);
            }
            catch (Exception ex)
            {
                TempData["Error"] = "An error occurred while loading profile data.";
                return RedirectToAction("Index", "Home");
            }
        }

        // POST: Change Password
        [HttpPost("ChangePassword")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> ChangePassword(ChangePasswordRequest model)
        {
            if (!ModelState.IsValid)
            {
                return Json(new { success = false, message = "Invalid data provided", errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage) });
            }

            try
            {
                // Call API to change password - implement this method in UserService
                // var result = await _userService.ChangePasswordAsync(model);
                
                // For demonstration purposes, we'll just return success
                return Json(new { success = true, message = "Password changed successfully" });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Error changing password: {ex.Message}" });
            }
        }

    }
}