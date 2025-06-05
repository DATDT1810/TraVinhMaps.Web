using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using Microsoft.VisualStudio.Web.CodeGenerators.Mvc.Templates.Blazor;
using TraVinhMaps.Web.Admin.Models.LocalSpecialties;

namespace TraVinhMaps.Web.Admin.Services.LocalSpecialties
{
    public interface ILocalSpecialtiesService
    {
        Task<LocalSpecialtiesResponse> GetByIdAsync(string id, CancellationToken cancellationToken = default);
        Task<IEnumerable<LocalSpecialtiesResponse>> ListAllAsync(CancellationToken cancellationToken = default);

        Task<IEnumerable<LocalSpecialtiesResponse>> ListAsync(Expression<Func<LocalSpecialtiesResponse, bool>> predicate, CancellationToken cancellationToken = default);
        Task<LocalSpecialtiesResponse> AddAsync(CreateSpecialtyViewModel entity, CancellationToken cancellationToken = default);
        Task<IEnumerable<LocalSpecialtiesResponse>> AddRangeAsync(IEnumerable<CreateSpecialtyViewModel> entities, CancellationToken cancellationToken = default);
        Task UpdateAsync(UpdateLocalSpecialtiesRequest entity, CancellationToken cancellationToken = default);
        Task DeleteAsync(LocalSpecialtiesResponse entity, CancellationToken cancellationToken = default);
        Task<LocalSpecialtiesResponse> GetAsyns(Expression<Func<LocalSpecialtiesResponse, bool>> predicate, CancellationToken cancellationToken = default);
        Task<List<string>> AddLocalSpecialtiesImage(AddImageLocalSpecialtiesRequest request, CancellationToken cancellationToken = default);
        Task<string> DeleteLocalSpecialtiesImage(string id, string imageUrl, CancellationToken cancellationToken = default);
        Task<bool> RestoreLocalSpecialtiesAsync(string id, CancellationToken cancellationToken = default);
        Task<bool> DeleteLocalSpecialtiesAsync(string id, CancellationToken cancellationToken = default);

        // (Sell Location)
        Task<LocalSpecialtyLocation> AddSellLocationAsync(string id, AddLocationRequest request, CancellationToken cancellationToken = default);
        Task<bool> RemoveSellLocationAsync(string id, string sellLocationId, CancellationToken cancellationToken = default);
        Task<LocalSpecialtyLocation> UpdateSellLocationAsync(string id, UpdateLocationRequest request, CancellationToken cancellationToken = default);
    }
}