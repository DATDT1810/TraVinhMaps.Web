using System.ComponentModel.Design;
using System.IO.Pipes;
using System.Linq.Expressions;
using System.Text.Json;
using TraVinhMaps.Web.Admin.Models.OcopProduct;
using TraVinhMaps.Web.Admin.Models.SellLocation;
namespace TraVinhMaps.Web.Admin.Services.OcopProduct
{
    public class OcopProductService : IOcopProductService
    {
        private readonly HttpClient _httpClient;
        private string ocopProductApi;

        public OcopProductService(IHttpClientFactory httpClientFactory)
        {
            this._httpClient = httpClientFactory.CreateClient("ApiClient");
            this.ocopProductApi = "api/OcopProduct/";
        }

        public async Task<OcopProductResponse> GetByIdAsync(string id, CancellationToken cancellationToken = default)
        {
            var response = await _httpClient.GetAsync(ocopProductApi + "GetOcopProductById/" + id);
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                var option = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                return JsonSerializer.Deserialize<OcopProductBase<OcopProductResponse>>(content, option)?.Data ?? throw new HttpRequestException("Fail to find ocop product by id.");
            }
            else
            {
                var errorResult = await response.Content.ReadAsStringAsync();
                throw new HttpRequestException($"Unable to fetch ocop product by id. Status: {response.StatusCode}, Error: {errorResult}");
            }
        }

        public async Task<IEnumerable<OcopProductResponse>> GetOcopProductByCompanyId(string companyId, CancellationToken cancellationToken = default)
        {
            var response = await _httpClient.GetAsync(ocopProductApi + "GetOcopProductByCompanyId/" + companyId);
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                var option = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                return JsonSerializer.Deserialize<OcopProductBase<List<OcopProductResponse>>>(content, option)?.Data ?? throw new HttpRequestException("Fail to find ocop product by company id.");
            }
            else
            {
                var errorResult = await response.Content.ReadAsStringAsync();
                throw new HttpRequestException($"Unable to fetch list ocop product by company id. Status: {response.StatusCode}, Error: {errorResult}");
            }
        }

        public async Task<IEnumerable<OcopProductResponse>> GetOcopProductByOcopTypeId(string ocopTypeId, CancellationToken cancellationToken = default)
        {
            var response = await _httpClient.GetAsync(ocopProductApi + "GetOcopProductByOcopTypeId/" + ocopTypeId);
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                var option = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                return JsonSerializer.Deserialize<OcopProductBase<List<OcopProductResponse>>>(content, option)?.Data ?? throw new HttpRequestException("Fail to find ocop product by ocop type id.");
            }
            else
            {
                var errorResult = await response.Content.ReadAsStringAsync();
                throw new HttpRequestException($"Unable to fetch list ocop product by ocop type id. Status: {response.StatusCode}, Error: {errorResult}");
            }
        }

        public async Task<IEnumerable<OcopProductResponse>> ListAllAsync(CancellationToken cancellationToken = default)
        {
            var response = await _httpClient.GetAsync(ocopProductApi + "GetAllOcopProduct");
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                var option = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                return JsonSerializer.Deserialize<OcopProductBase<List<OcopProductResponse>>>(content, option)?.Data ?? throw new HttpRequestException("Fail to find list ocop product.");
            }
            else
            {
                var errorResult = await response.Content.ReadAsStringAsync();
                throw new HttpRequestException($"Unable to fetch list ocop product. Status: {response.StatusCode}, Error: {errorResult}");
            }
        }

        public async Task<CreateOcopProductResponse<OcopProductResponse>> AddAsync(CreateOcopProductRequest entity, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrEmpty(entity.ProductName) || entity.ProductImageFile == null || !entity.ProductImageFile.Any())
            {
                throw new ArgumentException("ProductName and at least one image are required.");
            }
            using var content = new MultipartFormDataContent();
            content.Add(new StringContent(entity.ProductName ?? string.Empty), "ProductName");
            content.Add(new StringContent(entity.ProductDescription ?? string.Empty), "ProductDescription");
            content.Add(new StringContent(entity.ProductPrice ?? string.Empty), "ProductPrice");
            content.Add(new StringContent(entity.OcopTypeId ?? string.Empty), "OcopTypeId");
            content.Add(new StringContent(entity.CompanyId ?? string.Empty), "CompanyId");
            content.Add(new StringContent(entity.OcopPoint.ToString()), "OcopPoint");
            content.Add(new StringContent(entity.OcopYearRelease.ToString()), "OcopYearRelease");
            content.Add(new StringContent(entity.TagId ?? string.Empty), "TagId");
            content.Add(new StringContent(entity.SellingLinkId ?? string.Empty), "SellingLinkId");
            foreach (var file in entity.ProductImageFile)
            {
                var streamContent = new StreamContent(file.OpenReadStream());
                streamContent.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue(file.ContentType);
                content.Add(streamContent, "ProductImageFile", file.FileName);
            }
            HttpResponseMessage responseMessage = await _httpClient.PostAsync(ocopProductApi + "AddOcopProduct", content);
            if (responseMessage.IsSuccessStatusCode)
            {
                var contentResult = await responseMessage.Content.ReadAsStringAsync(cancellationToken);
                var option = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                return JsonSerializer.Deserialize<CreateOcopProductResponse<OcopProductResponse>>(contentResult, option) ?? throw new HttpRequestException("Unable to create ocop product.");
            }
            else
            {
                var errorResult = await responseMessage.Content.ReadAsStringAsync(cancellationToken);
                throw new HttpRequestException($"Unable to fetch create ocop product. Status: {responseMessage.StatusCode}, Error: {errorResult}");
            }
        }

        public async Task<List<string>> AddImageOcopProduct(string id, List<IFormFile> imageFiles, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrEmpty(id))
                throw new ArgumentException("Product ID is required.", nameof(id));
            if (imageFiles == null || !imageFiles.Any())
                throw new ArgumentException("Must select at least one photo.", nameof(imageFiles));

            using var content = new MultipartFormDataContent();
            content.Add(new StringContent(id), "id");
            foreach (var file in imageFiles)
            {
                var streamContent = new StreamContent(file.OpenReadStream());
                streamContent.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue(file.ContentType);
                content.Add(streamContent, "imageFile", file.FileName);
            }

            HttpResponseMessage responseMessage = await _httpClient.PostAsync(ocopProductApi + "AddImageOcopProduct", content, cancellationToken);

            if (responseMessage.IsSuccessStatusCode)
            {
                var contentResult = await responseMessage.Content.ReadAsStringAsync(cancellationToken);
                var imageUrls = JsonSerializer.Deserialize<CreateOcopProductImageResponse>(contentResult, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                return imageUrls?.Data ?? new List<string>();
            }
            else
            {
                var errorResult = await responseMessage.Content.ReadAsStringAsync();
                throw new HttpRequestException($"Cannot add photos for OCOP products. Status: {responseMessage.StatusCode}, Error: {errorResult}");
            }
        }
        public async Task<DeleteImageOcopProductResponse> DeleteImageOcopProduct(string id, string imageUrl, CancellationToken cancellationToken = default)
        {
            var encodedImageUrl = Uri.EscapeDataString(imageUrl);
            var response = await _httpClient.DeleteAsync(ocopProductApi + "DeleteImageOcopProduct/" + id + "/" + encodedImageUrl);
            if(response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                var option = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                return JsonSerializer.Deserialize<DeleteImageOcopProductResponse>(content, option) ?? throw new HttpRequestException("Unable to delete image of ocop product.");
            }
            else
            {
                var errorResult = await response.Content.ReadAsStringAsync();
                throw new HttpRequestException($"Unable to fetch delete image ocop product. Status: {response.StatusCode}, Error: {errorResult}");
            }
        }

        public async Task<long> CountAsync(Expression<Func<OcopProductResponse, bool>> predicate = null, CancellationToken cancellationToken = default)
        {
            var response = await _httpClient.GetAsync(ocopProductApi + "CountOcopProducts");
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                var option = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                return JsonSerializer.Deserialize<long>(content, option);
            }
            else
            {
                var errorResult = await response.Content.ReadAsStringAsync();
                throw new HttpRequestException($"Unable to fetch count of ocop product. Status: {response.StatusCode}, Error: {errorResult}");
            }
        }

        public async Task<SellLocationResponse> AddSellLocation(string id, SellLocationResponse sellLocation, CancellationToken cancellationToken = default)
        {
            var data = JsonSerializer.Serialize(sellLocation);
            var content = new StringContent(data, System.Text.Encoding.UTF8, "application/json");
            HttpResponseMessage responseMessage = await _httpClient.PostAsync(ocopProductApi + "AddSellLocation", content);
            if(responseMessage.IsSuccessStatusCode)
            {
                var contentResult = await responseMessage.Content.ReadAsStringAsync();
                var option = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                return JsonSerializer.Deserialize<SellLocationBase<SellLocationResponse>>(contentResult, option)?.data ?? throw new HttpRequestException("Unable to create sell location.");
            }
            else
            {
                var errorResult = await responseMessage.Content.ReadAsStringAsync();
                throw new HttpRequestException($"Unable to fetch create sell location. Status: {responseMessage.StatusCode}, Error: {errorResult}");
            }
        }

        public async Task<DeleteOcopProductResponse> DeleteOcopProductAsync(string id, CancellationToken cancellationToken = default)
        {
            var response = await _httpClient.DeleteAsync(ocopProductApi + "DeleteOcopProduct/" + id);
            if(response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                var option = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                return JsonSerializer.Deserialize<DeleteOcopProductResponse>(content, option) ?? throw new HttpRequestException("Fail to delete ocop product.");
            }
            else
            {
                var errorResult = await response.Content.ReadAsStringAsync();
                throw new HttpRequestException($"Unable to fetch delete ocop product. Status: {response.StatusCode}, Error: {errorResult}");
            }
        }

        public async Task<DeleteSellLocationResponse> DeleteSellLocation(string ocopProductId, string sellLocationName, CancellationToken cancellationToken = default)
        {
            var response = await _httpClient.DeleteAsync(ocopProductApi + "DeleteSellLocation/" + ocopProductId + "/" + sellLocationName, cancellationToken);
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                var option = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                return JsonSerializer.Deserialize<DeleteSellLocationResponse>(content, option) ?? throw new HttpRequestException("Unable to delete sell location.");
            }
            else
            {
                var errorResult = await response.Content.ReadAsStringAsync();
                throw new HttpRequestException($"Unable to fetch delete sell location. Status: {response.StatusCode}, Error: {errorResult}");
            }
        }

        public async Task<RestoreOcopProductResponse> RestoreOcopProductAsync(string id, CancellationToken cancellationToken = default)
        {
            var response = await _httpClient.PutAsync(ocopProductApi + "RestoreOcopProduct/" + id, new StringContent(""));
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                var option = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                return JsonSerializer.Deserialize<RestoreOcopProductResponse>(content, option) ?? throw new HttpRequestException("Fail to restore ocop product.");;
            }
            else
            {
                var errorResult = await response.Content.ReadAsStringAsync();
                throw new HttpRequestException($"Unable to fetch restore ocop product. Status: {response.StatusCode}, Error: {errorResult}");
            }
        }

        public async Task<UpdateOcopProductResponse> UpdateAsync(UpdateOcopProductRequest entity, CancellationToken cancellationToken = default)
        {
            var options = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            };
            var data = JsonSerializer.Serialize(entity, options);
            var content = new StringContent(data, System.Text.Encoding.UTF8, "application/json");

            HttpResponseMessage responseMessage = await _httpClient.PutAsync(ocopProductApi + "UpdateOcopProduct", content);
            if (responseMessage.IsSuccessStatusCode)
            {
                var contentResponse = await responseMessage.Content.ReadAsStringAsync();
                var option = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                return JsonSerializer.Deserialize<UpdateOcopProductResponse>(contentResponse, option) ?? throw new HttpRequestException("Fail to update ocop product.");
            }
            else
            {
                var errorResult = await responseMessage.Content.ReadAsStringAsync();
                throw new HttpRequestException($"Unable to fetch update ocop product. Status: {responseMessage.StatusCode}, Error: {errorResult}");
            }
        }

        public async Task<UpdateSellLocationResponse> UpdateSellLocation(string id, SellLocationResponse sellLocation, CancellationToken cancellationToken = default)
        {
            var options = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            };
            var data = JsonSerializer.Serialize(sellLocation, options);
            var content = new StringContent(data, System.Text.Encoding.UTF8, "application/json");

            HttpResponseMessage responseMessage = await _httpClient.PutAsync(ocopProductApi + "UpdateSellLocation", content);
            if (responseMessage.IsSuccessStatusCode)
            {
                var contentResponse = await responseMessage.Content.ReadAsStringAsync();
                var option = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                return JsonSerializer.Deserialize<UpdateSellLocationResponse>(contentResponse, option) ?? throw new HttpRequestException("Fail to update sell location.");
            }
            else
            {
                var errorResult = await responseMessage.Content.ReadAsStringAsync();
                throw new HttpRequestException($"Unable to fetch update sell location. Status: {responseMessage.StatusCode}, Error: {errorResult}");
            }
        }
    }
}
