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
            try
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
                    // var errorResult = await response.Content.ReadAsStringAsync(cancellationToken);
                    // throw new HttpRequestException($"Unable to fetch list review. Status: {response.StatusCode}, Error: {errorResult}");
                    return Enumerable.Empty<ReviewResponse>();
                }
            }
            catch (Exception ex)
            {
                throw new HttpRequestException($"An error occurred while fetching reviews: {ex.Message}", ex);
            }
        }
        public async Task<long> CountAsync(Expression<Func<ReviewResponse, bool>> predicate = null, CancellationToken cancellationToken = default)
        {
            try
            {
                var response = await _httpClient.GetAsync(reviewApi + "CountReviews");
                if (response.IsSuccessStatusCode)
                {
                    var contentResult = await response.Content.ReadAsStringAsync(cancellationToken);
                    var option = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                    var result = System.Text.Json.JsonSerializer.Deserialize<ApiResponse<long>>(contentResult, option);
                    return result.Data;
                }
                else
                {
                    var errorResult = await response.Content.ReadAsStringAsync(cancellationToken);
                }
            }
            catch (Exception ex)
            {
                return 0;
            }
            return 0;
        }
        public async Task<long> GetTotalUsersReviewedAsync(CancellationToken cancellationToken = default)
        {
            var response = await _httpClient.GetAsync(reviewApi + "GetTotalUsersReviewedAsync");
            if (response.IsSuccessStatusCode)
            {
                var contentResult = await response.Content.ReadAsStringAsync(cancellationToken);
                var option = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var result = System.Text.Json.JsonSerializer.Deserialize<ApiResponse<long>>(contentResult, option);
                return result.Data;
            }
            else
            {
                var errorResult = await response.Content.ReadAsStringAsync(cancellationToken);
                throw new HttpRequestException($"Unable to fetch total users review. Status: {response.StatusCode}, Error: {errorResult}");
            }
        }
        public async Task<long> GetTotalFiveStarReviewsAsync(CancellationToken cancellationToken = default)
        {
            var response = await _httpClient.GetAsync(reviewApi + "GetTotalFiveStarReviewsAsync");
            if (response.IsSuccessStatusCode)
            {
                var contentResult = await response.Content.ReadAsStringAsync(cancellationToken);
                var option = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var result = System.Text.Json.JsonSerializer.Deserialize<ApiResponse<long>>(contentResult, option);
                return result.Data;
            }
            else
            {
                var errorResult = await response.Content.ReadAsStringAsync(cancellationToken);
                throw new HttpRequestException($"Unable to fetch total five star review. Status: {response.StatusCode}, Error: {errorResult}");
            }
        }
        public async Task<string> GetTopReviewerAsync(CancellationToken cancellationToken = default)
        {
            try
            {
                var response = await _httpClient.GetAsync(reviewApi + "GetTopReviewerAsync");
                if (response.IsSuccessStatusCode)
                {
                    var contentResult = await response.Content.ReadAsStringAsync(cancellationToken);
                    var option = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                    var result = System.Text.Json.JsonSerializer.Deserialize<TopReviewerResponse>(contentResult, option);
                    return result.UserName;
                }
                else
                {
                    // var errorResult = await response.Content.ReadAsStringAsync(cancellationToken);
                    // throw new HttpRequestException($"Unable to fetch top reviewer. Status: {response.StatusCode}, Error: {errorResult}");
                    return string.Empty; // Return empty string if the request fails
                }
            }
            catch (Exception ex)
            {
                throw new HttpRequestException($"An error occurred while fetching the top reviewer: {ex.Message}", ex);
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
            try
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
                    // var errorResult = await response.Content.ReadAsStringAsync(cancellationToken);
                    // throw new HttpRequestException($"Unable to fetch reviews. Status: {response.StatusCode}, Error: {errorResult}");
                    return Enumerable.Empty<ReviewResponse>(); // Return empty if the request fails
                }
            }
            catch (Exception ex)
            {
                throw new HttpRequestException($"An error occurred while filtering reviews: {ex.Message}", ex);
            }
        }

        public async Task<IEnumerable<ReviewResponse>> GetLatestReviewsAsync(int count = 5, CancellationToken cancellationToken = default)
        {
            try
            {
                var response = await _httpClient.GetAsync(reviewApi + "GetLatestReviews");
                if (response.IsSuccessStatusCode)
                {
                    var contentResult = await response.Content.ReadAsStringAsync(cancellationToken);
                    var option = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                    return System.Text.Json.JsonSerializer.Deserialize<ReviewBase<List<ReviewResponse>>>(contentResult, option)?.Data ?? throw new HttpRequestException("Fail to find list latest review.");
                }
                else
                {
                    // var errorResult = await response.Content.ReadAsStringAsync(cancellationToken);
                    // throw new HttpRequestException($"Unable to fetch list latest review. Status: {response.StatusCode}, Error: {errorResult}");
                    return Enumerable.Empty<ReviewResponse>(); // Return empty if the request fails
                }
            }
            catch (Exception ex)
            {
                throw new HttpRequestException($"An error occurred while fetching latest reviews: {ex.Message}", ex);
            }
        }

        public async Task<IEnumerable<ReviewResponse>> GetListReviewByUserId(string id, CancellationToken cancellationToken = default)
        {
            var response = await _httpClient.GetAsync(reviewApi + "GetReviewsByUserId/" + id);
            if (response.IsSuccessStatusCode)
            {
                var contentResult = await response.Content.ReadAsStringAsync(cancellationToken);
                var option = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                return System.Text.Json.JsonSerializer.Deserialize<ReviewBase<List<ReviewResponse>>>(contentResult, option)?.Data ?? throw new HttpRequestException("Fail to find list review by user id.");
            }
            else
            {
                var errorResult = await response.Content.ReadAsStringAsync(cancellationToken);
                throw new HttpRequestException($"Unable to fetch list review by user id. Status: {response.StatusCode}, Error: {errorResult}");
            }
        }
    }
}