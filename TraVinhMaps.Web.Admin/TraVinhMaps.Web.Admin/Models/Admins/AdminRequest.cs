using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace TraVinhMaps.Web.Admin.Models.Admins
{
    public class AdminRequest
    {
        public string RoleId { get; set; }
        [Required]
        [EmailAddress]  
        public string Email { get; set; }                  
    }
}       