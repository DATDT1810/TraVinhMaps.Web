using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace TraVinhMaps.Web.Admin.Models.DestinationTypes
{
    public class DestinationTypeResponse
    {
        public string Id { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string Name { get; set; }

        public DateTime? UpdateAt { get; set; }

        public bool Status { get; set; } = true;

        public string MarkerId { get; set; }
    }
}