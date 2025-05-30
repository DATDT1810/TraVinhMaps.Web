using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace TraVinhMaps.Web.Admin.Models.TouristDestination
{
    public class OpeningHoursDestination
    {
        [DisplayName("Opening Time")]
        [MinLength(3, ErrorMessage = "Address must be at least 3 characters")]
        [MaxLength(20, ErrorMessage = "Address must be less than or equal to 20 characters")]
        public string? OpenTime { get; set; }
        [DisplayName("Closing Time")]
        [MinLength(3, ErrorMessage = "Address must be at least 3 characters")]
        [MaxLength(20, ErrorMessage = "Address must be less than or equal to 20 characters")]
        public string? CloseTime { get; set; }
    }
}