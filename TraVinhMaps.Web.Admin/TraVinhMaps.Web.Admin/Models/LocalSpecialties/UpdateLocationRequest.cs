using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace TraVinhMaps.Web.Admin.Models.LocalSpecialties
{
    public class UpdateLocationRequest
    {
        public string LocationId { get; set; }
        public string MarkerId { get; set; }
        public string Name { get; set; }
        public string Address { get; set; }
        public LocationsRequest Location { get; set; }
    }

    public class LocationsRequest
    {
        public string? Type { get; set; }
        public List<double>? Coordinates { get; set; }
    }
}