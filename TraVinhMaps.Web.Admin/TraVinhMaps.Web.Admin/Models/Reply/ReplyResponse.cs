using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace TraVinhMaps.Web.Admin.Models.Reply
{
    public class ReplyResponse
    {
        public string? Content { get; set; }
        public List<string>? Images { get; set; }
        public required string UserId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}