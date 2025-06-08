using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text.Json;
using System.Threading.Tasks;
using TraVinhMaps.Web.Admin.Models.Feedback;

namespace TraVinhMaps.Web.Admin.Services.Feedback
{
    public class FeedbackService : IFeedbackService
    {
        private readonly HttpClient _httpClient;
        private string feedbackApi;

        public FeedbackService(IHttpClientFactory httpClientFactory)
        {
            _httpClient = httpClientFactory.CreateClient("ApiClient");
            this.feedbackApi = "api/Feedback/";
        }
        public async Task<FeedbackResponse> GetByIdAsync(string id, CancellationToken cancellationToken = default)
        {
            var response = await _httpClient.GetAsync(feedbackApi + "details/" + id);
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync(cancellationToken);
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var apiResult = JsonSerializer.Deserialize<ApiResponse<FeedbackResponse>>(content, options);
                if (apiResult?.Data != null)
                {
                    return apiResult.Data;
                }
                throw new HttpRequestException("Feedback data is missing.");
            }
            throw new HttpRequestException($"Request failed with status code: {response.StatusCode}");
        }

        public async Task<IEnumerable<FeedbackResponse>> ListAllAsync(CancellationToken cancellationToken = default)
        {
            var response = await _httpClient.GetAsync(feedbackApi + "all", cancellationToken);
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync(cancellationToken);
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var apiResponse = JsonSerializer.Deserialize<ApiResponse<IEnumerable<FeedbackResponse>>>(content, options);
                if (apiResponse?.Data != null)
                {
                    return apiResponse.Data;
                }
                throw new HttpRequestException("Feedback data is missing.");
            }
            throw new HttpRequestException($"Request failed with status code: {response.StatusCode}");
        }

        public Task<IEnumerable<FeedbackResponse>> ListAsync(Expression<Func<FeedbackResponse, bool>> predicate, CancellationToken cancellationToken = default)
        {
            throw new NotImplementedException();
        }
    }
}