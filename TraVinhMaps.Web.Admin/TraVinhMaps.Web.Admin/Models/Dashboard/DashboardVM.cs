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
        public List<UserResponse> RecentUsers { get; set; } = new List<UserResponse>();
        public List<UserStatisticVM> UserStatistics { get; set; } = new List<UserStatisticVM>();
        public Dictionary<string, Dictionary<string, int>> PerformanceByTag { get; set; } = new Dictionary<string, Dictionary<string, int>>();
    }

    public class UserStatisticVM
    {
        public Dictionary<string, int> Age { get; set; } = new Dictionary<string, int>();
        public Dictionary<string, int> Hometown { get; set; } = new Dictionary<string, int>();
        public Dictionary<string, int> Gender { get; set; } = new Dictionary<string, int>();
        public Dictionary<string, int> Status { get; set; } = new Dictionary<string, int>();
        public Dictionary<string, int> Time { get; set; } = new Dictionary<string, int>();
    }
}