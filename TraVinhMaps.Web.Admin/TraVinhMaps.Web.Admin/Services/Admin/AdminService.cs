using Newtonsoft.Json;
using System.Net.Http.Headers;
using TraVinhMaps.Web.Admin.Models;
using TraVinhMaps.Web.Admin.Models.Users;
using TraVinhMaps.Web.Admin.Services.Auth;

namespace TraVinhMaps.Web.Admin.Services.Admin
{
    public class AdminService : IAdminService
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ITokenService _tokenService;
        private const string AdminApiBaseUrl = "api/Users/"; // Example base URL, adjust as needed
        public AdminService(IHttpClientFactory httpClientFactory, ITokenService tokenService)
        {
            _httpClientFactory = httpClientFactory;
            _tokenService = tokenService;
        }

        public async Task<AdminProfileResponse> GetAdminProfileAsync(CancellationToken cancellationToken = default)
        {
            var client = _httpClientFactory.CreateClient("ApiClient");
            var request = new HttpRequestMessage(HttpMethod.Get, AdminApiBaseUrl + "get-profile-admin");
            var response = await client.SendAsync(request, cancellationToken);
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
                        return JsonConvert.DeserializeObject<AdminProfileResponse>(data.Data);
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
            var client = _httpClientFactory.CreateClient("ApiClient");

            using var content = new MultipartFormDataContent();

            content.Add(new StringContent(model.Id), "Id");
            content.Add(new StringContent(model.UserName ?? ""), "UserName");
            content.Add(new StringContent(model.Email ?? ""), "Email");
            content.Add(new StringContent(model.PhoneNumber ?? ""), "PhoneNumber");

            if (model.Avatar != null && model.Avatar.Length > 0)
            {
                var stream = model.Avatar.OpenReadStream();
                var fileContent = new StreamContent(stream);
                fileContent.Headers.ContentType = MediaTypeHeaderValue.Parse(model.Avatar.ContentType);

                content.Add(fileContent, "Avartar", model.Avatar.FileName); // Tên phải đúng với tên property: Avartar
            }

            var response = await client.PostAsync(AdminApiBaseUrl + "update-profile-admin", content, cancellationToken);

            if (response.IsSuccessStatusCode)
            {
                return true;
            }
            return false;
        }
    }
}
