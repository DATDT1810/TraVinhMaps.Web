using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace TraVinhMaps.Web.Admin.Models.TouristDestination
{
    public class ContactDestination
    {
        [DisplayName("Phone Number")]
        [Phone(ErrorMessage = "Invalid phone number")]
        public string? Phone { get; set; }
        [DisplayName("Email Address")]
        [EmailAddress(ErrorMessage = "Invalid email address")]
        public string? Email { get; set; }
        [DisplayName("Website")]
        [Url(ErrorMessage = "Invalid URL")]
        public string? Website { get; set; }
    }
}