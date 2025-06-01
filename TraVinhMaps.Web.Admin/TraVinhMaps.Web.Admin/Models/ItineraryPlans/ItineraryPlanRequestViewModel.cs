using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace TraVinhMaps.Web.Admin.Models.ItineraryPlans
{
    public class ItineraryPlanRequestViewModel
    {
        [Required(ErrorMessage = "Name is required.")]
        [StringLength(100, ErrorMessage = "Name cannot be longer than 100 characters.")]
        public string Name { get; set; }
        public string? Duration { get; set; }
        public string Locations { get; set; }
        public string? EstimatedCost { get; set; }
    }
}