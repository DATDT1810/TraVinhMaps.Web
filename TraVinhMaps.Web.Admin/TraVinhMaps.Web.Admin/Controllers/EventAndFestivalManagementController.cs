using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using System.Globalization;
using TraVinhMaps.Web.Admin.Models;
using TraVinhMaps.Web.Admin.Models.EventAndFestivalFeature;
using TraVinhMaps.Web.Admin.Services.EventAndFestivalFeature;
using TraVinhMaps.Web.Admin.Services.Markers;
using TraVinhMaps.Web.Admin.Services.Tags;

namespace TraVinhMaps.Web.Admin.Controllers
{
    [Authorize]
    [Route("Admin/[controller]")]
    public class EventAndFestivalManagementController : Controller
    {
        private readonly ILogger<EventAndFestivalManagementController> _logger;
        private readonly IEventAndFestivalService _eventAndFestivalService;
        private readonly ITagService _tagService;
        private readonly IMarkerService _markerService;

        public EventAndFestivalManagementController(ILogger<EventAndFestivalManagementController> logger, IEventAndFestivalService eventAndFestivalService, ITagService tagService, IMarkerService markerService)
        {
            _logger = logger;
            _eventAndFestivalService = eventAndFestivalService;
            _tagService = tagService;
            _markerService = markerService;
        }

        // GET: EventAndFestivalManagement/Index
        [HttpGet]
        public async Task<IActionResult> Index()
        {
            ViewData["Breadcrumb"] = new List<string> { "Event And Festival Management", "Event And Festival List" };
            ViewData["Breadcrumb"] = new List<BreadcrumbItem>
            {
                new BreadcrumbItem { Title = "Event And Festival Management", Url = Url.Action("Index", "EventAndFestivalManagement")! },
                new BreadcrumbItem { Title = "Event And Festival List" } // default URL for the current page
            };
            var eventAndFestivals = await _eventAndFestivalService.ListAllAsync();
            if (eventAndFestivals == null)
            {
                ViewBag.error = "Something went wrong, please try again";
                return View(eventAndFestivals);
            }
            return View(eventAndFestivals);
        }

        // GET: EventAndFestivalManagement/CreateEventAndFestival
        [HttpGet("CreateEventAndFestival")]
        public async Task<IActionResult> CreateEventAndFestivalAsync()
        {
            var model = new CreateEventAndFestivalRequestViewModel
            {
                NameEvent = "",
                Name = "",
                Address = "",
                Type = "Point",
                longitude = 106.3346,
                latitude = 9.9513,
                StartDate = DateTime.Now.ToString("MM/dd/yyyy"),
                EndDate = DateTime.Now.AddDays(7).ToString("MM/dd/yyyy"),
                Category = "Event",
                ImagesFile = new List<IFormFile>(),
                Description = "",
            };
            return View(model);
        }


        // POST: EventAndFestivalManagement/CreateEventFestival
        [HttpPost("CreateEventFestival")]
        public async Task<IActionResult> CreateEventFestival(CreateEventAndFestivalRequestViewModel createEventAndFestivalRequestViewModel)
        {
            if (createEventAndFestivalRequestViewModel == null)
            {
                TempData["errorMessage"] = "Add event/festival failure, please try again";
                return RedirectToAction("CreateEventAndFestival", createEventAndFestivalRequestViewModel);
            }
            var markers = await _markerService.ListAllAsync();
            var tags = await _tagService.ListAllAsync();
            string format = "MM/dd/yyyy";
            CultureInfo provider = CultureInfo.InvariantCulture;
            CreateEventAndFestivalRequest createEventAndFestivalRequest = new CreateEventAndFestivalRequest()
            {
                NameEvent = createEventAndFestivalRequestViewModel.NameEvent,
                Description = createEventAndFestivalRequestViewModel.Description ?? string.Empty,
                StartDate = DateTime.ParseExact(createEventAndFestivalRequestViewModel.StartDate, format, provider),
                EndDate = DateTime.ParseExact(createEventAndFestivalRequestViewModel.EndDate, format, provider),
                Category = createEventAndFestivalRequestViewModel.Category,
                ImagesFile = createEventAndFestivalRequestViewModel.ImagesFile,
                Location = new EventLocation
                {
                    Name = createEventAndFestivalRequestViewModel.Name,
                    Address = createEventAndFestivalRequestViewModel.Address,
                    MarkerId = markers.FirstOrDefault(m => m.Name == "Event And Festival")?.Id,
                    location = new Location
                    {
                        Type = createEventAndFestivalRequestViewModel.Type,
                        Coordinates = new List<double> { createEventAndFestivalRequestViewModel.longitude, createEventAndFestivalRequestViewModel.latitude }
                    }
                },
                TagId = tags.FirstOrDefault(t => t.Name == "Festivals")?.Id,
            };
            var success = await _eventAndFestivalService.CreateEventAndFestival(createEventAndFestivalRequest);
            if (success == null)
            {
                TempData["errorMessage"] = "Add event/festival failure, please try again";
                return RedirectToAction("CreateEventAndFestival", createEventAndFestivalRequestViewModel);
            }
            TempData["successMessage"] = "Add event/festival successfull";
            return RedirectToAction("Index");
        }

        // GET: EventAndFestivalManagement/DetailEventFestival
        [HttpGet("DetailEventFestival")]
        public async Task<IActionResult> DetailEventFestival(string id)
        {
            if (id == null)
            {
                return NotFound();
            }
            var eventAndFestivalDetail = await _eventAndFestivalService.GetEventAndFestivalById(id);
            if (eventAndFestivalDetail == null)
            {
                return NotFound();
            }
            ViewBag.EventAndFestivalTag = await _tagService.GetByIdAsync(eventAndFestivalDetail.TagId);
            ViewBag.marker = await _markerService.GetMarkerById(eventAndFestivalDetail.Location.MarkerId);
            return View(eventAndFestivalDetail);
        }
        
        // GET: EventAndFestivalManagement/EditEventAndFestival
        [HttpGet("EditEventAndFestival")]
        public async Task<IActionResult> EditEventAndFestival(string id)
        {
            if (id == null)
            {
                return NotFound();
            }
            var eventAndFestivalDetail = await _eventAndFestivalService.GetEventAndFestivalById(id);
            if (eventAndFestivalDetail == null)
            {
                return NotFound();
            }
            UpdateEventAndFestivalRequestViewModel updateEventAndFestivalRequestViewModel = new UpdateEventAndFestivalRequestViewModel()
            {
                Id = eventAndFestivalDetail.Id,
                NameEvent = eventAndFestivalDetail.NameEvent,
                Description = eventAndFestivalDetail.Description,
                StartDate = eventAndFestivalDetail.StartDate.ToLocalTime().ToString("MM/dd/yyyy"),
                EndDate = eventAndFestivalDetail.EndDate.ToLocalTime().ToString("MM/dd/yyyy"),
                Category = eventAndFestivalDetail.Category,
                Name = eventAndFestivalDetail.Location.Name,
                Address = eventAndFestivalDetail.Location.Address,
                Type = eventAndFestivalDetail.Location.location.Type,
                longitude = eventAndFestivalDetail.Location.location.Coordinates[0],
                latitude = eventAndFestivalDetail.Location.location.Coordinates[1],
            };

            ViewBag.Category = new List<SelectListItem>
            {
                new SelectListItem { Value = "Event", Text = "Event" },
                new SelectListItem { Value = "Festival", Text = "Festival" }
            };
            ViewBag.TypeLocation = new List<SelectListItem>
            {
                new SelectListItem { Value = "Point", Text = "Point" },
                new SelectListItem { Value = "Unknow", Text = "Unknow" }
            };
            return View(updateEventAndFestivalRequestViewModel);
        }

        // POST: EventAndFestivalManagement/EditEventAndFestival
        [HttpPost("EditEventAndFestival")]
        public async Task<IActionResult> EditEventAndFestival(UpdateEventAndFestivalRequestViewModel updateEventAndFestivalRequestViewModel)
        {
            if (!ModelState.IsValid)
            {
                TempData["errorMessage"] = "Edit event/festival failure, please try again";
                return View(updateEventAndFestivalRequestViewModel);
            }
            string format = "MM/dd/yyyy";
            CultureInfo provider = CultureInfo.InvariantCulture;
            var tags = await _tagService.ListAllAsync();
            var markers = await _markerService.ListAllAsync();
            UpdateEventAndFestivalRequest updateEventAndFestivalRequest = new UpdateEventAndFestivalRequest()
            {
                Id = updateEventAndFestivalRequestViewModel.Id,
                NameEvent = updateEventAndFestivalRequestViewModel.NameEvent,
                Description = updateEventAndFestivalRequestViewModel.Description,
                StartDate = DateTime.ParseExact(updateEventAndFestivalRequestViewModel.StartDate, format, provider),
                EndDate = DateTime.ParseExact(updateEventAndFestivalRequestViewModel.EndDate, format, provider),
                Category = updateEventAndFestivalRequestViewModel.Category,
                Location = new EventLocation
                {
                    Name = updateEventAndFestivalRequestViewModel.Name,
                    Address = updateEventAndFestivalRequestViewModel.Address,
                    MarkerId = markers.FirstOrDefault(t => t.Name == "Event And Festival")?.Id,
                    location = new Location
                    {
                        Type = updateEventAndFestivalRequestViewModel.Type,
                        Coordinates = new List<double> { updateEventAndFestivalRequestViewModel.longitude, updateEventAndFestivalRequestViewModel.latitude }
                    }
                },
                TagId = tags.FirstOrDefault(t => t.Name == "Festivals")?.Id,
            };
            var eventAndFestivalUpdate = await _eventAndFestivalService.UpdateEventAndFestival(updateEventAndFestivalRequest);
            if (eventAndFestivalUpdate == null)
            {
                return View(updateEventAndFestivalRequestViewModel);
            }
            TempData["EditEventAndFestivalSuccess"] = "Edit event and festival successfull";
            return RedirectToAction("DetailEventFestival", new { id = updateEventAndFestivalRequestViewModel.Id });
        }

        // POST: EventAndFestivalManagement/DeleteEventAndFestival  
        [HttpPost("DeleteEventAndFestival")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteEventAndFestival(string id, CancellationToken cancellationToken)
        {
            try
            {
                await _eventAndFestivalService.DeleteEventAndFestival(id);
                return Json(new { success = true, message = "Delete event and festival successfully" });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Error delete event and festival: {ex.Message}" });
            }
        }

        // POST: EventAndFestivalManagement/DeleteEventAndFestivalByForm
        [HttpPost("DeleteEventAndFestivalByForm")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteEventAndFestivalByForm(string id, CancellationToken cancellationToken)
        {
            try
            {
                await _eventAndFestivalService.DeleteEventAndFestival(id);
                TempData["successMessage"] = "Delete event and festival successfully";
                return RedirectToAction("Index");
            }
            catch (Exception ex)
            {
                TempData["errorMessage"] = $"Error Delete event and festival: {ex.Message}";
                return RedirectToAction("DetailEventFestival", new { id = id });
            }
        }

        // POST: EventAndFestivalManagement/RestoreEventAndFestival
        [HttpPost("RestoreEventAndFestival")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> RestoreEventAndFestival(string id, CancellationToken cancellationToken)
        {
            try
            {
                await _eventAndFestivalService.RestoreEventAndFestival(id);
                return Json(new { success = true, message = "Delete destination successfully" });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Error delete destination: {ex.Message}" });
            }
        }

        // POST: EventAndFestivalManagement/RestoreEventAndFestivalByForm
        [HttpPost("RestoreEventAndFestivalByForm")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> RestoreEventAndFestivalByForm(string id, CancellationToken cancellationToken)
        {
            try
            {
                await _eventAndFestivalService.RestoreEventAndFestival(id);
                TempData["successMessage"] = "Restore event and festival successfully";
                return RedirectToAction("DetailEventFestival", new { id = id });
            }
            catch (Exception ex)
            {
                TempData["errorMessage"] = $"Error restore event and festival: {ex.Message}";
                return RedirectToAction("Index");
            }
        }

        // POST: EventAndFestivalManagement/AddEventAndFestivalImage
        [HttpPost("AddEventAndFestivalImage")]
        public async Task<IActionResult> AddEventAndFestivalImage(string id, List<IFormFile> imageDestinationFileList)
        {
            try
            {
                if (!IsImageListFile(imageDestinationFileList))
                {
                    TempData["error"] = "Invalid file type. Please upload a valid image file.";
                    return RedirectToAction("DetailDestination", new { id = id });
                }
                AddImageEventAndFestivalRequest addImageEventAndFestivalRequest = new AddImageEventAndFestivalRequest()
                {
                    id = id,
                    imageFile = imageDestinationFileList
                };
                var result = await _eventAndFestivalService.AddEventAndFestivalImage(addImageEventAndFestivalRequest);
                if (result == null)
                {
                    TempData["errorHistory"] = "adding history photos to this tourist attraction failed, please try again later";
                    return RedirectToAction("DetailEventFestival", new { id = id });
                }
                return RedirectToAction("DetailEventFestival", new { id = id });
            }
            catch (System.Exception ex)
            {
                return Json(new { success = false, message = $"Error deleting image: {ex.Message}" });
            }
        }

        // POST: EventAndFestivalManagement/DeleteEventAndFestivalImage
        [HttpPost("DeleteEventAndFestivalImage")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteEventAndFestivalImage(string id, string urlImage)
        {
            try
            {
                if (id == null)
                {
                    return NotFound();
                }
                var eventAndFestivalDetail = await _eventAndFestivalService.GetEventAndFestivalById(id);
                if (eventAndFestivalDetail == null)
                {
                    return NotFound();
                }

                // Kiểm tra số lượng ảnh hiện tại
                var currentImages = eventAndFestivalDetail.Images;
                if (currentImages == null || currentImages.Count <= 1)
                {
                    TempData["errorMessage"] = "You cannot delete the last remaining image.";
                    return RedirectToAction("DetailEventFestival", new { id = id });
                }

                DeleteEventAndFestivalImage deleteEventAndFestivalImage = new DeleteEventAndFestivalImage()
                {
                    id = id,
                    imageUrl = urlImage
                };
                var result = await _eventAndFestivalService.DeleteEventAndFestivalImage(deleteEventAndFestivalImage);
                if (result)
                {
                    TempData["successMessage"] = "Add event/festival image successfull";
                    return RedirectToAction("DetailEventFestival", new { id = id });
                }
                TempData["errorMessage"] = "Add event/festival image failure, please try again";
                return RedirectToAction("DetailEventFestival", new { id = id });
            }
            catch (System.Exception ex)
            {
                return Json(new { success = false, message = $"Error deleting image: {ex.Message}" });
            }
        }

        // GET: EventAndFestivalManagement/Error
        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View("Error!");
        }
        
        // Helper methods to validate image files
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

        // Helper method to validate a list of image files
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
    }
}