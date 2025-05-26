using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace TraVinhMaps.Web.Admin.Models.EventAndFestivalFeature
{
    public class CreateEventAndFestivalRequest
    {
        [Required(ErrorMessage = "Event name is required.")]
        [StringLength(200, ErrorMessage = "Event name cannot exceed 200 characters.")]
        public string NameEvent { get; set; }
        [StringLength(3000, ErrorMessage = "Description cannot exceed 3000 characters.")]
        public string? Description { get; set; }
        public required DateTime StartDate { get; set; }
        public required DateTime EndDate { get; set; }
        public string? Category { get; set; }
        public required List<IFormFile> ImagesFile { get; set; }
        public required EventLocation Location { get; set; }
        public required string TagId { get; set; }
    }
}