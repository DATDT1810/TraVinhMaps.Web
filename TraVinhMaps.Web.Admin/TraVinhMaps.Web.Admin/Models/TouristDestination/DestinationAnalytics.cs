using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace TraVinhMaps.Web.Admin.Models.TouristDestination
{
    public class DestinationAnalytics
    {
        public string Id { get; set; } = default!;
        public string LocationName { get; set; } = default!;
        public long ViewCount { get; set; }
        public long InteractionCount { get; set; }
        public long FavoriteCount { get; set; }
    }
}