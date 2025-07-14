using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TraVinhMaps.Web.Admin.Models.Translate;

namespace TraVinhMaps.Web.Admin.Services.Translate
{
    public class TranslateService : ITranslationService
    {
        private readonly HttpClient _httpClient;

        public TranslateService(IHttpClientFactory httpClientFactory)
        {
            _httpClient = httpClientFactory.CreateClient("ApiClient");
        }

        public async Task<TranslationResult> TranslateAsync(string text, string sourceLang = "en", string targetLang = "vi", CancellationToken cancellationToken = default)
        {
            var url = $"/api/Translation?text={Uri.EscapeDataString(text)}&sourceLang={sourceLang}&targetLang={targetLang}";

            var response = await _httpClient.GetAsync(url, cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                throw new Exception($"Translation API failed: {await response.Content.ReadAsStringAsync()}");
            }
            var result = await response.Content.ReadFromJsonAsync<TranslationResult>(cancellationToken: cancellationToken);
            return result;
        }

        public async Task<Dictionary<string, string>> TranslateBatchAsync(IEnumerable<string> texts, string sourceLang, string targetLang, CancellationToken ct)
        {
            var requestBody = new
            {
                texts = texts.ToList(),
                sourceLang,
                targetLang
            };

            var response = await _httpClient.PostAsJsonAsync("/api/Translation/batch", requestBody, ct);
            if (!response.IsSuccessStatusCode)
            {
                throw new Exception($"Batch translation failed: {await response.Content.ReadAsStringAsync()}");
            }

            return await response.Content.ReadFromJsonAsync<Dictionary<string, string>>(cancellationToken: ct);
        }

        public async Task<string> GetCacheJsonAsync()
        {
            var response = await _httpClient.GetAsync("/api/Translation/cache");
            if (!response.IsSuccessStatusCode)
                throw new Exception($"Failed to fetch translation cache: {response.StatusCode}");

            return await response.Content.ReadAsStringAsync();
        }
    }

}
