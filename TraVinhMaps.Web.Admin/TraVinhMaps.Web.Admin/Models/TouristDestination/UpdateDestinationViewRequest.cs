using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace TraVinhMaps.Web.Admin.Models.TouristDestination
{
    public class UpdateDestinationViewRequest
    {
        public string Id { get; set; }
        [DisplayName("Destination title")]
        [MinLength(2, ErrorMessage = "Title must be at least 2 characters")]
        [MaxLength(100, ErrorMessage = "Title must be less than or equal to 100 characters")]
        [Required(ErrorMessage = "Title of destination is required")]
        public string Name { get; set; }
        [MinLength(10, ErrorMessage = "Description must be at least 10 characters")]
        [MaxLength(3000, ErrorMessage = "Description must be less than or equal to 3000 characters")]
        public string? Description { get; set; }
        [DisplayName("Address of destination")]
        [MinLength(10, ErrorMessage = "Address must be at least 10 characters")]
        [MaxLength(1000, ErrorMessage = "Address must be less than or equal to 1000 characters")]
        [Required(ErrorMessage = "Address of destination is required")]
        public string Address { get; set; }
        public string Type { get; set; }
        [Required(ErrorMessage = "longitude of destination is required")]
        public double longitude { get; set; }
        [Required(ErrorMessage = "latitude of destination is required")]
        public double latitude { get; set; }
        public HistoryStoryUpdateRequest? HistoryStory { get; set; }
        public string DestinationTypeId { get; set; }
        public OpeningHoursDestination? OpeningHours { get; set; }
        public string? Capacity { get; set; }
        public ContactDestination? Contact { get; set; }
        public required string TagId { get; set; }
        public string? Ticket { get; set; }
         public List<string>? Images { get; set; }
    }
}