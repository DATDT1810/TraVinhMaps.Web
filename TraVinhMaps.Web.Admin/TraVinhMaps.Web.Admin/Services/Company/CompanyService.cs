using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using TraVinhMaps.Web.Admin.Models.Company;
using TraVinhMaps.Web.Admin.Models.Contact;

namespace TraVinhMaps.Web.Admin.Services.Company
{
    public class CompanyService : ICompanyService
    {
        private readonly HttpClient _httpClient;
        private string companyApi;

        public CompanyService(IHttpClientFactory httpClientFactory)
        {
            this._httpClient = httpClientFactory.CreateClient("ApiClient");
            this.companyApi = "api/Company/";
        }
        public async Task<IEnumerable<CompanyResponse>> ListAllAsync(CancellationToken cancellationToken = default)
        {
            var response = await _httpClient.GetAsync(companyApi + "GetAllCompany");
            if (response.IsSuccessStatusCode)
            {
                var contentResult = await response.Content.ReadAsStringAsync(cancellationToken);
                var option = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                return System.Text.Json.JsonSerializer.Deserialize<CompanyBase<List<CompanyResponse>>>(contentResult, option)?.Data ?? throw new HttpRequestException("Fail to find list company.");
            }
            else
            {
                var errorResult = await response.Content.ReadAsStringAsync(cancellationToken);
                throw new HttpRequestException($"Unable to fetch list company. Status: {response.StatusCode}, Error: {errorResult}");
            }
        }

        public async Task<CompanyResponse> GetByIdAsync(string id, CancellationToken cancellationToken = default)
        {
            var response = await _httpClient.GetAsync(companyApi + "GetCompanyById/" + id);
            if (response.IsSuccessStatusCode)
            {
                var contentResult = await response.Content.ReadAsStringAsync(cancellationToken);
                var option = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                return System.Text.Json.JsonSerializer.Deserialize<CompanyBase<CompanyResponse>>(contentResult, option)?.Data ?? throw new HttpRequestException("Unable to find selling link by id.");
            }
            else
            {
                var errorResult = await response.Content.ReadAsStringAsync(cancellationToken);
                throw new HttpRequestException($"Unable to fetch company by id. Status: {response.StatusCode}, Error: {errorResult}");
            }
        }
        public async Task<CreateCompanyResponse<CompanyResponse>> AddAsync(CompanyViewModel entity, CancellationToken cancellationToken = default)
        {
            var json = System.Text.Json.JsonSerializer.Serialize(entity);
            using var content = new StringContent(json, Encoding.UTF8, "application/json");
            HttpResponseMessage responseMessage = await _httpClient.PostAsync(companyApi + "AddCompany", content);
            Console.WriteLine("Response: ", responseMessage);
            if (responseMessage.IsSuccessStatusCode)
            {
                var contentResult = await responseMessage.Content.ReadAsStringAsync(cancellationToken);
                Console.WriteLine("API Response Content: " + contentResult);
                var option = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                return System.Text.Json.JsonSerializer.Deserialize<CreateCompanyResponse<CompanyResponse>>(contentResult, option) ?? throw new HttpRequestException("Unable to create ocop type.");
            }
            else
            {
                var errorResult = await responseMessage.Content.ReadAsStringAsync(cancellationToken);
                throw new HttpRequestException($"Unable to fetch create company. Status: {responseMessage.StatusCode}, Error: {errorResult}");
            }
        }


        public async Task<CompanyMessage> UpdateAsync(UpdateCompanyRequest entity, CancellationToken cancellationToken = default)
        {
            var options = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            };
            var data = JsonSerializer.Serialize(entity, options);
            var content = new StringContent(data, System.Text.Encoding.UTF8, "application/json");

            HttpResponseMessage responseMessage = await _httpClient.PutAsync(companyApi + "UpdateCompany", content);
            if (responseMessage.IsSuccessStatusCode)
            {
                var contentResponse = await responseMessage.Content.ReadAsStringAsync();
                var option = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                return JsonSerializer.Deserialize<CompanyMessage>(contentResponse, option) ?? throw new HttpRequestException("Fail to update company.");
            }
            else
            {
                var errorResult = await responseMessage.Content.ReadAsStringAsync();
                throw new HttpRequestException($"Unable to fetch update company. Status: {responseMessage.StatusCode}, Error: {errorResult}");
            }
        }

        public async Task<long> CountAsync(Expression<Func<CompanyResponse, bool>> predicate = null, CancellationToken cancellationToken = default)
        {
            var response = await _httpClient.GetAsync(companyApi + "CountCompanies");
            if (response.IsSuccessStatusCode)
            {
                var contentResult = await response.Content.ReadAsStringAsync(cancellationToken);
                var option = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                return System.Text.Json.JsonSerializer.Deserialize<long>(contentResult, option);
            }
            else
            {
                var errorResult = await response.Content.ReadAsStringAsync(cancellationToken);
                throw new HttpRequestException($"Unable to fetch count company Status: {response.StatusCode}, Error: {errorResult}");
            }
        }
    }
}