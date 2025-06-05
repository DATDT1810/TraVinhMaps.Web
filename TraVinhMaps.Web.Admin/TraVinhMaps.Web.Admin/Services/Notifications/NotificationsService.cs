using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text.Json;
using System.Threading.Tasks;
using TraVinhMaps.Web.Admin.Models.Notifications;

namespace TraVinhMaps.Web.Admin.Services.Notifications
{
    public class NotificationsService : INotificationsService
    {
        private readonly HttpClient _httpClient;
        private string notificationApi;

        public NotificationsService(IHttpClientFactory clientFactory)
        {
            _httpClient = clientFactory.CreateClient("ApiClient");
            this.notificationApi = "api/Notifications/";
        }

        public Task<NotificationResponse> AddAsync(NotificationResponse entity, CancellationToken cancellationToken = default)
        {
            throw new NotImplementedException();
        }

        public Task<IEnumerable<NotificationResponse>> AddRangeAsync(IEnumerable<NotificationResponse> entities, CancellationToken cancellationToken = default)
        {
            throw new NotImplementedException();
        }

        public async Task<NotificationResponse> GetByIdAsync(string id, CancellationToken cancellationToken = default)
        {
            var response = await _httpClient.GetAsync(notificationApi + id, cancellationToken);
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync(cancellationToken);
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                return JsonSerializer.Deserialize<NotificationResponse>(content, options) ?? throw new HttpRequestException("notification not found.");
            }
            throw new HttpRequestException("Unable to fetch notification.");
        }

        public Task UpdateAsync(NotificationResponse entity, CancellationToken cancellationToken = default)
        {
            throw new NotImplementedException();
        }

        public Task<IEnumerable<NotificationResponse>> ListAsync(Expression<Func<NotificationResponse, bool>> predicate, CancellationToken cancellationToken = default)
        {
            throw new NotImplementedException();
        }

        public async Task<IEnumerable<NotificationResponse>> ListAllAsync(CancellationToken cancellationToken = default)
        {
            var response = await _httpClient.GetAsync(notificationApi, cancellationToken);
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                return JsonSerializer.Deserialize<IEnumerable<NotificationResponse>>(content, options) ?? new List<NotificationResponse>();
            }
            throw new HttpRequestException("Unable to fetch get all notifications.");
        }

        public Task<bool> MarkNotificationAsReadAsync(string notificationId, CancellationToken cancellationToken = default)
        {
            throw new NotImplementedException();
        }

        public async Task<bool> SendNotificationAsync(NotificationRequest notificationRequest, CancellationToken cancellation = default)
        {
            string data = JsonSerializer.Serialize(notificationRequest);
            var content = new StringContent(data, System.Text.Encoding.UTF8, "application/json");

            HttpResponseMessage response = await _httpClient.PostAsync(notificationApi + "send", content, cancellation);
            if (!response.IsSuccessStatusCode)
                return false;

            var result = await response.Content.ReadAsStringAsync(cancellation);
            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            var apiResponse = JsonSerializer.Deserialize<ApiResponse>(result, options);
            return apiResponse?.Success ?? false;
        }

        public async Task<IEnumerable<NotificationResponse>> GetUniqueNotificationsAsync(CancellationToken cancellationToken = default)
        {
            var response = await _httpClient.GetAsync(notificationApi + "unique", cancellationToken);
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                return JsonSerializer.Deserialize<IEnumerable<NotificationResponse>>(content, options) ?? new List<NotificationResponse>();
            }
            throw new HttpRequestException("Unable to fetch get all notifications.");
        }
    }
}