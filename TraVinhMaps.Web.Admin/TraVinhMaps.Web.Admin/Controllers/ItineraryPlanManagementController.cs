using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.Extensions.Logging;
using TraVinhMaps.Web.Admin.Models.ItineraryPlans;
using TraVinhMaps.Web.Admin.Models.TouristDestination;
using TraVinhMaps.Web.Admin.Services.ItineraryPlan;
using TraVinhMaps.Web.Admin.Services.Tags;
using TraVinhMaps.Web.Admin.Services.TouristDestination;

namespace TraVinhMaps.Web.Admin.Controllers
{
    [Route("Admin/[controller]")]
    public class ItineraryPlanManagementController : Controller
    {
        private readonly ILogger<ItineraryPlanManagementController> _logger;
        private readonly IItineraryPlanService _itineraryPlanService;
        private readonly IDestinationService _destinationService;
        private readonly ITagService _tagService;

        public ItineraryPlanManagementController(ILogger<ItineraryPlanManagementController> logger, IItineraryPlanService itineraryPlanService, IDestinationService destinationService, ITagService tagService)
        {
            _logger = logger;
            _itineraryPlanService = itineraryPlanService;
            _destinationService = destinationService;
            _tagService = tagService;
        }

        [HttpGet]
        public async Task<IActionResult> Index()
        {
            ViewData["Title"] = "Itinerary plan";
            ViewData["Breadcrumb"] = new List<string> { "Itinerary plan Management", "Itinerary plan List" };
            var itineraryPlans = await _itineraryPlanService.ListAllAsync();
            if (itineraryPlans == null)
            {
                ViewBag.errorMessage = "There is no itinerary Plan in the list. Let's add a itinerary Plan.";
                return View(itineraryPlans);
            }
            return View(itineraryPlans);
        }

        [HttpGet("CreateItineratyPlan")]
        public async Task<IActionResult> CreateItineratyPlan()
        {
            ViewBag.DestinationList = await GetDestinationNamesAsync(); ;
            return View();
        }

        [HttpPost("CreateItineratyPlan")]
        public async Task<IActionResult> CreateItineratyPlan(ItineraryPlanRequestViewModel itineraryPlanRequestViewModel)
        {
            if (!ModelState.IsValid)
            {
                TempData["errorMessage"] = "Create itinerary plan failed, please try again";
                return View(itineraryPlanRequestViewModel);
            }
            List<string> listDestination = JsonSerializer.Deserialize<List<string>>(itineraryPlanRequestViewModel.Locations);
            if (listDestination.Count < 2)
            {
                TempData["errorMessage"] = "Add at least 2 Destination, please try again";
                ViewBag.DestinationList = await GetDestinationNamesAsync(); ;
                return View(itineraryPlanRequestViewModel);
            }
            List<string> destinationIdList = await GetIdByDestinationName(listDestination);

            ItineraryPlanRequest itineraryPlanRequest = new ItineraryPlanRequest()
            {
                Name = itineraryPlanRequestViewModel.Name,
                Duration = itineraryPlanRequestViewModel.Duration,
                EstimatedCost = itineraryPlanRequestViewModel.EstimatedCost,
                Locations = new HashSet<string>(destinationIdList)
            };
            var itineratyPlan = await _itineraryPlanService.CreateItineraryPlan(itineraryPlanRequest);
            if (itineratyPlan == null)
            {
                TempData["errorMessage"] = "Create itinerary plan failed, please try again";
                ViewBag.DestinationList = await GetDestinationNamesAsync(); ;
                return View(itineraryPlanRequestViewModel);
            }
            TempData["successMessage"] = "Create itinerary plan successfull";
            return RedirectToAction("Index");
        }

        [HttpGet("DetailItineraryPlan")]
        public async Task<IActionResult> DetailItineraryPlan(string id)
        {
            var itineraryPlan = await _itineraryPlanService.GetItineraryPlanById(id);
            List<TouristDestinationResponse> touristDestinationResponses = await GetDestinationListByIdList(itineraryPlan.Locations);
            ItineraryPlanResponseViewModel itineraryPlanResponseViewModel = new ItineraryPlanResponseViewModel()
            {
                Id = itineraryPlan.Id,
                Name = itineraryPlan.Name,
                Duration = itineraryPlan.Duration,
                CreatedAt = itineraryPlan.CreatedAt,
                Locations = touristDestinationResponses,
                EstimatedCost = itineraryPlan.EstimatedCost,
                Status = itineraryPlan.Status,
                UpdateAt = itineraryPlan.UpdateAt
            };
            ViewBag.TagList = await _tagService.ListAllAsync();
            return View(itineraryPlanResponseViewModel);
        }

        [HttpGet("EditItineraryPlan")]
        public async Task<IActionResult> EditItineraryPlan(string id)
        {
            var itineraryPlan = await _itineraryPlanService.GetItineraryPlanById(id);
            UpdateItineraryPlanResponse updateItineraryPlanResponse = new UpdateItineraryPlanResponse()
            {
                Id = itineraryPlan.Id,
                Name = itineraryPlan.Name,
                Duration = itineraryPlan.Duration,
                EstimatedCost = itineraryPlan.EstimatedCost,
            };
            ViewBag.DurationValue = new List<SelectListItem>
            {
                new SelectListItem { Value = "One day", Text = "One day" },
                new SelectListItem { Value = "2 days 1 night", Text = "2 days 1 night" },
                new SelectListItem { Value = "3 days 2 night", Text = "3 days 2 night" },
                new SelectListItem { Value = "4 days 3 night", Text = "4 days 3 night" },
                new SelectListItem { Value = "5 days 4 night", Text = "5 days 4 night" },
            };
            ViewBag.EstimatedCostValue = new List<SelectListItem>
            {
                new SelectListItem { Value = "1 million", Text = "1 million" },
                new SelectListItem { Value = "2 million", Text = "2 million" },
                new SelectListItem { Value = "3 million", Text = "3 million" },
                new SelectListItem { Value = "4 million", Text = "4 million" },
                new SelectListItem { Value = "5 million", Text = "5 million" },
            };
            return View(updateItineraryPlanResponse);
        }

        [HttpPost("EditItineraryPlan")]
        public async Task<IActionResult> EditItineraryPlan(UpdateItineraryPlanResponse updateItineraryPlanResponse)
        {
            if (!ModelState.IsValid)
            {
                ViewBag.DurationValue = GetDurationList();
                ViewBag.EstimatedCostValue = GetEstimatedCostList();
                TempData["errorMessage"] = "Update itinerary plan failed, please try again";
                return View(updateItineraryPlanResponse);
            }
            if (updateItineraryPlanResponse == null)
            {
                ViewBag.DurationValue = GetDurationList();
                ViewBag.EstimatedCostValue = GetEstimatedCostList();
                TempData["errorMessage"] = "Update itinerary plan failed, please try again";
                return View(updateItineraryPlanResponse);
            }
            var updatedItineraryPlan = await _itineraryPlanService.UpdateItineraryPlan(updateItineraryPlanResponse);
            if (updatedItineraryPlan == null)
            {
                ViewBag.DurationValue = GetDurationList();
                ViewBag.EstimatedCostValue = GetEstimatedCostList();
                TempData["errorMessage"] = "Update itinerary plan failed, please try again";
                return View(updateItineraryPlanResponse);
            }
            TempData["successMessage"] = "Update itinerary plan successfull";
            return RedirectToAction("Index");
        }

        [HttpPost("DeleteItineraryPlan")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteItineraryPlan(string id, CancellationToken cancellationToken)
        {
            try
            {
                await _itineraryPlanService.DeleteItineraryPlan(id);
                return Json(new { success = true, message = "Delete itinerary plan successfully" });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Error delete itinerary plan: {ex.Message}" });
            }
        }

        [HttpPost("DeleteItineraryPlanByForm")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteItineraryPlanByForm(string id, CancellationToken cancellationToken)
        {
            try
            {
                var result = await _itineraryPlanService.DeleteItineraryPlan(id);
                if (result)
                {
                    TempData["successMessage"] = "Delete itinerary plan successfully";
                    return RedirectToAction("Index");
                }
                TempData["errorMessage"] = $"Error delete itinerary plan";
                return RedirectToAction("DetailItineraryPlan", new { id = id });
            }
            catch (Exception ex)
            {
                TempData["errorMessage"] = $"Error delete itinerary plan: {ex.Message}";
                return RedirectToAction("DetailItineraryPlan", new { id = id });
            }
        }

        [HttpPost("RestoreItineraryPlan")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> RestoreItineraryPlan(string id, CancellationToken cancellationToken)
        {
            try
            {
                await _itineraryPlanService.RestoreItineraryPlan(id);
                return Json(new { success = true, message = "Delete restoreItinerary plan successfully" });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Error delete restoreItinerary plan: {ex.Message}" });
            }
        }

        [HttpPost("RestoreItineraryPlanlByForm")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> RestoreItineraryPlanlByForm(string id, CancellationToken cancellationToken)
        {
            try
            {
                await _itineraryPlanService.RestoreItineraryPlan(id);
                TempData["successMessage"] = "Restore restoreItinerary plan successfully";
                return RedirectToAction("DetailItineraryPlan", new { id = id });
            }
            catch (Exception ex)
            {
                TempData["errorMessage"] = $"Error restore restoreItinerary plan: {ex.Message}";
                return RedirectToAction("Index");
            }
        }


        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View("Error!");
        }

        private async Task<List<string>> GetDestinationNamesAsync()
        {
            var destinations = await _destinationService.ListAllAsync();
            return destinations.Select(d => d.Name).ToList();
        }

        private async Task<List<string>> GetIdByDestinationName(List<string> destinationNameList)
        {
            var destinations = await _destinationService.ListAllAsync();
            var matchedIds = new List<string>();

            foreach (var name in destinationNameList)
            {
                var matched = destinations.FirstOrDefault(d => d.Name == name);
                if (matched != null)
                {
                    matchedIds.Add(matched.Id);
                }
            }
            return matchedIds;
        }

        private async Task<List<TouristDestinationResponse>> GetDestinationListByIdList(List<string> listId)
        {
            var destinations = await _destinationService.ListAllAsync();
            var destinationList = new List<TouristDestinationResponse>();

            foreach (var idItem in listId)
            {
                var matched = destinations.FirstOrDefault(d => d.Id == idItem);
                if (matched != null)
                {
                    destinationList.Add(matched);
                }
            }
            return destinationList;
        }

        private List<SelectListItem> GetDurationList() => new List<SelectListItem>
        {
            new SelectListItem { Value = "One day", Text = "One day" },
            new SelectListItem { Value = "2 days 1 night", Text = "2 days 1 night" },
            new SelectListItem { Value = "3 days 2 night", Text = "3 days 2 night" },
            new SelectListItem { Value = "4 days 3 night", Text = "4 days 3 night" },
            new SelectListItem { Value = "5 days 4 night", Text = "5 days 4 night" },
        };

        private List<SelectListItem> GetEstimatedCostList() => new List<SelectListItem>
        {
            new SelectListItem { Value = "1 million", Text = "1 million" },
            new SelectListItem { Value = "2 million", Text = "2 million" },
            new SelectListItem { Value = "3 million", Text = "3 million" },
            new SelectListItem { Value = "4 million", Text = "4 million" },
            new SelectListItem { Value = "5 million", Text = "5 million" },
        };
    }
}