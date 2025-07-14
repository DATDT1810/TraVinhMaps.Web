using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using TraVinhMaps.Web.Admin.Models;
using TraVinhMaps.Web.Admin.Models.Review;
using TraVinhMaps.Web.Admin.Services.DestinationTypes;
using TraVinhMaps.Web.Admin.Services.Review;
using TraVinhMaps.Web.Admin.Services.TouristDestination;

namespace TraVinhMaps.Web.Admin.Controllers
{
    [Route("Admin/Review")]
    public class ReviewController : Controller
    {
        private readonly IReviewService _reviewService;
        private readonly IDestinationTypeService _destinationTypeService;
        public ReviewController(IReviewService reviewService, IDestinationTypeService destinationTypeService)
        {
            _reviewService = reviewService;
            _destinationTypeService = destinationTypeService;
        }

        // GET: Review/Index
        public async Task<IActionResult> Index(string? destinationId, int? rating, DateTime? startAt, DateTime? endAt)
        {
            ViewData["Title"] = "Review Management";
            ViewData["Breadcrumb"] = new List<BreadcrumbItem>
            {
                new BreadcrumbItem { Title = "Review Management", Url = Url.Action("Index", "Review")! },
                new BreadcrumbItem { Title = "Review List" } // default URL for the current page
            };
            var destinationList = await _destinationTypeService.ListAllAsync();
            IEnumerable<ReviewResponse> reviews;
            if (!string.IsNullOrEmpty(destinationId) || rating.HasValue || startAt.HasValue || endAt.HasValue)
            {
                reviews = await _reviewService.FilterReviewsAsync(destinationId, rating, startAt, endAt);
            }
            else
            {
                reviews = await _reviewService.ListAllAsync();
            }
            ViewBag.Destination = destinationList;
            return View(reviews);
        }

        // GET: Review/DetailReview
        [HttpGet("DetailReview")]
        public async Task<IActionResult> DetailReview(string id)
        {
            ViewData["Title"] = "Review Details";
            ViewData["Breadcrumb"] = new List<BreadcrumbItem>
            {
                new BreadcrumbItem { Title = "Review Management", Url = Url.Action("Index", "Company")! },
                new BreadcrumbItem { Title = "Review Details" } // default URL for the current page
            };
            var review = await _reviewService.GetReviewByIdAsync(id);
            return View(review);
        }
    }
}