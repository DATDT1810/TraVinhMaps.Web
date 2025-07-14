using System.Linq.Expressions;
using System.Text.Json;
using TraVinhMaps.Web.Admin.Models.Location;
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
        public async Task<OcopProductResponse> GetOcopProductByName(string name, CancellationToken cancellationToken = default)
        {
            var response = await _httpClient.GetAsync(ocopProductApi + "GetOcopProductByName");
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                var option = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                return JsonSerializer.Deserialize<OcopProductResponse>(content, option) ?? throw new HttpRequestException("Fail to find ocop product by name.");
            }
            else
            {
                var errorResult = await response.Content.ReadAsStringAsync();
                throw new HttpRequestException($"Unable to fetch ocop product by name. Status: {response.StatusCode}, Error: {errorResult}");
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

        public async Task<CreateOcopProductResponse<OcopProductResponse>> AddAsync(OcopProductViewModel entity, CancellationToken cancellationToken = default)
        {
            using var content = new MultipartFormDataContent();
            content.Add(new StringContent(entity.ProductName ?? string.Empty), "ProductName");
            content.Add(new StringContent(entity.ProductDescription ?? string.Empty), "ProductDescription");
            content.Add(new StringContent(entity.ProductPrice ?? string.Empty), "ProductPrice");
            content.Add(new StringContent(entity.OcopTypeId ?? string.Empty), "OcopTypeId");
            content.Add(new StringContent(entity.CompanyId ?? string.Empty), "CompanyId");
            content.Add(new StringContent(entity.OcopPoint.ToString()), "OcopPoint");
            content.Add(new StringContent(entity.OcopYearRelease.ToString()), "OcopYearRelease");
            content.Add(new StringContent(entity.TagId ?? string.Empty), "TagId");

            foreach (var file in entity.ProductImageFile)
            {
                var streamContent = new StreamContent(file.OpenReadStream());
                streamContent.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue(file.ContentType);
                content.Add(streamContent, "ProductImageFile", file.FileName);
            }

            HttpResponseMessage responseMessage = await _httpClient.PostAsync(ocopProductApi + "AddOcopProduct", content, cancellationToken);

            if (!responseMessage.IsSuccessStatusCode)
            {
                var errorResult = await responseMessage.Content.ReadAsStringAsync(cancellationToken);
                OcopProductMessage? apiError = null;
                try
                {
                    apiError = JsonSerializer.Deserialize<OcopProductMessage>(errorResult, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                }
                catch
                {
                    // Bỏ qua nếu không parse được
                }

                if (apiError != null && !string.IsNullOrEmpty(apiError.Message))
                {
                    throw new HttpRequestException(apiError.Message);
                }
                throw new HttpRequestException($"Unable to create ocop product. Status: {responseMessage.StatusCode}");
            }

            var contentResult = await responseMessage.Content.ReadAsStringAsync(cancellationToken);
            var option = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            var productResponse = JsonSerializer.Deserialize<CreateOcopProductResponse<OcopProductResponse>>(contentResult, option) ?? throw new HttpRequestException("Unable to create ocop product.");
            
            foreach (var sellLocationVM in entity.SellLocations)
            {
                var sellLocation = new SellLocationResponse
                {
                    Id = productResponse.value.data.Id,
                    LocationName = sellLocationVM.LocationName,
                    LocationAddress = sellLocationVM.LocationAddress,
                    MarkerId = "68486609935049741c54a644",
                    Location = new LocationResponse
                    {
                        Type = sellLocationVM.Type,
                        Coordinates = new List<double> { sellLocationVM.Longitude, sellLocationVM.Latitude }
                    }
                };
                await AddSellLocation(productResponse.value.data.Id, sellLocation, cancellationToken);
            }

            return productResponse;
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
            if (response.IsSuccessStatusCode)
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
            if (responseMessage.IsSuccessStatusCode)
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

        public async Task<OcopProductMessage> DeleteOcopProductAsync(string id, CancellationToken cancellationToken = default)
        {
            var response = await _httpClient.DeleteAsync(ocopProductApi + "DeleteOcopProduct/" + id);
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                var option = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                return JsonSerializer.Deserialize<OcopProductMessage>(content, option) ?? throw new HttpRequestException("Fail to delete ocop product.");
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

        public async Task<OcopProductMessage> RestoreOcopProductAsync(string id, CancellationToken cancellationToken = default)
        {
            var response = await _httpClient.PutAsync(ocopProductApi + "RestoreOcopProduct/" + id, new StringContent(""));
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                var option = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                return JsonSerializer.Deserialize<OcopProductMessage>(content, option) ?? throw new HttpRequestException("Fail to restore ocop product."); ;
            }
            else
            {
                var errorResult = await response.Content.ReadAsStringAsync();
                throw new HttpRequestException($"Unable to fetch restore ocop product. Status: {response.StatusCode}, Error: {errorResult}");
            }
        }

        public async Task<OcopProductMessage> UpdateAsync(UpdateOcopProductRequest entity, CancellationToken cancellationToken = default)
        {
            var options = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            };
            var data = JsonSerializer.Serialize(entity, options);
            var content = new StringContent(data, System.Text.Encoding.UTF8, "application/json");

            HttpResponseMessage responseMessage = await _httpClient.PutAsync(ocopProductApi + "UpdateOcopProduct", content, cancellationToken);

            var contentResponse = await responseMessage.Content.ReadAsStringAsync(cancellationToken);

            var option = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };

            var apiResponse = JsonSerializer.Deserialize<OcopProductMessage>(contentResponse, option)
                            ?? throw new HttpRequestException("Fail to update ocop product.");

            if (!responseMessage.IsSuccessStatusCode || apiResponse.Status == "error")
            {
                throw new HttpRequestException(apiResponse.Message ?? $"Unable to update ocop product. Status: {responseMessage.StatusCode}");
            }

            return apiResponse;
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

        public async Task<ProductLookUpResponse> GetLookUpAsync()
        {
            var response = await _httpClient.GetAsync(ocopProductApi + "get-lookup-product");
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                var option = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true,
                    AllowTrailingCommas = true
                };

                try
                {
                    var responseWrapper = JsonSerializer.Deserialize<ProductLookUpResponseWrapper>(content, option);

                    if (responseWrapper?.Data != null)
                    {
                        // Convert single Tags object to a List for view compatibility
                        var tagsList = new List<TagResponse>();
                        if (responseWrapper.Data.Tags != null)
                        {
                            tagsList.Add(responseWrapper.Data.Tags);
                        }

                        return new ProductLookUpResponse
                        {
                            OcopTypes = responseWrapper.Data.OcopTypes ?? new List<OcopTypeResponse>(),
                            Companies = responseWrapper.Data.Companies ?? new List<CompanyResponse>(),
                            Tags = tagsList
                        };
                    }

                    throw new HttpRequestException("Fail to get lookup data for ocop product: No data returned");
                }
                catch (JsonException ex)
                {
                    throw new HttpRequestException($"Failed to parse lookup data: {ex.Message}\nJSON: {content.Substring(0, Math.Min(content.Length, 500))}");
                }
            }
            else
            {
                var errorResult = await response.Content.ReadAsStringAsync();
                throw new HttpRequestException($"Unable to fetch lookup data for ocop product. Status: {response.StatusCode}, Error: {errorResult}");
            }
        }

        public async Task<IEnumerable<OcopProductAnalytics>> GetProductAnalyticsAsync(string timeRange = "month", DateTime? startDate = null, DateTime? endDate = null, CancellationToken cancellationToken = default)
        {
            try
            {
                var url = $"{ocopProductApi}analytics?timeRange={Uri.EscapeDataString(timeRange)}";
                if (startDate.HasValue)
                {
                    url += $"&startDate={Uri.EscapeDataString(startDate.Value.ToString("yyyy-MM-ddTHH:mm:ssZ"))}";
                }
                if (endDate.HasValue)
                {
                    url += $"&endDate={Uri.EscapeDataString(endDate.Value.ToString("yyyy-MM-ddTHH:mm:ssZ"))}";
                }

                var response = await _httpClient.GetAsync(url, cancellationToken);
                response.EnsureSuccessStatusCode();

                var content = await response.Content.ReadAsStringAsync(cancellationToken);
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var result = JsonSerializer.Deserialize<OcopProductBase<List<OcopProductAnalytics>>>(content, options);

                return result?.Data ?? Enumerable.Empty<OcopProductAnalytics>();
            }
            catch (HttpRequestException ex)
            {
                throw new HttpRequestException($"Failed to fetch OCOP product analytics. Status: {ex.StatusCode}, Message: {ex.Message}", ex);
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException("An error occurred while fetching product analytics.", ex);
            }
        }

        public async Task<IEnumerable<OcopProductUserDemographics>> GetUserDemographicsAsync(string timeRange = "month", DateTime? startDate = null, DateTime? endDate = null, CancellationToken cancellationToken = default)
        {
            try
            {
                var url = $"{ocopProductApi}analytics-userdemographics?timeRange={Uri.EscapeDataString(timeRange)}";
                if (startDate.HasValue)
                {
                    url += $"&startDate={Uri.EscapeDataString(startDate.Value.ToString("yyyy-MM-ddTHH:mm:ssZ"))}";
                }
                if (endDate.HasValue)
                {
                    url += $"&endDate={Uri.EscapeDataString(endDate.Value.ToString("yyyy-MM-ddTHH:mm:ssZ"))}";
                }

                var response = await _httpClient.GetAsync(url, cancellationToken);
                response.EnsureSuccessStatusCode();

                var content = await response.Content.ReadAsStringAsync(cancellationToken);
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var result = JsonSerializer.Deserialize<OcopProductBase<List<OcopProductUserDemographics>>>(content, options);

                return result?.Data ?? Enumerable.Empty<OcopProductUserDemographics>();
            }
            catch (HttpRequestException ex)
            {
                throw new HttpRequestException($"Failed to fetch OCOP user demographics. Status: {ex.StatusCode}, Message: {ex.Message}", ex);
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException("An error occurred while fetching user demographics.", ex);
            }
        }

        public async Task<IEnumerable<OcopProductAnalytics>> GetTopProductsByInteractionsAsync(int top = 5, string timeRange = "month", DateTime? startDate = null, DateTime? endDate = null, CancellationToken cancellationToken = default)
        {
            try
            {
                var url = $"{ocopProductApi}analytics-getTopProductsByInteractions?top={top}&timeRange={Uri.EscapeDataString(timeRange)}";
                if (startDate.HasValue)
                {
                    url += $"&startDate={Uri.EscapeDataString(startDate.Value.ToString("yyyy-MM-ddTHH:mm:ssZ"))}";
                }
                if (endDate.HasValue)
                {
                    url += $"&endDate={Uri.EscapeDataString(endDate.Value.ToString("yyyy-MM-ddTHH:mm:ssZ"))}";
                }

                var response = await _httpClient.GetAsync(url, cancellationToken);
                var content = await response.Content.ReadAsStringAsync(cancellationToken);
                if (!response.IsSuccessStatusCode)
                    throw new HttpRequestException($"[GetTopProductsByFavorites] API call failed. Status: {(int)response.StatusCode} {response.ReasonPhrase}. Content: {content}");
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var result = JsonSerializer.Deserialize<OcopProductBase<List<OcopProductAnalytics>>>(content, options);

                return result?.Data ?? Enumerable.Empty<OcopProductAnalytics>();
            }
            catch (HttpRequestException ex)
            {
                throw new HttpRequestException($"[GetTopProductsByInteractions] Failed to fetch data. {ex.Message}", ex);
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException("[GetTopProductsByInteractions] Unknown error.", ex);
            }
        }

        public async Task<IEnumerable<OcopProductAnalytics>> GetTopProductsByFavoritesAsync(int top = 5, string timeRange = "month", DateTime? startDate = null, DateTime? endDate = null, CancellationToken cancellationToken = default)
        {
            try
            {
                var url = $"{ocopProductApi}analytics-getTopProductsByFavorites?top={top}&timeRange={Uri.EscapeDataString(timeRange)}";
                if (startDate.HasValue)
                {
                    url += $"&startDate={Uri.EscapeDataString(startDate.Value.ToString("yyyy-MM-ddTHH:mm:ssZ"))}";
                }
                if (endDate.HasValue)
                {
                    url += $"&endDate={Uri.EscapeDataString(endDate.Value.ToString("yyyy-MM-ddTHH:mm:ssZ"))}";
                }

                var response = await _httpClient.GetAsync(url, cancellationToken);
                var content = await response.Content.ReadAsStringAsync(cancellationToken);
                if (!response.IsSuccessStatusCode)
                    throw new HttpRequestException($"[GetTopProductsByFavorites] API call failed. Status: {(int)response.StatusCode} {response.ReasonPhrase}. Content: {content}");

                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var result = JsonSerializer.Deserialize<OcopProductBase<List<OcopProductAnalytics>>>(content, options);

                return result?.Data ?? Enumerable.Empty<OcopProductAnalytics>();
            }
            catch (HttpRequestException ex)
            {
                throw new HttpRequestException($"[GetTopProductsByFavorites] Failed to fetch data. {ex.Message}", ex);
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException("[GetTopProductsByFavorites] Unknown error.", ex);
            }
        }

        public async Task<IEnumerable<OcopProductAnalytics>> CompareProductsAsync(IEnumerable<string> productIds, string timeRange = "month", DateTime? startDate = null, DateTime? endDate = null, CancellationToken cancellationToken = default)
        {
            try
            {
                var url = $"{ocopProductApi}analytics-compareproducts?timeRange={Uri.EscapeDataString(timeRange)}";
                if (startDate.HasValue)
                {
                    url += $"&startDate={Uri.EscapeDataString(startDate.Value.ToString("yyyy-MM-ddTHH:mm:ssZ"))}";
                }
                if (endDate.HasValue)
                {
                    url += $"&endDate={Uri.EscapeDataString(endDate.Value.ToString("yyyy-MM-ddTHH:mm:ssZ"))}";
                }

                var response = await _httpClient.GetAsync(url, cancellationToken);
                var content = await response.Content.ReadAsStringAsync(cancellationToken);
                if (!response.IsSuccessStatusCode)
                    throw new HttpRequestException($"[CompareProducts] API call failed. Status: {(int)response.StatusCode} {response.ReasonPhrase}. Content: {content}");

                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var result = JsonSerializer.Deserialize<OcopProductBase<List<OcopProductAnalytics>>>(content, options);

                return result?.Data ?? Enumerable.Empty<OcopProductAnalytics>();
            }
            catch (HttpRequestException ex)
            {
                throw new HttpRequestException($"[CompareProducts] Failed to fetch data. {ex.Message}", ex);
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException("[CompareProducts] Unknown error.", ex);
            }
        }
    }
}
