using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using TraVinhMaps.Web.Admin.Models;
using TraVinhMaps.Web.Admin.Models.Tags;

namespace TraVinhMaps.Web.Admin.Services.Tags
{
    public class TagService : ITagService
    {
        private readonly HttpClient _httpClient;
        private string tagAPi;

        public TagService(IHttpClientFactory clientFactory)
        {
            _httpClient = clientFactory.CreateClient("ApiClient");
            this.tagAPi = "api/Tags/";
        }

        public async Task<TagsResponse> GetByIdAsync(string id, CancellationToken cancellationToken = default)
        {
            var response = await _httpClient.GetAsync(tagAPi + "GetTagById/" + id, cancellationToken);
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync(cancellationToken);
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                return JsonSerializer.Deserialize<TagsResponse>(content, options) ?? throw new HttpRequestException("Tag not found.");
            }
            throw new HttpRequestException("Unable to fetch tags.");
        }

        public async Task<string> GetTagIdByNameAsync(string tagName, CancellationToken cancellationToken = default)
        {
            var url = $"{tagAPi.TrimEnd('/')}/GetTagIdByName/{Uri.EscapeDataString(tagName)}";
            var response = await _httpClient.GetAsync(url, cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync(cancellationToken);
                Console.WriteLine($"API Error for tag '{tagName}': Status: {response.StatusCode}, Response: {errorContent}");
                throw new HttpRequestException($"Unable to fetch tag '{tagName}'. Status: {response.StatusCode}, Response: {errorContent}");
            }

            var content = await response.Content.ReadAsStringAsync(cancellationToken);
            Console.WriteLine($"API Response for tag '{tagName}': {content}");

            if (string.IsNullOrWhiteSpace(content))
            {
                throw new HttpRequestException($"Tag '{tagName}' not found.");
            }

            return content.Trim(); // Return the raw string, trimmed of any whitespace
        }

        public async Task<IEnumerable<TagsResponse>> ListAllAsync(CancellationToken cancellationToken = default)
        {
            var response = await _httpClient.GetAsync(tagAPi + "all", cancellationToken);
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                return JsonSerializer.Deserialize<IEnumerable<TagsResponse>>(content, options) ?? new List<TagsResponse>();
            }
            throw new HttpRequestException("Unable to fetch get all tags.");
        }

    }
}