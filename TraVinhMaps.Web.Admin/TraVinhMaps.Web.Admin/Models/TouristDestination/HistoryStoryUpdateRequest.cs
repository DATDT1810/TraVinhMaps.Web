using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace TraVinhMaps.Web.Admin.Models.TouristDestination
{
    public class HistoryStoryUpdateRequest
    {
        [MinLength(10, ErrorMessage = "Address must be at least 10 characters")]
        [MaxLength(1000, ErrorMessage = "Address must be less than or equal to 1000 characters")]
        public string? Content { get; set; }
        public List<string>? Images { get; set; }
    }
}