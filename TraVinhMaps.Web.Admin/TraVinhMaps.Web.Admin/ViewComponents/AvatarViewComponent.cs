using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using TraVinhMaps.Web.Admin.Services.Users;

namespace TraVinhMaps.Web.Admin.ViewComponents
{
    public class AvatarViewComponent : ViewComponent
    {
        private readonly IUserService _userService;

        public AvatarViewComponent(IUserService userService)
        {
            _userService = userService;
        }

        public async Task<IViewComponentResult> InvokeAsync()
        {
            var username = UserClaimsPrincipal?.Identity?.Name;

            if (string.IsNullOrEmpty(username))
            {
                return View("Default", "/assets/images/dashboard/profile.png");
            }

            var user = await _userService
                .ListAsync(u => u.Username.Equals(username, StringComparison.OrdinalIgnoreCase));

            var avatarUrl = user?.FirstOrDefault()?.UserProfile?.Avatar
                            ?? "/assets/images/dashboard/profile.png";

            if (!string.IsNullOrEmpty(user?.FirstOrDefault()?.UserProfile?.Avatar))
            {
                avatarUrl += $"?v={DateTime.UtcNow.Ticks}";
            }

            return View("Default", avatarUrl);
        }
    }
}