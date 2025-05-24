using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TraVinhMaps.Web.Admin.Models;
using TraVinhMaps.Web.Admin.Models.Tags;

namespace TraVinhMaps.Web.Admin.Services.Tags
{
    public interface ITagService
    {
        Task<TagsResponse> GetByIdAsync(string id, CancellationToken cancellationToken = default);
        Task<IEnumerable<TagsResponse>> ListAllAsync(CancellationToken cancellationToken = default);
    }
}