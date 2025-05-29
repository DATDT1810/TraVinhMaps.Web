using TraVinhMaps.Web.Admin.Models.Users;

namespace TraVinhMaps.Web.Admin.Services.Users
{
    public interface IUserService
    {
        Task<UserResponse> GetByIdAsync(string id, CancellationToken cancellationToken = default);
        Task<IEnumerable<UserResponse>> ListAllAsync(CancellationToken cancellationToken = default);
        Task<IEnumerable<UserResponse>> ListAsync(Func<UserResponse, bool> predicate, CancellationToken cancellationToken = default);
        Task<UserResponse> AddAsync(UserResponse entity, CancellationToken cancellationToken = default);
        Task<IEnumerable<UserResponse>> AddRangeAsync(IEnumerable<UserResponse> entities, CancellationToken cancellationToken = default);
        Task UpdateAsync(UserResponse entity, CancellationToken cancellationToken = default);
        Task DeleteAsync(UserResponse entity, CancellationToken cancellationToken = default);
        Task<long> CountAsync(Func<UserResponse, bool> predicate = null, CancellationToken cancellationToken = default);
        Task<long> CountAllUsersAsync(CancellationToken cancellationToken = default);
        Task<long> CountActiveUsersAsync(CancellationToken cancellationToken = default);
        Task<bool> DeleteUser(string id, CancellationToken cancellationToken = default);
        Task<bool> RestoreUser(string id, CancellationToken cancellationToken = default);
        Task<List<UserResponse>> GetRecentUsersAsync(int count, CancellationToken cancellationToken = default);
        Task<UserResponse> AddAdminAsync(UserRequest request, CancellationToken cancellationToken = default);
    }
}