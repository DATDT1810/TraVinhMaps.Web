using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace TraVinhMaps.Web.Admin.Models.Admins
{
    public class UpdateAdminRequest
    {
        public string Id { get; set; }
        public string PhoneNumber { get; set; } = default!;
        public string Username { get; set; } = default!;
        public string Password { get; set; } = default!;
    }
}