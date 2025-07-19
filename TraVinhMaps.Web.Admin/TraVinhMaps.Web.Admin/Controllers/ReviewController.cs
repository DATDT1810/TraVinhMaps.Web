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
        private readonly IDestinationService _destinationService;
        public ReviewController(IReviewService reviewService, IDestinationService destinationService)
        {
            _reviewService = reviewService;
            _destinationService = destinationService;
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
            IEnumerable<ReviewResponse> reviews;
            if (!string.IsNullOrEmpty(destinationId) || rating.HasValue || startAt.HasValue || endAt.HasValue)
            {
                reviews = await _reviewService.FilterReviewsAsync(destinationId, rating, startAt, endAt);
            }
            else
            {
                reviews = await _reviewService.ListAllAsync();
            }
            try
                {
                     var destinationList = await _destinationService.ListAllAsync();
                    var totalUsersReview = await _reviewService.GetTotalUsersReviewedAsync();
                    var totalFiveStarReviews = await _reviewService.GetTotalFiveStarReviewsAsync();
                    var topReviewer = await _reviewService.GetTopReviewerAsync();
                    var countReview = await _reviewService.CountAsync();
                    ViewBag.Destination = destinationList;
                    ViewBag.TotalUsersReview = totalUsersReview;
                    ViewBag.TotalFiveStarReviews = totalFiveStarReviews;
                    ViewBag.TopReviewer = topReviewer;
                    ViewBag.CountReview = countReview;
                }
            catch (HttpRequestException ex)
            {
                Console.WriteLine($"[ERROR] Failed to get OcopType: {ex.Message}");
                ViewBag.Destination = "Unknown";
                ViewBag.TotalUsersReview = "No stats";
                ViewBag.TotalFiveStarReviews = "No stats";
                ViewBag.TopReviewer = "No stats";
                ViewBag.CountReview = "No stats";
            }
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