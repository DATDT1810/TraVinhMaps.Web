using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace TraVinhMaps.Web.Admin.Models.CommunityTips
{
    public class CommunityTipsResponse
    {
        public string Id { get; set; } = default!;
        public string Title { get; set; } = default!;
        public string Content { get; set; } = default!;
        public DateTime? UpdateAt { get; set; } = DateTime.UtcNow;
        public bool Status { get; set; }
        public string TagId { get; set; } = default!;
        public DateTime CreatedAt { get; set; }
        public string TagName { get; set; } = default!;
    }
}