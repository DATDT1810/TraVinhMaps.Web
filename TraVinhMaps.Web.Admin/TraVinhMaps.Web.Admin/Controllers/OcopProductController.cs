using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TraVinhMaps.Web.Admin.Models.Location;
using TraVinhMaps.Web.Admin.Models.OcopProduct;
using TraVinhMaps.Web.Admin.Models.SellLocation;
using TraVinhMaps.Web.Admin.Services.OcopProduct;

namespace TraVinhMaps.Web.Admin.Controllers
{
    [Route("Admin/OcopProduct")]
    public class OcopProductController : Controller
    {
        private readonly IOcopProductService _ocopProductService;
        public OcopProductController(IOcopProductService ocopProductService)
        {
            _ocopProductService = ocopProductService;
        }
        public async Task<IActionResult> Index()
        {
            var listOcopProduct = await _ocopProductService.ListAllAsync();
            return View(listOcopProduct);
        }

        [HttpGet("Detail/{id}")]
        public async Task<IActionResult> DetailOcopProduct(string id, CancellationToken cancellationToken = default)
        {
            var ocopProduct = await _ocopProductService.GetByIdAsync(id);
            ViewBag.OcopProductId = id;
            if (ocopProduct != null)
    {
        // Chuyển ObjectId thành chuỗi nếu cần
        ocopProduct.TagId = ocopProduct.TagId?.ToString().Replace("ObjectId(\"", "").Replace("\")", "");
    }
            return View(ocopProduct);
        }

        [HttpGet("UpdateOcopProduct")]
        public async Task<IActionResult> UpdateOcopProduct(string id)
        {
            var findOcopProduct = await _ocopProductService.GetByIdAsync(id);
            if (findOcopProduct == null)
            {
                return View("Ocop product not found.");
            }
            UpdateOcopProductRequest updateOcopProductRequest = new UpdateOcopProductRequest
            {
                Id = findOcopProduct.Id,
                ProductName = findOcopProduct.ProductName,
                ProductDescription = findOcopProduct.ProductDescription,
                ProductPrice = findOcopProduct.ProductPrice,
                OcopTypeId = findOcopProduct.OcopTypeId,
                UpdateAt = findOcopProduct.UpdateAt,
                CompanyId = findOcopProduct.CompanyId,
                OcopPoint = findOcopProduct.OcopPoint,
                OcopYearRelease = findOcopProduct.OcopYearRelease,
                TagId = findOcopProduct.TagId,
                SellingLinkId = findOcopProduct.SellingLinkId
            };
            return View(updateOcopProductRequest);
        }

        [HttpPost("UpdateOcopProductPost")]
        public async Task<IActionResult> UpdateOcopProductPost(OcopProductResponse request, CancellationToken cancellationToken = default)
        {
            var existingProduct = await _ocopProductService.GetByIdAsync(request.Id);
            if (existingProduct == null)
            {
                return NotFound();
            }
            var updateOcopProductRequest = new UpdateOcopProductRequest
            {
                Id = request.Id,
                ProductName = request.ProductName,
                ProductDescription = request.ProductDescription,
                ProductPrice = request.ProductPrice,
                OcopTypeId = request.OcopTypeId,
                UpdateAt = request.UpdateAt,
                CompanyId = request.CompanyId,
                OcopPoint = request.OcopPoint,
                OcopYearRelease = request.OcopYearRelease,
                TagId = request.TagId,
                SellingLinkId = request.SellingLinkId
            };

            try
            {
                await _ocopProductService.UpdateAsync(updateOcopProductRequest);
            }
            catch (Exception ex)
            {
                TempData["ErrorMessage"] = "Something went wrong, please try again: " + ex.Message + "\n" + ex.StackTrace;
                return View("UpdateOcopProduct", request);
            }
            TempData["SuccessMessage"] = "Ocop product updated successfully!";
            return RedirectToAction("Index");
        }
        [HttpPost("DeleteOcopProduct")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteOcopProduct(string id, CancellationToken cancellationToken = default)
        {
            try
            {
                await _ocopProductService.DeleteOcopProductAsync(id);
                return Json(new { success = true, message = "Delete destination successfully" });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Error delete destination: {ex.Message}" });
            }
        }


        [HttpPost("RestoreOcopProduct")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> RestoreOcopProduct(string id, CancellationToken cancellationToken = default)
        {
            try
            {
                await _ocopProductService.RestoreOcopProductAsync(id);
                return Json(new { success = true, message = "Restore ocop product successfully" });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Error restore ocop product : {ex.Message}" });
            }
        }
        [HttpGet("CreateSellLocation")]
        public IActionResult CreateSellLocation(string id)
        {
            ViewBag.OcopProductId = id;
            return View(new SellLocationViewModel());
        }
        [HttpPost("CreateSellLocation")]
        public async Task<IActionResult> CreateSellLocation(string id, SellLocationViewModel sellLocationViewModel, CancellationToken cancellationToken = default)
        {
            if (!ModelState.IsValid)
            {
                var errorMessages = ModelState.Where(ms => ms.Value.Errors.Count > 0)
                                              .Select(ms => $"Key: {ms.Key}, Errors: {string.Join(", ", ms.Value.Errors.Select(e => e.ErrorMessage))}")
                                              .ToList();
                ViewBag.ErrorMessage = string.Join("<br/>", errorMessages);
                return View(sellLocationViewModel);
            }
            var sellLocation = new SellLocationResponse
            {
                Id = id,
                LocationName = sellLocationViewModel.LocationName,
                LocationAddress = sellLocationViewModel.LocationAddress,
                Location = new LocationResponse
                {
                    Type = sellLocationViewModel.Type,
                    Coordinates = new List<double>()
                }
            };
            if (sellLocationViewModel.Longitude != 0 && sellLocationViewModel.Latitude != 0)
            {
                sellLocation.Location.Coordinates = new List<double> { sellLocationViewModel.Longitude, sellLocationViewModel.Latitude };
            }
            try
            {
                var result = await _ocopProductService.AddSellLocation(id, sellLocation, cancellationToken);
                ViewBag.OcopProductId = id;
                TempData["SuccessMessage"] = "Sell location add successfully!";
                return RedirectToAction("DetailOcopProduct", new { id });
            }
            catch (Exception ex)
            {
                TempData["ErrorMessage"] = "Something went wrong, please try again: " + ex.Message + "\n" + ex.StackTrace;
                return View("CreateSellLocation", sellLocationViewModel);
            }
        }
        [HttpGet("UpdateSellLocation")]
        public async Task<IActionResult> UpdateSellLocation(string id, string locationName)
        {
            var findOcopProduct = await _ocopProductService.GetByIdAsync(id);
            if (findOcopProduct == null)
            {
                return View("Ocop product not found.");
            }
            ViewBag.OcopProductId = id;
            var sellLocation = findOcopProduct.Sellocations?.FirstOrDefault(s => s.LocationName == locationName);
            if (sellLocation == null) return NotFound("Sell location not found.");
            SellLocationViewModel sellLocationViewModel = new SellLocationViewModel
            {
                Id = sellLocation.Id,
                LocationName = sellLocation.LocationName,
                LocationAddress = sellLocation.LocationAddress,
                Type = sellLocation.Location?.Type,
                Longitude = sellLocation.Location?.Coordinates?.FirstOrDefault() ?? 0,
                Latitude = sellLocation.Location?.Coordinates?.Skip(1).FirstOrDefault() ?? 0,
            };
            return View(sellLocationViewModel);
        }

        [HttpPost("UpdateSellLocationPost")]
        public async Task<IActionResult> UpdateSellLocationPost(string id, SellLocationViewModel sellLocationViewModel, CancellationToken cancellationToken = default)
        {
            if (!ModelState.IsValid)
            {
                var errorMessages = ModelState.Where(ms => ms.Value.Errors.Count > 0)
                                              .Select(ms => $"Key: {ms.Key}, Errors: {string.Join(", ", ms.Value.Errors.Select(e => e.ErrorMessage))}")
                                              .ToList();
                TempData["ErrorMessage"] = string.Join("<br/>", errorMessages);
                return View("UpdateSellLocation", sellLocationViewModel);
            }
            var sellLocation = new SellLocationResponse
            {
                Id = id,
                LocationName = sellLocationViewModel.LocationName,
                LocationAddress = sellLocationViewModel.LocationAddress,
                Location = new LocationResponse
                {
                    Type = sellLocationViewModel.Type,
                    Coordinates = new List<double>()
                }
            };
            if (sellLocationViewModel.Longitude != 0 && sellLocationViewModel.Latitude != 0)
            {
                sellLocation.Location.Coordinates = new List<double> { sellLocationViewModel.Latitude, sellLocationViewModel.Longitude };
            }
            try
            {
                var result = await _ocopProductService.UpdateSellLocation(id, sellLocation, cancellationToken);
                TempData["SuccessMessage"] = "Sell location update successfully!";
                return RedirectToAction("DetailOcopProduct", new { id });
            }
            catch (Exception ex)
            {
                TempData["ErrorMessage"] = "Something went wrong, please try again: " + ex.Message + "\n" + ex.StackTrace;
                return View("UpdateSellLocation", sellLocationViewModel);
            }
        }
        [HttpDelete("DeleteSellLocation/{id}/{name}")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteSellLocation(string id, string name, CancellationToken cancellationToken = default)
        {
            try
            {
                await _ocopProductService.DeleteSellLocation(id, name, cancellationToken);
                return Json(new { success = true });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Error delete sell location: {ex.Message}" });
            }
        }
        [HttpPost("AddOcopProductImage")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> AddOcopProductImage(string id, List<IFormFile> imageFile)
        {
            if (string.IsNullOrEmpty(id))
            {
                TempData["ErrorMessage"] = "Missing product ID.";
                return RedirectToAction("DetailOcopProduct", new { id = id ?? "unknown" });
            }

            if (imageFile == null || imageFile.Count == 0)
            {
                TempData["ErrorMessage"] = "Please select at least one photo.";
                return RedirectToAction("DetailOcopProduct", new { id });
            }
            try
            {
                var imageUrls = await _ocopProductService.AddImageOcopProduct(id, imageFile);
                if (imageUrls != null && imageUrls.Any())
                {
                    TempData["SuccessMessage"] = "Image of ocop product added successfully!";
                }
                else
                {
                    TempData["ErrorMessage"] = "No images were added.";
                }
                return RedirectToAction("DetailOcopProduct", new { id });
            }
            catch (HttpRequestException ex)
            {
                TempData["ErrorMessage"] = $"Fail add image: {ex.Message}";
                return RedirectToAction("DetailOcopProduct", new { id });
            }
        }
        [HttpPost("DeleteOcopProductImage")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteOcopProductImage(string id, string imageUrl)
        {
            if (string.IsNullOrEmpty(id) || string.IsNullOrEmpty(imageUrl))
            {
                TempData["ErrorMessage"] = "Missing product ID or image URL.";
                return RedirectToAction("DetailOcopProduct", new { id = id ?? "unknown" });
            }
            try
            {
                await _ocopProductService.DeleteImageOcopProduct(id, imageUrl);
                TempData["SuccessMessage"] = "Image of ocop product deleted successfully!";
                return RedirectToAction("DetailOcopProduct", new { id });
            }
            catch (HttpRequestException ex)
            {
                TempData["ErrorMessage"] = $"Failed to delete image: {ex.Message}";
                return RedirectToAction("DetailOcopProduct", new { id });
            }
        }
        [HttpGet("CreateOcopProduct")]
        public async Task<IActionResult> CreateOcopProduct()
        {
            return View();
        }
        [HttpPost("CreateOcopProductPost")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> CreateOcopProductPost(CreateOcopProductRequest createOcopProductRequest, CancellationToken cancellationToken = default)
        {
            if (!ModelState.IsValid)
            {
                var errorMessages = ModelState.Where(ms => ms.Value.Errors.Count > 0)
                                            .Select(ms => $"Key: {ms.Key}, Errors: {string.Join(", ", ms.Value.Errors.Select(e => e.ErrorMessage))}")
                                            .ToList();
                TempData["ErrorMessage"] = string.Join("<br/>", errorMessages);
                return View("CreateOcopProduct", createOcopProductRequest);
            }
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp" };
            if (createOcopProductRequest.ProductImageFile != null && createOcopProductRequest.ProductImageFile.Any())
            {
                foreach (var file in createOcopProductRequest.ProductImageFile)
                {
                    var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
                    if (!allowedExtensions.Contains(extension))
                    {
                        ModelState.AddModelError("ProductImageFile",
                            $"File \"{file.FileName}\" is not a supported image format. Allowed formats: {string.Join(", ", allowedExtensions)}.");
                        TempData["ErrorMessage"] = ModelState["ProductImageFile"]?.Errors.FirstOrDefault()?.ErrorMessage;
                        return View("CreateOcopProduct", createOcopProductRequest);
                    }
                }
            }
            else
            {
                ModelState.AddModelError("ProductImageFile", "At least one product image is required.");
                TempData["ErrorMessage"] = ModelState["ProductImageFile"]?.Errors.FirstOrDefault()?.ErrorMessage;
                return View("CreateOcopProduct", createOcopProductRequest);
            }
            try
            {
                var result = await _ocopProductService.AddAsync(createOcopProductRequest, cancellationToken);
                if (result?.value?.data == null)
                {
                    TempData["ErrorMessage"] = "Failed to create ocop product: No data returned.";
                    return View("CreateOcopProduct", createOcopProductRequest);
                }

                var createdProduct = new OcopProductResponse
                {
                    Id = result.value.data.Id,
                    ProductName = result.value.data.ProductName,
                    ProductDescription = result.value.data.ProductDescription,
                    ProductImage = result.value.data.ProductImage,
                    ProductPrice = result.value.data.ProductPrice,
                    OcopTypeId = result.value.data.OcopTypeId,
                    Status = result.value.data.Status,
                    Sellocations = result.value.data.Sellocations,
                    CompanyId = result.value.data.CompanyId,
                    OcopPoint = result.value.data.OcopPoint,
                    OcopYearRelease = result.value.data.OcopYearRelease,
                    TagId = result.value.data.TagId,
                    SellingLinkId = result.value.data.SellingLinkId,
                    CreatedAt = result.value.data.CreatedAt,
                    UpdateAt = result.value.data.UpdateAt
                };

                TempData["SuccessMessage"] = "Ocop product created successfully!";
                return RedirectToAction("Index");
            }
            catch (HttpRequestException ex)
            {
                TempData["ErrorMessage"] = $"Failed to create ocop product: {ex.Message}";
                return View("CreateOcopProduct", createOcopProductRequest);
            }
            catch (Exception ex)
            {
                TempData["ErrorMessage"] = $"Something went wrong, please try again: {ex.Message}";
                return View("CreateOcopProduct", createOcopProductRequest);
            }
        }
    }
}
