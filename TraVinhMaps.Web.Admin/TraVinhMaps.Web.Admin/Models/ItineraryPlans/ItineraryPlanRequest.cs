using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace TraVinhMaps.Web.Admin.Models.ItineraryPlans
{
    public class ItineraryPlanRequest
    {
        public required string Name { get; set; }
        public string? Duration { get; set; }
        public HashSet<string>? Locations { get; set; }
        public string? EstimatedCost { get; set; }
    }
}