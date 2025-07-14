using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TraVinhMaps.Web.Admin.Models;
using TraVinhMaps.Web.Admin.Models.Admins;
using TraVinhMaps.Web.Admin.Models.Users;
using TraVinhMaps.Web.Admin.Services.Admin;

namespace TraVinhMaps.Web.Admin.Controllers
{
    [Authorize]
    [Route("[controller]")]
    public class AdminController : Controller
    {
        private readonly IAdminService _adminService;

        public AdminController(IAdminService adminService)
        {
            _adminService = adminService;
        }

        [HttpGet("Profile")]
        public async Task<IActionResult> Profile()
        {
            try
            {
                // Get admin profile data
                var apiResponse = await _adminService.GetAdminProfileAsync();
                if (apiResponse == null)
                {
                    TempData["Error"] = "Unable to retrieve profile data.";
                    return RedirectToAction("Index", "Home");
                }
                return View(apiResponse);
            }
            catch (Exception ex)
            {
                TempData["Error"] = "An error occurred while loading profile data.";
                return RedirectToAction("Index", "Home");
            }
        }

        [HttpPost("UpdateProfile")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> UpdateProfile(AdminProfileUpdateRequest model)
        {
            try
            {
                // Image validation (if there is one)
                if (model.Avatar != null)
                {
                    // Check if file is empty
                    if (model.Avatar.Length == 0)
                    {
                        TempData["Error"] = "The uploaded file is empty.";
                        return RedirectToAction(nameof(Profile));
                    }

                    // Validate file extension
                    var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp" };
                    var extension = Path.GetExtension(model.Avatar.FileName).ToLowerInvariant();

                    if (!allowedExtensions.Contains(extension))
                    {
                        TempData["Error"] = "Invalid file format. Please upload an image file (JPEG, PNG, GIF, BMP, WebP).";
                        return RedirectToAction(nameof(Profile));
                    }

                    // Validate content type
                    var allowedContentTypes = new[] {
                        "image/jpeg", "image/jpg", "image/png", "image/gif",
                        "image/bmp", "image/webp", "image/svg+xml"
                    };

                    if (!allowedContentTypes.Contains(model.Avatar.ContentType))
                    {
                        TempData["Error"] = "Invalid file type. Please upload an image file.";
                        return RedirectToAction(nameof(Profile));
                    }

                    // Validate file size (e.g., max 5MB)
                    const int maxFileSizeInBytes = 5 * 1024 * 1024; // 5MB
                    if (model.Avatar.Length > maxFileSizeInBytes)
                    {
                        TempData["Error"] = "File size exceeds the maximum limit (5MB).";
                        return RedirectToAction(nameof(Profile));
                    }
                }

                // Call the service to update profile
                var result = await _adminService.UpdateProfileAsync(model);

                if (result)
                {
                    TempData["Success"] = "Profile updated successfully.";
                    return RedirectToAction(nameof(Profile));
                }
                else
                {
                    TempData["Error"] = "Failed to update profile. Please try again.";
                    return RedirectToAction(nameof(Profile));
                }
            }
            catch (Exception ex)
            {
                TempData["Error"] = "An error occurred while updating your profile: " + ex.Message;
                return RedirectToAction(nameof(Profile));
            }
        }

        // GET: Admin/Index
        [Authorize(Roles = "super-admin")]
        [HttpGet]
        public async Task<IActionResult> Index()
        {
            ViewData["Title"] = "Admin Management";
            ViewData["Breadcrumb"] = new List<BreadcrumbItem>
            {
                new BreadcrumbItem { Title = "Admin Management", Url = Url.Action("Index", "Admin")! },
                new BreadcrumbItem { Title = "Admin List" } // default URL for the current page
            };
            var admins = await _adminService.ListAllAsync() ?? new List<AdminResponse>(); ;
            return View(admins);
        }

        // GET: Admin/Details
        [HttpGet("Details")]
        public async Task<IActionResult> Details(string id)
        {
            ViewData["Title"] = "Admin Details";
            ViewData["Breadcrumb"] = new List<BreadcrumbItem>
            {
                new BreadcrumbItem { Title = "Admin Management", Url = Url.Action("Index", "Admin")! },
                new BreadcrumbItem { Title = "Admin Details" } // default URL for the current page
            };
            var admin = await _adminService.GetByIdAsync(id);
            if (admin == null)
            {
                return RedirectToAction("Index");
            }
            return View(admin);
        }

        [Authorize(Roles = "super-admin")]
        // GET: Admin/Create
        [HttpGet("Create")]
        public IActionResult Create()
        {
            ViewData["Title"] = "Admin Create";
            ViewData["Breadcrumb"] = new List<BreadcrumbItem>
            {
                new BreadcrumbItem { Title = "Admin Management", Url = Url.Action("Index", "Admin")! },
                new BreadcrumbItem { Title = "Admin Create" } // default URL for the current page
            };
            return View();
        }

        [Authorize(Roles = "super-admin")]
        // POST: Admin/Create
        [HttpPost("Create")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(AdminRequest request, CancellationToken cancellationToken = default)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToList();
                return Json(new { success = false, message = string.Join(", ", errors) });
            }

            try
            {
                var admin = await _adminService.AddAsync(request, cancellationToken);
                return Json(new
                {
                    success = true,
                    message = "Create the admin successfully!"
                });
            }
            catch (InvalidOperationException ex)
            {
                // Return the specific error message from the repository
                return Json(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = "Failed to create admin" });
            }
        }
        // Get: Admin/Restore
        [Authorize(Roles = "super-admin")]
        [HttpGet("Restore/{id}")]
        public async Task<IActionResult> Restore(string id)
        {
            var user = await _adminService.GetByIdAsync(id);
            return View(user);
        }

        // POST: Admin/Restore
        [Authorize(Roles = "super-admin")]
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

        // GET: Admin/Delete
        [HttpGet("Delete/{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var admin = await _adminService.GetByIdAsync(id);
            return View(admin);
        }

        // POST: Admin/Delete
        [Authorize(Roles = "super-admin")]
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

        // GET: Admin/Setting
        [HttpGet("setting")]
        public async Task<IActionResult> Settings()
        {
            ViewData["Title"] = "Security Settings";
            ViewData["Breadcrumb"] = new List<BreadcrumbItem>
            {
                new BreadcrumbItem { Title = "Admin", Url = Url.Action("", "")! },
                new BreadcrumbItem { Title = "Setting" } // default URL for the current page
            };
            var settingProfile = await _adminService.GetSettingProfileAsync();
            return View(settingProfile);
        }
    }
}
