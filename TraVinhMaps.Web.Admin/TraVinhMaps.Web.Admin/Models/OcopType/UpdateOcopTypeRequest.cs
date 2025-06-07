using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace TraVinhMaps.Web.Admin.Models.OcopType
{
    public class UpdateOcopTypeRequest
    {
        public required string Id { get; set; }
        public required string OcopTypeName { get; set; }
        public DateTime? UpdateAt { get; set; }
    }
}