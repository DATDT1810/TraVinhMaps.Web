using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using TraVinhMaps.Web.Admin.Models;
using TraVinhMaps.Web.Admin.Models.Markers;

namespace TraVinhMaps.Web.Admin.Services.Markers
{
    public class MarkerService : IMarkerService
    {
        private readonly HttpClient _httpClient;
        private string MarkerApi;
        public MarkerService(IHttpClientFactory httpClientFactory)
        {
            this._httpClient = httpClientFactory.CreateClient("ApiClient");
            this.MarkerApi = "api/Marker/";
        }
        public async Task<MarkerResponse> CreateMarker(CreateMarkerRequest createMarkerRequest)
        {
            using var formData = new MultipartFormDataContent();
            formData.Add(new StringContent(createMarkerRequest.Name), "Name");

            var streamContent = new StreamContent(createMarkerRequest.ImageFile.OpenReadStream());
            streamContent.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue(createMarkerRequest.ImageFile.ContentType);
            formData.Add(streamContent, "ImageFile", createMarkerRequest.ImageFile.FileName);

            var response = await _httpClient.PostAsync(MarkerApi + "CreateMarker", formData);
            var content = await response.Content.ReadAsStringAsync();
            System.Console.WriteLine("______________________________________________");
            System.Console.WriteLine(response);
            if (response.IsSuccessStatusCode)
            {
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var data = JsonSerializer.Deserialize<UpdateMarkerResponse<BaseResponseModel<MarkerResponse>>>(content, options);
                return data.Value.Data;
            }
            return null;
        }

        public async Task<bool> DeleteMarker(string id)
        {
            HttpResponseMessage response = await _httpClient.DeleteAsync(MarkerApi + "DeleteMarker/" + id);
            System.Console.WriteLine(response);
            if (response.IsSuccessStatusCode)
            {
                return true;
            }
            return false;
        }

        public async Task<MarkerResponse> GetMarkerById(string id)
        {
            if (string.IsNullOrEmpty(id))
            {
                return null;
            }
            var response = await this._httpClient.GetAsync(MarkerApi + "GetMarkerById/" + id);
            if (response.IsSuccessStatusCode)
            {
                var data = await response.Content.ReadAsStringAsync();
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var destinationDetailData = JsonSerializer.Deserialize<BaseResponseModel<MarkerResponse>>(data, options);
                return destinationDetailData.Data;
            }
            return null;
        }

        public async Task<IEnumerable<MarkerResponse>> ListAllAsync(CancellationToken cancellationToken = default)
        {
            var response = await _httpClient.GetAsync(MarkerApi + "GetAllMarkers", cancellationToken);
            System.Console.WriteLine(response);
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var data = JsonSerializer.Deserialize<BaseResponseModel<IEnumerable<MarkerResponse>>>(content, options);
                return data.Data;
            }
            return null;
        }

        public async Task<bool> RestoreMarker(string id)
        {
            HttpResponseMessage response = await _httpClient.PutAsync(MarkerApi + "RestoreMarker/" + id, new StringContent(""));
            System.Console.WriteLine(response);
            if (response.IsSuccessStatusCode)
            {
                return true;
            }
            return false;
        }

        public async Task<MarkerResponse> UpdateMarker(UpdateMarkerRequest updateMarkerRequest)
        {
            string data = JsonSerializer.Serialize(updateMarkerRequest);
            var content = new StringContent(data, System.Text.Encoding.UTF8, "application/json");
            HttpResponseMessage response = await _httpClient.PutAsync(MarkerApi + "UpdateMarker", content);
            var contentResponse = await response.Content.ReadAsStringAsync();
            System.Console.WriteLine(contentResponse);
            if (response.StatusCode == System.Net.HttpStatusCode.Created)
            {
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var responseData = JsonSerializer.Deserialize<UpdateMarkerResponse<BaseResponseModel<MarkerResponse>>>(contentResponse, options);
                return responseData.Value.Data;
            }
            return null;
        }

        public async Task<string> UploadImageAsync(EditMarkerPictureRequest editMarkerPictureRequest)
        {
            using var formData = new MultipartFormDataContent();
            formData.Add(new StringContent(editMarkerPictureRequest.Id), "Id");
            formData.Add(new StringContent(editMarkerPictureRequest.CurrentUrlImage), "CurrentUrlImage");

            var streamContent = new StreamContent(editMarkerPictureRequest.NewImageFile.OpenReadStream());
            streamContent.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue(editMarkerPictureRequest.NewImageFile.ContentType);
            formData.Add(streamContent, "NewImageFile", editMarkerPictureRequest.NewImageFile.FileName);

            var response = await _httpClient.PutAsync(MarkerApi + "EditMarkerImage", formData);
            var content = await response.Content.ReadAsStringAsync();
            System.Console.WriteLine(response);
            if (response.IsSuccessStatusCode)
            {
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var data = JsonSerializer.Deserialize<BaseResponseModel<string>>(content, options);
                return data.Data;
            }
            return null;
        }
    }
}