using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using TraVinhMaps.Web.Admin.Models.Roles;

namespace TraVinhMaps.Web.Admin.Services.Roles
{
    public class RoleService : IRoleService
    {
        private readonly HttpClient _httpClient;
        private string roleApi;

        public RoleService(IHttpClientFactory clientFactory)
        {
            _httpClient = clientFactory.CreateClient("ApiClient");
            this.roleApi = "api/Role";
        }


        public async Task<RoleResponse> GetByIdAsync(string id, CancellationToken cancellationToken = default)
        {
            var response = await _httpClient.GetAsync(roleApi +"/"+ id, cancellationToken);
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync(cancellationToken);
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                return JsonSerializer.Deserialize<RoleResponse>(content, options) ?? throw new HttpRequestException("Role not found.");
            }
            throw new HttpRequestException("Unable to fetch role.");
        }

        public async Task<IEnumerable<RoleResponse>> ListAllAsync(CancellationToken cancellationToken = default)
        {
            var response = await _httpClient.GetAsync(roleApi, cancellationToken);
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                return JsonSerializer.Deserialize<IEnumerable<RoleResponse>>(content, options) ?? new List<RoleResponse>();
            }
            throw new HttpRequestException("Unable to fetch get all role.");
        }
    }
}