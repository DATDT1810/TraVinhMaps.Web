using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TraVinhMaps.Web.Admin.Models.Dashboard;
using TraVinhMaps.Web.Admin.Services.Admin;
using TraVinhMaps.Web.Admin.Services.Users;

namespace TraVinhMaps.Web.Admin.Controllers
{
    [Authorize]
    public class HomeController : Controller
    {
        private readonly IUserService _userService;
        private readonly IAdminService _adminService;

        public HomeController(IUserService userService, IAdminService adminService)
        {
            _userService = userService;
            _adminService = adminService;
        }

        public async Task<IActionResult> Index()
        {
            ViewData["Title"] = "Dashboard";
            ViewData["Breadcrumb"] = new List<string> { "Dashboard", "Default" };
            var model = new DashboardVM
            {
                TotalUsers = await _userService.CountAllUsersAsync(),
                TotalUserActive = await _userService.CountActiveUsersAsync(),
            };
            return View(model);
        }


        [HttpGet("setting")]
        public async Task<IActionResult> Settings()
        {
            ViewData["Title"] = "Security Settings";
            ViewData["Breadcrumb"] = new List<string> { "Settings", "Security" };
            var settingProfile = await _adminService.GetSettingProfileAsync();
            return View(settingProfile);

        }

    }
}
