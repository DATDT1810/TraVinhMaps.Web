using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using TraVinhMaps.Web.Admin.Models.Translate;
using TraVinhMaps.Web.Admin.Services.Translate;

namespace TraVinhMaps.Web.Admin.Controllers
{
    [Route("[controller]")]
    public class TranslationController : Controller
    {
        private readonly ITranslationService _translationService;

        public TranslationController(ITranslationService translationService)
        {
            _translationService = translationService;
        }

        [HttpGet]
        public async Task<IActionResult> Translate(string text, string sourceLang = "en", string targetLang = "vi", CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(text))
                return BadRequest("Text is required");

            var result = await _translationService.TranslateAsync(text, sourceLang, targetLang, cancellationToken);
            return Ok(result);
        }


        [HttpPost("batch")]
        public async Task<IActionResult> TranslateBatch([FromBody] TranslationBatchRequest req, CancellationToken cancellationToken = default)
        {
            if (req == null || req.Texts == null || !req.Texts.Any())
                return BadRequest("Texts required");

            var result = await _translationService.TranslateBatchAsync(req.Texts, req.SourceLang, req.TargetLang, cancellationToken);
            return Ok(result);
        }


        [HttpGet("cache")]
        public IActionResult GetCache()
        {
            var path = Path.Combine(AppContext.BaseDirectory, "Cache", "translations.json");
            if (!System.IO.File.Exists(path))
                return NotFound("Cache file not found");

            var json = System.IO.File.ReadAllText(path);
            return Content(json, "application/json");
        }

    }
}