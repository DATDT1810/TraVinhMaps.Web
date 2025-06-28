using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace TraVinhMaps.Web.Admin.Models.TouristDestination
{
    public class DestinationUserDemographics
    {
        public string Id { get; set; } = default!;
        public string LocationName { get; set; } = default!;
        public string AgeGroup { get; set; } = default!;
        public string Hometown { get; set; } = default!;
        public long UserCount { get; set; }
    }
}