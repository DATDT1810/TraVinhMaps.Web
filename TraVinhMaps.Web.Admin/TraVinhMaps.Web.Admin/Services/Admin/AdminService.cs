using Newtonsoft.Json;
using System.Net.Http.Headers;
using System.Text;
using System.Linq.Expressions;
using System.Collections.Generic;
using TraVinhMaps.Web.Admin.Models;
using TraVinhMaps.Web.Admin.Models.Admins;
using TraVinhMaps.Web.Admin.Models.Users;
using TraVinhMaps.Web.Admin.Services.Auth;

namespace TraVinhMaps.Web.Admin.Services.Admin
{
    public class AdminService : IAdminService
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ITokenService _tokenService;
        private readonly HttpClient _httpClient;
        private const string AdminApiBaseUrl = "api/Users/"; // Example base URL, adjust as needed
        private const string adminApi = "api/Admins/"; // Admin API base URL

        public AdminService(IHttpClientFactory httpClientFactory, ITokenService tokenService)
        {
            _httpClientFactory = httpClientFactory;
            _tokenService = tokenService;
            _httpClient = httpClientFactory.CreateClient("ApiClient");
        }

        public async Task<AdminProfileResponse> GetAdminProfileAsync(CancellationToken cancellationToken = default)
        {
            var request = new HttpRequestMessage(HttpMethod.Get, AdminApiBaseUrl + "get-profile-admin");
            var response = await _httpClient.SendAsync(request, cancellationToken);
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync(cancellationToken);
                try
                {
                    // Try to deserialize directly using the generic BaseResponseModel
                    var data = JsonConvert.DeserializeObject<BaseResponseModel<AdminProfileResponse>>(content);
                    if (data == null || data.Data == null)
                    {
                        return null; // or throw an exception based on your error handling strategy
                    }
                    return data.Data;
                }
                catch (JsonException ex)
                {
                    // Log the exception
                    Console.WriteLine($"Error deserializing response: {ex.Message}");
                    // If direct deserialization fails, try the old approach as fallback
                    try
                    {
                        var data = JsonConvert.DeserializeObject<BaseResponseModel>(content);
                        if (data == null || data.Data == null)
                        {
                            return null;
                        }
                        return JsonConvert.DeserializeObject<AdminProfileResponse>(data.Data.ToString());
                    }
                    catch (Exception innerEx)
                    {
                        Console.WriteLine($"Fallback deserialization also failed: {innerEx.Message}");
                        Console.WriteLine($"Raw content: {content}");
                        return null;
                    }
                }
            }
            else
            {
                // Handle error response
                return null; // or throw an exception based on your error handling strategy
            }
        }

        public Task<bool> ChangePasswordAsync(ChangePasswordRequest model, CancellationToken cancellationToken = default)
        {
            throw new NotImplementedException();
        }

        public async Task<bool> UpdateProfileAsync(AdminProfileUpdateRequest model, CancellationToken cancellationToken = default)
        {
            // For file uploads, we need to use MultipartFormDataContent
            using var content = new MultipartFormDataContent();

            // Add text fields
            content.Add(new StringContent(model.Id ?? ""), "Id");
            content.Add(new StringContent(model.UserName ?? ""), "UserName");
            content.Add(new StringContent(model.Email ?? ""), "Email");
            content.Add(new StringContent(model.PhoneNumber ?? ""), "PhoneNumber");

            // Handle file upload
            if (model.Avatar != null && model.Avatar.Length > 0)
            {
                var stream = model.Avatar.OpenReadStream();
                var fileContent = new StreamContent(stream);
                fileContent.Headers.ContentType = MediaTypeHeaderValue.Parse(model.Avatar.ContentType);

                // Note: Using "Avartar" to match the backend property name
                content.Add(fileContent, "Avartar", model.Avatar.FileName);
            }

            var response = await _httpClient.PostAsync(AdminApiBaseUrl + "update-profile-admin", content, cancellationToken);
            return response.IsSuccessStatusCode;
        }

        public async Task<AdminRequest> AddAsync(AdminRequest entity, CancellationToken cancellationToken = default)
        {
            string data = JsonConvert.SerializeObject(entity);
            var content = new StringContent(data, Encoding.UTF8, "application/json");

            HttpResponseMessage response = await _httpClient.PostAsync(adminApi + "create", content, cancellationToken);

            // Read content response
            var responseContent = await response.Content.ReadAsStringAsync(cancellationToken);

            if (response.IsSuccessStatusCode)
            {
                return JsonConvert.DeserializeObject<AdminRequest>(responseContent)
                    ?? throw new HttpRequestException("Unable to create admin.");
            }

            if (response.StatusCode == System.Net.HttpStatusCode.BadRequest)
            {
                var errorObj = JsonConvert.DeserializeObject<Dictionary<string, string>>(responseContent);
                if (errorObj != null && errorObj.TryGetValue("message", out var errorMessage))
                {
                    throw new InvalidOperationException(errorMessage);
                }
                throw new InvalidOperationException("Create admin failed");
            }

            throw new HttpRequestException($"Unable to create admin. Status: {response.StatusCode}, Error: {responseContent}");
        }

        public async Task<bool> DeleteAdmin(string id, CancellationToken cancellationToken = default)
        {
            var response = await _httpClient.DeleteAsync(adminApi + "LockAdmin/" + id, cancellationToken);
            return response.IsSuccessStatusCode;
        }

        public async Task<AdminResponse> GetByIdAsync(string id, CancellationToken cancellationToken = default)
        {
            var response = await _httpClient.GetAsync(adminApi + id, cancellationToken);
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync(cancellationToken);
                return JsonConvert.DeserializeObject<AdminResponse>(content)
                    ?? throw new HttpRequestException("Admin not found.");
            }
            throw new HttpRequestException("Unable to fetch Admin.");
        }

        public async Task<IEnumerable<AdminResponse>> ListAllAsync(CancellationToken cancellationToken = default)
        {
            var response = await _httpClient.GetAsync(adminApi + "all", cancellationToken);
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync(cancellationToken);
                return JsonConvert.DeserializeObject<IEnumerable<AdminResponse>>(content)
                    ?? new List<AdminResponse>();
            }
            throw new HttpRequestException("Unable to fetch all admins.");
        }

        public Task<IEnumerable<AdminResponse>> ListAsync(Expression<Func<AdminResponse, bool>> predicate, CancellationToken cancellationToken = default)
        {
            throw new NotImplementedException();
        }

        public async Task<bool> RestoreAdmin(string id, CancellationToken cancellationToken = default)
        {
            var contents = new StringContent("", Encoding.UTF8, "application/json");
            var response = await _httpClient.PutAsync(adminApi + "RestoreAdmin/" + id, contents, cancellationToken);
            return response.IsSuccessStatusCode;
        }

        // public async Task<UpdateAdminRequest> UpdateAsync(UpdateAdminRequest entity, CancellationToken cancellationToken = default)
        // {
        //     string data = JsonConvert.SerializeObject(entity);
        //     var content = new StringContent(data, Encoding.UTF8, "application/json");
        //     HttpResponseMessage response = await _httpClient.PutAsync(adminApi, content, cancellationToken);
        //     if (response.IsSuccessStatusCode)
        //     {
        //         var result = await response.Content.ReadAsStringAsync(cancellationToken);
        //         return JsonConvert.DeserializeObject<UpdateAdminRequest>(result)
        //             ?? throw new HttpRequestException("Unable to update admin.");
        //     }
        //     var errorContent = await response.Content.ReadAsStringAsync(cancellationToken);

        //     if (response.StatusCode == System.Net.HttpStatusCode.BadRequest)
        //     {
        //         throw new InvalidOperationException(errorContent);
        //     }
        //     throw new HttpRequestException($"Unable to update admin. Status: {response.StatusCode}, Error: {errorContent}");
        // }
    }
}
