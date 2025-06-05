using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace TraVinhMaps.Web.Admin.Models.LocalSpecialties
{
    public class AddImageLocalSpecialtiesRequest
    {
        public string Id { get; set; }
        public List<IFormFile> ImageFile { get; set; }
    }
}