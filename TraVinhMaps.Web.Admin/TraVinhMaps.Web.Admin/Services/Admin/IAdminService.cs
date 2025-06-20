﻿using System.Linq.Expressions;
using TraVinhMaps.Web.Admin.Models.Admins;
using TraVinhMaps.Web.Admin.Models.Users;

namespace TraVinhMaps.Web.Admin.Services.Admin
{
    public interface IAdminService
    {
        Task<AdminProfileResponse> GetAdminProfileAsync(CancellationToken cancellationToken = default);
        Task<bool> ChangePasswordAsync(ChangePasswordRequest model, CancellationToken cancellationToken = default);
        Task<bool> UpdateProfileAsync(AdminProfileUpdateRequest model, CancellationToken cancellationToken = default);
        Task<AdminResponse> GetByIdAsync(string id, CancellationToken cancellationToken = default);
        Task<IEnumerable<AdminResponse>> ListAllAsync(CancellationToken cancellationToken = default);
        Task<IEnumerable<AdminResponse>> ListAsync(Expression<Func<AdminResponse, bool>> predicate, CancellationToken cancellationToken = default);
        Task<AdminRequest> AddAsync(AdminRequest entity, CancellationToken cancellationToken = default);
        // Task<UpdateAdminRequest> UpdateAsync(UpdateAdminRequest entity, CancellationToken cancellationToken = default);
        Task<bool> DeleteAdmin(string id, CancellationToken cancellationToken = default);
        Task<bool> RestoreAdmin(string id, CancellationToken cancellationToken = default);
        // Get setting profile admin
        Task<SettingProfileResponse> GetSettingProfileAsync(CancellationToken cancellationToken = default);
    }
}