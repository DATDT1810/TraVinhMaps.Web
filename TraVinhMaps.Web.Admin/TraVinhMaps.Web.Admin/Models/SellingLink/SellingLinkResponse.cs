using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace TraVinhMaps.Web.Admin.Models.SellingLink
{
    public class SellingLinkResponse
    {
        public required string Id { get; set; }
        public required string ProductId { get; set; }
        public required string Title { get; set; }
        public required string Link { get; set; }
        public DateTime? UpdateAt { get; set; }
        public required DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}