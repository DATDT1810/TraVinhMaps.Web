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

        public async Task<IActionResult> Index(string timeRange = "day")
        {
            ViewData["Title"] = "Dashboard";
            ViewData["Breadcrumb"] = new List<string> { "Dashboard", "Default" };

            // Validate timeRange to prevent invalid values
            timeRange = timeRange.ToLower() switch
            {
                "day" => "day",
                "week" => "week",
                "month" => "month",
                "year" => "year",
                _ => "day" // Default
            };

            var model = new DashboardVM
            {
                TotalUsers = await _userService.CountAllUsersAsync(),
                TotalUserActive = await _userService.CountActiveUsersAsync(),
                UserStatistics = new List<UserStatisticVM>()
            };

            try
            {
                var statistics = await _userService.GetUserStatisticsAsync("all", timeRange);
                model.UserStatistics.Add(new UserStatisticVM
                {
                    Age = statistics.ContainsKey("age") ? (Dictionary<string, int>)statistics["age"] : new Dictionary<string, int>(),
                    Hometown = statistics.ContainsKey("hometown") ? (Dictionary<string, int>)statistics["hometown"] : new Dictionary<string, int>(),
                    Gender = statistics.ContainsKey("gender") ? (Dictionary<string, int>)statistics["gender"] : new Dictionary<string, int>(),
                    Status = statistics.ContainsKey("status") ? (Dictionary<string, int>)statistics["status"] : new Dictionary<string, int>(),
                    Time = statistics.ContainsKey("time") ? (Dictionary<string, int>)statistics["time"] : new Dictionary<string, int>()
                });
            }
            catch (Exception ex)
            {
                ViewData["Error"] = "Không thể tải thống kê người dùng: " + ex.Message;
            }

            // Pass the selected timeRange to the view for pre-selecting the dropdowns
            ViewData["TimeRange"] = timeRange;

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
