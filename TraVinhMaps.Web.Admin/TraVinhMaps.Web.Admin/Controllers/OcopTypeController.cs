using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using TraVinhMaps.Web.Admin.Models;
using TraVinhMaps.Web.Admin.Models.OcopType;
using TraVinhMaps.Web.Admin.Services.OcopType;

namespace TraVinhMaps.Web.Admin.Controllers
{
    [Route("Admin/OcopType")]
    public class OcopTypeController : Controller
    {
        private readonly IOcopTypeService _ocopTypeService;
        public OcopTypeController(IOcopTypeService ocopTypeService)
        {
            _ocopTypeService = ocopTypeService;
        }

        // GET: OcopType/Index
        public async Task<IActionResult> Index()
        {
            ViewData["Title"] = "Ocop Type NManagement";
            ViewData["Breadcrumb"] = new List<BreadcrumbItem>
            {
                new BreadcrumbItem { Title = "Ocop Type Management", Url = Url.Action("Index", "OcopType")! },
                new BreadcrumbItem { Title = "Ocop Type List" } // default URL for the current page
            };
            var listOcopType = await _ocopTypeService.ListAllAsync();
            return View(listOcopType);
        }
        
        // GET: OcopType/CreateOcopType
        [HttpGet("CreateOcopType")]
        public async Task<IActionResult> CreateOcopType()
        {
            return View();
        }

        // POST: OcopType/CreateOcopTypePost
        [HttpPost("CreateOcopTypePost")]
        public async Task<IActionResult> CreateOcopTypePost(CreateOcopTypeRequest createOcopTypeRequest, CancellationToken cancellationToken = default)
        {
            if (!ModelState.IsValid)
            {
                var errorMessages = ModelState.Where(ms => ms.Value.Errors.Count > 0)
                                            .Select(ms => $"Key: {ms.Key}, Errors: {string.Join(", ", ms.Value.Errors.Select(e => e.ErrorMessage))}")
                                            .ToList();
                TempData["ErrorMessage"] = string.Join("<br/>", errorMessages);
                return View("CreateOcopType", createOcopTypeRequest);
            }
            try
            {
                var result = await _ocopTypeService.AddAsync(createOcopTypeRequest, cancellationToken);
                if (result?.value?.data == null)
                {
                    TempData["ErrorMessage"] = "Failed to create ocop type: No data returned.";
                    return View("CreateOcopType", createOcopTypeRequest);
                }
                var createOcopType = new OcopTypeResponse
                {
                    Id = result.value.data.Id,
                    OcopTypeName = result.value.data.OcopTypeName,
                    OcopTypeStatus = result.value.data.OcopTypeStatus,
                    CreatedAt = result.value.data.CreatedAt,
                    UpdateAt = result.value.data.UpdateAt
                };
                TempData["SuccessMessage"] = "Ocop type created successfully!";
                return RedirectToAction("Index");
            }
            catch (HttpRequestException ex)
            {
                TempData["ErrorMessage"] = $"Failed to create ocop type: {ex.Message}";
                return View("CreateOcopType", createOcopTypeRequest);
            }
            catch (Exception ex)
            {
                TempData["ErrorMessage"] = $"Something went wrong, please try again: {ex.Message}";
                return View("CreateOcopType", createOcopTypeRequest);
            }
        }

        // GET: OcopType/UpdateOcopType
        [HttpGet("UpdateOcopType")]
        public async Task<IActionResult> UpdateOcopType(string id)
        {
            var findOcopType = await _ocopTypeService.GetByIdAsync(id);
            if (findOcopType == null)
            {
                return NotFound("Ocop type not found.");
            }
        
            UpdateOcopTypeRequest updateOcopTypeRequest = new UpdateOcopTypeRequest
            {
                Id = findOcopType.Id,
                OcopTypeName = findOcopType.OcopTypeName,
                UpdateAt = findOcopType.UpdateAt
            };
            return View(updateOcopTypeRequest);

        }

        // POST: OcopType/UpdateOcopTypePost
        [HttpPost("UpdateOcopTypePost")]
        public async Task<IActionResult> UpdateOcopTypePost(OcopTypeResponse request, CancellationToken cancellationToken = default)
        {
            var existingOcopType = await _ocopTypeService.GetByIdAsync(request.Id);
            if (existingOcopType == null)
            {
                return NotFound();
            }
            var updateOcopTypeRequest = new UpdateOcopTypeRequest
            {
                Id = request.Id,
                OcopTypeName = request.OcopTypeName,
                UpdateAt = request.UpdateAt
            };

            try
            {
                await _ocopTypeService.UpdateAsync(updateOcopTypeRequest);
            }
            catch (Exception ex)
            {
                TempData["ErrorMessage"] = "Something went wrong, please try again: " + ex.Message + "\n" + ex.StackTrace;
                return View("UpdateOcopType", request);
            }
            TempData["SuccessMessage"] = "Ocop type updated successfully!";
            return RedirectToAction("Index");
        }
    }
}