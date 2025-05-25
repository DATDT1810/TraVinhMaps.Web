using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using TraVinhMaps.Web.Admin.Models.CommunityTips;

namespace TraVinhMaps.Web.Admin.Services.CommunityTips
{
    public interface ICommunityTipsService
    {
        Task<CommunityTipsResponse> GetByIdAsync(string id, CancellationToken cancellationToken = default);
        Task<IEnumerable<CommunityTipsResponse>> ListAllAsync(CancellationToken cancellationToken = default);
        Task<IEnumerable<CommunityTipsResponse>> ListAsync(Expression<Func<CommunityTipsRequest, bool>> predicate, CancellationToken cancellationToken = default);
        Task<CommunityTipsRequest> AddAsync(CommunityTipsRequest entity, CancellationToken cancellationToken = default);
        Task<IEnumerable<CommunityTipsRequest>> AddRangeAsync(IEnumerable<CommunityTipsRequest> entities, CancellationToken cancellationToken = default);
        Task UpdateAsync(CommunityTipsResponse entity, CancellationToken cancellationToken = default);
        Task DeleteAsync(CommunityTipsRequest entity, CancellationToken cancellationToken = default);
        Task DeleteTipAsync(string id, CancellationToken cancellationToken = default);
        Task<bool> RestoreTipAsync(string id, CancellationToken cancellationToken = default);
        Task<long> CountAsync(Expression<Func<CommunityTipsRequest, bool>> predicate = null, CancellationToken cancellationToken = default);
    }
}