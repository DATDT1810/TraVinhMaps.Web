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
    [Route("[controller]")]
    public class CommunityTipsController : Controller
    {
        private readonly ICommunityTipsService _communityTipsService;
        private readonly ITagService _tagService;

        public CommunityTipsController(ICommunityTipsService communityTipsService, ITagService tagService = null)
        {
            _communityTipsService = communityTipsService;
            _tagService = tagService;
        }

        [HttpGet("Index")]
        public async Task<IActionResult> Index()
        {
            ViewData["Title"] = "Tips List";
            ViewData["Breadcrumb"] = new List<string> { "Tips Management", "Tips List" };
            var tips = await _communityTipsService.ListAllAsync();

            var tipsWithTags = new List<CommunityTipsResponse>();
            foreach (var tip in tips)
            {
                var tag = await _tagService.GetByIdAsync(tip.TagId);
                tip.TagName = tag?.Name ?? ""; 
                tipsWithTags.Add(tip);
            }

            var tags = await _tagService.ListAllAsync();
            ViewBag.Tags = tags.Select(t => new { Id = t.Id, Name = t.Name }).ToList();
            return View(tipsWithTags);
        }

        // GET: CommunityTips/ComunityTipsDetails/{id}
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

        [HttpGet("Create")]
        public async Task<IActionResult> Create(CancellationToken cancellationToken)
        {
            ViewData["Title"] = "Add Tips";
            ViewData["Breadcrumb"] = new List<string> { "Tips Management", "Add" };

            var tags = await _tagService.ListAllAsync();
            ViewBag.Tags = new SelectList(tags, "Id", "Name");

            return View();
        }

        // POST: Admin/Tips/Add
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
                TempData["CreateTipsSuccess"] = "The tips create successfully!";
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
                TempData["CreateTipsError"] = "The tips failed to add!";
                return View(request);
            }
        }

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
                TempData["EditTipsError"] = "The tips failed to edit!";
                return View(request);
            }
        }


        [HttpGet("Restore/{id}")]
        public async Task<IActionResult> Restore(string id)
        {
            var tips = await _communityTipsService.GetByIdAsync(id);
            return View(tips);
        }

        [HttpPost("Restore")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> RestoreConfirm(string id, CancellationToken cancellationToken = default)
        {
            try
            {
                var success = await _communityTipsService.RestoreTipAsync(id, cancellationToken);
                if (success)
                {
                    return Json(new { success = true, message = "Tips restored successfully" });
                }
                return Json(new { success = false, message = "Failed to restore tips" });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Error restoring tips: {ex.Message}" });
            }
        }


        [HttpGet("Delete/{id}")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Delete(string id)
        {
            var tips = await _communityTipsService.GetByIdAsync(id);
            return View(tips);
        }

        [HttpPost("Delete")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteConfirm(string id, CancellationToken cancellationToken)
        {
            try
            {
                await _communityTipsService.DeleteTipAsync(id, cancellationToken);
                return Json(new { success = true, message = "Tips delete successfully" });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Error delete user: {ex.Message}" });
            }
        }
    }
}