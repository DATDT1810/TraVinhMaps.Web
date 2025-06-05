using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace TraVinhMaps.Web.Admin.Models.Markers
{
    public class CreateMarkerRequest
    {
        [Required(ErrorMessage = "Name is required")]
        public string Name { get; set; }
        [Required(ErrorMessage = "Image is required")]
        public IFormFile ImageFile { get; set; }
    }
}