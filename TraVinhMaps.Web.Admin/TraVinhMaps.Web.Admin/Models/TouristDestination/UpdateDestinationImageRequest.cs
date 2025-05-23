using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace TraVinhMaps.Web.Admin.Models.TouristDestination
{
    public class UpdateDestinationImageRequest
    {
        public required string Id { get; set; }
        public required string Name { get; set; }
        public double? AvarageRating { get; set; }
        public string? Description { get; set; }
        public required string Address { get; set; }
        public required LocationDestination Location { get; set; }
        public HistoryStoryUpdateDestionRequest? HistoryStory { get; set; }
        public required string DestinationTypeId { get; set; }
        public OpeningHoursDestination? OpeningHours { get; set; }
        public string? Capacity { get; set; }
        public ContactDestination? Contact { get; set; }
        public required string TagId { get; set; }
        public string? Ticket { get; set; }
    }
}