using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace TraVinhMaps.Web.Admin.Models.CommunityTips
{
    public class CommunityTipsRequest
    {
        public string Title { get; set; }
        public string Content { get; set; }
        public DateTime? UpdateAt { get; set; }
        public bool Status { get; set; }
        public string TagId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}