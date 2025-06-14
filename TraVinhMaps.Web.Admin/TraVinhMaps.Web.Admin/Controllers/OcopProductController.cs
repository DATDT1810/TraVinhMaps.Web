﻿using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TraVinhMaps.Web.Admin.Models.Location;
using TraVinhMaps.Web.Admin.Models.OcopProduct;
using TraVinhMaps.Web.Admin.Models.SellingLink;
using TraVinhMaps.Web.Admin.Models.SellLocation;
using TraVinhMaps.Web.Admin.Services.OcopProduct;
using TraVinhMaps.Web.Admin.Services.SellingLink;

namespace TraVinhMaps.Web.Admin.Controllers
{
    [Route("Admin/OcopProduct")]
    public class OcopProductController : Controller
    {
        private readonly IOcopProductService _ocopProductService;
        private readonly ISellingLinkService _sellingLinkService;
        public OcopProductController(IOcopProductService ocopProductService, ISellingLinkService sellingLinkService)
        {
            _ocopProductService = ocopProductService;
            _sellingLinkService = sellingLinkService;
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
                return Json(new { success = true, message = "Delete ocop product successfully" });
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
        [HttpGet("CreateSellingLink")]
        public async Task<IActionResult> CreateSellingLink()
        {
            return View();
        }
        [HttpPost("CreateSellingLinkPost")]

        public async Task<IActionResult> CreateSellingLinkPost(CreateSellingLinkRequest sellingLinkRequest, CancellationToken cancellationToken = default)
        {
            if (!ModelState.IsValid)
            {
                var errorMessages = ModelState.Where(ms => ms.Value.Errors.Count > 0)
                                            .Select(ms => $"Key: {ms.Key}, Errors: {string.Join(", ", ms.Value.Errors.Select(e => e.ErrorMessage))}")
                                            .ToList();
                TempData["ErrorMessage"] = string.Join("<br/>", errorMessages);
                return View("CreateSellingLink", sellingLinkRequest);
            }
            try
            {
                var result = await _sellingLinkService.AddAsync(sellingLinkRequest, cancellationToken);
                if (result?.value?.data == null)
                {
                    TempData["ErrorMessage"] = "Failed to create selling link: No data returned.";
                    return View("CreateSellingLink", sellingLinkRequest);
                }
                var createSellingLink = new SellingLinkResponse
                {
                    Id = result.value.data.Id,
                    Tittle = result.value.data.Tittle,
                    Link = result.value.data.Link,
                    CreatedAt = result.value.data.CreatedAt,
                    UpdateAt = result.value.data.UpdateAt
                };
                TempData["SuccessMessage"] = "Selling link created successfully!";
                return RedirectToAction("Index");
            }
            catch (HttpRequestException ex)
            {
                TempData["ErrorMessage"] = $"Failed to create selling link: {ex.Message}";
                return View("CreateSellingLink", sellingLinkRequest);
            }
            catch (Exception ex)
            {
                TempData["ErrorMessage"] = $"Something went wrong, please try again: {ex.Message}";
                return View("CreateSellingLink", sellingLinkRequest);
            }
        }
        [HttpDelete("DeleteSellingLink")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteSellingLink(SellingLinkResponse sellingLinkResponse, CancellationToken cancellationToken = default)
        {
            var findSellingLink = await _sellingLinkService.GetByIdAsync(sellingLinkResponse.Id);
            if (findSellingLink == null)
            {
                return View("Selling link not found.");
            }
            try
            {
                await _sellingLinkService.DeleteAsync(findSellingLink, cancellationToken);
                return Json(new { success = true });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Error delete selling link: {ex.Message}" });
            }
        }

        [HttpGet("ImportProducts")]
        public async Task<IActionResult> ImportProducts()
        {
            try
            {
                var lookUp = await _ocopProductService.GetLookUpAsync();
                if (lookUp == null)
                {
                    TempData["ErrorMessage"] = "Failed to load lookup data: lookup result is null";
                    return RedirectToAction("Index");
                }

                // Add diagnostic information
                if (lookUp.OcopTypes == null || !lookUp.OcopTypes.Any())
                {
                    TempData["ErrorMessage"] = "Warning: No OcopTypes were loaded";
                }

                if (lookUp.Companies == null || !lookUp.Companies.Any())
                {
                    TempData["ErrorMessage"] = "Warning: No Companies were loaded";
                }

                if (lookUp.Tags == null || !lookUp.Tags.Any())
                {
                    TempData["ErrorMessage"] = "Warning: No Tags were loaded";
                }

                // Ensure each list is initialized to avoid null reference exceptions in the view
                ViewBag.OcopTypes = lookUp.OcopTypes ?? new List<OcopTypeResponse>();
                ViewBag.Companies = lookUp.Companies ?? new List<CompanyResponse>();
                ViewBag.Tags = lookUp.Tags ?? new List<TagResponse>();

                ViewData["Title"] = "Create Ocop Product";
                ViewData["Breadcrumb"] = new List<string> { "Ocop Product", "Import Products" };
                return View();
            }
            catch (HttpRequestException ex)
            {
                TempData["ErrorMessage"] = $"Error loading lookup data: {ex.Message}";
                return RedirectToAction("Index");
            }
            catch (Exception ex)
            {
                TempData["ErrorMessage"] = $"Unexpected error: {ex.Message}";
                return RedirectToAction("Index");
            }
        }
    }
}
