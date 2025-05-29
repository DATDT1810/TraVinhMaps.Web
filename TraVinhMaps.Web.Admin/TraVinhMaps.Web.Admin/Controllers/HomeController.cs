using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TraVinhMaps.Web.Admin.Models.Dashboard;
using TraVinhMaps.Web.Admin.Services.Users;

namespace TraVinhMaps.Web.Admin.Controllers
{
    [Authorize]
    public class HomeController : Controller
    {
        private readonly IUserService _userService;
        public HomeController(IUserService userService)
        {
            _userService = userService;
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

    }
}
