using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using TraVinhMaps.Web.Admin.Models;
using TraVinhMaps.Web.Admin.Models.DestinationTypes;

namespace TraVinhMaps.Web.Admin.Services.DestinationTypes
{
    public class DestinationTypeService : IDestinationTypeService
    {
        private readonly HttpClient _httpClient;
        private string destinationTypeApi;
        public DestinationTypeService(IHttpClientFactory httpClientFactory)
        {
            this._httpClient = httpClientFactory.CreateClient("ApiClient");
            this.destinationTypeApi = "api/DestinationType/";
        }

        public async Task<DestinationTypeResponse> GetByIdAsync(string id)
        {
            if (string.IsNullOrEmpty(id))
            {
                return null;
            }
            var response = await this._httpClient.GetAsync(destinationTypeApi + "GetDestinationTypeById/" + id);
            if (response.IsSuccessStatusCode)
            {
                var data = await response.Content.ReadAsStringAsync();
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var destinationDetailData = JsonSerializer.Deserialize<BaseResponseModel<DestinationTypeResponse>>(data, options);
                return destinationDetailData.Data;
            }
            return null;
        }

        public async Task<IEnumerable<DestinationTypeResponse>> ListAllAsync(CancellationToken cancellationToken = default)
        {
            var response = await _httpClient.GetAsync(destinationTypeApi + "GetAllDestinationTypes", cancellationToken);
            System.Console.WriteLine(response);
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var data = JsonSerializer.Deserialize<BaseResponseModel<IEnumerable<DestinationTypeResponse>>>(content, options);
                return data.Data;
            }
            return null;
        }
    }
}