using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using TraVinhMaps.Web.Admin.Services.Users;

namespace TraVinhMaps.Web.Admin.ViewComponents
{
    public class NotificationViewComponent : ViewComponent
    {
        private readonly IUserService _userService;

        public NotificationViewComponent(IUserService userService)
        {
            _userService = userService;
        }

        public async Task<IViewComponentResult> InvokeAsync()
        {
            var recentUsers = await _userService.GetRecentUsersAsync(5);
            return View(recentUsers);
        }
    }
}