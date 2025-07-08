using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TraVinhMaps.Web.Admin.Models.Dashboard;
using TraVinhMaps.Web.Admin.Models.Review;
using TraVinhMaps.Web.Admin.Services.Admin;
using TraVinhMaps.Web.Admin.Services.Review;
using TraVinhMaps.Web.Admin.Services.Users;

namespace TraVinhMaps.Web.Admin.Controllers
{
    [Authorize]
    public class HomeController : Controller
    {
        private readonly IUserService _userService;
        private readonly IAdminService _adminService;
        private readonly IReviewService _reviewService;

        public HomeController(IUserService userService, IAdminService adminService, IReviewService reviewService)
        {
            _userService = userService;
            _adminService = adminService;
            _reviewService = reviewService;
        }

        public async Task<IActionResult> Index(string timeRange = "month", string[]? tagNames = null)
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
                _ => "month" // Default
            };

            if (tagNames == null || tagNames.Length == 0)
            {
                tagNames = new[] { "Destination" }; // Default tag name
            }

            var model = new DashboardVM
            {
                TotalUsers = await _userService.CountAllUsersAsync(),
                TotalUserActive = await _userService.CountActiveUsersAsync(),
                UserStatistics = new List<UserStatisticVM>(),
                LatestReviews = new List<ReviewResponse>()
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

                var startDate = timeRange switch
                {
                    "day" => DateTime.UtcNow.AddHours(7).Date, // Hôm nay
                    "week" => DateTime.UtcNow.AddHours(7).Date.AddDays(-7), // 7 ngày trước
                    "month" => DateTime.UtcNow.AddHours(7).Date.AddMonths(-1), // 1 tháng trước
                    "year" => DateTime.UtcNow.AddHours(7).Date.AddYears(-1), // 1 năm trước
                    _ => DateTime.UtcNow.AddHours(7).Date.AddDays(-30) // Default 30 ngày
                };
                var endDate = DateTime.UtcNow.AddHours(7).Date.AddDays(1); // Ngày mai

                var performance = await _userService.GetPerformanceByTagAsync(
                tagNames: tagNames,
                includeOcop: true,
                includeDestination: true,
                includeLocalSpecialty: true,
                includeTips: true,
                includeFestivals: true,
                startDate: startDate,
                endDate: endDate,
                cancellationToken: CancellationToken.None
            );
                model.PerformanceByTag = performance ?? new Dictionary<string, Dictionary<string, int>>();
            }
            catch (Exception ex)
            {
                ViewData["Error"] = "Unable to load user statistics: " + ex.Message;
            }
            try
            {
                var latestReviews = await _reviewService.GetLatestReviewsAsync(5, cancellationToken: CancellationToken.None);
                model.LatestReviews = latestReviews.ToList();
            }
            catch (Exception ex)
            {
                ViewData["ErrorReviews"] = "Unable to load latest reviews: " + ex.Message;
            }

            // Pass the selected timeRange to the view for pre-selecting the dropdowns
            ViewData["TimeRange"] = timeRange;
            ViewData["TagName"] = tagNames;

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
