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
        [RegularExpression(@"^(\+84|0[35789])[0-9]{8}$", ErrorMessage = "Invalid Vietnamese phone number format.")]
        public string? Phone { get; set; }
        [DisplayName("Email Address")]
        [EmailAddress(ErrorMessage = "Invalid email address")]
        public string? Email { get; set; }
        [DisplayName("Website")]
        [RegularExpression(@"^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$", ErrorMessage = "Invalid website URL format.")]
        public string? Website { get; set; }
    }
}