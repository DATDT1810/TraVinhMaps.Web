using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace TraVinhMaps.Web.Admin.Models.TouristDestination
{
    public class DestinationStatsOverview
    {
        public long TotalDestinations { get; set; }
        public long TotalViews { get; set; }
        public long TotalInteractions { get; set; }
        public long TotalFavorites { get; set; }
        public List<DestinationAnalytics> DestinationDetails { get; set; } = default!;
    }
}