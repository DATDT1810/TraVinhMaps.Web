using TraVinhMaps.Web.Admin.Models.Users;
using Microsoft.AspNetCore.Http;

namespace TraVinhMaps.Web.Admin.Services.Admin
{
    public interface IAdminService
    {
        Task<AdminProfileResponse> GetAdminProfileAsync(CancellationToken cancellationToken = default);
        Task<bool> ChangePasswordAsync(ChangePasswordRequest model, CancellationToken cancellationToken = default);
        Task<bool> UpdateProfileAsync(AdminProfileUpdateRequest model, CancellationToken cancellationToken = default);
    }
}