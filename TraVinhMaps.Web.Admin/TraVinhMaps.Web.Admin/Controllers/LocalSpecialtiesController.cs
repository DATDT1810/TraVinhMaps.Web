using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using TraVinhMaps.Web.Admin.Models;
using TraVinhMaps.Web.Admin.Models.LocalSpecialties;
using TraVinhMaps.Web.Admin.Models.Tags;
using TraVinhMaps.Web.Admin.Services.LocalSpecialties;
using TraVinhMaps.Web.Admin.Services.Markers;
using TraVinhMaps.Web.Admin.Services.Tags;

namespace TraVinhMaps.Web.Admin.Controllers
{
    [Route("[controller]")]
    public class LocalSpecialtiesController : Controller
    {
        private readonly ILocalSpecialtiesService _localSpecialtiesService;
        private readonly ITagService _tagService;
        private readonly IMarkerService _markerService;

        // Constructor: Injects dependencies for local specialties and tag services
        public LocalSpecialtiesController(ILocalSpecialtiesService localSpecialtiesService, ITagService tagService, IMarkerService markerService)
        {
            _localSpecialtiesService = localSpecialtiesService;
            _tagService = tagService;
            _markerService = markerService;
        }

        // GET: /LocalSpecialties/Index
        // Retrieves and displays a list of all local specialties
        [HttpGet("Index")]
        public async Task<IActionResult> Index()
        {
            ViewData["Title"] = "Local Specialties";
            ViewData["Breadcrumb"] = new List<BreadcrumbItem>
            {
                new BreadcrumbItem { Title = "Local Specialties Management", Url = Url.Action("Index", "LocalSpecialties")! },
                new BreadcrumbItem { Title = "Local Specialties List" } // default URL for the current page
            };
            var localSpecialties = await _localSpecialtiesService.ListAllAsync();
            return View(localSpecialties);
        }

        // GET: /LocalSpecialties/Details/{id}
        // Displays details of a specific local specialty by ID
        [HttpGet("Details/{id}")]
        public async Task<IActionResult> LocalSpecialtiesDetails(string id)
        {
            ViewData["Title"] = "Local Specialties Details";
            ViewData["Breadcrumb"] = new List<BreadcrumbItem>
            {
                new BreadcrumbItem { Title = "Local Specialties Management", Url = Url.Action("Index", "LocalSpecialties")! },
                new BreadcrumbItem { Title = "Local Specialties Details" } // default URL for the current page
            };
            try
            {
                var localSpecialty = await _localSpecialtiesService.GetByIdAsync(id);
                if (localSpecialty == null)
                {
                    return NotFound();
                }

                // Lấy tag "Local Specialty"
                var tagId = await _tagService.GetTagIdByNameAsync("Local specialty");
                var localSpecialTag = new Tag
                {
                    Id = tagId,
                    Name = "Local specialty"
                };
                ViewBag.LocalSpecialTag = localSpecialTag;

                // Lấy marker "Sell Location"
                var markers = await _markerService.ListAllAsync();
                var sellLocationMarker = markers.FirstOrDefault(m => m.Name == "Sell Location");
                if (sellLocationMarker == null)
                {
                    throw new HttpRequestException("Marker 'Sell Location' not found.");
                }
                ViewBag.SellLocationMarker = sellLocationMarker;

                return View(localSpecialty);
            }
            catch (Exception ex)
            {
                TempData["Error"] = $"Error: {ex.Message}";
                return RedirectToAction("Index");
            }
        }

        // GET: /LocalSpecialties/Restore/{id}
        // Displays a confirmation view for restoring a deleted local specialty
        [HttpGet("Restore/{id}")]
        public async Task<IActionResult> Restore(string id)
        {
            var localSpecialties = await _localSpecialtiesService.GetByIdAsync(id);
            return View(localSpecialties);
        }

        // POST: /LocalSpecialties/Restore
        // Handles the restoration of a deleted local specialty
        [HttpPost("Restore")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> RestoreConfirm(string id, CancellationToken cancellationToken = default)
        {
            try
            {
                var success = await _localSpecialtiesService.RestoreLocalSpecialtiesAsync(id, cancellationToken);
                if (success)
                {
                    return Json(new { success = true, message = "Local Specialties restored successfully" });
                }
                return Json(new { success = false, message = "Failed to restore Local Specialties" });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Error restoring local specialties: {ex.Message}" });
            }
        }

        // GET: /LocalSpecialties/Delete/{id}
        // Displays a confirmation view for deleting a local specialty
        [HttpGet("Delete/{id}")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Delete(string id)
        {
            var localSpecialties = await _localSpecialtiesService.GetByIdAsync(id);
            return View(localSpecialties);
        }

        // POST: /LocalSpecialties/Delete
        // Handles the deletion of a local specialty
        [HttpPost("Delete")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteConfirm(string id, CancellationToken cancellationToken)
        {
            try
            {
                await _localSpecialtiesService.DeleteLocalSpecialtiesAsync(id, cancellationToken);
                return Json(new { success = true, message = "Local Specialties deleted successfully" });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Error deleting local specialties: {ex.Message}" });
            }
        }

        // GET: /LocalSpecialties/Create
        // Displays the form for creating a new local specialty
        [HttpGet("Create")]
        public async Task<IActionResult> Create()
        {
            ViewData["Title"] = "Create Local Specialty";
            ViewData["Breadcrumb"] = new List<BreadcrumbItem>
            {
                new BreadcrumbItem { Title = "Local Specialties Management", Url = Url.Action("Index", "LocalSpecialties")! },
                new BreadcrumbItem { Title = "Create Local Specialty" } // default URL for the current page
            };
            try
            {
                // fetch tag "Local Specialty"
                var tagId = await _tagService.GetTagIdByNameAsync("Local specialty");
                var localSpecialTag = new Tag
                {
                    Id = tagId,
                    Name = "Local specialty"
                };
                ViewBag.LocalSpecialTag = localSpecialTag;

                // fetch marker "Sell Location"
                var markers = await _markerService.ListAllAsync();
                var sellLocationMarker = markers.FirstOrDefault(m => m.Name == "Sell Location");
                if (sellLocationMarker == null)
                {
                    throw new HttpRequestException("Marker 'Sell Location' not found.");
                }
                ViewBag.SellLocationMarker = sellLocationMarker;
            }
            catch (HttpRequestException ex)
            {
                TempData["CreateLocalSpecialtiesError"] = $"Error: {ex.Message}";
                return RedirectToAction("Index");
            }
            return View(new CreateSpecialtyViewModel());
        }

        // POST: /LocalSpecialties/Create
        // Handles the creation of a new local specialty
        [HttpPost("Create")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(CreateSpecialtyViewModel request, CancellationToken cancellationToken)
        {
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp" };

            if (request.Images == null || !request.Images.Any())
            {
                TempData["CreateLocalSpecialtiesError"] = "You must upload at least one image.";
                return View(request);
            }
            else
            {
                if (request.Images.Count > 5)
                {
                    TempData["CreateLocalSpecialtiesError"] = "You can upload a maximum of 5 images.";
                    return View(request);
                }

                foreach (var file in request.Images)
                {
                    if (file.Length == 0) continue;
                    var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
                    if (!allowedExtensions.Contains(ext))
                    {
                        TempData["CreateLocalSpecialtiesError"] = $"Unsupported file format. Allowed formats are: {string.Join(", ", allowedExtensions)}.";
                        break;
                    }
                }
            }
            if (!ModelState.IsValid)
            {
                return View(request ?? new CreateSpecialtyViewModel());
            }
            try
            {
                var localSpecial = await _localSpecialtiesService.AddAsync(request, cancellationToken);
                TempData["CreateLocalSpecialtiesSuccess"] = "The local specialties was created successfully!";
                return RedirectToAction("Index");
            }
            catch (HttpRequestException ex)
            {
                ModelState.AddModelError("", $"Error creating local specialty: {ex.Message}");
                TempData["CreateLocalSpecialtiesError"] = "Failed to add the local specialties!";
                return View(request);
            }
            catch (Exception ex)
            {
                ModelState.AddModelError("", $"Unexpected error: {ex.Message}");
                TempData["CreateLocalSpecialtiesError"] = "Failed to add the local specialties!";
                return View(request);
            }
        }

        // GET: /LocalSpecialties/CreatePointOfSell
        // Displays the form for creating a new point of sale for a local specialty
        [HttpGet("CreatePointOfSell")]
        public IActionResult CreatePointOfSell()
        {
            return View();
        }

        // POST: /LocalSpecialties/CreatePointOfSell
        // Handles the creation of a new point of sale for a local specialty
        [HttpPost("CreatePointOfSell")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> CreatePointOfSell(AddLocationRequest request, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage);
                return Json(new { success = false, message = string.Join("; ", errors) });
            }

            try
            {
                var pointOfSell = await _localSpecialtiesService.AddSellLocationAsync(request.Id, request, cancellationToken);
                return Json(new { success = true, message = "The point of sell was created successfully!" });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Failed to create point of sell: {ex.Message}" });
            }
        }

        // POST: /LocalSpecialties/DeleteLocalSpecialtiesImage
        // Handles the deletion of an image associated with a local specialty
        [HttpPost("DeleteLocalSpecialtiesImage")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteLocalSpecialtiesImage(DeleteImageLocalSpecialtiesRequest request)
        {
            if (string.IsNullOrEmpty(request.Id) || string.IsNullOrEmpty(request.ImageUrl))
            {
                return Json(new { success = false, message = "Missing local specialty ID or image URL." });
            }
            try
            {
                await _localSpecialtiesService.DeleteLocalSpecialtiesImage(request.Id, request.ImageUrl);
                return Json(new { success = true, message = "Image of local specialty deleted successfully!" });
            }
            catch (HttpRequestException ex)
            {
                return Json(new { success = false, message = $"Failed to delete image: {ex.Message}" });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Unexpected error: {ex.Message}" });
            }
        }

        // POST: /LocalSpecialties/AddLocalSpecialtiesImage
        // Handles the addition of new images to a local specialty
        [HttpPost("AddLocalSpecialtiesImage")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> AddLocalSpecialtiesImage(AddImageLocalSpecialtiesRequest request)
        {
            if (string.IsNullOrEmpty(request.Id) || request.ImageFile == null || !request.ImageFile.Any())
            {
                return Json(new { success = false, message = "Please select images and provide the local specialty ID." });
            }

            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp" };
            var maxFileSize = 5 * 1024 * 1024; // 5 MB
            var maxImages = 5;

            if (request.ImageFile.Count > maxImages)
            {
                return Json(new { success = false, message = $"You can upload up to {maxImages} images only." });
            }

            foreach (var file in request.ImageFile)
            {
                if (file.Length == 0)
                {
                    return Json(new { success = false, message = $"File '{file.FileName}' is empty." });
                }

                if (file.Length > maxFileSize)
                {
                    return Json(new { success = false, message = $"File '{file.FileName}' exceeds the maximum size of 5 MB." });
                }

                var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
                if (!allowedExtensions.Contains(extension))
                {
                    return Json(new { success = false, message = $"File '{file.FileName}' has an unsupported format. Allowed: {string.Join(", ", allowedExtensions)}" });
                }
            }

            try
            {
                var imageUrls = await _localSpecialtiesService.AddLocalSpecialtiesImage(request);
                return Json(new { success = true, message = "Images uploaded successfully!", imageUrls });
            }
            catch (HttpRequestException ex)
            {
                // Gợi ý: Log ex.Message nội bộ, không show cho user
                return Json(new
                {
                    success = false,
                    message = "Failed to upload images. Please check your internet connection or try again later."
                });
            }
            catch (Exception ex)
            {
                // Log lỗi thật vào hệ thống log để điều tra (không cho người dùng biết detail)
                return Json(new
                {
                    success = false,
                    message = "An unexpected error occurred during image upload. Please try again later or contact support."
                });
            }
        }


        // GET: /LocalSpecialties/UpdateSellLocation
        // Displays the form for updating a point of sale for a local specialty
        [HttpGet("UpdateSellLocation")]
        public async Task<IActionResult> UpdateSellLocation(string id, string locationName)
        {
            var localSpecialty = await _localSpecialtiesService.GetByIdAsync(id);
            if (localSpecialty == null)
            {
                TempData["ErrorMessage"] = "Local specialty not found.";
                return RedirectToAction("Index");
            }
            var location = localSpecialty.Locations?.FirstOrDefault(s => s.Name == locationName);
            if (location == null)
            {
                TempData["ErrorMessage"] = "Sell location not found.";
                return RedirectToAction("LocalSpecialtiesDetails", new { id });
            }
            var viewModel = new LocalSpecialtyLocationViewModel
            {
                Id = id,
                LocationId = location.LocationId,
                Name = location.Name,
                Address = location.Address,
                // MarkerId = location.MarkerId,
                Type = location.Location?.Type ?? "Point",
                Longitude = location.Location?.Coordinates?.FirstOrDefault() ?? 0,
                Latitude = location.Location?.Coordinates?.Skip(1).FirstOrDefault() ?? 0
            };
            return View(viewModel);
        }

        // POST: /LocalSpecialties/UpdateSellLocation
        // Handles the update of a point of sale for a local specialty
        [HttpPost("UpdateSellLocation")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> UpdateSellLocation(string id, LocalSpecialtyLocationViewModel viewModel, CancellationToken cancellationToken = default)
        {
            // Check ID
            if (string.IsNullOrEmpty(id) || string.IsNullOrEmpty(viewModel.Id) || id != viewModel.Id)
            {
                return Json(new { success = false, message = "Invalid local specialty ID." });
            }

            // From LocalSpecialtyLocationViewModel to LocalSpecialtyLocation
            var location = new LocalSpecialtyLocation
            {
                LocationId = viewModel.LocationId,
                Name = viewModel.Name,
                Address = viewModel.Address,
                Location = new Location
                {
                    Type = viewModel.Type ?? "Point",
                    Coordinates = new List<double> { viewModel.Longitude, viewModel.Latitude }
                }
            };

            // Lấy marker "Sell Location" và gán MarkerId trước khi gọi service
            var markers = await _markerService.ListAllAsync();
            var sellLocationMarker = markers.FirstOrDefault(m => m.Name == "Sell Location");
            if (sellLocationMarker == null)
            {
                return Json(new { success = false, message = "Marker 'Sell Location' not found." });
            }
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage);
                return Json(new { success = false, message = string.Join("; ", errors) });
            }

            try
            {
                var updateRequest = new UpdateLocationRequest
                {
                    LocationId = location.LocationId,
                    Name = location.Name,
                    Address = location.Address,
                    Location = new LocationsRequest
                    {
                        Type = location.Location.Type,
                        Coordinates = location.Location.Coordinates
                    }
                };

                await _localSpecialtiesService.UpdateSellLocationAsync(id, updateRequest, cancellationToken);
                return Json(new { success = true, message = "Sell location updated successfully!" });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Failed to update sell location: {ex.Message}" });
            }
        }

        // DELETE: /LocalSpecialties/DeleteSellLocation/{id}/{locationId}
        // Handles the deletion of a point of sale for a local specialty
        [HttpDelete("DeleteSellLocation/{id}/{locationId}")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteSellLocation(string id, string locationId, CancellationToken cancellationToken)
        {
            try
            {
                var success = await _localSpecialtiesService.RemoveSellLocationAsync(id, locationId, cancellationToken);
                return Json(new { success });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Error deleting sell location: {ex.Message}" });
            }
        }

        // GET: /LocalSpecialties/EditLocalSpecialty
        // Displays the form for editing an existing local specialty
        [HttpGet("EditLocalSpecialty")]
        public async Task<IActionResult> EditLocalSpecialty(string id)
        {
            ViewData["Title"] = "Edit Local Specialty";
            ViewData["Breadcrumb"] = new List<BreadcrumbItem>
            {
                new BreadcrumbItem { Title = "Local Specialties Management", Url = Url.Action("Index", "LocalSpecialties")! },
                new BreadcrumbItem { Title = "Edit Local Specialties" } // default URL for the current page
            };
            try
            {
                var localSpecialty = await _localSpecialtiesService.GetByIdAsync(id);
                if (localSpecialty == null)
                {
                    return RedirectToAction("Index");
                }
                var model = new UpdateLocalSpecialtiesRequest
                {
                    Id = localSpecialty.Id,
                    FoodName = localSpecialty.FoodName,
                    Description = localSpecialty.Description,
                    TagId = localSpecialty.TagId,
                    Status = localSpecialty.Status,
                    UpdateAt = localSpecialty.UpdateAt ?? DateTime.UtcNow
                };
                var tags = await _tagService.ListAllAsync();
                ViewBag.Tags = new SelectList(tags, "Id", "Name", localSpecialty.TagId);
                return View(model);
            }
            catch (Exception)
            {
                return RedirectToAction("Index");
            }
        }

        // POST: /LocalSpecialties/EditLocalSpecialty
        // Handles the update of an existing local specialty
        [HttpPost("EditLocalSpecialty")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> EditLocalSpecialty(UpdateLocalSpecialtiesRequest request, CancellationToken cancellationToken)
        {
            try
            {
                await _localSpecialtiesService.UpdateAsync(request);
                TempData["EditLocalSpecialtySuccess"] = "Local specialty updated successfully!";
                return RedirectToAction("Index");
            }
            catch (Exception)
            {
                TempData["EditLocalSpecialtyError"] = "Failed to update the local specialty!";
                return View(request);
            }
        }
    }
}