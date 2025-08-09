using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using TraVinhMaps.Web.Admin.Models;
using TraVinhMaps.Web.Admin.Models.Markers;
using TraVinhMaps.Web.Admin.Services.Markers;

namespace TraVinhMaps.Web.Admin.Controllers
{
    [Route("Admin/[controller]")]
    public class MarkerManagementController : Controller
    {
        private readonly ILogger<MarkerManagementController> _logger;
        private readonly IMarkerService _markerService;
        public MarkerManagementController(ILogger<MarkerManagementController> logger, IMarkerService markerService)
        {
            _logger = logger;
            _markerService = markerService;
        }

        [Authorize(Roles = "super-admin")]
        // GET: MarkerManagement/Index
        [HttpGet]
        public async Task<IActionResult> Index()
        {
            ViewData["Title"] = "Marker Management";
            ViewData["Breadcrumb"] = new List<BreadcrumbItem>
            {
                new BreadcrumbItem { Title = "Marker Management", Url = Url.Action("Index", "MarkerManagement")! },
                new BreadcrumbItem { Title = "Marker List" } // default URL for the current page
            };
            var Markers = await _markerService.ListAllAsync();
            if (Markers == null)
            {
                ViewBag.errorMessage = "There is no Marker in the list. Let's add Marker.";
                return View(Markers);
            }
            return View(Markers);
        }

        [Authorize(Roles = "super-admin")]
        [HttpGet("CreateMarker")]
        public IActionResult CreateMarker()
        {
            return View();
        }

        [Authorize(Roles = "super-admin")]
        [HttpPost("CreateMarker")]
        public async Task<IActionResult> CreateMarker(CreateMarkerRequest createMarkerRequest)
        {
            if (!ModelState.IsValid)
            {
                return View(createMarkerRequest);
            }

            var result = await _markerService.CreateMarker(createMarkerRequest);
            if (result != null)
            {
                TempData["successMessage"] = "Create marker successfull";
                return RedirectToAction("Index");
            }
            else
            {
                TempData["errorMessage"] = "Create marker failed, please try again";
                return View(createMarkerRequest);
            }
        }

        [Authorize(Roles = "super-admin")]
        [HttpGet("MarkerDetail")]
        public async Task<IActionResult> MarkerDetail(string id)
        {
            if (id == null)
            {
                return Error();
            }

            var marker = await _markerService.GetMarkerById(id);
            if (marker == null)
            {
                TempData["errorMessage"] = "Marker not found";
                return RedirectToAction("Index");
            }
            return View(marker);
        }

        [Authorize(Roles = "super-admin")]
        [HttpPost("EditMarker")]
        public async Task<IActionResult> EditMarker(MarkerResponse markerResponse)
        {
            UpdateMarkerRequest updateMarkerRequest = new UpdateMarkerRequest
            {
                Id = markerResponse.Id,
                Name = markerResponse.Name
            };
            System.Console.WriteLine("UpdateMarkerRequest: " + updateMarkerRequest.Id + " - " + updateMarkerRequest.Name);
            var result = await _markerService.UpdateMarker(updateMarkerRequest);
            if (result == null)
            {
                TempData["errorMessage"] = "Update marker failed, please try again";
                return RedirectToAction("MarkerDetail", new { id = markerResponse.Id });
            }
            TempData["successMessage"] = "Edit marker successfull";
            return RedirectToAction("Index");
        }

        [Authorize(Roles = "super-admin")]
        [HttpPost("UpdateMarkerImage")]
        public async Task<IActionResult> UpdateMarkerImage(string id, string oldUrlImage, IFormFile markerImage)
        {
            if (id == null || markerImage == null)
            {
                TempData["errorMessage"] = "Update marker image failed, please try again";
                return RedirectToAction("MarkerDetail", new { id = id });
            }
            EditMarkerPictureRequest editMarkerPictureRequest = new EditMarkerPictureRequest
            {
                Id = id,
                CurrentUrlImage = oldUrlImage,
                NewImageFile = markerImage
            };
            var result = await _markerService.UploadImageAsync(editMarkerPictureRequest);
            if (result == null)
            {
                TempData["errorMessage"] = "Update marker image failed, please try again";
                return RedirectToAction("MarkerDetail", new { id = editMarkerPictureRequest.Id });
            }
            TempData["successMessage"] = "Update marker image successfull";
            return RedirectToAction("MarkerDetail", new { id = id });
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View("Error!");
        }

        [Authorize(Roles = "super-admin")]
        [HttpPost("DeleteMarker")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteMarker(string id, CancellationToken cancellationToken)
        {
            try
            {
                await _markerService.DeleteMarker(id);
                return Json(new { success = true, message = "Delete marker successfully" });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Error to delete marker: {ex.Message}" });
            }
        }

        [Authorize(Roles = "super-admin")]
        [HttpPost("RestoreMarker")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> RestoreMarker(string id, CancellationToken cancellationToken)
        {
            try
            {
                await _markerService.RestoreMarker(id);
                return Json(new { success = true, message = "Delete marker successfully" });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Error delete marker: {ex.Message}" });
            }
        }
    }
}