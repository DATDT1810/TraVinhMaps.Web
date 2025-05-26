using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.Extensions.Logging;
using TraVinhMaps.Web.Admin.Models.CommunityTips;
using TraVinhMaps.Web.Admin.Services.CommunityTips;
using TraVinhMaps.Web.Admin.Services.Tags;

namespace TraVinhMaps.Web.Admin.Controllers
{
    // Controller responsible for handling Community Tips-related actions
    [Route("[controller]")]
    public class CommunityTipsController : Controller
    {
        private readonly ICommunityTipsService _communityTipsService;
        private readonly ITagService _tagService;

        // Constructor injection for community tips and tag services
        public CommunityTipsController(ICommunityTipsService communityTipsService, ITagService tagService)
        {
            _communityTipsService = communityTipsService;
            _tagService = tagService;
        }

        // GET: /CommunityTips/Index
        // Displays the list of community tips
        [HttpGet("Index")]
        public async Task<IActionResult> Index()
        {
            ViewData["Title"] = "Tips List";
            ViewData["Breadcrumb"] = new List<string> { "Tips Management", "Tips List" };

            var tips = await _communityTipsService.ListAllAsync();

            // Load tags for each tip and assign the tag name
            var tipsWithTags = new List<CommunityTipsResponse>();
            foreach (var tip in tips)
            {
                var tag = await _tagService.GetByIdAsync(tip.TagId);
                tip.TagName = tag?.Name ?? ""; 
                tipsWithTags.Add(tip);
            }

            // Send all available tags to the view
            var tags = await _tagService.ListAllAsync();
            ViewBag.Tags = tags.Select(t => new { Id = t.Id, Name = t.Name }).ToList();

            return View(tipsWithTags);
        }

        // GET: /CommunityTips/{id}
        // Displays the detail view of a specific tip
        [HttpGet("{id}")]
        public async Task<IActionResult> CommunityTipsDetails(string id, CancellationToken cancellationToken = default)
        {
            ViewData["Title"] = "Tips List";
            ViewData["Breadcrumb"] = new List<string> { "Tips List", "Details" };

            var tips = await _communityTipsService.GetByIdAsync(id, cancellationToken);
            if (tips == null)
            {
                return RedirectToAction("Index");
            }

            var tag = await _tagService.GetByIdAsync(tips.TagId);
            ViewBag.TagName = tag?.Name ?? "";

            return View(tips);
        }

        // GET: /CommunityTips/Create
        // Displays the form to create a new tip
        [HttpGet("Create")]
        public async Task<IActionResult> Create(CancellationToken cancellationToken)
        {
            ViewData["Title"] = "Add Tips";
            ViewData["Breadcrumb"] = new List<string> { "Tips Management", "Add" };

            var tags = await _tagService.ListAllAsync();
            ViewBag.Tags = new SelectList(tags, "Id", "Name");

            return View();
        }

        // POST: /CommunityTips/Create
        // Handles form submission for creating a new tip
        [HttpPost("Create")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(CommunityTipsRequest request, CancellationToken cancellationToken = default)
        {
            if (!ModelState.IsValid)
            {
                var tags = await _tagService.ListAllAsync();
                ViewBag.Tags = new SelectList(tags, "Id", "Name");
                return View(request);
            }

            try
            {
                var notification = await _communityTipsService.AddAsync(request, cancellationToken);
                TempData["CreateTipsSuccess"] = "The tip was created successfully!";
                return RedirectToAction(nameof(Index));
            }
            catch (InvalidOperationException)
            {
                var tags = await _tagService.ListAllAsync();
                ViewBag.Tags = new SelectList(tags, "Id", "Name");
                TempData["CreateTipsError"] = "A tip with the same title and tag already exists.";
                return View(request);
            }
            catch (Exception)
            {
                var tags = await _tagService.ListAllAsync();
                ViewBag.Tags = new SelectList(tags, "Id", "Name");
                TempData["CreateTipsError"] = "Failed to add the tip!";
                return View(request);
            }
        }

        // GET: /CommunityTips/Edit?id={id}
        // Displays the form to edit an existing tip
        [HttpGet("Edit")]
        public async Task<IActionResult> Edit(string id)
        {
            try
            {
                var tips = await _communityTipsService.GetByIdAsync(id);
                if (tips == null)
                {
                    return RedirectToAction("Index");
                }

                var tags = await _tagService.ListAllAsync();
                ViewBag.Tags = new SelectList(tags, "Id", "Name", tips.TagId);
                return View(tips);
            }
            catch (Exception)
            {
                return RedirectToAction("Index");
            }
        }

        // POST: /CommunityTips/Edit
        // Handles form submission to update an existing tip
        [HttpPost("Edit")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(CommunityTipsResponse request, CancellationToken cancellationToken)
        {
            try
            {
                await _communityTipsService.UpdateAsync(request);
                TempData["EditTipsSuccess"] = "Tip updated successfully!";
                return RedirectToAction("Index");
            }
            catch (Exception)
            {
                TempData["EditTipsError"] = "Failed to update the tip!";
                return View(request);
            }
        }

        // GET: /CommunityTips/Restore/{id}
        // Displays confirmation view for restoring a deleted tip
        [HttpGet("Restore/{id}")]
        public async Task<IActionResult> Restore(string id)
        {
            var tips = await _communityTipsService.GetByIdAsync(id);
            return View(tips);
        }

        // POST: /CommunityTips/Restore
        // Handles the actual restoration of a deleted tip
        [HttpPost("Restore")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> RestoreConfirm(string id, CancellationToken cancellationToken = default)
        {
            try
            {
                var success = await _communityTipsService.RestoreTipAsync(id, cancellationToken);
                if (success)
                {
                    return Json(new { success = true, message = "Tip restored successfully" });
                }
                return Json(new { success = false, message = "Failed to restore tip" });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Error restoring tip: {ex.Message}" });
            }
        }

        // GET: /CommunityTips/Delete/{id}
        // Displays confirmation view for deleting a tip
        [HttpGet("Delete/{id}")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Delete(string id)
        {
            var tips = await _communityTipsService.GetByIdAsync(id);
            return View(tips);
        }

        // POST: /CommunityTips/Delete
        // Handles deletion of a tip
        [HttpPost("Delete")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteConfirm(string id, CancellationToken cancellationToken)
        {
            try
            {
                await _communityTipsService.DeleteTipAsync(id, cancellationToken);
                return Json(new { success = true, message = "Tip deleted successfully" });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Error deleting tip: {ex.Message}" });
            }
        }
    }
}
