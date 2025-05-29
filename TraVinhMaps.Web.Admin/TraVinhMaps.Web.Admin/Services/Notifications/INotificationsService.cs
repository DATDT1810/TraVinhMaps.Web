using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using TraVinhMaps.Web.Admin.Models.Notifications;

namespace TraVinhMaps.Web.Admin.Services.Notifications
{
    public interface INotificationsService
    {
        Task<NotificationResponse> GetByIdAsync(string id, CancellationToken cancellationToken = default);
        Task<IEnumerable<NotificationResponse>> ListAllAsync(CancellationToken cancellationToken = default);
        Task<IEnumerable<NotificationResponse>> ListAsync(Expression<Func<NotificationResponse, bool>> predicate, CancellationToken cancellationToken = default);
        Task<NotificationResponse> AddAsync(NotificationResponse entity, CancellationToken cancellationToken = default);
        Task<IEnumerable<NotificationResponse>> AddRangeAsync(IEnumerable<NotificationResponse> entities, CancellationToken cancellationToken = default);
        Task UpdateAsync(NotificationResponse entity, CancellationToken cancellationToken = default);
        Task DeleteAsync(NotificationResponse entity, CancellationToken cancellationToken = default);
        Task<long> CountAsync(Expression<Func<NotificationResponse, bool>> predicate = null, CancellationToken cancellationToken = default);
        Task<NotificationResponse> GetAsyns(Expression<Func<NotificationResponse, bool>> predicate, CancellationToken cancellationToken = default);
        Task<bool> SendNotificationAsync(NotificationRequest notificationRequest, CancellationToken cancellation = default);
        Task<bool> MarkNotificationAsReadAsync(string notificationId, CancellationToken cancellationToken = default);
        Task<IEnumerable<NotificationResponse>> GetNotificationsByUserIdAsync(string userId, bool? isRead = null, CancellationToken cancellationToken = default);
        Task<IEnumerable<NotificationResponse>> GetUniqueNotificationsAsync(CancellationToken cancellationToken = default);
    }
}