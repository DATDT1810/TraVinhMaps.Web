using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace TraVinhMaps.Web.Admin.Models.OcopType
{
    public class OcopTypeResponse
    {
        public required string Id { get; set; }
        public required string OcopTypeName { get; set; }
        public required bool OcopTypeStatus { get; set; }
        public required DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdateAt { get; set; }
    }
}