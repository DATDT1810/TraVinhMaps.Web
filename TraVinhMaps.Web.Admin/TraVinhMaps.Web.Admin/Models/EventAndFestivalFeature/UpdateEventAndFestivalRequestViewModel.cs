using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using TraVinhMaps.Web.Admin.Models.EventAndFestivalFeature.DataAnnotationsCustoms;

namespace TraVinhMaps.Web.Admin.Models.EventAndFestivalFeature
{
    public class UpdateEventAndFestivalRequestViewModel
    {
        public string Id { get; set; }
        [Required(ErrorMessage = "Event name is required.")]
        [StringLength(200, ErrorMessage = "Event name cannot exceed 200 characters.")]
        public string NameEvent { get; set; }
        [StringLength(3000, ErrorMessage = "Description cannot exceed 3000 characters.")]
        public string? Description { get; set; }
        [Required(ErrorMessage = "Start date is required.")]
        [DateNotInPast("MM/dd/yyyy")]
        public string StartDate { get; set; }
        [Required(ErrorMessage = "End date is required.")]
        public string EndDate { get; set; }
        public string? Category { get; set; }
        [StringLength(200, ErrorMessage = "Location name cannot exceed 200 characters.")]
        public string? Name { get; set; }
        [StringLength(300, ErrorMessage = "Address cannot exceed 300 characters.")]
        public string? Address { get; set; }
        public string? Type { get; set; }
        [Required(ErrorMessage = "Longitude of destination is required")]
        public double longitude { get; set; }
        [Required(ErrorMessage = "Latitude of destination is required")]
        public double latitude { get; set; }
        public List<string>? Images { get; set; }
    }
}