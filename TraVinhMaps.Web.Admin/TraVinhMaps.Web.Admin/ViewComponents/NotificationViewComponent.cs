using Microsoft.AspNetCore.Mvc;
using TraVinhMaps.Web.Admin.Services.Review;
using TraVinhMaps.Web.Admin.Services.Users;

namespace TraVinhMaps.Web.Admin.ViewComponents
{
    public class NotificationViewComponent : ViewComponent
    {
        private readonly IReviewService _reviewService;
        private readonly IUserService _userService;

        public NotificationViewComponent(IUserService userService, IReviewService reviewService)
        {
            _userService = userService;
            _reviewService = reviewService;
        }

        public async Task<IViewComponentResult> InvokeAsync()
        {
            var recentUsers = await _userService.GetRecentUsersAsync(5);
            var countReview = await _reviewService.CountAsync();
            ViewBag.CountReview = countReview;
            return View(recentUsers);
        }
    }
}