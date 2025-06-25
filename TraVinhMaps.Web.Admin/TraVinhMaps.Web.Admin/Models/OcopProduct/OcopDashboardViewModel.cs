using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace TraVinhMaps.Web.Admin.Models.OcopProduct
{
    public class OcopDashboardViewModel
    {
        public List<OcopProductAnalytics> Analytics { get; set; } = new();
        public List<OcopProductUserDemographics> UserDemographics { get; set; } = new();
        public List<OcopProductAnalytics> TopProductsByInteractions { get; set; } = new();
        public List<OcopProductAnalytics> TopProductsByFavorites { get; set; } = new();
        public List<OcopProductAnalytics> ComparedProducts { get; set; } = new();
    }
}