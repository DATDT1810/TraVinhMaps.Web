using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using TraVinhMaps.Web.Admin.Models.TouristDestination.DataAnnotationsCustoms;

namespace TraVinhMaps.Web.Admin.Models.TouristDestination
{
    public class TouristDestinationViewRequest
    {
        [DisplayName("Destination title")]
        [MinLength(2, ErrorMessage = "Title must be at least 2 characters")]
        [MaxLength(100, ErrorMessage = "Title must be less than or equal to 100 characters")]
        [Required(ErrorMessage = "Title of destination is required")]
        public string Name { get; set; }
        [DisplayName("Description")]
        [MinLength(10, ErrorMessage = "Description must be at least 10 characters")]
        [MaxLength(3000, ErrorMessage = "Description must be less than or equal to 3000 characters")]
        public string? Description { get; set; }
        [DisplayName("Address of destination")]
        [MinLength(10, ErrorMessage = "Address must be at least 10 characters")]
        [MaxLength(150, ErrorMessage = "Address must be less than or equal to 150 characters")]
        [Required(ErrorMessage = "Address of destination is required")]
        public string Address { get; set; }
        public string Type { get; set; }
        [Required(ErrorMessage = "longitude of destination is required")]
        public double longitude { get; set; }
        [Required(ErrorMessage = "latitude of destination is required")]
        public double latitude { get; set; }
        [MinFilesRequired(1, ErrorMessage = "At least one image file is required.")]
        [AllowedImageExtensions(new[] { ".jpg", ".jpeg", ".png", ".gif" }, ErrorMessage = "Only JPG, JPEG, PNG, and GIF files are allowed.")]
        public List<IFormFile> ImagesFile { get; set; }
        public HistoryStoryRequest? HistoryStory { get; set; }
        public string DestinationTypeId { get; set; }
        public OpeningHoursDestination? OpeningHours { get; set; }
        [MinLength(3, ErrorMessage = "Capacity must be at least 3 characters")]
        [MaxLength(30, ErrorMessage = "Capacity must be less than or equal to 30 characters")]
        public string? Capacity { get; set; }
        public ContactDestination? Contact { get; set; }
        [MinLength(3, ErrorMessage = "Ticket must be at least 3 characters")]
        [MaxLength(30, ErrorMessage = "Ticket must be less than or equal to 30 characters")]
        public string? Ticket { get; set; }
    }
}