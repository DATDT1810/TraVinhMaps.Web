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

        // Overview Statistics for All Destinations
        Task<DestinationStatsOverview> GetDestinationStatsOverviewAsync(string timeRange = "month", DateTime? startDate = null, DateTime? endDate = null, CancellationToken cancellationToken = default);
        // Top Destinations by Number of Likes
        Task<IEnumerable<DestinationAnalytics>> GetTopDestinationsByFavoritesAsync(int top = 5, string timeRange = "month", DateTime? startDate = null, DateTime? endDate = null, CancellationToken cancellationToken = default);
        // Top Destinations by Number of Views
        Task<IEnumerable<DestinationAnalytics>> GetTopDestinationsByViewsAsync(int topCount = 5, string timeRange = "month", DateTime? startDate = null, DateTime? endDate = null, CancellationToken cancellationToken = default);
        // User Analysis by Age Group and Hometown
        Task<IEnumerable<DestinationUserDemographics>> GetUserDemographicsAsync(string timeRange = "month", DateTime? startDate = null, DateTime? endDate = null, CancellationToken cancellationToken = default);
        // Destination Comparison
        Task<IEnumerable<DestinationAnalytics>> CompareDestinationsAsync(IEnumerable<string> destinationIds, string timeRange = "month", DateTime? startDate = null, DateTime? endDate = null, CancellationToken cancellationToken = default);
    }
}