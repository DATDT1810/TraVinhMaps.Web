using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using TraVinhMaps.Web.Admin.Models.TouristDestination.DataAnnotationsCustoms;

namespace TraVinhMaps.Web.Admin.Models.TouristDestination
{
    public class HistoryStoryRequest
    {
        [MinLength(10, ErrorMessage = "Description must be at least 10 characters")]
        [MaxLength(3000, ErrorMessage = "Description must be less than or equal to 3000 characters")]
        public string? Content { get; set; }
        [AllowedImageExtensions(new[] { ".jpg", ".jpeg", ".png", ".gif" }, ErrorMessage = "Only JPG, JPEG, PNG, and GIF files are allowed.")]
        public List<IFormFile>? ImagesFile { get; set; }
    }
}