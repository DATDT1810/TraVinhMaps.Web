using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text.Json;
using System.Threading.Tasks;
using TraVinhMaps.Web.Admin.Models.Admins;

namespace TraVinhMaps.Web.Admin.Services.Admins
{
    public class AdminService : IAdminService
    {
        private readonly HttpClient _httpClient;

        public AdminService(IHttpClientFactory clientFactory)
        {
            _httpClient = clientFactory.CreateClient("ApiClient");
            this.adminApi = "api/Admins/";
        }

        private string adminApi;

        public async Task<AdminRequest> AddAsync(AdminRequest entity, CancellationToken cancellationToken = default)
        {
            string data = JsonSerializer.Serialize(entity);
            var content = new StringContent(data, System.Text.Encoding.UTF8, "application/json");
            HttpResponseMessage response = await _httpClient.PostAsync(adminApi + "create", content, cancellationToken);
            if (response.IsSuccessStatusCode)
            {
                var result = await response.Content.ReadAsStringAsync(cancellationToken);
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                return JsonSerializer.Deserialize<AdminRequest>(result, options) ?? throw new HttpRequestException("Unable to create admin.");
            }
            var errorContent = await response.Content.ReadAsStringAsync(cancellationToken);

            if (response.StatusCode == System.Net.HttpStatusCode.BadRequest)
            {
                throw new InvalidOperationException(errorContent);
            }
            throw new HttpRequestException($"Unable to create admin. Status: {response.StatusCode}, Error: {errorContent}");

        }

        public async Task<bool> DeleteAdmin(string id, CancellationToken cancellationToken = default)
        {
            var response = await _httpClient.DeleteAsync(adminApi + "LockAdmin/" + id);
            return response.IsSuccessStatusCode;
        }

        public async Task<AdminResponse> GetByIdAsync(string id, CancellationToken cancellationToken = default)
        {
            var response = await _httpClient.GetAsync(adminApi + id);
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                return JsonSerializer.Deserialize<AdminResponse>(content, options) ?? throw new HttpRequestException("Admin not found.");
            }
            throw new HttpRequestException("Unable to fetch Admin.");
        }

        public async Task<IEnumerable<AdminResponse>> ListAllAsync(CancellationToken cancellationToken = default)
        {
            var response = await _httpClient.GetAsync(adminApi + "all", cancellationToken);
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                return JsonSerializer.Deserialize<IEnumerable<AdminResponse>>(content, options) ?? new List<AdminResponse>();
            }
            throw new HttpRequestException("Unable to fetch get all admins.");
        }

        public Task<IEnumerable<AdminResponse>> ListAsync(Expression<Func<AdminResponse, bool>> predicate, CancellationToken cancellationToken = default)
        {
            throw new NotImplementedException();
        }

        public async Task<bool> RestoreAdmin(string id, CancellationToken cancellationToken = default)
        {
            var contents = new StringContent("");
            var response = await _httpClient.PutAsync(adminApi + "RestoreAdmin/" + id, contents, cancellationToken);
            if (response.IsSuccessStatusCode)
            {
                return true;
            }
            return false;
        }

        public async Task<UpdateAdminRequest> UpdateAsync(UpdateAdminRequest entity, CancellationToken cancellationToken = default)
        {
            string data = JsonSerializer.Serialize(entity);
            var content = new StringContent(data, System.Text.Encoding.UTF8, "application/json");
            HttpResponseMessage response = await _httpClient.PutAsync(adminApi, content, cancellationToken);
            if (response.IsSuccessStatusCode)
            {
                var result = await response.Content.ReadAsStringAsync(cancellationToken);
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                return JsonSerializer.Deserialize<UpdateAdminRequest>(result, options) ?? throw new HttpRequestException("Unable to  admin.");
            }
            var errorContent = await response.Content.ReadAsStringAsync(cancellationToken);

            if (response.StatusCode == System.Net.HttpStatusCode.BadRequest)
            {
                throw new InvalidOperationException(errorContent);
            }
            throw new HttpRequestException($"Unable to update admin. Status: {response.StatusCode}, Error: {errorContent}");
        }
    }
}