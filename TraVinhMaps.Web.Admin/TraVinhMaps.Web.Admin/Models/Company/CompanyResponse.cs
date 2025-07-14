using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TraVinhMaps.Web.Admin.Models.Contact;
using TraVinhMaps.Web.Admin.Models.Location;

namespace TraVinhMaps.Web.Admin.Models.Company
{
    public class CompanyResponse
    {
        public required string Id { get; set; }
        public required string Name { get; set; }
        public required string Address { get; set; }
        public required List<LocationResponse> Locations { get; set; } 
        public ContactResponse? Contact { get; set; }
        public required DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdateAt { get; set; } = DateTime.UtcNow;
    }
}