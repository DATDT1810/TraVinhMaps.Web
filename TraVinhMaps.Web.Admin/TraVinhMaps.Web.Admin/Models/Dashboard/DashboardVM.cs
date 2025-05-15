using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TraVinhMaps.Web.Admin.Models.Users;

namespace TraVinhMaps.Web.Admin.Models.Dashboard
{
    public class DashboardVM
    {
        public long TotalUsers { get; set; }
        public long TotalUserActive { get; set; }
        public long TotalReviews { get; set; }
        public List<UserResponse> RecentUsers { get; set; }
    }
}