using System.Text.Json;
using TraVinhMaps.Web.Admin.Models.EventAndFestivalFeature;

namespace TraVinhMaps.Web.Admin.Services.EventAndFestivalFeature
{
    public class EventAndFestivalService : IEventAndFestivalService
    {
        private readonly HttpClient _httpClient;
        private string eventAndFestivalApi;

        public EventAndFestivalService(IHttpClientFactory httpClientFactory)
        {
            this._httpClient = httpClientFactory.CreateClient("ApiClient");
            this.eventAndFestivalApi = "api/EventAndFestival/";
        }

        public async Task<List<string>> AddEventAndFestivalImage(AddImageEventAndFestivalRequest addImageEventAndFestivalRequest)
        {
            using var formData = new MultipartFormDataContent();
            formData.Add(new StringContent(addImageEventAndFestivalRequest.id), "id");
            foreach (var itemImage in addImageEventAndFestivalRequest.imageFile)
            {
                var streamContent = new StreamContent(itemImage.OpenReadStream());
                streamContent.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue(itemImage.ContentType);
                formData.Add(streamContent, "imageFile", itemImage.FileName);
            }
            var response = await _httpClient.PostAsync(eventAndFestivalApi + "AddEventAndFestivalImage", formData);
            var content = await response.Content.ReadAsStringAsync();
            if (response.IsSuccessStatusCode)
            {
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var data = JsonSerializer.Deserialize<ResponseEventAndFestivalBase<List<string>>>(content, options);
                return data.Data;
            }
            return null;
        }

        public async Task<EventAndFestivalResponse> CreateEventAndFestival(CreateEventAndFestivalRequest createEventAndFestivalRequest)
        {
            using var formData = new MultipartFormDataContent();
            formData.Add(new StringContent(createEventAndFestivalRequest.NameEvent), "NameEvent");

            if (!string.IsNullOrEmpty(createEventAndFestivalRequest.Description))
            {
                formData.Add(new StringContent(createEventAndFestivalRequest.Description), "Description");
            }

            formData.Add(new StringContent(createEventAndFestivalRequest.StartDate.ToString("o")), "StartDate");
            formData.Add(new StringContent(createEventAndFestivalRequest.EndDate.ToString("o")), "EndDate");

            if (!string.IsNullOrEmpty(createEventAndFestivalRequest.Category))
            {
                formData.Add(new StringContent(createEventAndFestivalRequest.Category), "Category");
            }

            foreach (var itemImage in createEventAndFestivalRequest.ImagesFile)
            {
                var streamContent = new StreamContent(itemImage.OpenReadStream());
                streamContent.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue(itemImage.ContentType);
                formData.Add(streamContent, "ImagesFile", itemImage.FileName);
            }

            if (!string.IsNullOrEmpty(createEventAndFestivalRequest.Location.Name))
            {
                formData.Add(new StringContent(createEventAndFestivalRequest.Location.Name), "Location.Name");
            }

            if (!string.IsNullOrEmpty(createEventAndFestivalRequest.Location.Address))
            {
                formData.Add(new StringContent(createEventAndFestivalRequest.Location.Address), "Location.Address");
            }

            if (!string.IsNullOrEmpty(createEventAndFestivalRequest.Location.location.Type))
            {
                formData.Add(new StringContent(createEventAndFestivalRequest.Location.location.Type), "Location.location.Type");
            }

            foreach (var coordinate in createEventAndFestivalRequest.Location.location.Coordinates)
            {
                formData.Add(new StringContent(coordinate.ToString()), "Location.location.Coordinates");
            }

            formData.Add(new StringContent(createEventAndFestivalRequest.Location.MarkerId), "Location.MarkerId");
            formData.Add(new StringContent(createEventAndFestivalRequest.TagId), "TagId");

            var response = await _httpClient.PostAsync(eventAndFestivalApi + "CreateEventAndFestival", formData);
            var content = await response.Content.ReadAsStringAsync();
            System.Console.WriteLine("_______________________________________________________");
            System.Console.WriteLine(content);
            if (response.IsSuccessStatusCode)
            {
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var data = JsonSerializer.Deserialize<ResponseEventAndFestivalBase<EventAndFestivalResponse>>(content, options);
                return data.Data;
            }
            return null;
        }

        public async Task<bool> DeleteEventAndFestival(string id)
        {
            HttpResponseMessage response = await _httpClient.DeleteAsync(eventAndFestivalApi + "DeleteEventAndFestival/" + id);
            if (response.IsSuccessStatusCode)
            {
                return true;
            }
            return false;
        }

        public async Task<bool> DeleteEventAndFestivalImage(DeleteEventAndFestivalImage deleteEventAndFestivalImage)
        {
            string data = JsonSerializer.Serialize(deleteEventAndFestivalImage);
            var content = new StringContent(data, System.Text.Encoding.UTF8, "application/json");
            var response = await this._httpClient.PostAsync(eventAndFestivalApi + "DeleteEventAndFestivalImage", content);
            var contentResponse = await response.Content.ReadAsStringAsync();
            if (response.IsSuccessStatusCode)
            {
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var responseData = JsonSerializer.Deserialize<ResponseEventAndFestivalBase<bool>>(contentResponse, options);
                return responseData.Data;
            }
            return false;
        }

        public async Task<EventAndFestivalResponse> GetEventAndFestivalById(string id)
        {
            if (string.IsNullOrEmpty(id))
            {
                return null;
            }
            var response = await this._httpClient.GetAsync(eventAndFestivalApi + "GetEventAndFestivalById/" + id);
            if (response.IsSuccessStatusCode)
            {
                var data = await response.Content.ReadAsStringAsync();
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var destinationDetailData = JsonSerializer.Deserialize<ResponseEventAndFestivalBase<EventAndFestivalResponse>>(data, options);
                return destinationDetailData.Data;
            }
            return null;
        }

        public async Task<IEnumerable<EventAndFestivalResponse>> ListAllAsync(CancellationToken cancellationToken = default)
        {
            var response = await _httpClient.GetAsync(eventAndFestivalApi + "GetAllEventAndFestinal", cancellationToken);
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var data = JsonSerializer.Deserialize<ResponseEventAndFestivalBase<IEnumerable<EventAndFestivalResponse>>>(content, options);
                return data.Data;
            }
            return null;
        }

        public async Task<bool> RestoreEventAndFestival(string id)
        {
            HttpResponseMessage response = await _httpClient.PutAsync(eventAndFestivalApi + "RestoreEventAndFestival/" + id, new StringContent(""));
            if (response.IsSuccessStatusCode)
            {
                return true;
            }
            return false;
        }

        public async Task<EventAndFestivalResponse> UpdateEventAndFestival(UpdateEventAndFestivalRequest updateEventAndFestivalRequest)
        {
            string data = JsonSerializer.Serialize(updateEventAndFestivalRequest);
            var content = new StringContent(data, System.Text.Encoding.UTF8, "application/json");
            HttpResponseMessage response = await _httpClient.PutAsync(eventAndFestivalApi + "UpdateEventAndFestival", content);
            var contentResponse = await response.Content.ReadAsStringAsync();
            System.Console.WriteLine("__________________________");
            System.Console.WriteLine(contentResponse);
            if (response.StatusCode == System.Net.HttpStatusCode.Created)
            {
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var responseData = JsonSerializer.Deserialize<UpdateEventAndFestivalResponse<ResponseEventAndFestivalBase<EventAndFestivalResponse>>>(contentResponse, options);
                return responseData.Value.Data;
            }
            return null;
        }
    }
}