using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TraVinhMaps.Web.Admin.Models.TouristDestination;

namespace TraVinhMaps.Web.Admin.Services.TouristDestination
{
    public interface IDestinationService
    {
        Task<IEnumerable<TouristDestinationResponse>> ListAllAsync(CancellationToken cancellationToken = default);
        Task<TouristDestinationResponse> CreateDestination(TouristDestinationRequest touristDestinationRequest);
        Task<List<String>> AddDestinationImage(AddDestinationImageRequest addDestinationImageRequest);
        Task<List<String>> AddDestinationHistoryImage(AddDestinationImageRequest addDestinationImageRequest);
        Task<bool> DeleteDestinationImage(DeleteDestinationImageRequest deleteDestinationImageRequest);
        Task<bool> DeleteDestinationHistoryImage(DeleteDestinationImageRequest deleteDestinationImageRequest);
        Task<TouristDestinationResponse> UpdateDestination(UpdateDestinationRequest updateDestinationRequest);
        Task<bool> DeleteDestination(string id);
        Task<bool> RestoreDestination(string id);
        Task<TouristDestinationResponse> GetDestinationById(string id);
    }
}