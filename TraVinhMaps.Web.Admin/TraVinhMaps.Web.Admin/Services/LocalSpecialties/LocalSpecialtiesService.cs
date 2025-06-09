using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Text.Json;
using TraVinhMaps.Web.Admin.Models.LocalSpecialties;

namespace TraVinhMaps.Web.Admin.Services.LocalSpecialties
{
    public class LocalSpecialtiesService : ILocalSpecialtiesService
    {
        private readonly HttpClient _httpClient;
        private string localSpecialtiesApi;

        public LocalSpecialtiesService(IHttpClientFactory clientFactory)
        {
            _httpClient = clientFactory.CreateClient("ApiClient");
            this.localSpecialtiesApi = "api/LocalSpecialties/";
        }

        public async Task<IEnumerable<LocalSpecialtiesResponse>> ListAllAsync(CancellationToken cancellationToken = default)
        {
            var response = await _httpClient.GetAsync(localSpecialtiesApi + "all", cancellationToken);
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var apiResult = JsonSerializer.Deserialize<LocalSpecialtiesBase<List<LocalSpecialtiesResponse>>>(content, options);
                return apiResult?.Data ?? new List<LocalSpecialtiesResponse>();
            }
            throw new HttpRequestException("Unable to fetch get all local specialties.");
        }

        public async Task<LocalSpecialtiesResponse> GetByIdAsync(string id, CancellationToken cancellationToken = default)
        {
            var response = await _httpClient.GetAsync(localSpecialtiesApi + id, cancellationToken);
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var apiResult = JsonSerializer.Deserialize<LocalSpecialtiesBase<LocalSpecialtiesResponse>>(content, options);
                return apiResult.Data ?? throw new HttpRequestException("Unable to fetch get all local specialties.");
            }
            throw new HttpRequestException("Unable to fetch get all local specialties.");
        }

        public async Task<bool> RestoreLocalSpecialtiesAsync(string id, CancellationToken cancellationToken = default)
        {
            var contents = new StringContent("");
            var response = await _httpClient.PutAsync(localSpecialtiesApi + "restore/" + id, contents, cancellationToken);
            if (response.IsSuccessStatusCode)
            {
                return true;
            }
            return false;
        }

        public async Task<bool> DeleteLocalSpecialtiesAsync(string id, CancellationToken cancellationToken = default)
        {
            var response = await _httpClient.DeleteAsync(localSpecialtiesApi + id, cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                throw new HttpRequestException($"Unable to delete tip with ID: {id}");
            }
            return true;
        }

        public async Task<LocalSpecialtiesResponse> AddAsync(CreateSpecialtyViewModel entity, CancellationToken cancellationToken = default)
        {
            // Create Local Specialties
            var createRequest = new CreateLocalSpecialtiesRequest
            {
                FoodName = entity.FoodName,
                Description = entity.Description,
                TagId = entity.TagId,
                Status = true
            };

            var form = new MultipartFormDataContent
            {
                { new StringContent(createRequest.FoodName), "FoodName" },
                { new StringContent(createRequest.Description ?? ""), "Description" },
                { new StringContent(createRequest.TagId), "TagId" },
                { new StringContent(createRequest.Status.ToString()), "Status" }
            };

            var response = await _httpClient.PostAsync(localSpecialtiesApi + "create", form, cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync(cancellationToken);
                throw new HttpRequestException($"Failed to create local specialty: {errorContent}", null, response.StatusCode);
            }

            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            var content = await response.Content.ReadAsStringAsync(cancellationToken);
            var apiResponse = JsonSerializer.Deserialize<LocalSpecialtiesFormatBase<LocalSpecialtiesBase<LocalSpecialtiesResponse>>>(content, options);
            var localSpecialty = apiResponse?.Value.Data ?? throw new HttpRequestException("Unable to deserialize server response.");

            try
            {
                // Create Image
                if (entity.Images != null && entity.Images.Any())
                {
                    var imageRequest = new AddImageLocalSpecialtiesRequest
                    {
                        Id = localSpecialty.Id,
                        ImageFile = entity.Images
                    };
                    var imageUrls = await AddLocalSpecialtiesImage(imageRequest, cancellationToken);
                    if (imageUrls == null || !imageUrls.Any())
                    {
                        await DeleteLocalSpecialtiesAsync(localSpecialty.Id, cancellationToken);
                        throw new HttpRequestException("Failed to upload images.");
                    }
                }

                // Create sell location
                if (entity.Locations != null && entity.Locations.Any())
                {
                    foreach (var loc in entity.Locations)
                    {
                        var locationRequest = new AddLocationRequest
                        {
                            Name = loc.Name,
                            Address = loc.Address,
                            MarkerId = loc.MarkerId,
                            Location = new LocationRequest
                            {
                                Type = "Point",
                                Coordinates = new List<double> { loc.Longitude, loc.Latitude }
                            }
                        };
                        var locationResult = await AddSellLocationAsync(localSpecialty.Id, locationRequest, cancellationToken);
                        if (locationResult == null)
                        {
                            await DeleteLocalSpecialtiesAsync(localSpecialty.Id, cancellationToken);
                            throw new HttpRequestException($"Failed to add location: {loc.Name}");
                        }
                    }
                }
                return localSpecialty;
            }
            catch (Exception)
            {
                await DeleteLocalSpecialtiesAsync(localSpecialty.Id, cancellationToken);
                throw;
            }
        }
        public Task<IEnumerable<LocalSpecialtiesResponse>> ListAsync(Expression<Func<LocalSpecialtiesResponse, bool>> predicate, CancellationToken cancellationToken = default)
        {
            throw new NotImplementedException();
        }

        public Task<IEnumerable<LocalSpecialtiesResponse>> AddRangeAsync(IEnumerable<CreateSpecialtyViewModel> entities, CancellationToken cancellationToken = default)
        {
            throw new NotImplementedException();
        }

        public async Task UpdateAsync(UpdateLocalSpecialtiesRequest entity, CancellationToken cancellationToken = default)
        {
            string data = JsonSerializer.Serialize(entity);
            var content = new StringContent(data, System.Text.Encoding.UTF8, "application/json");

            HttpResponseMessage response = await _httpClient.PutAsync(localSpecialtiesApi + "update", content, cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync(cancellationToken);
                throw new HttpRequestException($"Unable to fetch tips. Status: {response.StatusCode}, Error: {errorContent}");
            }
        }

        public Task DeleteAsync(LocalSpecialtiesResponse entity, CancellationToken cancellationToken = default)
        {
            throw new NotImplementedException();
        }

        public Task<LocalSpecialtiesResponse> GetAsyns(Expression<Func<LocalSpecialtiesResponse, bool>> predicate, CancellationToken cancellationToken = default)
        {
            throw new NotImplementedException();
        }

        public async Task<string> DeleteLocalSpecialtiesImage(string id, string imageUrl, CancellationToken cancellationToken = default)
        {
            var request = new DeleteImageLocalSpecialtiesRequest
            {
                Id = id,
                ImageUrl = imageUrl
            };
            var content = new StringContent(JsonSerializer.Serialize(request), Encoding.UTF8, "application/json");
            var response = await _httpClient.PostAsync(localSpecialtiesApi + "DeleteLocalSpecialtiesImage", content, cancellationToken);

            if (response.IsSuccessStatusCode)
            {
                var responseContent = await response.Content.ReadAsStringAsync();
                return responseContent;
            }
            else
            {
                var errorResult = await response.Content.ReadAsStringAsync();
                throw new HttpRequestException($"Unable to delete image. Status: {response.StatusCode}, Error: {errorResult}");
            }
        }

        public async Task<LocalSpecialtyLocation> AddSellLocationAsync(string id, AddLocationRequest request, CancellationToken cancellationToken = default)
        {
            string data = JsonSerializer.Serialize(request);
            var content = new StringContent(data, System.Text.Encoding.UTF8, "application/json");

            HttpResponseMessage response = await _httpClient.PostAsync(localSpecialtiesApi + id + "/add-location", content, cancellationToken);
            var responseContent = await response.Content.ReadAsStringAsync(cancellationToken);
            if (response.IsSuccessStatusCode)
            {
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var apiResponse = JsonSerializer.Deserialize<LocalSpecialtiesBase<LocalSpecialtyLocation>>(responseContent, options);
                return apiResponse?.Data ?? throw new HttpRequestException("Unable to deserialize server response.");
            }
            if (response.StatusCode == System.Net.HttpStatusCode.BadRequest)
            {
                throw new InvalidOperationException(responseContent);
            }

            throw new HttpRequestException($"Unable to create local specialty. Status: {response.StatusCode}, Error: {responseContent}");
        }

        public async Task<bool> RemoveSellLocationAsync(string id, string sellLocationId, CancellationToken cancellationToken = default)
        {
            var response = await _httpClient.DeleteAsync(localSpecialtiesApi + id + "/locations/" + sellLocationId, cancellationToken);
            if (response.IsSuccessStatusCode)
            {
                return true;
            }
            return false;
        }
        public async Task<LocalSpecialtyLocation> UpdateSellLocationAsync(string id, UpdateLocationRequest request, CancellationToken cancellationToken = default)
        {
            Console.WriteLine($"Sending request to update location for LocalSpecialty Id: {id}, LocationId: {request.LocationId}");
            var json = JsonSerializer.Serialize(request);
            Console.WriteLine($"Request JSON: {json}");

            var content = new StringContent(json, Encoding.UTF8, "application/json");
            var response = await _httpClient.PutAsync(localSpecialtiesApi + id + "/locations", content, cancellationToken);
            var responseContent = await response.Content.ReadAsStringAsync(cancellationToken);
            Console.WriteLine($"API Response: {responseContent}");

            if (response.IsSuccessStatusCode)
            {
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                System.Console.WriteLine(responseContent);
                var apiResponse = JsonSerializer.Deserialize<LocalSpecialtiesBase<LocalSpecialtyLocation>>(responseContent, options);
                if (apiResponse == null)
                {
                    throw new HttpRequestException($"API returned failure: {apiResponse?.Message ?? "No message provided"}");
                }
                return apiResponse.Data ?? throw new HttpRequestException("No data found in server response.");
            }

            throw new InvalidOperationException(responseContent);
        }

        public async Task<List<string>> AddLocalSpecialtiesImage(AddImageLocalSpecialtiesRequest request, CancellationToken cancellationToken = default)
        {
            var form = new MultipartFormDataContent();
            foreach (var file in request.ImageFile)
            {
                var streamContent = new StreamContent(file.OpenReadStream());
                streamContent.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue(file.ContentType);
                form.Add(streamContent, "imageFiles", file.FileName);
            }

            var response = await _httpClient.PostAsync(localSpecialtiesApi + $"{request.Id}/add-images", form, cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync(cancellationToken);
                throw new HttpRequestException($"Failed to uploading images: {errorContent}");
            }

            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            var content = await response.Content.ReadAsStringAsync(cancellationToken);
            var result = JsonSerializer.Deserialize<LocalSpecialtiesBase<List<string>>>(content, options) ?? throw new HttpRequestException("Unable to deserialize server response.");
            return result.Data;
        }
    }
}