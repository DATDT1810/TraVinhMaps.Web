using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TraVinhMaps.Web.Admin.Models.DestinationTypes;

namespace TraVinhMaps.Web.Admin.Services.DestinationTypes
{
    public interface IDestinationTypeService
    {
        Task<IEnumerable<DestinationTypeResponse>> ListAllAsync(CancellationToken cancellationToken = default);
        Task<DestinationTypeResponse> GetByIdAsync(string id);
    }
}