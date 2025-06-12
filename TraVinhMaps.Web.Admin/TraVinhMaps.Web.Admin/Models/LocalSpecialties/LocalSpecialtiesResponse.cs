using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace TraVinhMaps.Web.Admin.Models.LocalSpecialties
{
    public class LocalSpecialtiesResponse
    {
        public required string Id { get; set; }
        public required string FoodName { get; set; }
        public string? Description { get; set; }
        public List<string>? Images { get; set; }
        public required List<LocalSpecialtyLocation> Locations { get; set; }
        public required string TagId { get; set; }
        public required bool Status { get; set; }
        public required DateTime CreatedAt { get; set; }
        public DateTime? UpdateAt { get; set; }
    }

    public class LocalSpecialtyLocation
    {
        public string LocationId { get; set; }
        public required string Name { get; set; }
        public required string Address { get; set; }
        public required Location Location { get; set; }
    }
    public class Location
    {
        public string? Type { get; set; }
        public List<double>? Coordinates { get; set; }
    }
}