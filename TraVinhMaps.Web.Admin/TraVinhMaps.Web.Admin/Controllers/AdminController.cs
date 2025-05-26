using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using TraVinhMaps.Web.Admin.Models.Admins;
using TraVinhMaps.Web.Admin.Services.Admins;

namespace TraVinhMaps.Web.Admin.Controllers
{
    [Route("[controller]")]
    public class AdminController : Controller
    {
        private readonly IAdminService _adminService;

        public AdminController(IAdminService adminService)
        {
            _adminService = adminService;
        }

        [HttpGet]
        public async Task<IActionResult> Index()
        {
            ViewData["Title"] = "Admin Management";
            ViewData["Breadcrumb"] = new List<string> { "Admin Management", "Admin List" };
            var admins = await _adminService.ListAllAsync();
            return View(admins);
        }

        [HttpGet("Details")]
        public async Task<IActionResult> Details(string id)
        {
            ViewData["Title"] = "Admin Details";
            ViewData["Breadcrumb"] = new List<string> { "Admin List", "Details" };
            var admin = await _adminService.GetByIdAsync(id);
            if (admin == null)
            {
                return RedirectToAction("Index");
            }
            return View(admin);
        }

        // GET: Admin/Create
        [HttpGet("Create")]
        public IActionResult Create()
        {
            ViewData["Title"] = "Admin Create";
            ViewData["Breadcrumb"] = new List<string> { "Admin Create", "Create" };
            return View();
        }

        // POST: Admin/Create
        [HttpPost("Create")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(AdminRequest request, CancellationToken cancellationToken = default)
        {
            if (!ModelState.IsValid)
            {
                return View(request);
            }
            try
            {
                var admin = await _adminService.AddAsync(request, cancellationToken);
                TempData["CreateAdminSuccess"] = "Create the admin successfully!";
                return RedirectToAction(nameof(Index));
            }
            catch (Exception)
            {
                TempData["CreateAdminError"] = "Create the admin fail!";
                return View(request);
            }
        }

        // GET: Admin/Update
        [HttpGet("Update/{id}")]
        public async Task<IActionResult> Update(string id)
        {
            var admin = await _adminService.GetByIdAsync(id);

            if (admin == null)
            {
                return RedirectToAction("Index");
            }

            var updateModel = new UpdateAdminRequest
            {
                Id = admin.Id,
                PhoneNumber = admin.PhoneNumber,
                Username = admin.Username,
                Password = admin.Password
            };

            ViewData["Title"] = "Admin Update";
            ViewData["Breadcrumb"] = new List<string> { "Admin Update", "Update" };
            return View(updateModel);
        }

        // POST: Admin/Update
        [HttpPost("Update")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Update(UpdateAdminRequest request, CancellationToken cancellationToken = default)
        {
            if (!ModelState.IsValid)
            {
                return View(request);
            } 
            try
            {
                var admin = await _adminService.UpdateAsync(request, cancellationToken);
                TempData["Success"] = "Update the admin successfully!";
                return RedirectToAction(nameof(Index));
            }
            catch (Exception)
            {
                TempData["Error"] = "Update the admin fail!";
                return View(request);
            }
        }

        [HttpGet("Restore/{id}")]
        public async Task<IActionResult> Restore(string id)
        {
            var user = await _adminService.GetByIdAsync(id);
            return View(user);
        }

        [HttpPost("Restore")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> RestoreConfirm(string id, CancellationToken cancellationToken = default)
        {
            try
            {
                var success = await _adminService.RestoreAdmin(id, cancellationToken);
                if (success)
                {
                    return Json(new { success = true, message = "Admin restored successfully" });
                }
                return Json(new { success = false, message = "Failed to restore admin" });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Error restoring admin: {ex.Message}" });
            }
        }

        [HttpGet("Delete/{id}")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Delete(string id)
        {
            var admin = await _adminService.GetByIdAsync(id);
            return View(admin);
        }

        [HttpPost("Delete")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteConfirm(string id, CancellationToken cancellationToken)
        {
            try
            {
                await _adminService.DeleteAdmin(id, cancellationToken);
                return Json(new { success = true, message = "Admin banned successfully" });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Error banning admin: {ex.Message}" });
            }
        }

    }
}