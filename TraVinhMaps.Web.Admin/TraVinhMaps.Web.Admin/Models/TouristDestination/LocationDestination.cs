using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using TraVinhMaps.Web.Admin.Models.TouristDestination.DataAnnotationsCustoms;

namespace TraVinhMaps.Web.Admin.Models.TouristDestination
{
    public class LocationDestination
    {
        [Required(ErrorMessage = "Type of destination is required")]
        public string? Type { get; set; }
        [ValidateCoordinates]
        public List<double>? Coordinates { get; set; }
    }
}