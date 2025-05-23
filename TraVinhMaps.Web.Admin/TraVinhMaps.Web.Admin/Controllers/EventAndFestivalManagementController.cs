using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using TraVinhMaps.Web.Admin.Models.EventAndFestivalFeature;
using TraVinhMaps.Web.Admin.Services.EventAndFestivalFeature;

namespace TraVinhMaps.Web.Admin.Controllers
{
    [Route("Admin/[controller]")]
    public class EventAndFestivalManagementController : Controller
    {
        private readonly ILogger<EventAndFestivalManagementController> _logger;
        private readonly IEventAndFestivalService _eventAndFestivalService;

        public EventAndFestivalManagementController(ILogger<EventAndFestivalManagementController> logger, IEventAndFestivalService eventAndFestivalService)
        {
            _logger = logger;
            _eventAndFestivalService = eventAndFestivalService;
        }

        [HttpGet]
        public async Task<IActionResult> Index()
        {
            ViewData["Breadcrumb"] = new List<string> { "Event And Festival Management", "Event And Festival List" };
            var eventAndFestivals = await _eventAndFestivalService.ListAllAsync();
            if (eventAndFestivals == null)
            {
                ViewBag.error = "Something went wrong, please try again";
                return View(eventAndFestivals);
            }
            return View(eventAndFestivals);
        }

        [HttpGet("CreateEventAndFestival")]
        public IActionResult CreateEventAndFestival()
        {
            return View();
        }

        [HttpPost("CreateEventAndFestival")]
        public async Task<IActionResult> CreateEventAndFestival(CreateEventAndFestivalRequest createEventAndFestivalRequest)
        {
            // await _eventAndFestivalService.CreateEventAndFestival(createEventAndFestivalRequest);
            return RedirectToAction("Index");
        }
        

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View("Error!");
        }
    }
}