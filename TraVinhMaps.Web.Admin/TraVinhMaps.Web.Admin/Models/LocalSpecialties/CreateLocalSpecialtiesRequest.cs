using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace TraVinhMaps.Web.Admin.Models.LocalSpecialties
{
    public class CreateLocalSpecialtiesRequest
    {
        public string FoodName { get; set; } = default!;
        public string Description { get; set; } = default!;
        public string TagId { get; set; } = default!;
        public bool Status { get; set; } = true;
    }
}