using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text.Json;
using System.Threading.Tasks;
using TraVinhMaps.Web.Admin.Models.CommunityTips;

namespace TraVinhMaps.Web.Admin.Services.CommunityTips
{
    public class CommunityTipsService : ICommunityTipsService
    {
        private readonly HttpClient _httpClient;
        private string tipsApi;

        public CommunityTipsService(IHttpClientFactory clientFactory)
        {
            _httpClient = clientFactory.CreateClient("ApiClient");
            this.tipsApi = "api/CommunityTips/";
        }

        public async Task<IEnumerable<CommunityTipsResponse>> ListAllAsync(CancellationToken cancellationToken = default)
        {
            var response = await _httpClient.GetAsync(tipsApi + "GetAllTip", cancellationToken);
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                return JsonSerializer.Deserialize<IEnumerable<CommunityTipsResponse>>(content, options) ?? new List<CommunityTipsResponse>();
            }
            throw new HttpRequestException("Unable to fetch get all tips.");
        }

        public async Task<IEnumerable<CommunityTipsResponse>> ListAsync(Expression<Func<CommunityTipsRequest, bool>> predicate, CancellationToken cancellationToken = default)
        {
            var response = await _httpClient.GetAsync(tipsApi + "GetAllTipActive", cancellationToken);
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                return JsonSerializer.Deserialize<IEnumerable<CommunityTipsResponse>>(content, options) ?? new List<CommunityTipsResponse>();
            }
            throw new HttpRequestException("Unable to fetch get all tips.");
        }

        public async Task<CommunityTipsResponse> GetByIdAsync(string id, CancellationToken cancellationToken = default)
        {
            var response = await _httpClient.GetAsync(tipsApi + "GetByIdTip/" + id, cancellationToken);
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync(cancellationToken);
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                return JsonSerializer.Deserialize<CommunityTipsResponse>(content, options) ?? throw new HttpRequestException("Tips not found.");
            }
            var errorContent = await response.Content.ReadAsStringAsync(cancellationToken);
            throw new HttpRequestException($"Unable to fetch tips. Status: {response.StatusCode}, Error: {errorContent}");
        }

        public async Task<CommunityTipsRequest> AddAsync(CommunityTipsRequest entity, CancellationToken cancellationToken = default)
        {

            string data = JsonSerializer.Serialize(entity);
            var content = new StringContent(data, System.Text.Encoding.UTF8, "application/json");

            HttpResponseMessage response = await _httpClient.PostAsync(tipsApi + "CreateTip", content, cancellationToken);
            if (response.IsSuccessStatusCode)
            {
                var result = await response.Content.ReadAsStringAsync(cancellationToken);
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                return JsonSerializer.Deserialize<CommunityTipsRequest>(result, options) ?? throw new HttpRequestException("Unable to create tips.");
            }
            var errorContent = await response.Content.ReadAsStringAsync(cancellationToken);

            if (response.StatusCode == System.Net.HttpStatusCode.BadRequest)
            {
                throw new InvalidOperationException(errorContent);
            }
            throw new HttpRequestException($"Unable to create tips. Status: {response.StatusCode}, Error: {errorContent}");
        }

        public Task<IEnumerable<CommunityTipsRequest>> AddRangeAsync(IEnumerable<CommunityTipsRequest> entities, CancellationToken cancellationToken = default)
        {
            throw new NotImplementedException();
        }

        public Task<long> CountAsync(Expression<Func<CommunityTipsRequest, bool>> predicate = null, CancellationToken cancellationToken = default)
        {
            throw new NotImplementedException();
        }

        public Task DeleteAsync(CommunityTipsRequest entity, CancellationToken cancellationToken = default)
        {
            throw new NotImplementedException();
        }

        public async Task DeleteTipAsync(string id, CancellationToken cancellationToken = default)
        {
            var response = await _httpClient.DeleteAsync(tipsApi + "DeleteTip/" + id, cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                throw new HttpRequestException($"Unable to delete tip with ID: {id}");
            }
        }

        public async Task<bool> RestoreTipAsync(string id, CancellationToken cancellationToken = default)
        {
            var contents = new StringContent("");
            var response = await _httpClient.PutAsync(tipsApi + "RestoreTip/" + id, contents, cancellationToken);
            if (response.IsSuccessStatusCode)
            {
                return true;
            }
            return false;
        }

        public async Task UpdateAsync(CommunityTipsResponse entity, CancellationToken cancellationToken = default)
        {
            string data = JsonSerializer.Serialize(entity);
            var content = new StringContent(data, System.Text.Encoding.UTF8, "application/json");

            HttpResponseMessage response = await _httpClient.PutAsync(tipsApi + "UpdateTip", content, cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync(cancellationToken);
                throw new HttpRequestException($"Unable to fetch tips. Status: {response.StatusCode}, Error: {errorContent}");
            }
        }
    }
}