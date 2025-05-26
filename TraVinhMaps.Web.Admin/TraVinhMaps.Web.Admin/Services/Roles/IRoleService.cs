using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TraVinhMaps.Web.Admin.Models.Roles;

namespace TraVinhMaps.Web.Admin.Services.Roles
{
    public interface IRoleService
    {
        Task<RoleResponse> GetByIdAsync(string id, CancellationToken cancellationToken = default);
        Task<IEnumerable<RoleResponse>> ListAllAsync(CancellationToken cancellationToken = default);
    }
}