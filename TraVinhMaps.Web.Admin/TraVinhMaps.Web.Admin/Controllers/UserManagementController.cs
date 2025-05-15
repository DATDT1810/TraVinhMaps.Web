using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
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
            ViewData["Breadcrumb"] = new List<string> { "Account Management","Account List" };
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
    }
}