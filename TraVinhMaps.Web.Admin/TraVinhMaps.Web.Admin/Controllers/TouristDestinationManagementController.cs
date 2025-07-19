using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using TraVinhMaps.Web.Admin.Models;
using TraVinhMaps.Web.Admin.Models.TouristDestination;
using TraVinhMaps.Web.Admin.Models.TouristDestination.Mappers;
using TraVinhMaps.Web.Admin.Services.DestinationTypes;
using TraVinhMaps.Web.Admin.Services.Markers;
using TraVinhMaps.Web.Admin.Services.Tags;
using TraVinhMaps.Web.Admin.Services.TouristDestination;

namespace TraVinhMaps.Web.Admin.Controllers
{
    [Route("Admin/[controller]")]
    public class TouristDestinationManagementController : Controller
    {
        private readonly ILogger<TouristDestinationManagementController> _logger;
        private readonly IDestinationService _destinationService;
        private readonly IDestinationTypeService _destinationTypeService;
        private readonly ITagService _tagService;
        private readonly IMarkerService _markerService;


        public TouristDestinationManagementController(ILogger<TouristDestinationManagementController> logger, IDestinationService destinationService, IDestinationTypeService destinationTypeService, ITagService tagService, IMarkerService markerService)
        {
            _logger = logger;
            _destinationService = destinationService;
            _destinationTypeService = destinationTypeService;
            _tagService = tagService;
            _markerService = markerService;

        }

        // GET: TouristDestinationManagement/Index
        [HttpGet]
        public async Task<IActionResult> Index()
        {
            ViewData["Title"] = "Destination Management";
            ViewData["Breadcrumb"] = new List<BreadcrumbItem>
            {
                new BreadcrumbItem { Title = "Destination Management", Url = Url.Action("Index", "TouristDestinationManagement")! },
                new BreadcrumbItem { Title = "Destination List" } // default URL for the current page
            };
            var destinations = await _destinationService.ListAllAsync();
            if (destinations == null)
            {
                ViewBag.error = "There is no destination in the list. Let's add a destination.";
                return View(destinations);
            }
            return View(destinations);
        }

        // GET: TouristDestinationManagement/CreateDestination
        [HttpGet("CreateDestination")]
        public async Task<IActionResult> CreateDestination()
        {
            ViewBag.DestinationTypes = await GetDestinationTypeList();
            return View();
        }

        // POST: TouristDestinationManagement/CreateDestination
        [HttpPost("CreateDestination")]
        public async Task<IActionResult> CreateDestination(TouristDestinationViewRequest touristDestinationViewRequest)
        {
            if (!ModelState.IsValid)
            {
                string errorMessage = "";
                foreach (var modelStateEntry in ModelState)
                {
                    var key = modelStateEntry.Key;
                    foreach (var error in modelStateEntry.Value.Errors)
                    {
                        Console.WriteLine($"Key: {key}, Error: {error.ErrorMessage}");
                        errorMessage += $"{error.ErrorMessage} ";
                    }
                }
                ViewBag.error = errorMessage;
                ViewBag.DestinationTypes = await GetDestinationTypeList();
                return View(touristDestinationViewRequest);
            }
            var touristDestinationRequest = DestinationMapper.Mapper.Map<TouristDestinationRequest>(touristDestinationViewRequest);
            var tags = await _tagService.ListAllAsync();
            touristDestinationRequest.TagId = tags.FirstOrDefault(t => t.Name == "Destination")?.Id;
            touristDestinationRequest.AvarageRating = 0;
            if (touristDestinationRequest.Location == null)
            {
                touristDestinationRequest.Location = new LocationDestination
                {
                    Type = touristDestinationViewRequest.Type ?? "Point",
                    Coordinates = new List<double>()
                };
            }
            else if (touristDestinationRequest.Location.Coordinates == null)
            {
                touristDestinationRequest.Location.Coordinates = new List<double>();
            }
            touristDestinationRequest.Location.Coordinates.Add(touristDestinationViewRequest.longitude);
            touristDestinationRequest.Location.Coordinates.Add(touristDestinationViewRequest.latitude);
            var data = await _destinationService.CreateDestination(touristDestinationRequest);
            if (data == null)
            {
                ViewBag.error = "Something went wrong, please try again";
                return View(touristDestinationViewRequest);
            }
            ViewBag.DestinationTypes = await GetDestinationTypeList();
            return RedirectToAction("Index");
        }

        // GET: TouristDestinationManagement/DetailDestination
        [HttpGet("DetailDestination")]
        public async Task<IActionResult> DetailDestination(string id)
        {
            if (id == null)
            {
                return NotFound();
            }
            var destinationDetail = await _destinationService.GetDestinationById(id);
            if (destinationDetail == null)
            {
                return NotFound();
            }
            ViewBag.DestinationTag = await _tagService.GetByIdAsync(destinationDetail.TagId);
            var destinationTypeResult = await _destinationTypeService.GetByIdAsync(destinationDetail.DestinationTypeId);
            ViewBag.marker = await _markerService.GetMarkerById(destinationTypeResult.MarkerId);
            ViewBag.DestinationType = destinationTypeResult;
            return View(destinationDetail);
        }

        // POST: TouristDestinationManagement/DeleteDestination
        [HttpGet("EditDestination")]
        public async Task<IActionResult> EditDestination(string id)
        {
            try
            {
                var destination = await _destinationService.GetDestinationById(id);
                if (destination == null)
                {
                    return NotFound();
                }
                var touristDestinationData = DestinationMapper.Mapper.Map<UpdateDestinationViewRequest>(destination);
                touristDestinationData.longitude = destination.Location.Coordinates[0];
                touristDestinationData.latitude = destination.Location.Coordinates[1];
                touristDestinationData.Type = destination.Location.Type;

                ViewBag.DestinationTypes = await GetDestinationTypeList();

                return View(touristDestinationData);
            }
            catch (Exception ex)
            {
                ViewBag.error = $"An error occurred: {ex.Message}";
                return View("Error");
            }
        }

        // POST: TouristDestinationManagement/EditDestination
        [HttpPost("EditDestination")]
        public async Task<IActionResult> EditDestination(UpdateDestinationViewRequest updateDestinationViewRequest)
        {
            var updateDestinationData = DestinationMapper.Mapper.Map<UpdateDestinationRequest>(updateDestinationViewRequest);
            var destinationDetail = await _destinationService.GetDestinationById(updateDestinationViewRequest.Id);
            if (destinationDetail == null)
            {
                return NotFound();
            }
            updateDestinationData.TagId = destinationDetail.TagId;
            updateDestinationData.AvarageRating = destinationDetail.AvarageRating;

            if (updateDestinationData.Location == null)
            {
                updateDestinationData.Location = new LocationDestination()
                {
                    Type = updateDestinationViewRequest.Type,
                    Coordinates = new List<double>()
                };
            }
            updateDestinationData.Location.Type = updateDestinationViewRequest.Type;
            updateDestinationData.Location.Coordinates.Add(updateDestinationViewRequest.longitude);
            updateDestinationData.Location.Coordinates.Add(updateDestinationViewRequest.latitude);

            var updateDestination = await _destinationService.UpdateDestination(updateDestinationData);
            if (updateDestination == null)
            {
                ViewBag.DestinationTypes = await GetDestinationTypeList();
                ViewBag.error = "something went wrong, please try again";
                return View(updateDestinationViewRequest);
            }
            return RedirectToAction("DetailDestination", new { id = updateDestinationViewRequest.Id });
        }

        // POST: TouristDestinationManagement/DeleteDestination
        [HttpPost("DeleteDestination")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteDestination(string id, CancellationToken cancellationToken)
        {
            try
            {
                await _destinationService.DeleteDestination(id);
                return Json(new { success = true, message = "Delete destination successfully" });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Error delete destination: {ex.Message}" });
            }
        }

        // POST: TouristDestinationManagement/DeleteDestinationByForm
        [HttpPost("DeleteDestinationByForm")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteDestinationByForm(string id, CancellationToken cancellationToken)
        {
            try
            {
                await _destinationService.DeleteDestination(id);
                return RedirectToAction("Index");
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Error delete destination: {ex.Message}" });
            }
        }

        // POST: TouristDestinationManagement/RestoreDestination
        [HttpPost("RestoreDestination")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> RestoreDestination(string id, CancellationToken cancellationToken)
        {
            try
            {
                await _destinationService.RestoreDestination(id);
                return Json(new { success = true, message = "Destination restore successfully" });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Error restore destination: {ex.Message}" });
            }
        }

        // POST: TouristDestinationManagement/RestoreDestinationByForm
        [HttpPost("RestoreDestinationByForm")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> RestoreDestinationByForm(string id, CancellationToken cancellationToken)
        {
            try
            {
                await _destinationService.RestoreDestination(id);
                return RedirectToAction("DetailDestination", new { id = id });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Error restore destination: {ex.Message}" });
            }
        }

        // POST: TouristDestinationManagement/DeleteDestinationImage
        [HttpPost("DeleteDestinationImage")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteDestinationImage(string id, string urlImage)
        {
            try
            {
                if (id == null)
                {
                    return NotFound();
                }
                var destinationDetail = await _destinationService.GetDestinationById(id);
                if (destinationDetail == null)
                {
                    return NotFound();
                }

                // Kiểm tra số lượng ảnh hiện tại
                var currentImages = destinationDetail.Images;
                if (currentImages == null || currentImages.Count <= 1)
                {
                    TempData["error"] = "You cannot delete the last remaining image.";
                    return RedirectToAction("DetailDestination", new { id = id });
                }

                DeleteDestinationImageRequest deleteDestinationImageRequest = new DeleteDestinationImageRequest()
                {
                    id = id,
                    imageUrl = urlImage
                };
                var result = await _destinationService.DeleteDestinationImage(deleteDestinationImageRequest);
                if (result)
                {
                    return RedirectToAction("DetailDestination", new { id = id });
                }
                TempData["error"] = "Something went wrong with delete image, please try again";
                return RedirectToAction("DetailDestination", new { id = id });
            }
            catch (System.Exception ex)
            {
                return Json(new { success = false, message = $"Error deleting image: {ex.Message}" });
            }
        }

        // POST: TouristDestinationManagement/DeleteHistoryDestinationImage
        [HttpPost("DeleteHistoryDestinationImage")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteHistoryDestinationImage(string id, string urlImage)
        {
            try
            {
                DeleteDestinationImageRequest deleteDestinationImageRequest = new DeleteDestinationImageRequest()
                {
                    id = id,
                    imageUrl = urlImage
                };
                var result = await _destinationService.DeleteDestinationHistoryImage(deleteDestinationImageRequest);
                if (result)
                {
                    return RedirectToAction("DetailDestination", new { id = id });
                }
                TempData["errorHistory"] = "Something went wrong with delete history image, please try again";
                return RedirectToAction("DetailDestination", new { id = id });
            }
            catch (System.Exception ex)
            {
                return Json(new { success = false, message = $"Error deleting image: {ex.Message}" });
            }
        }

        // POST: TouristDestinationManagement/AddDestinationImage
        [HttpPost("AddDestinationImage")]
        public async Task<IActionResult> AddDestinationImage(string id, List<IFormFile> imageDestinationFileList)
        {
            try
            {
                if (!IsImageListFile(imageDestinationFileList))
                {
                    TempData["error"] = "Invalid file type. Please upload a valid image file.";
                    return RedirectToAction("DetailDestination", new { id = id });
                }
                AddDestinationImageRequest addDestinationImageRequest = new AddDestinationImageRequest()
                {
                    id = id,
                    imageFile = imageDestinationFileList
                };
                var result = await _destinationService.AddDestinationImage(addDestinationImageRequest);
                if (result == null)
                {
                    TempData["error"] = "Adding photos to this tourist attraction failed, please try again later";
                    return RedirectToAction("DetailDestination", new { id = id });
                }
                return RedirectToAction("DetailDestination", new { id = id });
            }
            catch (System.Exception ex)
            {
                return Json(new { success = false, message = $"Error deleting image: {ex.Message}" });
            }
        }

        // POST: TouristDestinationManagement/AddDestinationHistoryImage
        [HttpPost("AddDestinationHistoryImage")]
        public async Task<IActionResult> AddDestinationHistoryImage(string id, List<IFormFile> imageDestinationFileList)
        {
            try
            {
                if (!IsImageListFile(imageDestinationFileList))
                {
                    TempData["error"] = "Invalid file type. Please upload a valid image file.";
                    return RedirectToAction("DetailDestination", new { id = id });
                }
                AddDestinationImageRequest addDestinationImageRequest = new AddDestinationImageRequest()
                {
                    id = id,
                    imageFile = imageDestinationFileList
                };
                var result = await _destinationService.AddDestinationHistoryImage(addDestinationImageRequest);
                if (result == null)
                {
                    TempData["errorHistory"] = "adding history photos to this tourist attraction failed, please try again later";
                    return RedirectToAction("DetailDestination", new { id = id });
                }
                return RedirectToAction("DetailDestination", new { id = id });
            }
            catch (System.Exception ex)
            {
                return Json(new { success = false, message = $"Error deleting image: {ex.Message}" });
            }
        }

        // GET: TouristDestinationManagement/RestoreDestination
        private bool IsImageFile(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return false;
            var allowedContentTypes = new[] { "image/jpeg", "image/png", "image/gif", "image/webp" };
            if (!allowedContentTypes.Contains(file.ContentType.ToLower()))
                return false;
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
            var fileExtension = Path.GetExtension(file.FileName).ToLower();
            if (!allowedExtensions.Contains(fileExtension))
                return false;
            return true;
        }

        // Check if all files in the list are valid image files
        private bool IsImageListFile(List<IFormFile> formFiles)
        {
            foreach (var item in formFiles)
            {
                if (!IsImageFile(item))
                {
                    return false;
                }
            }
            return true;
        }

        // Get the list of destination types for dropdown
        private async Task<List<SelectListItem>> GetDestinationTypeList()
        {
            var destinationTypes = await _destinationTypeService.ListAllAsync();
            var selectList = destinationTypes
                .Take(5)
                .Select(dt => new SelectListItem
                {
                    Value = dt.Id,
                    Text = dt.Name
                })
                .ToList();

            return selectList;
        }

        // Analytics for destinations
        // GET: TouristDestinationManagement/DestinationsStatistics
        [HttpGet("destinations-statistics")]
        public async Task<IActionResult> DestinationsStatistics([FromQuery] List<string> destinationIds = null, string timeRange = "month", DateTime? startDate = null, DateTime? endDate = null)
        {
            ViewData["Title"] = "Destinations statistics";
            ViewData["Breadcrumb"] = new List<BreadcrumbItem>
            {
                new BreadcrumbItem { Title = "Analytics", Url = Url.Action("DestinationsStatistics", "TouristDestinationManagement")! },
                new BreadcrumbItem { Title = "Destinations statistics" } // default URL for the current page
            };

            try
            {
                var overviewTask = _destinationService.GetDestinationStatsOverviewAsync(timeRange, startDate, endDate);
                var demographicTask = _destinationService.GetUserDemographicsAsync(timeRange, startDate, endDate);
                var topDestinationByViewsTask = _destinationService.GetTopDestinationsByViewsAsync(5, timeRange, startDate, endDate);
                var topDestinationsByFavoriteTask = _destinationService.GetTopDestinationsByFavoritesAsync(5, timeRange, startDate, endDate);

                // Call CompareProducts only if productIds has a value. 
                Task<IEnumerable<DestinationAnalytics>> compareDestinationsTask = Task.FromResult(Enumerable.Empty<DestinationAnalytics>());
                if (destinationIds != null && destinationIds.Any())
                    compareDestinationsTask = _destinationService.CompareDestinationsAsync(destinationIds, timeRange, startDate, endDate);

                await Task.WhenAll(overviewTask, demographicTask, topDestinationByViewsTask, topDestinationsByFavoriteTask, compareDestinationsTask);

                var vm = new DestinationStatisticsViewModel
                {
                    DestinationStatsOverview = overviewTask.Result,
                    UserDemographics = demographicTask.Result.ToList() ?? new List<DestinationUserDemographics>(),
                    TopDestinationsByViews = topDestinationByViewsTask.Result?.ToList() ?? new List<DestinationAnalytics>(),
                    TopDestinationByFavorites = topDestinationsByFavoriteTask.Result?.ToList() ?? new List<DestinationAnalytics>(),
                    CompareDestination = compareDestinationsTask.Result?.ToList() ?? new List<DestinationAnalytics>(),
                };
                return View("DestinationsStatistics", vm);
            }
            catch (Exception ex)
            {
                ViewData["Error"] = $"An error occurred: {ex.Message}";
                return View("DestinationsStatistics", new DestinationStatisticsViewModel());
            }
        }
    }
}