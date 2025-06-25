using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using TraVinhMaps.Web.Admin.Models.Company;

namespace TraVinhMaps.Web.Admin.Services.Company
{
    public interface ICompanyService
    {
        Task<IEnumerable<CompanyResponse>> ListAllAsync(CancellationToken cancellationToken = default);
        Task<CompanyResponse> GetByIdAsync(string id, CancellationToken cancellationToken = default);
        Task<CreateCompanyResponse<CompanyResponse>> AddAsync(CompanyViewModel entity, CancellationToken cancellationToken = default);
        Task<CompanyMessage> UpdateAsync(UpdateCompanyRequest entity, CancellationToken cancellationToken = default);
        Task<long> CountAsync(Expression<Func<CompanyResponse, bool>> predicate = null, CancellationToken cancellationToken = default);
    }
}