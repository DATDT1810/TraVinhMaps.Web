using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace TraVinhMaps.Web.Admin.Models.ItineraryPlans
{
    public class ItineraryPlanResponse
    {
        public required string Id { get; set; }
        public required DateTime CreatedAt { get; set; }
        public required string Name { get; set; }
        public string? Duration { get; set; }
        public List<string>? Locations { get; set; }
        public string? EstimatedCost { get; set; }

        public required bool Status { get; set; } = true;
        public DateTime? UpdateAt { get; set; }
    }
}