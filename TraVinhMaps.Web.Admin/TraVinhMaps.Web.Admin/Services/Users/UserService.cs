using System.Text.Json;
using Microsoft.AspNetCore.WebUtilities;
using TraVinhMaps.Web.Admin.Models;
using TraVinhMaps.Web.Admin.Models.Users;

namespace TraVinhMaps.Web.Admin.Services.Users
{
    public class UserService : IUserService
    {
        private readonly HttpClient _httpClient;
        private string userApi;

        public UserService(IHttpClientFactory httpClientFactory)
        {
            _httpClient = httpClientFactory.CreateClient("ApiClient");
            this.userApi = "api/Users/";
        }

        public async Task<IEnumerable<UserResponse>> ListAllAsync(CancellationToken cancellationToken = default)
        {
            var response = await _httpClient.GetAsync(userApi + "all", cancellationToken);
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                return JsonSerializer.Deserialize<IEnumerable<UserResponse>>(content, options) ?? new List<UserResponse>();
            }
            throw new HttpRequestException("Unable to fetch get all users.");
        }

        public async Task<IEnumerable<UserResponse>> ListAsync(Func<UserResponse, bool> predicate, CancellationToken cancellationToken = default)
        {
            var response = await _httpClient.GetAsync(userApi + "inActive", cancellationToken);
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                return JsonSerializer.Deserialize<IEnumerable<UserResponse>>(content, options) ?? new List<UserResponse>();
            }
            throw new HttpRequestException("Unable to fetch get all users.");
        }


        public async Task<UserResponse> AddAsync(UserResponse entity, CancellationToken cancellationToken = default)
        {
            string data = JsonSerializer.Serialize(entity);
            Console.WriteLine("Sending data: " + data);
            var content = new StringContent(data, System.Text.Encoding.UTF8, "application/json");
            HttpResponseMessage response = await _httpClient.PostAsync(userApi, content, cancellationToken);
            if (response.IsSuccessStatusCode)
            {
                var contentResult = await response.Content.ReadAsStringAsync();
                Console.WriteLine("Response: " + contentResult);
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                return JsonSerializer.Deserialize<UserResponse>(contentResult, options) ?? throw new HttpRequestException("Unable to create user.");
            }
            else
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                Console.WriteLine("Error Response: " + errorContent);
                throw new HttpRequestException($"Unable to create user. Status: {response.StatusCode}, Error: {errorContent}");
            }
        }

        public Task<IEnumerable<UserResponse>> AddRangeAsync(IEnumerable<UserResponse> entities, CancellationToken cancellationToken = default)
        {
            throw new NotImplementedException();
        }

        public async Task<long> CountAsync(Func<UserResponse, bool> predicate = null, CancellationToken cancellationToken = default)
        {
            var response = await _httpClient.GetAsync(userApi + "all", cancellationToken);
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var users = JsonSerializer.Deserialize<IEnumerable<UserResponse>>(content, options) ?? new List<UserResponse>();

                if (predicate != null)
                {
                    return users.LongCount(predicate);
                }
                return users.LongCount();
            }
            throw new HttpRequestException("Unable to fetch users for counting.");
        }

        public async Task<long> CountAllUsersAsync(CancellationToken cancellationToken = default)
        {
            var response = await _httpClient.GetAsync(userApi + "count", cancellationToken);
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                return long.Parse(content);
            }
            throw new HttpRequestException("Unable to fetch user count.");
        }

        public async Task<long> CountActiveUsersAsync(CancellationToken cancellationToken = default)
        {
            var response = await _httpClient.GetAsync(userApi + "count-active", cancellationToken);
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                return long.Parse(content);
            }
            throw new HttpRequestException("Unable to fetch user count.");
        }

        public async Task DeleteAsync(UserResponse entity, CancellationToken cancellationToken = default)
        {
            var response = await _httpClient.DeleteAsync(userApi, cancellationToken);
        }

        public async Task<bool> DeleteUser(string id, CancellationToken cancellationToken = default)
        {
            var response = await _httpClient.DeleteAsync(userApi + "LockUser/" + id);
            return response.IsSuccessStatusCode;
        }

        public async Task<UserResponse> GetByIdAsync(string id, CancellationToken cancellationToken = default)
        {
            try
            {
                var response = await _httpClient.GetAsync(userApi + id, cancellationToken);

                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync(cancellationToken);
                    var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                    return JsonSerializer.Deserialize<UserResponse>(content, options);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[GetByIdAsync] Error: {ex.Message}");
            }
            return null;
        }

        public async Task<bool> RestoreUser(string id, CancellationToken cancellationToken = default)
        {
            var contents = new StringContent("");
            var response = await _httpClient.PutAsync(userApi + "RestoreUser/" + id, contents, cancellationToken);
            if (response.IsSuccessStatusCode)
            {
                return true;
            }
            return false;
        }

        public async Task UpdateAsync(UserResponse entity, CancellationToken cancellationToken = default)
        {
            string data = JsonSerializer.Serialize(entity);
            var content = new StringContent(data, System.Text.Encoding.UTF8, "application/json");
            HttpResponseMessage response = await _httpClient.PutAsync(userApi, content, cancellationToken);
        }

        public async Task<List<UserResponse>> GetRecentUsersAsync(int count, CancellationToken cancellationToken = default)
        {
            try
            {
                var response = await _httpClient.GetAsync(userApi + "all", cancellationToken);
                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                    var users = JsonSerializer.Deserialize<IEnumerable<UserResponse>>(content, options) ?? new List<UserResponse>();
                    return users.OrderByDescending(u => u.CreatedAt).Take(count).ToList();
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[GetRecentUsersAsync] Error: {ex.Message}");
            }
            return new List<UserResponse>();
        }

        public async Task<UserResponse> AddAdminAsync(UserRequest request, CancellationToken cancellationToken = default)
        {
            string data = JsonSerializer.Serialize(request);
            var content = new StringContent(data, System.Text.Encoding.UTF8, "application/json");
            HttpResponseMessage response = await _httpClient.PostAsync(userApi + "admin", content, cancellationToken);

            if (response.IsSuccessStatusCode)
            {
                var result = await response.Content.ReadAsStringAsync();
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                return JsonSerializer.Deserialize<UserResponse>(result, options) ?? throw new HttpRequestException("Unable to create admin.");
            }
            else
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                throw new HttpRequestException($"Unable to create admin. Status: {response.StatusCode}, Error: {errorContent}");
            }
        }
        public async Task<Dictionary<string, object>> GetUserStatisticsAsync(string groupBy, string timeRange, CancellationToken cancellationToken = default)
        {
            try
            {
                var url = $"{userApi}stats?groupBy={groupBy}&timeRange={timeRange}";
                var response = await _httpClient.GetAsync(url, cancellationToken);

                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync(cancellationToken);
                    var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                    var baseResult = JsonSerializer.Deserialize<UserBase<JsonElement>>(content, options);

                    if (baseResult?.Data.ValueKind == JsonValueKind.Object)
                    {
                        var result = new Dictionary<string, object>();
                        foreach (var prop in baseResult.Data.EnumerateObject())
                        {
                            if (groupBy != "all" && prop.Name != groupBy) continue;
                            var subDict = JsonSerializer.Deserialize<Dictionary<string, int>>(prop.Value.GetRawText(), options);
                            result[prop.Name] = subDict;
                        }
                        return result;
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[GetUserStatsAsync] Error: {ex.Message}");
            }

            return new Dictionary<string, object>();
        }

        public async Task<Dictionary<string, Dictionary<string, int>>> GetPerformanceByTagAsync(
    IEnumerable<string>? tagNames,
    bool includeOcop,
    bool includeDestination,
    bool includeLocalSpecialty,
    bool includeTips,
    bool includeFestivals,
    string timeRange = "month",
    DateTime? startDate = null,
    DateTime? endDate = null,
    CancellationToken cancellationToken = default)
        {
            // 1. Tính toán thời gian nếu cần (tùy theo timeRange)
            startDate ??= timeRange switch
            {
                "day" => DateTime.UtcNow.AddHours(7).Date,
                "week" => DateTime.UtcNow.AddHours(7).Date.AddDays(-7),
                "month" => DateTime.UtcNow.AddHours(7).Date.AddMonths(-1),
                "year" => DateTime.UtcNow.AddHours(7).Date.AddYears(-1),
                _ => DateTime.UtcNow.AddHours(7).Date.AddDays(-30)
            };
            endDate ??= DateTime.UtcNow.AddHours(7).Date.AddDays(1); // ngày mai

            var query = new Dictionary<string, string?>
            {
                ["includeOcop"] = includeOcop.ToString().ToLower(),
                ["includeDestination"] = includeDestination.ToString().ToLower(),
                ["includeLocalSpecialty"] = includeLocalSpecialty.ToString().ToLower(),
                ["includeTips"] = includeTips.ToString().ToLower(),
                ["includeFestivals"] = includeFestivals.ToString().ToLower(),
                ["timeRange"] = timeRange,
                ["startDate"] = startDate.Value.ToString("yyyy-MM-ddTHH:mm:ssZ"),
                ["endDate"] = endDate.Value.ToString("yyyy-MM-ddTHH:mm:ssZ")
            };

            if (tagNames != null)
            {
                foreach (var tag in tagNames.Where(t => !string.IsNullOrWhiteSpace(t)))
                {
                    query.Add("tags", tag);
                }
            }

            var url = QueryHelpers.AddQueryString($"{userApi}performance-tags", query);

            using var response = await _httpClient.GetAsync(url, cancellationToken);
            response.EnsureSuccessStatusCode();

            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            var parsed = await response.Content.ReadFromJsonAsync<BaseResponseModel<Dictionary<string, Dictionary<string, int>>>>(options, cancellationToken);

            return parsed?.Data ?? new Dictionary<string, Dictionary<string, int>>();
        }

    }
}