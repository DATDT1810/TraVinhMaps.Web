using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text.Json;
using System.Threading.Tasks;
using TraVinhMaps.Web.Admin.Models.Review;

namespace TraVinhMaps.Web.Admin.Services.Review
{
    public class ReviewService : IReviewService
    {
        private readonly HttpClient _httpClient;
        private string reviewApi;

        public ReviewService(IHttpClientFactory httpClientFactory)
        {
            this._httpClient = httpClientFactory.CreateClient("ApiClient");
            this.reviewApi = "api/Review/";
        }
        public async Task<IEnumerable<ReviewResponse>> ListAllAsync(CancellationToken cancellationToken = default)
        {
            var response = await _httpClient.GetAsync(reviewApi + "GetAllReview");
            if (response.IsSuccessStatusCode)
            {
                var contentResult = await response.Content.ReadAsStringAsync(cancellationToken);
                var option = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                return System.Text.Json.JsonSerializer.Deserialize<ReviewBase<List<ReviewResponse>>>(contentResult, option)?.Data ?? throw new HttpRequestException("Fail to find list review.");
            }
            else
            {
                var errorResult = await response.Content.ReadAsStringAsync(cancellationToken);
                throw new HttpRequestException($"Unable to fetch list review. Status: {response.StatusCode}, Error: {errorResult}");
            }
        }
        public async Task<long> CountAsync(Expression<Func<ReviewResponse, bool>> predicate = null, CancellationToken cancellationToken = default)
        {
            var response = await _httpClient.GetAsync(reviewApi + "CountReviews");
            if (response.IsSuccessStatusCode)
            {
                var contentResult = await response.Content.ReadAsStringAsync(cancellationToken);
                var option = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                return System.Text.Json.JsonSerializer.Deserialize<long>(contentResult, option);
            }
            else
            {
                var errorResult = await response.Content.ReadAsStringAsync(cancellationToken);
                throw new HttpRequestException($"Unable to fetch count review. Status: {response.StatusCode}, Error: {errorResult}");
            }
        }

        public async Task<ReviewResponse> GetReviewByIdAsync(string id, CancellationToken cancellationToken = default)
        {
            var response = await _httpClient.GetAsync(reviewApi + "GetReviewById/" + id);
            if (response.IsSuccessStatusCode)
            {
                var contentResult = await response.Content.ReadAsStringAsync(cancellationToken);
                var option = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                return System.Text.Json.JsonSerializer.Deserialize<ReviewBase<ReviewResponse>>(contentResult, option)?.Data ?? throw new HttpRequestException("Unable to find review by id.");
            }
            else
            {
                var errorResult = await response.Content.ReadAsStringAsync(cancellationToken);
                throw new HttpRequestException($"Unable to fetch review by id. Status: {response.StatusCode}, Error: {errorResult}");
            }
        }
        public async Task<IEnumerable<ReviewResponse>> FilterReviewsAsync(string? destinationId, int? rating, DateTime? startAt, DateTime? endAt, CancellationToken cancellationToken = default)
        {
            var queryParams = new List<string>();

            if (!string.IsNullOrEmpty(destinationId))
                queryParams.Add($"destinationId={Uri.EscapeDataString(destinationId)}");
            if (rating.HasValue)
                queryParams.Add($"rating={rating.Value}");
            if (startAt.HasValue)
                queryParams.Add($"startAt={Uri.EscapeDataString(startAt.Value.ToString("o"))}"); 
            if (endAt.HasValue)
                queryParams.Add($"endAt={Uri.EscapeDataString(endAt.Value.ToString("o"))}"); 
            var queryString = queryParams.Any() ? "?" + string.Join("&", queryParams) : string.Empty;

            var response = await _httpClient.GetAsync(reviewApi + "FilterReviewsAsync" + queryString, cancellationToken);
            if (response.IsSuccessStatusCode)
            {
                var contentResult = await response.Content.ReadAsStringAsync(cancellationToken);
                var option = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                return System.Text.Json.JsonSerializer.Deserialize<ReviewBase<List<ReviewResponse>>>(contentResult, option)?.Data ?? throw new HttpRequestException("Unable to find reviews.");
            }
            else
            {
                var errorResult = await response.Content.ReadAsStringAsync(cancellationToken);
                throw new HttpRequestException($"Unable to fetch reviews. Status: {response.StatusCode}, Error: {errorResult}");
            }
        }
    }
}