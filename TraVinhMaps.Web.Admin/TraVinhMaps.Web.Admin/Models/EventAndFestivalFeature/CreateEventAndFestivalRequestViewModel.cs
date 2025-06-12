using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using TraVinhMaps.Web.Admin.Models.EventAndFestivalFeature.DataAnnotationsCustoms;

namespace TraVinhMaps.Web.Admin.Models.EventAndFestivalFeature
{
    public class CreateEventAndFestivalRequestViewModel
    {
        [Required(ErrorMessage = "Event name is required.")]
        [StringLength(200, ErrorMessage = "Event name cannot exceed 200 characters.")]
        public required string NameEvent { get; set; }
        [StringLength(3000, ErrorMessage = "Description cannot exceed 3000 characters.")]
        public string? Description { get; set; }
        [Required(ErrorMessage = "Start date is required.")]
        [DateNotInPast("MM/dd/yyyy")]
        public string StartDate { get; set; }
        [Required(ErrorMessage = "End date is required.")]
        public string EndDate { get; set; }
        public string? Category { get; set; }
        [Required(ErrorMessage = "At least one image file is required.")]
        public required List<IFormFile> ImagesFile { get; set; }
        [StringLength(200, ErrorMessage = "Location name cannot exceed 200 characters.")]
        public string? Name { get; set; }
        [StringLength(300, ErrorMessage = "Address cannot exceed 300 characters.")]
        public string? Address { get; set; }
        public string Type { get; set; }
        [Required(ErrorMessage = "longitude of destination is required")]
        public double longitude { get; set; }
        [Required(ErrorMessage = "latitude of destination is required")]
        public double latitude { get; set; }
    }
}