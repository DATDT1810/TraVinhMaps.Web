using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace TraVinhMaps.Web.Admin.Models.Admins
{
    public class AdminResponse
    {
        public string Id { get; set; } = default!;
        public string PhoneNumber { get; set; } = default!;
        public string Username { get; set; } = default!;
        public string Email { get; set; } = default!;
        public string Password { get; set; } = default!;
        public string RoleId { get; set; } = default!;
        public bool Status { get; set; }
        public required DateTime CreatedAt { get; set; } 
    }
}