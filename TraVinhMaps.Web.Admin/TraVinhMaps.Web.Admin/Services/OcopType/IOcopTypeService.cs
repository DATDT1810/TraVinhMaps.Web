using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using TraVinhMaps.Web.Admin.Models.OcopType;

namespace TraVinhMaps.Web.Admin.Services.OcopType
{
    public interface IOcopTypeService
    {
        Task<OcopTypeResponse> GetByIdAsync(string id, CancellationToken cancellationToken = default);
        Task<IEnumerable<OcopTypeResponse>> ListAllAsync(CancellationToken cancellationToken = default);
        Task<CreateOcopTypeResponse<OcopTypeResponse>> AddAsync(CreateOcopTypeRequest entity, CancellationToken cancellationToken = default);
        Task<OcopTypeMessage> UpdateAsync(UpdateOcopTypeRequest entity, CancellationToken cancellationToken = default);
        Task<long> CountAsync(Expression<Func<OcopTypeResponse, bool>> predicate = null, CancellationToken cancellationToken = default);
    }
}