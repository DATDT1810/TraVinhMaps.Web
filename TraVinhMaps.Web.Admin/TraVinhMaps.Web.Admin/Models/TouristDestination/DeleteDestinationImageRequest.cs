using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace TraVinhMaps.Web.Admin.Models.TouristDestination
{
    public class DeleteDestinationImageRequest
    {
        public string id { get; set; }
        public string imageUrl { get; set; }
    }
}