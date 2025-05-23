using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace TraVinhMaps.Web.Admin.Models.TouristDestination
{
    public class AddDestinationImageRequest
    {
        public string id { get; set; }
        public List<IFormFile> imageFile { get; set; }
    }
}