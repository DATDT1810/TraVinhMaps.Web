using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace TraVinhMaps.Web.Admin.Models.EventAndFestivalFeature
{
    public class AddImageEventAndFestivalRequest
    {
        public string id { get; set; }
        public List<IFormFile> imageFile { get; set; }
    }
}