using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace TraVinhMaps.Web.Admin.Models.SellingLink
{
    public class UpdateSellingLinkRequest
    {
        public required string Id { get; set; }
        [Required(ErrorMessage = "Product ID is required.")]
        public string ProductId { get; set; }

        [Required(ErrorMessage = "Title is required.")]
        public string Title { get; set; }
        public string? Link { get; set; }
    }
}