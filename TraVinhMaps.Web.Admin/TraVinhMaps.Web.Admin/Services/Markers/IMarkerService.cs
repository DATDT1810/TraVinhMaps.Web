using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TraVinhMaps.Web.Admin.Models.Markers;

namespace TraVinhMaps.Web.Admin.Services.Markers
{
    public interface IMarkerService
    {
        Task<IEnumerable<MarkerResponse>> ListAllAsync(CancellationToken cancellationToken = default);
        Task<MarkerResponse> GetMarkerById(string id);
        Task<MarkerResponse> CreateMarker(CreateMarkerRequest createMarkerRequest);
        Task<MarkerResponse> UpdateMarker(UpdateMarkerRequest updateMarkerRequest);
        Task<string> UploadImageAsync(EditMarkerPictureRequest editMarkerPictureRequest);
        Task<bool> DeleteMarker(string id);
        Task<bool> RestoreMarker(string id);
    }
}