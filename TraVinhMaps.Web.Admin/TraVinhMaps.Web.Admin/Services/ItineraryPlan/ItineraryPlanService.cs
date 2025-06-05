using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using TraVinhMaps.Web.Admin.Models;
using TraVinhMaps.Web.Admin.Models.ItineraryPlans;

namespace TraVinhMaps.Web.Admin.Services.ItineraryPlan
{
    public class ItineraryPlanService : IItineraryPlanService
    {
        private readonly HttpClient _httpClient;
        private string ItineraryPlanApi;

        public ItineraryPlanService(IHttpClientFactory httpClientFactory)
        {
            this._httpClient = httpClientFactory.CreateClient("ApiClient");
            this.ItineraryPlanApi = "api/ItineraryPlan/";
        }
        public async Task<ItineraryPlanResponse> CreateItineraryPlan(ItineraryPlanRequest itineraryPlanRequest)
        {
            string data = JsonSerializer.Serialize(itineraryPlanRequest);
            var content = new StringContent(data, System.Text.Encoding.UTF8, "application/json");
            HttpResponseMessage response = await _httpClient.PostAsync(ItineraryPlanApi + "CreateItineraryPlan", content);
            var contentResponse = await response.Content.ReadAsStringAsync();
            System.Console.WriteLine(contentResponse);
            if (response.StatusCode == System.Net.HttpStatusCode.Created)
            {
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var responseData = JsonSerializer.Deserialize<UpdateItineraryPlanRequest<BaseResponseModel<ItineraryPlanResponse>>>(contentResponse, options);
                return responseData.Value.Data;
            }
            return null;
        }

        public async Task<bool> DeleteItineraryPlan(string id)
        {
            HttpResponseMessage response = await _httpClient.DeleteAsync(ItineraryPlanApi + "DeleteItineraryPlan/?id=" + id);
            System.Console.WriteLine("___________________________________________________");
            System.Console.WriteLine(response);
            if (response.IsSuccessStatusCode)
            {
                return true;
            }
            return false;
        }

        public async Task<ItineraryPlanResponse> GetItineraryPlanById(string id)
        {
            if (string.IsNullOrEmpty(id))
            {
                return null;
            }
            var response = await this._httpClient.GetAsync(ItineraryPlanApi + "GetItineraryPlanById/" + id);
            if (response.IsSuccessStatusCode)
            {
                var data = await response.Content.ReadAsStringAsync();
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var destinationDetailData = JsonSerializer.Deserialize<BaseResponseModel<ItineraryPlanResponse>>(data, options);
                return destinationDetailData.Data;
            }
            return null;
        }

        public async Task<IEnumerable<ItineraryPlanResponse>> ListAllAsync(CancellationToken cancellationToken = default)
        {
            var response = await _httpClient.GetAsync(ItineraryPlanApi + "GetAllItineraryPlan", cancellationToken);
            System.Console.WriteLine(response);
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var data = JsonSerializer.Deserialize<BaseResponseModel<IEnumerable<ItineraryPlanResponse>>>(content, options);
                return data.Data;
            }
            return null;
        }

        public async Task<bool> RestoreItineraryPlan(string id)
        {
            HttpResponseMessage response = await _httpClient.PutAsync(ItineraryPlanApi + "RestoreItineraryPlan/" + id, new StringContent(""));
            System.Console.WriteLine(response);
            if (response.IsSuccessStatusCode)
            {
                return true;
            }
            return false;
        }

        public async Task<ItineraryPlanResponse> UpdateItineraryPlan(UpdateItineraryPlanResponse updateItineraryPlanResponse)
        {
            string data = JsonSerializer.Serialize(updateItineraryPlanResponse);
            var content = new StringContent(data, System.Text.Encoding.UTF8, "application/json");
            HttpResponseMessage response = await _httpClient.PutAsync(ItineraryPlanApi + "UpdateItineraryPlan", content);
            var contentResponse = await response.Content.ReadAsStringAsync();
            System.Console.WriteLine(contentResponse);
            if (response.StatusCode == System.Net.HttpStatusCode.Created)
            {
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var responseData = JsonSerializer.Deserialize<UpdateItineraryPlanRequest<BaseResponseModel<ItineraryPlanResponse>>>(contentResponse, options);
                return responseData.Value.Data;
            }
            return null;
        }
    }
}