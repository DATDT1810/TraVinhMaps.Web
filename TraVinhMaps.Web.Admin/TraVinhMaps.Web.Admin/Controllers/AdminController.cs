using Microsoft.AspNetCore.Mvc;
using TraVinhMaps.Web.Admin.Models.Users;
using TraVinhMaps.Web.Admin.Services.Admin;

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

        [HttpGet("Profile")]
        public async Task<IActionResult> Profile()
        {
            try
            {
                //    ViewData["Title"] = "User Profile";
                //    ViewData["Breadcrumb"] = new List<string> { "User Management", "Profile" };

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

                if (result != null)
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
                TempData["Error"] = "An error occurred while updating your profile.";
                return RedirectToAction(nameof(Profile));
            }
        }
    }
}

