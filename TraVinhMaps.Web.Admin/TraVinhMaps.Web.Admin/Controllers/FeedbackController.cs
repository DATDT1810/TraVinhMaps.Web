using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using TraVinhMaps.Web.Admin.Services.Feedback;

namespace TraVinhMaps.Web.Admin.Controllers
{
    [Route("[controller]")]
    public class FeedbackController : Controller
    {
        private readonly IFeedbackService _feebackService;

        public FeedbackController(IFeedbackService feebackService)
        {
            _feebackService = feebackService;
        }

        [HttpGet("Index")]
        public async Task<IActionResult> Index()
        {
            ViewData["Title"] = "Feedback Management";
            ViewData["Breadcrumb"] = new List<string> { "Feedback Management", "List" };
            var feedbacks = await _feebackService.ListAllAsync();
            return View(feedbacks);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Details(string id)
        {
            ViewData["Title"] = "Feedback Management";
            ViewData["Breadcrumb"] = new List<string> { "Feedback Management", "Details" };
            var feedbacks = await _feebackService.GetByIdAsync(id);
            return View(feedbacks);
        }

    }
}