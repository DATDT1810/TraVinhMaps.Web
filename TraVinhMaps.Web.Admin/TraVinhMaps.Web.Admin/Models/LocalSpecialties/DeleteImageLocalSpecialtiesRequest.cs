using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace TraVinhMaps.Web.Admin.Models.LocalSpecialties
{
    public class DeleteImageLocalSpecialtiesRequest
    {
        public string Id { get; set; }
        public string ImageUrl { get; set; }
    }
}