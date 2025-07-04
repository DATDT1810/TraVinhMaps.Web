using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TraVinhMaps.Web.Admin.Models.Reply;

namespace TraVinhMaps.Web.Admin.Models.Review
{
    public class ReviewResponse
    {
        public required string Id { get; set; }
        public int Rating { get; set; }
        public List<string>? Images { get; set; }
        public string? Comment { get; set; }
        public string UserId { get; set; }
        public string? UserName { get; set; }
        public string? Avatar { get; set; }
        public string DestinationId { get; set; }
        public string? DestinationName { get; set; }
        public List<ReplyResponse>? Reply { get; set; }
        public required DateTime CreatedAt { get; set; }
    }
}