using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace TraVinhMaps.Web.Admin.Models.EventAndFestivalFeature
{
    public class EventLocation
    {
        public string? Name { get; set; }

        public string? Address { get; set; }

        public Location? location { get; set; }

        public required string MarkerId { get; set; }
    }
}