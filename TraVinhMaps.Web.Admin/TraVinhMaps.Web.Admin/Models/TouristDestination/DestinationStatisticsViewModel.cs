using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace TraVinhMaps.Web.Admin.Models.TouristDestination
{
    public class DestinationStatisticsViewModel
    {
        public DestinationStatsOverview DestinationStatsOverview { get; set; } = new();
        public List<DestinationUserDemographics> UserDemographics { get; set; } = new();
        public List<DestinationAnalytics> TopDestinationsByViews { get; set; } = new();
        public List<DestinationAnalytics> TopDestinationByFavorites { get; set; } = new();
        public List<DestinationAnalytics> CompareDestination { get; set; } = new();
    }
}