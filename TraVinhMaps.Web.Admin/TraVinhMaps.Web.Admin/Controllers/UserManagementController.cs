using Microsoft.AspNetCore.Mvc;
using TraVinhMaps.Web.Admin.Models;
using TraVinhMaps.Web.Admin.Models.Users;
using TraVinhMaps.Web.Admin.Services.Auth;
using TraVinhMaps.Web.Admin.Services.Users;

namespace TraVinhMaps.Web.Admin.Controllers
{
    [Route("Admin/UserManagement")]
    public class UserManagementController : Controller
    {
        private readonly IUserService _userService;
        private readonly ITokenService _tokenService;
        public UserManagementController(IUserService userService, ITokenService tokenService)
        {
            _userService = userService;
            _tokenService = tokenService;
        }

        // GET: Admin/Users
        [HttpGet]
        public async Task<IActionResult> Index()
        {
            ViewData["Title"] = "Account Management";
            ViewData["Breadcrumb"] = new List<BreadcrumbItem>
            {
                new BreadcrumbItem { Title = "Account Management", Url = Url.Action("Index", "UserManagement")! },
                new BreadcrumbItem { Title = "Account List" } // default URL for the current page
            };
            var users = await _userService.ListAllAsync();
            return View(users);
        }

        // GET: Admin/Users/Details/{id}
        [HttpGet("Details")]
        public async Task<IActionResult> Details(string id)
        {
            ViewData["Title"] = "Account Details";
            ViewData["Breadcrumb"] = new List<BreadcrumbItem>
            {
                new BreadcrumbItem { Title = "Account Management", Url = Url.Action("Details", "UserManagement")! },
                new BreadcrumbItem { Title = "Account Details" } // default URL for the current page
            };
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
            ViewData["Breadcrumb"] = new List<BreadcrumbItem>
            {
                new BreadcrumbItem { Title = "Account Create", Url = Url.Action("Create", "UserManagement")! },
                new BreadcrumbItem { Title = "Create" } // default URL for the current page
            };
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

    }
}