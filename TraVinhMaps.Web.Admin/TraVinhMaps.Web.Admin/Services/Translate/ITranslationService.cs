using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TraVinhMaps.Web.Admin.Models.Translate;

namespace TraVinhMaps.Web.Admin.Services.Translate
{
    public interface ITranslationService
    {
        Task<TranslationResult> TranslateAsync(string text, string sourceLang = "en", string targetLang = "vi", CancellationToken cancellationToken = default);
        Task<Dictionary<string, string>> TranslateBatchAsync(IEnumerable<string> texts, string sourceLang, string targetLang, CancellationToken ct);
    }
}