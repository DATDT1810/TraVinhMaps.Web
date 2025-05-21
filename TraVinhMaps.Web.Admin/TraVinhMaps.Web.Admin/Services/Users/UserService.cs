using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using TraVinhMaps.Web.Admin.Models.Users;
using TraVinhMaps.Web.Admin.Models.Users.Specs;

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
            var response = await _httpClient.GetAsync(userApi + id);
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                return JsonSerializer.Deserialize<UserResponse>(content, options) ?? throw new HttpRequestException("User not found.");
            }
            throw new HttpRequestException("Unable to fetch user.");
        }

        public Task<PaginationUserResponse.Pagination<UserResponse>> GetUsersAsync(UserSpecParams userSpecParams, CancellationToken cancellationToken = default)
        {
            throw new NotImplementedException();
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
            var response = await _httpClient.GetAsync(userApi + "all", cancellationToken);
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var users = JsonSerializer.Deserialize<IEnumerable<UserResponse>>(content, options) ?? new List<UserResponse>();
                return users.OrderByDescending(u => u.CreatedAt).Take(count).ToList();
            }
            throw new HttpRequestException("Unable to fetch recent users.");
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
    }
}