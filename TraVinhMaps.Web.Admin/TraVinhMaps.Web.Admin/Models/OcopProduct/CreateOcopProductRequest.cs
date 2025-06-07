using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace TraVinhMaps.Web.Admin.Models.OcopProduct
{
    public class CreateOcopProductRequest
    {
        [Required(ErrorMessage = "Product name is required.")]
        [StringLength(100, ErrorMessage = "Product name must not exceed 100 characters.")]
        public required string ProductName { get; set; }
        [StringLength(500, ErrorMessage = "Product description must not exceed 500 characters.")]
        public string? ProductDescription { get; set; }
        [Required(ErrorMessage = "At least one product image is required.")]
        public List<IFormFile> ProductImageFile { get; set; }
        [RegularExpression(@"^\d+(\.\d{1,2})?$", ErrorMessage = "Product price must be a valid number.")]
        public string? ProductPrice { get; set; }
        public required string OcopTypeId { get; set; }
        public required string CompanyId { get; set; }
        public required int OcopPoint { get; set; }
        public required int OcopYearRelease { get; set; }
        public required string TagId { get; set; }
        [Required(ErrorMessage = "Selling link is required.")]
        [Url(ErrorMessage = "SellingLinkId must be a valid URL.")]
        public required string SellingLinkId { get; set; } 
    }
}