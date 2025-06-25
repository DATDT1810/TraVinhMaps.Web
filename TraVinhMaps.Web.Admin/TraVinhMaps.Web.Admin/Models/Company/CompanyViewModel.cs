using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using TraVinhMaps.Web.Admin.Models.Contact;
using TraVinhMaps.Web.Admin.Models.Location;

namespace TraVinhMaps.Web.Admin.Models.Company
{
    public class CompanyViewModel
    {
        [Required(ErrorMessage = "Company name is required.")]
        [StringLength(100, MinimumLength = 3, ErrorMessage = "Name must be between 3 and 100 characters.")]
        public required string Name { get; set; }
        [Required(ErrorMessage = "Company address is required.")]
        [StringLength(200, MinimumLength = 5, ErrorMessage = "Address must be between 5 and 200 characters.")]
        public required string Address { get; set; }
        [MinLength(1, ErrorMessage = "At least one location is required.")]
        public required List<LocationResponse> Locations { get; set; } 
        public ContactResponse? Contact { get; set; }
    }
}