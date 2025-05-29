using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using TraVinhMaps.Web.Admin.Models.TouristDestination.DataAnnotationsCustoms;

namespace TraVinhMaps.Web.Admin.Models.TouristDestination
{
    public class TouristDestinationRequest
    {
        [DisplayName("Destination title")]
        [MinLength(2, ErrorMessage = "Title must be at least 2 characters")]
        [MaxLength(100, ErrorMessage = "Title must be less than or equal to 100 characters")]
        [Required(ErrorMessage = "Title of destination is required")]
        public string Name { get; set; }
        public double? AvarageRating { get; set; }
        [DisplayName("Description")]
        public string? Description { get; set; }
        [DisplayName("Address of destination")]
        [MinLength(10, ErrorMessage = "Address must be at least 10 characters")]
        [MaxLength(150, ErrorMessage = "Address must be less than or equal to 150 characters")]
        [Required(ErrorMessage = "Address of destination is required")]
        public string Address { get; set; }
        [DisplayName("Address of destination")]
        [Required(ErrorMessage = "Location of destination is required")]
        public LocationDestination Location { get; set; }
        [MinFilesRequired(1, ErrorMessage = "At least one image file is required.")]
        public List<IFormFile> ImagesFile { get; set; }
        public HistoryStoryRequest? HistoryStory { get; set; }
        public string DestinationTypeId { get; set; }
        public OpeningHoursDestination? OpeningHours { get; set; }

        [MaxLength(10, ErrorMessage = "Capacity must be less than or equal to 10 characters")]
        public string? Capacity { get; set; }
        public ContactDestination? Contact { get; set; }
        public string TagId { get; set; }
        [MaxLength(10, ErrorMessage = "Ticket length must be less than or equal to 10 characters")]
        public string? Ticket { get; set; }
    }
}