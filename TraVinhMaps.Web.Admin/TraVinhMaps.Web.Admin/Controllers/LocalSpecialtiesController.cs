using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using TraVinhMaps.Web.Admin.Models.LocalSpecialties;
using TraVinhMaps.Web.Admin.Services.LocalSpecialties;
using TraVinhMaps.Web.Admin.Services.Tags;

namespace TraVinhMaps.Web.Admin.Controllers
{
    [Route("[controller]")]
    public class LocalSpecialtiesController : Controller
    {
        private readonly ILocalSpecialtiesService _localSpecialtiesService;
        private readonly ITagService _tagService;

        // Constructor: Injects dependencies for local specialties and tag services
        public LocalSpecialtiesController(ILocalSpecialtiesService localSpecialtiesService, ITagService tagService)
        {
            _localSpecialtiesService = localSpecialtiesService;
            _tagService = tagService;
        }

        // GET: /LocalSpecialties/Index
        // Retrieves and displays a list of all local specialties
        [HttpGet("Index")]
        public async Task<IActionResult> Index()
        {
            ViewData["Title"] = "Local Specialties";
            ViewData["Breadcrumb"] = new List<string> { "Local Specialties  ", "Local Specialties List" };
            var localSpecialties = await _localSpecialtiesService.ListAllAsync();
            return View(localSpecialties);
        }

        // GET: /LocalSpecialties/Details/{id}
        // Displays details of a specific local specialty by ID
        [HttpGet("Details/{id}")]
        public async Task<IActionResult> LocalSpecialtiesDetails(string id)
        {
            ViewData["Title"] = "Local Specialties";
            ViewData["Breadcrumb"] = new List<string> { "Local Specialties", "Local Specialties Details" };
            var localSpecialties = await _localSpecialtiesService.GetByIdAsync(id);
            var tag = await _tagService.GetByIdAsync(localSpecialties.TagId);
            ViewBag.TagName = tag?.Name ?? "";
            return View(localSpecialties);
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
            ViewData["Title"] = "Local Specialties";
            ViewData["Breadcrumb"] = new List<string> { "Local Specialties Management", "Local Specialties List" };
            var tags = await _tagService.ListAllAsync();
            ViewBag.Tags = new SelectList(tags, "Id", "Name");
            return View(new CreateSpecialtyViewModel());
        }

        // POST: /LocalSpecialties/Create
        // Handles the creation of a new local specialty
        [HttpPost("Create")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(CreateSpecialtyViewModel request, CancellationToken cancellationToken)
        {
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp" };
            if (request.Images != null && request.Images.Any())
            {
                if (request.Images.Count > 5)
                {
                    ModelState.AddModelError("Images", "You can upload a maximum of 5 images.");
                }
                foreach (var file in request.Images)
                {
                    if (file.Length == 0) continue;
                    var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
                    if (!allowedExtensions.Contains(ext))
                    {
                        ModelState.AddModelError("Images", $"Unsupported file format. Allowed formats are: {string.Join(", ", allowedExtensions)}.");
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
                TempData["CreateTipsError"] = "Failed to add the local specialties!";
                return View(request);
            }
            catch (Exception ex)
            {
                ModelState.AddModelError("", $"Unexpected error: {ex.Message}");
                TempData["CreateTipsError"] = "Failed to add the local specialties!";
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
            // Log dữ liệu nhận được
            Console.WriteLine($"Received AddLocationRequest: {Newtonsoft.Json.JsonConvert.SerializeObject(request)}");

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
                return Json(new { success = false, message = "Missing local specialty ID or no images selected." });
            }
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp" };
            var maxFileSize = 5 * 1024 * 1024; // 5 MB
            var maxImages = 5; // Max 5 images
            if (request.ImageFile.Count > maxImages)
            {
                return Json(new { success = false, message = $"You can upload a maximum of {maxImages} images." });
            }
            foreach (var file in request.ImageFile)
            {
                if (file.Length == 0)
                {
                    return Json(new { success = false, message = $"File {file.FileName} is empty." });
                }
                if (file.Length > maxFileSize)
                {
                    return Json(new { success = false, message = $"File {file.FileName} exceeds the maximum size of 5 MB." });
                }
                var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
                if (!allowedExtensions.Contains(extension))
                {
                    return Json(new { success = false, message = $"File {file.FileName} has an unsupported format. Allowed formats: {string.Join(", ", allowedExtensions)}." });
                }
            }
            try
            {
                var imageUrls = await _localSpecialtiesService.AddLocalSpecialtiesImage(request);
                return Json(new { success = true, message = "Images uploaded successfully!", imageUrls });
            }
            catch (HttpRequestException ex)
            {
                return Json(new { success = false, message = $"Failed to upload images: {ex.Message}" });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Unexpected error: {ex.Message}" });
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
                MarkerId = location.MarkerId,
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
            if (!ModelState.IsValid)
            {
                return Json(new { success = false, message = string.Join("; ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage)) });
            }
            if (string.IsNullOrEmpty(id) || string.IsNullOrEmpty(viewModel.Id) || id != viewModel.Id)
            {
                return Json(new { success = false, message = "Invalid local specialty ID." });
            }
            var location = new UpdateLocationRequest
            {
                LocationId = viewModel.LocationId,
                Name = viewModel.Name,
                Address = viewModel.Address,
                MarkerId = viewModel.MarkerId,
                Location = new LocationsRequest
                {
                    Type = viewModel.Type ?? "Point",
                    Coordinates = (viewModel.Longitude == 0 && viewModel.Latitude == 0)
                        ? new List<double> { 0, 0 }
                        : new List<double> { viewModel.Longitude, viewModel.Latitude }
                }
            };
            try
            {
                await _localSpecialtiesService.UpdateSellLocationAsync(id, location, cancellationToken);
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
            ViewData["Breadcrumb"] = new List<string> { "Local Specialties", "Edit" };
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