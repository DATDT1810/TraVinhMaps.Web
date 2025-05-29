using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace TraVinhMaps.Web.Admin.Models.Roles
{
    public class RoleResponse
    {
        public string Id { get; set; }
        public string RoleName { get; set; }
        public bool RoleStatus { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}