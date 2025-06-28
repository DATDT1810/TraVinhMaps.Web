using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using TraVinhMaps.Web.Admin.Models.TouristDestination;

namespace TraVinhMaps.Web.Admin.Services.TouristDestination
{
    public class DestinationService : IDestinationService
    {
        private readonly HttpClient _httpClient;
        private string destinationApi;
        public DestinationService(IHttpClientFactory httpClientFactory)
        {
            this._httpClient = httpClientFactory.CreateClient("ApiClient");
            this.destinationApi = "api/TouristDestination/";
        }

        public async Task<bool> DeleteDestination(string id)
        {
            HttpResponseMessage response = await _httpClient.DeleteAsync(destinationApi + "DeleteDestination/" + id);
            if (response.IsSuccessStatusCode)
            {
                return true;
            }
            return false;
        }

        public async Task<List<string>> AddDestinationHistoryImage(AddDestinationImageRequest addDestinationImageRequest)
        {
            using var formData = new MultipartFormDataContent();
            formData.Add(new StringContent(addDestinationImageRequest.id), "id");
            foreach (var itemImage in addDestinationImageRequest.imageFile)
            {
                var streamContent = new StreamContent(itemImage.OpenReadStream());
                streamContent.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue(itemImage.ContentType);
                formData.Add(streamContent, "imageFile", itemImage.FileName);
            }
            var response = await _httpClient.PostAsync(destinationApi + "AddDestinationHistoryStoryImage", formData);
            var content = await response.Content.ReadAsStringAsync();
            if (response.IsSuccessStatusCode)
            {
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var data = JsonSerializer.Deserialize<ResponseDestinationBase<List<string>>>(content, options);
                return data.Data;
            }
            return new List<string>();
        }

        public async Task<List<string>> AddDestinationImage(AddDestinationImageRequest addDestinationImageRequest)
        {
            using var formData = new MultipartFormDataContent();
            formData.Add(new StringContent(addDestinationImageRequest.id), "id");
            foreach (var itemImage in addDestinationImageRequest.imageFile)
            {
                var streamContent = new StreamContent(itemImage.OpenReadStream());
                streamContent.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue(itemImage.ContentType);
                formData.Add(streamContent, "imageFile", itemImage.FileName);
            }
            var response = await _httpClient.PostAsync(destinationApi + "AddDestinationImage", formData);
            var content = await response.Content.ReadAsStringAsync();
            if (response.IsSuccessStatusCode)
            {
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var data = JsonSerializer.Deserialize<ResponseDestinationBase<List<string>>>(content, options);
                return data.Data;
            }
            return null;
        }

        public async Task<TouristDestinationResponse> CreateDestination(TouristDestinationRequest touristDestinationRequest)
        {
            using var formData = new MultipartFormDataContent();
            formData.Add(new StringContent(touristDestinationRequest.Name), "Name");
            formData.Add(new StringContent(touristDestinationRequest.AvarageRating.ToString()), "AvarageRating");

            if (!string.IsNullOrEmpty(touristDestinationRequest.Description))
            {
                formData.Add(new StringContent(touristDestinationRequest.Description), "Description");
            }

            formData.Add(new StringContent(touristDestinationRequest.Address), "Address");
            if (!string.IsNullOrEmpty(touristDestinationRequest.Location.Type))
            {
                formData.Add(new StringContent(touristDestinationRequest.Location.Type), "Location.Type");
            }

            foreach (var coordinate in touristDestinationRequest.Location.Coordinates)
            {
                formData.Add(new StringContent(coordinate.ToString()), "Location.Coordinates");
            }

            foreach (var itemImage in touristDestinationRequest.ImagesFile)
            {
                var streamContent = new StreamContent(itemImage.OpenReadStream());
                streamContent.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue(itemImage.ContentType);
                formData.Add(streamContent, "ImagesFile", itemImage.FileName);
            }
            if (!string.IsNullOrEmpty(touristDestinationRequest.HistoryStory.Content))
            {
                formData.Add(new StringContent(touristDestinationRequest.HistoryStory.Content), "HistoryStory.Content");
            }
            if (touristDestinationRequest.HistoryStory != null && touristDestinationRequest.HistoryStory.ImagesFile != null && touristDestinationRequest.HistoryStory.ImagesFile.Any())
            {
                foreach (var itemImage in touristDestinationRequest.HistoryStory.ImagesFile)
                {
                    var streamContent = new StreamContent(itemImage.OpenReadStream());
                    streamContent.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue(itemImage.ContentType);
                    formData.Add(streamContent, "HistoryStory.ImagesFile", itemImage.FileName);
                }
            }

            formData.Add(new StringContent(touristDestinationRequest.DestinationTypeId), "DestinationTypeId");
            if (!string.IsNullOrEmpty(touristDestinationRequest.OpeningHours.OpenTime))
            {
                formData.Add(new StringContent(touristDestinationRequest.OpeningHours.OpenTime), "OpeningHours.OpenTime");
            }
            if (!string.IsNullOrEmpty(touristDestinationRequest.OpeningHours.CloseTime))
            {
                formData.Add(new StringContent(touristDestinationRequest.OpeningHours.CloseTime), "OpeningHours.CloseTime");
            }
            if (!string.IsNullOrEmpty(touristDestinationRequest.Capacity))
            {
                formData.Add(new StringContent(touristDestinationRequest.Capacity), "Capacity");
            }
            if (touristDestinationRequest.Contact != null && !string.IsNullOrEmpty(touristDestinationRequest.Contact.Email))
            {
                formData.Add(new StringContent(touristDestinationRequest.Contact.Email), "Contact.Email");
            }

            if (touristDestinationRequest.Contact != null && !string.IsNullOrEmpty(touristDestinationRequest.Contact.Phone))
            {
                formData.Add(new StringContent(touristDestinationRequest.Contact.Phone), "Contact.Phone");

            }
            if (touristDestinationRequest.Contact != null && !string.IsNullOrEmpty(touristDestinationRequest.Contact.Website))
            {
                formData.Add(new StringContent(touristDestinationRequest.Contact.Website), "Contact.Website");

            }
            formData.Add(new StringContent(touristDestinationRequest.TagId), "TagId");
            if (!string.IsNullOrEmpty(touristDestinationRequest.Ticket))
            {
                formData.Add(new StringContent(touristDestinationRequest.Ticket), "Ticket");

            }
            var response = await _httpClient.PostAsync(destinationApi + "CreateDestination", formData);
            var content = await response.Content.ReadAsStringAsync();
            Console.WriteLine("RESPONSE STATUS: " + response.StatusCode);
            Console.WriteLine("RESPONSE JSON: " + content);

            if (response.StatusCode == System.Net.HttpStatusCode.Created)
            {
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var wrapper = JsonSerializer.Deserialize<UpdateDestinationResponse<ResponseDestinationBase<TouristDestinationResponse>>>(content, options);
                return wrapper.Value.Data;
            }
            return null;
        }

        public async Task<bool> DeleteDestinationHistoryImage(DeleteDestinationImageRequest deleteDestinationImageRequest)
        {
            string data = JsonSerializer.Serialize(deleteDestinationImageRequest);
            var content = new StringContent(data, System.Text.Encoding.UTF8, "application/json");
            var response = await this._httpClient.PostAsync(destinationApi + "DeleteDestinationHistoryStoryImage", content);
            var contentResponse = await response.Content.ReadAsStringAsync();
            if (response.IsSuccessStatusCode)
            {
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var responseData = JsonSerializer.Deserialize<ResponseDestinationBase<bool>>(contentResponse, options);
                return responseData.Data;
            }
            return false;
        }

        public async Task<bool> DeleteDestinationImage(DeleteDestinationImageRequest deleteDestinationImageRequest)
        {
            string data = JsonSerializer.Serialize(deleteDestinationImageRequest);
            var content = new StringContent(data, System.Text.Encoding.UTF8, "application/json");
            var response = await this._httpClient.PostAsync(destinationApi + "DeleteDestinationImage", content);
            var contentResponse = await response.Content.ReadAsStringAsync();
            if (response.IsSuccessStatusCode)
            {
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var responseData = JsonSerializer.Deserialize<ResponseDestinationBase<bool>>(contentResponse, options);
                return responseData.Data;
            }
            return false;
        }

        public async Task<IEnumerable<TouristDestinationResponse>> ListAllAsync(CancellationToken cancellationToken)
        {
            var response = await _httpClient.GetAsync(destinationApi + "GetAllDestinations", cancellationToken);
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var data = JsonSerializer.Deserialize<ResponseDestinationBase<IEnumerable<TouristDestinationResponse>>>(content, options);
                return data.Data;
            }
            return null;
        }

        public async Task<TouristDestinationResponse> UpdateDestination(UpdateDestinationRequest updateDestinationRequest)
        {
            string data = JsonSerializer.Serialize(updateDestinationRequest);
            var content = new StringContent(data, System.Text.Encoding.UTF8, "application/json");
            HttpResponseMessage response = await _httpClient.PutAsync(destinationApi + "UpdateDestination", content);
            var contentResponse = await response.Content.ReadAsStringAsync();
            if (response.StatusCode == System.Net.HttpStatusCode.Created)
            {
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var responseData = JsonSerializer.Deserialize<UpdateDestinationResponse<ResponseDestinationBase<TouristDestinationResponse>>>(contentResponse, options);
                return responseData.Value.Data;
            }
            return null;
        }

        public async Task<TouristDestinationResponse> GetDestinationById(string id)
        {
            if (string.IsNullOrEmpty(id))
            {
                return null;
            }
            var response = await this._httpClient.GetAsync(destinationApi + "GetDestinationById/" + id);
            if (response.IsSuccessStatusCode)
            {
                var data = await response.Content.ReadAsStringAsync();
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var destinationDetailData = JsonSerializer.Deserialize<ResponseDestinationBase<TouristDestinationResponse>>(data, options);
                return destinationDetailData.Data;
            }
            return null;
        }

        public async Task<bool> RestoreDestination(string id)
        {
            HttpResponseMessage response = await _httpClient.PutAsync(destinationApi + "RestoreDestination/" + id, new StringContent(""));
            if (response.IsSuccessStatusCode)
            {
                return true;
            }
            return false;
        }

        public async Task<DestinationStatsOverview> GetDestinationStatsOverviewAsync(
        string timeRange = "month",
        DateTime? startDate = null,
        DateTime? endDate = null,
        CancellationToken cancellationToken = default)
        {
            try
            {
                // 1. Build query string
                var url = $"{destinationApi}stats-overview?timeRange={Uri.EscapeDataString(timeRange)}";

                if (startDate.HasValue)
                    url += $"&startDate={Uri.EscapeDataString(startDate.Value.ToString("yyyy-MM-ddTHH:mm:ssZ"))}";
                if (endDate.HasValue)
                    url += $"&endDate={Uri.EscapeDataString(endDate.Value.ToString("yyyy-MM-ddTHH:mm:ssZ"))}";

                // 2. Call API
                var response = await _httpClient.GetAsync(url, cancellationToken);
                response.EnsureSuccessStatusCode();

                // 3. Read / deserialize
                var json = await response.Content.ReadAsStringAsync(cancellationToken);
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };

                // Wrapper class should hold "data" (or similar) of type DestinationStatsOverview
                var wrapper = JsonSerializer.Deserialize<ResponseDestinationBase<DestinationStatsOverview>>(json, options);

                // 4. Return the DTO (null-conditional in case of unexpected payload)
                return wrapper?.Data ?? new DestinationStatsOverview
                {
                    TotalDestinations = 0,
                    TotalViews = 0,
                    TotalInteractions = 0,
                    TotalFavorites = 0,
                    DestinationDetails = new List<DestinationAnalytics>()
                };
            }
            catch (HttpRequestException ex)
            {
                throw new HttpRequestException(
                    $"Destination stats request failed. Status: {ex.StatusCode}, Message: {ex.Message}", ex);
            }
            catch (JsonException ex)
            {
                throw new InvalidOperationException($"JSON parse error: {ex.Message}", ex);
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException("Unexpected error while fetching destination analytics.", ex);
            }
        }


        public async Task<IEnumerable<DestinationAnalytics>> GetTopDestinationsByFavoritesAsync(int top = 5, string timeRange = "month", DateTime? startDate = null, DateTime? endDate = null, CancellationToken cancellationToken = default)
        {
            try
            {
                // 1. Build query string
                var url = $"{destinationApi}stats-getTopFavoritesDestinations?top={top}&timeRange={Uri.EscapeDataString(timeRange)}";

                if (startDate.HasValue)
                    url += $"&startDate={Uri.EscapeDataString(startDate.Value.ToString("yyyy-MM-ddTHH:mm:ssZ"))}";
                if (endDate.HasValue)
                    url += $"&endDate={Uri.EscapeDataString(endDate.Value.ToString("yyyy-MM-ddTHH:mm:ssZ"))}";

                // 2. Call API
                var response = await _httpClient.GetAsync(url, cancellationToken);
                response.EnsureSuccessStatusCode();

                // 3. Read / deserialize
                var json = await response.Content.ReadAsStringAsync(cancellationToken);
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };

                // Wrapper class should hold "data" (or similar) of type DestinationStatsOverview
                var wrapper = JsonSerializer.Deserialize<ResponseDestinationBase<IEnumerable<DestinationAnalytics>>>(json, options);

                // 4. Return the DTO (null-conditional in case of unexpected payload)
                return wrapper?.Data ?? Enumerable.Empty<DestinationAnalytics>();
            }
            catch (HttpRequestException ex)
            {
                throw new HttpRequestException(
                    $"Destination stats request failed. Status: {ex.StatusCode}, Message: {ex.Message}", ex);
            }
            catch (JsonException ex)
            {
                throw new InvalidOperationException($"JSON parse error: {ex.Message}", ex);
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException("Unexpected error while fetching destination analytics.", ex);
            }
        }

        public async Task<IEnumerable<DestinationAnalytics>> GetTopDestinationsByViewsAsync(int top = 5, string timeRange = "month", DateTime? startDate = null, DateTime? endDate = null, CancellationToken cancellationToken = default)
        {
            try
            {
                // 1. Build query string
                var url = $"{destinationApi}stats-getTopViewsDestinations?top={top}&timeRange={Uri.EscapeDataString(timeRange)}";

                if (startDate.HasValue)
                    url += $"&startDate={Uri.EscapeDataString(startDate.Value.ToString("yyyy-MM-ddTHH:mm:ssZ"))}";
                if (endDate.HasValue)
                    url += $"&endDate={Uri.EscapeDataString(endDate.Value.ToString("yyyy-MM-ddTHH:mm:ssZ"))}";

                // 2. Call API
                var response = await _httpClient.GetAsync(url, cancellationToken);
                response.EnsureSuccessStatusCode();

                // 3. Read / deserialize
                var json = await response.Content.ReadAsStringAsync(cancellationToken);
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };

                // Wrapper class should hold "data" (or similar) of type DestinationStatsOverview
                var wrapper = JsonSerializer.Deserialize<ResponseDestinationBase<IEnumerable<DestinationAnalytics>>>(json, options);

                // 4. Return the DTO (null-conditional in case of unexpected payload)
                return wrapper?.Data ?? Enumerable.Empty<DestinationAnalytics>();
            }
            catch (HttpRequestException ex)
            {
                throw new HttpRequestException(
                    $"Destination stats request failed. Status: {ex.StatusCode}, Message: {ex.Message}", ex);
            }
            catch (JsonException ex)
            {
                throw new InvalidOperationException($"JSON parse error: {ex.Message}", ex);
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException("Unexpected error while fetching destination analytics.", ex);
            }
        }

        public async Task<IEnumerable<DestinationUserDemographics>> GetUserDemographicsAsync(string timeRange = "month", DateTime? startDate = null, DateTime? endDate = null, CancellationToken cancellationToken = default)
        {
            try
            {
                // 1. Build query string
                var url = $"{destinationApi}stats-getUserDemographics?timeRange={Uri.EscapeDataString(timeRange)}";

                if (startDate.HasValue)
                    url += $"&startDate={Uri.EscapeDataString(startDate.Value.ToString("yyyy-MM-ddTHH:mm:ssZ"))}";
                if (endDate.HasValue)
                    url += $"&endDate={Uri.EscapeDataString(endDate.Value.ToString("yyyy-MM-ddTHH:mm:ssZ"))}";

                // 2. Call API
                var response = await _httpClient.GetAsync(url, cancellationToken);
                response.EnsureSuccessStatusCode();

                // 3. Read / deserialize
                var json = await response.Content.ReadAsStringAsync(cancellationToken);
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };

                // Wrapper class should hold "data" (or similar) of type DestinationStatsOverview
                var wrapper = JsonSerializer.Deserialize<ResponseDestinationBase<IEnumerable<DestinationUserDemographics>>>(json, options);

                // 4. Return the DTO (null-conditional in case of unexpected payload)
                return wrapper?.Data ?? Enumerable.Empty<DestinationUserDemographics>();
            }
            catch (HttpRequestException ex)
            {
                throw new HttpRequestException(
                    $"Destination stats request failed. Status: {ex.StatusCode}, Message: {ex.Message}", ex);
            }
            catch (JsonException ex)
            {
                throw new InvalidOperationException($"JSON parse error: {ex.Message}", ex);
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException("Unexpected error while fetching destination analytics.", ex);
            }
        }

        public async Task<IEnumerable<DestinationAnalytics>> CompareDestinationsAsync(IEnumerable<string> destinationIds, string timeRange = "month", DateTime? startDate = null, DateTime? endDate = null, CancellationToken cancellationToken = default)
        {
            try
            {
                var url = $"{destinationApi}stats-compare?timeRange={Uri.EscapeDataString(timeRange)}";
                if (startDate.HasValue)
                    url += $"&startDate={Uri.EscapeDataString(startDate.Value.ToString("yyyy-MM-ddTHH:mm:ssZ"))}";
                if (endDate.HasValue)
                    url += $"&endDate={Uri.EscapeDataString(endDate.Value.ToString("yyyy-MM-ddTHH:mm:ssZ"))}";
                if (destinationIds != null && destinationIds.Any())
                    url += $"&destinationIds={string.Join(",", destinationIds)}";

                var response = await _httpClient.GetAsync(url, cancellationToken);
                response.EnsureSuccessStatusCode();
                var json = await response.Content.ReadAsStringAsync(cancellationToken);
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var wrapper = JsonSerializer.Deserialize<ResponseDestinationBase<IEnumerable<DestinationAnalytics>>>(json, options);
                return wrapper?.Data ?? Enumerable.Empty<DestinationAnalytics>();
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException("Unexpected error while fetching destination analytics.", ex);
            }
        }
    }
}