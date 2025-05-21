using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using TraVinhMaps.Web.Admin.Models.Notifications;
using TraVinhMaps.Web.Admin.Services.Notifications;

namespace TraVinhMaps.Web.Admin.Controllers
{
    [Route("[controller]")]
    public class NotificationsController : Controller
    {
        private readonly INotificationsService _notificationService;

        public NotificationsController(INotificationsService notificationService)
        {
            _notificationService = notificationService;
        }

        [HttpGet("Index")]
        public async Task<IActionResult> Index()
        {
            ViewData["Title"] = "Send Notification";
            ViewData["Breadcrumb"] = new List<string> { "Send Notification", "Notifications List" };
            var notifications = await _notificationService.GetUniqueNotificationsAsync();
            return View(notifications);
        }

        [HttpGet("{id}", Name = "Details")]
        public async Task<IActionResult> Details(string id, CancellationToken cancellationToken = default)
        {
            ViewData["Title"] = "Send Notification";
            ViewData["Breadcrumb"] = new List<string> { "Send Notification", "Details" };
            var notification = await _notificationService.GetByIdAsync(id, cancellationToken);
            if (notification == null)
            {
                return RedirectToAction("GetUniqueNotifications");
            }
            return View(notification);
        }

        // GET: Admin/Nitofication/Send Notification
        [HttpGet("SendNotification")]
        public IActionResult SendNotification()
        {
            ViewData["Title"] = "Send Notification";
            ViewData["Breadcrumb"] = new List<string> { "Send Notification", "Send" };
            return View();
        }

        // POST: Admin/Notification/Send Notification
        [HttpPost("SendNotification")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> SendNotification(NotificationRequest request, CancellationToken cancellationToken = default)
        {
            if (!ModelState.IsValid)
            {
                return View(request);
            }
            try
            {
                var notification = await _notificationService.SendNotificationAsync(request, cancellationToken);
                TempData["NotificationSuccess"] = "The notification was sent successfully!";
                return RedirectToAction(nameof(Index));
            }
            catch (Exception)
            {
                TempData["NotificationError"] = "The notification failed to send!";
                return View(request);
            }
        }
    }
}