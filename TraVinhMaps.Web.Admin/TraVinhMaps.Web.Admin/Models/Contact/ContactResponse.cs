using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace TraVinhMaps.Web.Admin.Models.Contact
{
    public class ContactResponse
    {
        [Phone(ErrorMessage = "Invalid phone number.")]
        public string? Phone { get; set; }
        [EmailAddress(ErrorMessage = "Invalid email address.")]
        public string? Email { get; set; }
        [Url(ErrorMessage = "Invalid website URL.")]
        public string? Website { get; set; }
    }
}