using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using TraVinhMaps.Web.Admin.Models.Admins;
using TraVinhMaps.Web.Admin.Models.Users;

namespace TraVinhMaps.Web.Admin.Services.Admins
{
    public interface IAdminService
    {
        Task<AdminResponse> GetByIdAsync(string id, CancellationToken cancellationToken = default);
        Task<IEnumerable<AdminResponse>> ListAllAsync(CancellationToken cancellationToken = default);
        Task<IEnumerable<AdminResponse>> ListAsync(Expression<Func<AdminResponse, bool>> predicate, CancellationToken cancellationToken = default);
        Task<AdminRequest> AddAsync(AdminRequest entity, CancellationToken cancellationToken = default);
        Task<UpdateAdminRequest> UpdateAsync(UpdateAdminRequest entity, CancellationToken cancellationToken = default);
        Task<bool> DeleteAdmin(string id, CancellationToken cancellationToken = default);
        Task<bool> RestoreAdmin(string id, CancellationToken cancellationToken = default);
    }
}