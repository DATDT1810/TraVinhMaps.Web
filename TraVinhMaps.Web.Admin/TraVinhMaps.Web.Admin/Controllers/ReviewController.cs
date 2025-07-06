using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
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
        public async Task<IActionResult> Index(string? destinationId, int? rating, DateTime? startAt, DateTime? endAt)
        {
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
        [HttpGet("DetailReview")]
        public async Task<IActionResult> DetailReview(string id)
        {
            var review = await _reviewService.GetReviewByIdAsync(id);
            return View(review);
        }
    }
}