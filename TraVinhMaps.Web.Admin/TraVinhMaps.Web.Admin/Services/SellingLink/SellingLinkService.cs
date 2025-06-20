using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text.Json;
using System.Threading.Tasks;
using TraVinhMaps.Web.Admin.Models.SellingLink;

namespace TraVinhMaps.Web.Admin.Services.SellingLink
{
    public class SellingLinkService : ISellingLinkService
    {
        private readonly HttpClient _httpClient;
        private string sellingLinkApi;

        public SellingLinkService(IHttpClientFactory httpClientFactory)
        {
            this._httpClient = httpClientFactory.CreateClient("ApiClient");
            this.sellingLinkApi = "api/SellingLink/";
        }
        public async Task<SellingLinkResponse> GetByIdAsync(string id, CancellationToken cancellationToken = default)
        {
            var response = await _httpClient.GetAsync(sellingLinkApi + "GetSellingLinkById/" + id);
            if (response.IsSuccessStatusCode)
            {
                var contentResult = await response.Content.ReadAsStringAsync(cancellationToken);
                var option = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                return System.Text.Json.JsonSerializer.Deserialize<SellingLinkBase<SellingLinkResponse>>(contentResult, option)?.Data ?? throw new HttpRequestException("Unable to find selling link by id.");
            }
            else
            {
                var errorResult = await response.Content.ReadAsStringAsync(cancellationToken);
                throw new HttpRequestException($"Unable to fetch selling link by id. Status: {response.StatusCode}, Error: {errorResult}");
            }
        }
        public async Task<IEnumerable<SellingLinkResponse>> GetSellingLinkByOcopProductId(string ocopProductId, CancellationToken cancellationToken = default)
        {
            var response = await _httpClient.GetAsync(sellingLinkApi + "GetSellingLinkByProductId/" + ocopProductId);
            if (response.IsSuccessStatusCode)
            {
                var contentResult = await response.Content.ReadAsStringAsync();
                var option = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                return System.Text.Json.JsonSerializer.Deserialize<SellingLinkBase<List<SellingLinkResponse>>>(contentResult, option)?.Data ?? throw new HttpRequestException("Unable to find selling link by ocop product id.");
            }
            else
            {
                var errorResult = await response.Content.ReadAsStringAsync();
                throw new HttpRequestException($"Unable to fetch list ocop product by company id. Status: {response.StatusCode}, Error: {errorResult}");
            }
        }
        public async Task<CreateSellingLinkResponse<SellingLinkResponse>> AddAsync(SellingLinkViewModel entity, CancellationToken cancellationToken = default)
        {
            using var content = new MultipartFormDataContent();
            content.Add(new StringContent(entity.ProductId ?? string.Empty), "ProductId");
            content.Add(new StringContent(entity.Title ?? string.Empty), "Title");
            content.Add(new StringContent(entity.Link ?? string.Empty), "Link");
            HttpResponseMessage responseMessage = await _httpClient.PostAsync(sellingLinkApi + "AddSellingLink", content);
            Console.WriteLine("Response: ", responseMessage);
            if (responseMessage.IsSuccessStatusCode)
            {
                var contentResult = await responseMessage.Content.ReadAsStringAsync(cancellationToken);
                Console.WriteLine("API Response Content: " + contentResult);
                var option = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                return System.Text.Json.JsonSerializer.Deserialize<CreateSellingLinkResponse<SellingLinkResponse>>(contentResult, option) ?? throw new HttpRequestException("Unable to create ocop type.");
            }
            else
            {
                var errorResult = await responseMessage.Content.ReadAsStringAsync(cancellationToken);
                throw new HttpRequestException($"Unable to fetch create selling link. Status: {responseMessage.StatusCode}, Error: {errorResult}");
            }
        }


        public async Task<SellingLinkMessage> UpdateAsync(UpdateSellingLinkRequest entity, CancellationToken cancellationToken = default)
        {
            var options = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            };
            var data = JsonSerializer.Serialize(entity, options);
            var content = new StringContent(data, System.Text.Encoding.UTF8, "application/json");

            HttpResponseMessage responseMessage = await _httpClient.PutAsync(sellingLinkApi + "UpdateSellingLink", content);
            if (responseMessage.IsSuccessStatusCode)
            {
                var contentResponse = await responseMessage.Content.ReadAsStringAsync();
                var option = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                return JsonSerializer.Deserialize<SellingLinkMessage>(contentResponse, option) ?? throw new HttpRequestException("Fail to update selling link.");
            }
            else
            {
                var errorResult = await responseMessage.Content.ReadAsStringAsync();
                throw new HttpRequestException($"Unable to fetch update selling link. Status: {responseMessage.StatusCode}, Error: {errorResult}");
            }
        }
        public async Task<SellingLinkMessage> DeleteAsync(string sellingLinkId, CancellationToken cancellationToken = default)
        {
            var response = await _httpClient.DeleteAsync(sellingLinkApi + "DeleteSellingLink/" + sellingLinkId);
            if(response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                var option = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                return JsonSerializer.Deserialize<SellingLinkMessage>(content, option) ?? throw new HttpRequestException("Fail to delete ocop product.");
            }
            else
            {
                var errorResult = await response.Content.ReadAsStringAsync();
                throw new HttpRequestException($"Unable to fetch delete selling link. Status: {response.StatusCode}, Error: {errorResult}");
            }
        }

        public async Task<long> CountAsync(Expression<Func<SellingLinkResponse, bool>> predicate = null, CancellationToken cancellationToken = default)
        {
            var response = await _httpClient.GetAsync(sellingLinkApi + "CountSellingLinks");
            if (response.IsSuccessStatusCode)
            {
                var contentResult = await response.Content.ReadAsStringAsync(cancellationToken);
                var option = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                return System.Text.Json.JsonSerializer.Deserialize<long>(contentResult, option);
            }
            else
            {
                var errorResult = await response.Content.ReadAsStringAsync(cancellationToken);
                throw new HttpRequestException($"Unable to fetch count selling link. Status: {response.StatusCode}, Error: {errorResult}");
            }
        }

    }
}