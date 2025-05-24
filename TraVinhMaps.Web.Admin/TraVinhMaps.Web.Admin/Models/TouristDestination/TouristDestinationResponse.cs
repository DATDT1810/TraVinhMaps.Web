using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace TraVinhMaps.Web.Admin.Models.TouristDestination
{
    public class TouristDestinationResponse
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public double? AvarageRating { get; set; }
        public string? Description { get; set; }
        public string Address { get; set; }
        public LocationDestination Location { get; set; }
        public List<string>? Images { get; set; }
        public HistoryStoryRespont? HistoryStory { get; set; }
        public DateTime? UpdateAt { get; set; }
        public string DestinationTypeId { get; set; }
        public OpeningHoursDestination? OpeningHours { get; set; }
        public string? Capacity { get; set; }
        public ContactDestination? Contact { get; set; }
        public string TagId { get; set; }
        public string? Ticket { get; set; }
        public int? FavoriteCount { get; set; } = 0;
        public bool status { get; set; } = true;
        public DateTime CreatedAt { get; set; }
    }
}