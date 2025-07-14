using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace TraVinhMaps.Web.Admin.Models.SellingLink
{
    public class SellingLinkViewModel
    {
        [Required(ErrorMessage = "Product ID is required.")]
        public string ProductId { get; set; }

        [Required(ErrorMessage = "Title is required.")]
        public string Title { get; set; }
        public string? Link { get; set; }
        public DateTime? UpdateAt { get; set; } = DateTime.UtcNow;
    }
}