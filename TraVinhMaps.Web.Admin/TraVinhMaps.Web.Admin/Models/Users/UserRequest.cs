using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace TraVinhMaps.Web.Admin.Models.Users
{
    public class UserRequest
    {
        public string? Id { get; set; }
        public string Email { get; set; } = default!;
        public string Password { get; set; } = default!;
        public string RoleId { get; set; } = default!;
    }
}