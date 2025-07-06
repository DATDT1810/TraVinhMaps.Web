using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace TraVinhMaps.Web.Admin.Models.OcopProduct
{
    public class OcopProductAnalytics
    {
        public string Id { get; set; } = default!;
        public string ProductName { get; set; } = default!;
        public long ViewCount { get; set; }
        public long InteractionCount { get; set; }
        public long FavoriteCount { get; set; }
    }
}