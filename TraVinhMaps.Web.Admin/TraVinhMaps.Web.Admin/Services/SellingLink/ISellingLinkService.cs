using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using TraVinhMaps.Web.Admin.Models.SellingLink;

namespace TraVinhMaps.Web.Admin.Services.SellingLink
{
    public interface ISellingLinkService
    {
        Task<SellingLinkResponse> GetByIdAsync(string id, CancellationToken cancellationToken = default);
        Task<CreateSellingLinkResponse<SellingLinkResponse>> AddAsync(CreateSellingLinkRequest entity, CancellationToken cancellationToken = default);
        Task<SellingLinkMessage> DeleteAsync(SellingLinkResponse entity, CancellationToken cancellationToken = default);
        Task<long> CountAsync(Expression<Func<SellingLinkResponse, bool>> predicate = null, CancellationToken cancellationToken = default);
    }
}