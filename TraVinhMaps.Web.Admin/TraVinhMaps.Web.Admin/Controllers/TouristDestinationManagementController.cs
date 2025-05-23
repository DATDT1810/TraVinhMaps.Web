using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.Extensions.Logging;
using TraVinhMaps.Web.Admin.Models.TouristDestination;
using TraVinhMaps.Web.Admin.Models.TouristDestination.Mappers;
using TraVinhMaps.Web.Admin.Services.TouristDestination;

namespace TraVinhMaps.Web.Admin.Controllers
{
    [Route("Admin/[controller]")]
    public class TouristDestinationManagementController : Controller
    {
        private readonly ILogger<TouristDestinationManagementController> _logger;
        private readonly IDestinationService _destinationService;

        public TouristDestinationManagementController(ILogger<TouristDestinationManagementController> logger, IDestinationService destinationService)
        {
            _logger = logger;
            _destinationService = destinationService;
        }

        [HttpGet]
        public async Task<IActionResult> Index()
        {
            ViewData["Title"] = "Destination Management";
            ViewData["Breadcrumb"] = new List<string> { "Destination Management", "Destination List" };
            var destinations = await _destinationService.ListAllAsync();
            if (destinations == null)
            {
                ViewBag.error = "There is no destination in the list. Let's add a destination.";
                return View(destinations);
            }
            return View(destinations);
        }

        [HttpGet("CreateDestination")]
        public IActionResult CreateDestination()
        {
            return View();
        }

        [HttpPost("CreateDestination")]
        public async Task<IActionResult> CreateDestination(TouristDestinationViewRequest touristDestinationViewRequest)
        {
            if (!ModelState.IsValid)
            {
                return View(touristDestinationViewRequest);
            }
            var touristDestinationRequest = DestinationMapper.Mapper.Map<TouristDestinationRequest>(touristDestinationViewRequest);
            touristDestinationRequest.TagId = "682449f7d14510b9c087c29e";
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
            return RedirectToAction("Index");
        }

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
            return View(destinationDetail);
        }

        [HttpGet("EditDestination")]
        public async Task<IActionResult> EditDestination(string id)
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
            var touristDestinationData = DestinationMapper.Mapper.Map<UpdateDestinationViewRequest>(destinationDetail);
            touristDestinationData.longitude = destinationDetail.Location.Coordinates[0];
            touristDestinationData.latitude = destinationDetail.Location.Coordinates[1];
            touristDestinationData.Type = destinationDetail.Location.Type;

            // ViewBag.DestinationTypes = new List<SelectListItem>
            // {
            //     new SelectListItem { Value = "68244abd2b06dbe39f973e8c", Text = "Religious Buildings" },
            //     new SelectListItem { Value = "d7e5c3e8f2fa4c149b9e3cdd", Text = "Tree" }
            // };
            // ViewBag.TypeLocation = new List<SelectListItem>
            // {
            //     new SelectListItem { Value = "Point", Text = "Point" },
            //     new SelectListItem { Value = "Unknow", Text = "Unknow" }
            // };
            return View(touristDestinationData);
        }

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
                ViewBag.error = "something went wrong, please try again";
                return View(updateDestinationViewRequest);
            }
            return RedirectToAction("DetailDestination", new { id = updateDestinationViewRequest.Id });
        }

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

        [HttpPost("RestoreDestination")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> RestoreDestination(string id, CancellationToken cancellationToken)
        {
            try
            {
                await _destinationService.RestoreDestination(id);
                return Json(new { success = true, message = "destination restore successfully" });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Error restore destination: {ex.Message}" });
            }
        }

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
                    TempData["error"] = "adding photos to this tourist attraction failed, please try again later";
                    return RedirectToAction("DetailDestination", new { id = id });
                }
                return RedirectToAction("DetailDestination", new { id = id });
            }
            catch (System.Exception ex)
            {
                return Json(new { success = false, message = $"Error deleting image: {ex.Message}" });
            }
        }

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