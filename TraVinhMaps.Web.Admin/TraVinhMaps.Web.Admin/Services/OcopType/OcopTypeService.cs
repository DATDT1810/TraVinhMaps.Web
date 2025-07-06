using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using Newtonsoft.Json;
using TraVinhMaps.Web.Admin.Models.OcopType;

namespace TraVinhMaps.Web.Admin.Services.OcopType
{
    public class OcopTypeService : IOcopTypeService
    {
        private readonly HttpClient _httpClient;
        private string ocopTypeApi;

        public OcopTypeService(IHttpClientFactory httpClientFactory)
        {
            this._httpClient = httpClientFactory.CreateClient("ApiClient");
            this.ocopTypeApi = "api/OcopType/";
        }

        public async Task<CreateOcopTypeResponse<OcopTypeResponse>> AddAsync(CreateOcopTypeRequest entity, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrEmpty(entity.OcopTypeName))
            {
                throw new ArgumentException("OcopTypeName is required.");
            }

            var json = System.Text.Json.JsonSerializer.Serialize(entity);
            using var content = new StringContent(json, Encoding.UTF8, "application/json");

            HttpResponseMessage responseMessage = await _httpClient.PostAsync(ocopTypeApi + "AddOcopType", content, cancellationToken);

            if (responseMessage.IsSuccessStatusCode)
            {
                var contentResult = await responseMessage.Content.ReadAsStringAsync(cancellationToken);
                var option = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                return System.Text.Json.JsonSerializer.Deserialize<CreateOcopTypeResponse<OcopTypeResponse>>(contentResult, option)
                    ?? throw new HttpRequestException("Unable to create ocop type.");
            }
            else
            {
                var errorResult = await responseMessage.Content.ReadAsStringAsync(cancellationToken);
                throw new HttpRequestException($"Unable to fetch create ocop type. Status: {responseMessage.StatusCode}, Error: {errorResult}");
            }
        }
        public async Task<long> CountAsync(Expression<Func<OcopTypeResponse, bool>> predicate = null, CancellationToken cancellationToken = default)
        {
            var response = await _httpClient.GetAsync(ocopTypeApi + "CountOcopTypes");
            if (response.IsSuccessStatusCode)
            {
                var contentResult = await response.Content.ReadAsStringAsync(cancellationToken);
                var option = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                return System.Text.Json.JsonSerializer.Deserialize<long>(contentResult, option);
            }
            else
            {
                var errorResult = await response.Content.ReadAsStringAsync(cancellationToken);
                throw new HttpRequestException($"Unable to fetch count ocop type. Status: {response.StatusCode}, Error: {errorResult}");
            }
        }

        public async Task<OcopTypeResponse> GetByIdAsync(string id, CancellationToken cancellationToken = default)
        {
            var response = await _httpClient.GetAsync(ocopTypeApi + "GetOcopTypeById/" + id);
            if (response.IsSuccessStatusCode)
            {
                var contentResult = await response.Content.ReadAsStringAsync(cancellationToken);
                System.Console.WriteLine("=============================");
                System.Console.WriteLine("DEBUG JSON: " + contentResult);
                var option = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                return System.Text.Json.JsonSerializer.Deserialize<OcopTypeBase<OcopTypeResponse>>(contentResult, option)?.Data ?? throw new HttpRequestException("Unable to find ocop type by id.");
            }
            else
            {
                var errorResult = await response.Content.ReadAsStringAsync(cancellationToken);
                throw new HttpRequestException($"Unable to fetch ocop type by id. Status: {response.StatusCode}, Error: {errorResult}");
            }
        }

        public async Task<IEnumerable<OcopTypeResponse>> ListAllAsync(CancellationToken cancellationToken = default)
        {
            var response = await _httpClient.GetAsync(ocopTypeApi + "GetAllOcopType");
            if (response.IsSuccessStatusCode)
            {
                var contentResult = await response.Content.ReadAsStringAsync(cancellationToken);
                var option = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                return System.Text.Json.JsonSerializer.Deserialize<OcopTypeBase<List<OcopTypeResponse>>>(contentResult, option)?.Data ?? throw new HttpRequestException("Fail to find list ocop type.");
            }
            else
            {
                var errorResult = await response.Content.ReadAsStringAsync(cancellationToken);
                throw new HttpRequestException($"Unable to fetch list ocop type. Status: {response.StatusCode}, Error: {errorResult}");
            }
        }

        public async Task<OcopTypeMessage> UpdateAsync(UpdateOcopTypeRequest entity, CancellationToken cancellationToken = default)
        {
            var options = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            };
            var data = System.Text.Json.JsonSerializer.Serialize(entity, options);
            var content = new StringContent(data, System.Text.Encoding.UTF8, "application/json");

            HttpResponseMessage responseMessage = await _httpClient.PutAsync(ocopTypeApi + "UpdateOcopType", content);
            if (responseMessage.IsSuccessStatusCode)
            {
                var contentResponse = await responseMessage.Content.ReadAsStringAsync();
                var option = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                return System.Text.Json.JsonSerializer.Deserialize<OcopTypeMessage>(contentResponse, option) ?? throw new HttpRequestException("Fail to update ocop type.");
            }
            else
            {
                var errorResult = await responseMessage.Content.ReadAsStringAsync();
                throw new HttpRequestException($"Unable to fetch update ocop type. Status: {responseMessage.StatusCode}, Error: {errorResult}");
            }
        }
    }
}