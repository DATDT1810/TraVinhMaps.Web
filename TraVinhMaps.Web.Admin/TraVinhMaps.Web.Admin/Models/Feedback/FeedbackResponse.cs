using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace TraVinhMaps.Web.Admin.Models.Feedback
{
    public class FeedbackResponse
    {
        public string Id { get; set; } = default!;
        public string UserId { get; set; } = default!;
        public string Username { get; set; } = default!;
        public string Content { get; set; } = default!;
        public List<string>? Images { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}