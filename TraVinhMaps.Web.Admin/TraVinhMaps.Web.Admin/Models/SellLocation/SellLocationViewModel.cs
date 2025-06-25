using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace TraVinhMaps.Web.Admin.Models.SellLocation
{
    public class SellLocationViewModel
    {
        public string? Id { get; set; }
        [Required(ErrorMessage = "Location name is required.")]
        [StringLength(100, ErrorMessage = "Location name must not exceed 100 characters.")]
        public string? LocationName { get; set; }
        [Required(ErrorMessage = "Location address is required.")]
        [StringLength(200, ErrorMessage = "Location address must not exceed 200 characters.")]
        public string? LocationAddress { get; set; }
        public string? Type { get; set; }
        public string? MarkerId { get; set; }
        [Required(ErrorMessage = "Longitude is required.")]
        [Range(-180, 180, ErrorMessage = "Longitude must be between -180 and 180.")]
        public double Longitude { get; set; }
        [Required(ErrorMessage = "Latitude is required.")]
        [Range(-90, 90, ErrorMessage = "Latitude must be between -90 and 90.")]
        public double Latitude { get; set; }
    }
}