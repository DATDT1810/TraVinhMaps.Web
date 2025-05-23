using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace TraVinhMaps.Web.Admin.Models.EventAndFestivalFeature
{
    public class CreateEventAndFestivalRequest
    {
        public required string NameEvent { get; set; }
        public string? Description { get; set; }
        public required DateTime StartDate { get; set; }
        public required DateTime EndDate { get; set; }
        public string? Category { get; set; }
        public required List<IFormFile> ImagesFile { get; set; }
        public required EventLocation Location { get; set; }
        public required string TagId { get; set; }
    }
}