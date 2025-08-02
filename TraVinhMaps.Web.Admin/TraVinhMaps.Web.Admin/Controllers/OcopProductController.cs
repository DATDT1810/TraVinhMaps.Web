using System.Runtime.CompilerServices;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TraVinhMaps.Web.Admin.Models;
using TraVinhMaps.Web.Admin.Models.Location;
using TraVinhMaps.Web.Admin.Models.OcopProduct;
using TraVinhMaps.Web.Admin.Models.SellingLink;
using TraVinhMaps.Web.Admin.Models.SellLocation;
using TraVinhMaps.Web.Admin.Services.Company;
using TraVinhMaps.Web.Admin.Services.OcopProduct;
using TraVinhMaps.Web.Admin.Services.OcopType;
using TraVinhMaps.Web.Admin.Services.SellingLink;
using TraVinhMaps.Web.Admin.Services.Tags;

namespace TraVinhMaps.Web.Admin.Controllers
{
    [Route("Admin/OcopProduct")]
    public class OcopProductController : Controller
    {
        private readonly IOcopProductService _ocopProductService;
        private readonly ISellingLinkService _sellingLinkService;
        private readonly IOcopTypeService _ocopTypeService;
        private readonly ICompanyService _companyService;
        private readonly ITagService _tagService;
        public OcopProductController(IOcopProductService ocopProductService, ISellingLinkService sellingLinkService, IOcopTypeService ocopTypeService, ICompanyService companyService, ITagService tagService)
        {
            _ocopProductService = ocopProductService;
            _sellingLinkService = sellingLinkService;
            _ocopTypeService = ocopTypeService;
            _companyService = companyService;
            _tagService = tagService;
        }

        // GET: OcopProduct/Index
        public async Task<IActionResult> Index()
        {
            ViewData["Title"] = "OCOP Product Management";
            ViewData["Breadcrumb"] = new List<BreadcrumbItem>
            {
                new BreadcrumbItem { Title = "OCOP Product Management", Url = Url.Action("Index", "OcopProduct")! },
                new BreadcrumbItem { Title = "OCOP Product List" } // default URL for the current page
            };
            var listOcopProduct = await _ocopProductService.ListAllAsync();
            return View(listOcopProduct);
        }

        // GET: OcopProduct/Detail/{id}
        [HttpGet("Detail/{id}")]
        public async Task<IActionResult> DetailOcopProduct(string id, CancellationToken cancellationToken = default)
        {
            ViewData["Title"] = "OCOP Product Management";
            ViewData["Breadcrumb"] = new List<BreadcrumbItem>
            {
                new BreadcrumbItem { Title = "OCOP Product Management", Url = Url.Action("Index", "OcopProduct")! },
                new BreadcrumbItem { Title = "OCOP Product Details" } // default URL for the current page
            };
            var ocopProduct = await _ocopProductService.GetByIdAsync(id);
            var sellingLinks = await _sellingLinkService.GetSellingLinkByOcopProductId(id);

            ViewBag.SellingLinks = sellingLinks;
            ViewBag.OcopProductId = id;
            ViewBag.MarkerId = "68486609935049741c54a644";

            if (ocopProduct != null)
            {
                try
                {
                    var ocopType = await _ocopTypeService.GetByIdAsync(ocopProduct.OcopTypeId, cancellationToken);
                    var company = await _companyService.GetByIdAsync(ocopProduct.CompanyId, cancellationToken);
                    var tag = await _tagService.GetByIdAsync(ocopProduct.TagId, cancellationToken);
                    ViewBag.OcopTypeName = ocopType?.OcopTypeName ?? "Unknown";
                    ViewBag.CompanyName = company?.Name ?? "Unknown";
                    ViewBag.TagName = tag?.Name ?? "Unknown";
                }
                catch (HttpRequestException ex)
                {
                    Console.WriteLine($"[ERROR] Failed to get OcopType: {ex.Message}");
                    ViewBag.OcopTypeName = "Unknown";
                    ViewBag.CompanyName = "Unknown";
                    ViewBag.TagName = "Unknown";
                }
            }
            ViewData["Title"] = "OCOP Product Detail";
            ViewData["Breadcrumb"] = new List<string> { "OCOP Product", "OCOP Detail" };
            return View(ocopProduct);
        }

        // GET: OcopProduct/CreateOcopProduct
        [HttpGet("CreateOcopProduct")]
        public async Task<IActionResult> CreateOcopProduct()
        {
            ViewData["Title"] = "OCOP Product Management";
            ViewData["Breadcrumb"] = new List<BreadcrumbItem>
            {
                new BreadcrumbItem { Title = "OCOP Product Management", Url = Url.Action("Index", "OcopProduct")! },
                new BreadcrumbItem { Title = "Create OCOP Product" } // default URL for the current page
            };
            await LoadViewBags();
            return View();
        }

        // POST: OcopProduct/CreateOcopProduct
        [HttpPost("CreateOcopProductPost")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> CreateOcopProductPost(OcopProductViewModel ocopProductViewModel, CancellationToken cancellationToken = default)
        {
            if (!ModelState.IsValid)
            {
                var errorMessages = ModelState.Where(ms => ms.Value.Errors.Count > 0)
                                            .Select(ms => $"Key: {ms.Key}, Errors: {string.Join(", ", ms.Value.Errors.Select(e => e.ErrorMessage))}")
                                            .ToList();
                TempData["ErrorMessage"] = string.Join("<br/>", errorMessages);

                await LoadViewBags();
                return View("CreateOcopProduct", ocopProductViewModel);
            }

            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp" };
            if (ocopProductViewModel.ProductImageFile != null && ocopProductViewModel.ProductImageFile.Any())
            {
                foreach (var file in ocopProductViewModel.ProductImageFile)
                {
                    var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
                    if (!allowedExtensions.Contains(extension))
                    {
                        ModelState.AddModelError("ProductImageFile",
                            $"File \"{file.FileName}\" is not a supported image format. Allowed formats: {string.Join(", ", allowedExtensions)}.");
                        TempData["ErrorMessage"] = ModelState["ProductImageFile"]?.Errors.FirstOrDefault()?.ErrorMessage;

                        await LoadViewBags();
                        return View("CreateOcopProduct", ocopProductViewModel);
                    }
                }
            }
            else
            {
                ModelState.AddModelError("ProductImageFile", "At least one product image is required.");
                TempData["ErrorMessage"] = ModelState["ProductImageFile"]?.Errors.FirstOrDefault()?.ErrorMessage;
                await LoadViewBags();
                return View("CreateOcopProduct", ocopProductViewModel);
            }

            try
            {
                var result = await _ocopProductService.AddAsync(ocopProductViewModel, cancellationToken);
                if (result?.value?.data == null)
                {
                    TempData["ErrorMessage"] = "Failed to create ocop product: No data returned.";
                    await LoadViewBags();
                    return View("CreateOcopProduct", ocopProductViewModel);
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

                TempData["SuccessMessage"] = "Ocop product and sell locations created successfully!";
                return RedirectToAction("Index");
            }
            catch (HttpRequestException ex)
            {
                TempData["ErrorMessage"] = ex.Message;
                await LoadViewBags();
                return View("CreateOcopProduct", ocopProductViewModel);
            }
            catch (Exception ex)
            {
                TempData["ErrorMessage"] = $"Something went wrong, please try again: {ex.Message}";
                await LoadViewBags();
                return View("CreateOcopProduct", ocopProductViewModel);
            }
        }

        // GET: OcopProduct/UpdateOcopProduct/{id}
        private async Task LoadViewBags()
        {
            try
            {
                var ocopTypes = await _ocopTypeService.ListAllAsync();
                var company = await _companyService.ListAllAsync();
                var tag = await _tagService.ListAllAsync();
                ViewBag.OcopTypes = ocopTypes;
                ViewBag.Companies = company;
                ViewBag.Tags = tag;
            }
            catch (HttpRequestException ex)
            {
                Console.WriteLine($"[ERROR] Failed to get OcopType: {ex.Message}");
                ViewBag.OcopTypes = "Unknown";
                ViewBag.Companies = "Unknown";
                ViewBag.Tags = "Unknown";
            }
        }


        [HttpGet("UpdateOcopProduct")]
        public async Task<IActionResult> UpdateOcopProduct(string id)
        {
            ViewData["Title"] = "Ocop Product Management";
            ViewData["Breadcrumb"] = new List<BreadcrumbItem>
            {
                new BreadcrumbItem { Title = "OCOP Product Management", Url = Url.Action("Index", "OcopProduct")! },
                new BreadcrumbItem { Title = "Update OCOP Product" } // default URL for the current page
            };
            var findOcopProduct = await _ocopProductService.GetByIdAsync(id);
            if (findOcopProduct == null)
            {
                return View("Ocop product not found.");
            }
            await LoadViewBags();
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

        // POST: OcopProduct/UpdateOcopProductPost
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
                var result = await _ocopProductService.UpdateAsync(updateOcopProductRequest);

                if (result == null || result.Status == "error")
                {
                    TempData["ErrorMessage"] = "Failed to update OCOP product: " + (result?.Message ?? "Unknown error.");
                    await LoadViewBags();
                    return View("UpdateOcopProduct", updateOcopProductRequest);
                }

                TempData["SuccessMessage"] = result.Message ?? "Ocop product updated successfully!";
                return RedirectToAction("DetailOcopProduct", new { id = request.Id });
            }
            catch (Exception ex)
            {
                TempData["ErrorMessage"] = ex.Message;
                await LoadViewBags();
                return View("UpdateOcopProduct", updateOcopProductRequest);
            }
        }

        // POST: OcopProduct/DeleteOcopProduct
        [HttpPost("DeleteOcopProduct")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteOcopProduct(string id, CancellationToken cancellationToken = default)
        {
            try
            {
                await _ocopProductService.DeleteOcopProductAsync(id);
                return Json(new { success = true, message = "Delete OCOP product successfully" });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Error delete destination: {ex.Message}" });
            }
        }

        // POST: OcopProduct/RestoreOcopProduct
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

        // Sell Location Management
        [HttpGet("CreateSellLocation")]
        public IActionResult CreateSellLocation(string id)
        {
            ViewBag.OcopProductId = id;
            var sellLocationViewModel = new SellLocationViewModel
            {
                Id = id,
                MarkerId = "68486609935049741c54a644"
            };
            return View(sellLocationViewModel);
        }

        // POST: OcopProduct/CreateSellLocation
        [HttpPost("CreateSellLocation")]
        public async Task<IActionResult> CreateSellLocation(string id, SellLocationViewModel sellLocationViewModel, CancellationToken cancellationToken = default)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage);
                return Json(new { success = false, message = string.Join("; ", errors) });
            }
            var sellLocation = new SellLocationResponse
            {
                Id = id,
                LocationName = sellLocationViewModel.LocationName,
                LocationAddress = sellLocationViewModel.LocationAddress,
                MarkerId = sellLocationViewModel.MarkerId ?? "68486609935049741c54a644",
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
                return Json(new { success = true, message = "The point of sell was created successfully!" });
            }
            catch (Exception ex)
            {
                var userFriendlyMessage = "An unexpected error occurred.";

                try
                {
                    var startIndex = ex.Message.IndexOf('{');
                    if (startIndex >= 0)
                    {
                        var jsonPart = ex.Message.Substring(startIndex);

                        using var document = System.Text.Json.JsonDocument.Parse(jsonPart);
                        if (document.RootElement.TryGetProperty("message", out var messageProp))
                        {
                            var extractedMessage = messageProp.GetString();
                            if (!string.IsNullOrEmpty(extractedMessage))
                            {
                                userFriendlyMessage = extractedMessage;
                            }
                        }
                    }
                }
                catch
                {
                }

                return Json(new { success = false, message = userFriendlyMessage });
            }
        }

        // GET: OcopProduct/UpdateSellLocation/{id}/{locationName}
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
                MarkerId = sellLocation.MarkerId ?? "68486609935049741c54a644",
                Type = sellLocation.Location?.Type,
                Longitude = sellLocation.Location?.Coordinates?.FirstOrDefault() ?? 0,
                Latitude = sellLocation.Location?.Coordinates?.Skip(1).FirstOrDefault() ?? 0,
            };
            return View(sellLocationViewModel);
        }

        // POST: OcopProduct/UpdateSellLocationPost
        [HttpPost("UpdateSellLocationPost")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> UpdateSellLocationPost(string id, SellLocationViewModel sellLocationViewModel, CancellationToken cancellationToken = default)
        {
            Console.WriteLine($"Received id: {id}, SellLocationViewModel: {Newtonsoft.Json.JsonConvert.SerializeObject(sellLocationViewModel)}");
            if (!ModelState.IsValid)
            {
                return Json(new { success = false, message = string.Join("; ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage)) });
            }
            if (string.IsNullOrEmpty(id) || string.IsNullOrEmpty(sellLocationViewModel.Id) || id != sellLocationViewModel.Id)
            {
                return Json(new { success = false, message = "Invalid local specialty ID." });
            }
            var sellLocation = new SellLocationResponse
            {
                Id = id,
                LocationName = sellLocationViewModel.LocationName,
                LocationAddress = sellLocationViewModel.LocationAddress,
                MarkerId = sellLocationViewModel.MarkerId ?? "68486609935049741c54a644",
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
                var result = await _ocopProductService.UpdateSellLocation(id, sellLocation, cancellationToken);
                return Json(new { success = true, message = "Sell location updated successfully!" });
            }
            catch (Exception ex)
            {
                var userFriendlyMessage = "An unexpected error occurred.";

                try
                {
                    var startIndex = ex.Message.IndexOf('{');
                    if (startIndex >= 0)
                    {
                        var jsonPart = ex.Message.Substring(startIndex);

                        using var document = System.Text.Json.JsonDocument.Parse(jsonPart);
                        if (document.RootElement.TryGetProperty("message", out var messageProp))
                        {
                            var extractedMessage = messageProp.GetString();
                            if (!string.IsNullOrEmpty(extractedMessage))
                            {
                                userFriendlyMessage = extractedMessage;
                            }
                        }
                    }
                }
                catch
                {
                }

                return Json(new { success = false, message = userFriendlyMessage });
            }
        }

        // DELETE: OcopProduct/DeleteSellLocation/{id}/{name}
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

        // Selling Link Management
        [HttpPost("CreateSellingLink")]
        public async Task<IActionResult> CreateSellingLink(SellingLinkViewModel sellingLinkViewModel, CancellationToken cancellationToken = default)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage);
                return Json(new { success = false, message = string.Join("; ", errors) });
            }
            try
            {
                var result = await _sellingLinkService.AddAsync(sellingLinkViewModel, cancellationToken);

                var sellLocation = new SellingLinkResponse
                {
                    Id = result.Data.Id,
                    ProductId = result.Data.ProductId,
                    Title = result.Data.Title,
                    Link = result.Data.Link,
                    UpdateAt = result.Data.UpdateAt,
                    CreatedAt = result.Data.CreatedAt
                };
                return Json(new { success = true, message = "The point of selling link was created successfully!" });

            }
            catch (Exception ex)
            {
                var userFriendlyMessage = "An unexpected error occurred.";

                try
                {
                    var startIndex = ex.Message.IndexOf('{');
                    if (startIndex >= 0)
                    {
                        var jsonPart = ex.Message.Substring(startIndex);

                        using var document = System.Text.Json.JsonDocument.Parse(jsonPart);
                        if (document.RootElement.TryGetProperty("message", out var messageProp))
                        {
                            var extractedMessage = messageProp.GetString();
                            if (!string.IsNullOrEmpty(extractedMessage))
                            {
                                userFriendlyMessage = extractedMessage;
                            }
                        }
                    }
                }
                catch
                {
                    // ignore parse errors
                }

                // LOG TO SEE WHAT IS HAPPENING
                return Json(new
                {
                    success = false,
                    message = userFriendlyMessage,
                    rawError = ex.Message,
                    stack = ex.StackTrace
                });
            }


        }

        // GET: OcopProduct/UpdateSellingLink/{id}
        [HttpPost("UpdateSellingLinkPost")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> UpdateSellingLinkPost(SellingLinkResponse sellingLinkResponse, CancellationToken cancellationToken = default)
        {
            Console.WriteLine($"SellLocationViewModel: {Newtonsoft.Json.JsonConvert.SerializeObject(sellingLinkResponse)}");
            if (!ModelState.IsValid)
            {
                return Json(new { success = false, message = string.Join("; ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage)) });
            }
            var sellingLinkRequest = new UpdateSellingLinkRequest
            {
                Id = sellingLinkResponse.Id,
                ProductId = sellingLinkResponse.ProductId,
                Title = sellingLinkResponse.Title,
                Link = sellingLinkResponse.Link
            };
            try
            {
                ViewBag.SellingLinkId = sellingLinkResponse.Id;
                var result = await _sellingLinkService.UpdateAsync(sellingLinkRequest, cancellationToken);
                return Json(new { success = true, message = "Selling link updated successfully!" });
            }
            catch (Exception ex)
            {
                var userFriendlyMessage = "An unexpected error occurred.";

                try
                {
                    var startIndex = ex.Message.IndexOf('{');
                    if (startIndex >= 0)
                    {
                        var jsonPart = ex.Message.Substring(startIndex);

                        using var document = System.Text.Json.JsonDocument.Parse(jsonPart);
                        if (document.RootElement.TryGetProperty("message", out var messageProp))
                        {
                            var extractedMessage = messageProp.GetString();
                            if (!string.IsNullOrEmpty(extractedMessage))
                            {
                                userFriendlyMessage = extractedMessage;
                            }
                        }
                    }
                }
                catch
                {
                }

                return Json(new { success = false, message = userFriendlyMessage });
            }

        }

        // DELETE: OcopProduct/DeleteSellingLink/{id}
        [HttpDelete("DeleteSellingLink/{id}")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteSellingLink(string id, CancellationToken cancellationToken = default)
        {
            try
            {
                await _sellingLinkService.DeleteAsync(id, cancellationToken);
                return Json(new { success = true });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Error delete selling link: {ex.Message}" });
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

        // POST: OcopProduct/DeleteOcopProductImage
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

        // GET: OcopProduct/ImportProducts
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

        // Analytics Dashboard
        [HttpGet("dashboard")]
        public async Task<IActionResult> OcopDashboard([FromQuery] List<string> productIds = null, string timeRange = "month", DateTime? startDate = null, DateTime? endDate = null)
        {
            ViewData["Title"] = "Analytics";
            ViewData["Breadcrumb"] = new List<BreadcrumbItem>
            {
                new BreadcrumbItem { Title = "Analytics", Url = Url.Action("OcopDashboard", "OcopProduct")! },
                new BreadcrumbItem { Title = "Ocop Analytics" } // default URL for the current page
            };

            try
            {
                var analyticsTask = _ocopProductService.GetProductAnalyticsAsync(timeRange, startDate, endDate);
                var demographicTask = _ocopProductService.GetUserDemographicsAsync(timeRange, startDate, endDate);
                var topProductsByInteractionsTask = _ocopProductService.GetTopProductsByInteractionsAsync(5, timeRange, startDate, endDate);
                var topProductsByFavoriteTask = _ocopProductService.GetTopProductsByFavoritesAsync(5, timeRange, startDate, endDate);

                // Call CompareProducts only if productIds has a value. 
                Task<IEnumerable<OcopProductAnalytics>> compareProductsTask = Task.FromResult(Enumerable.Empty<OcopProductAnalytics>());
                if (productIds != null && productIds.Any())
                    compareProductsTask = _ocopProductService.CompareProductsAsync(productIds, timeRange, startDate, endDate);

                await Task.WhenAll(analyticsTask, demographicTask, topProductsByInteractionsTask, topProductsByFavoriteTask, compareProductsTask);

                var vm = new OcopDashboardViewModel
                {
                    Analytics = analyticsTask.Result.ToList() ?? new List<OcopProductAnalytics>(),
                    UserDemographics = demographicTask.Result.ToList() ?? new List<OcopProductUserDemographics>(),
                    TopProductsByInteractions = topProductsByInteractionsTask.Result?.ToList() ?? new List<OcopProductAnalytics>(),
                    TopProductsByFavorites = topProductsByFavoriteTask.Result?.ToList() ?? new List<OcopProductAnalytics>(),
                    ComparedProducts = compareProductsTask.Result?.ToList() ?? new List<OcopProductAnalytics>(),
                };
                return View("OcopDashboard", vm);
            }
            catch (Exception ex)
            {
                ViewData["Error"] = $"An error occurred: {ex.Message}";
                return View("OcopDashboard", new OcopDashboardViewModel());
            }
        }

    }
}
