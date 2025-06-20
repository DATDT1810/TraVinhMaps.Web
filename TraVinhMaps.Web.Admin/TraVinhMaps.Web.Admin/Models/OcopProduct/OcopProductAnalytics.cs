using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace TraVinhMaps.Web.Admin.Models.OcopProduct
{
    public class OcopProductAnalytics
    {
        public string Id { get; set; }
        public string ProductName { get; set; }
        public long ViewCount { get; set; }
        public long InteractionCount { get; set; }
        public long WishlistCount { get; set; }
    }
}