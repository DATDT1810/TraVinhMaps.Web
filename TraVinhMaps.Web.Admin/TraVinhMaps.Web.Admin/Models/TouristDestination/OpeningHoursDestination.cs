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
        public string? OpenTime { get; set; }
        [DisplayName("Closing Time")]
        public string? CloseTime { get; set; }
    }
}