using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace TraVinhMaps.Web.Admin.Models.EventAndFestivalFeature
{
    public class Location
    {
        public string? Type { get; set; }
        public List<double>? Coordinates { get; set; }
    }
}