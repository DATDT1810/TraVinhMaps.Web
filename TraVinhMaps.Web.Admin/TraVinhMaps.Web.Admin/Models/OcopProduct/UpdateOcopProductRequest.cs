using System.ComponentModel.DataAnnotations;
using TraVinhMaps.Web.Admin.Models.SellLocation;

namespace TraVinhMaps.Web.Admin.Models.OcopProduct
{
    public class UpdateOcopProductRequest
    {
        public required string Id { get; set; }
        [Required(ErrorMessage = "Product name is required.")]
        [StringLength(100, ErrorMessage = "Product name must not exceed 100 characters.")]
        public required string ProductName { get; set; }
        [StringLength(500, ErrorMessage = "Product description must not exceed 500 characters.")]
        public string? ProductDescription { get; set; }
        [RegularExpression(@"^\d+(\.\d{1,2})?$", ErrorMessage = "Product price must be a valid number.")]
        public string? ProductPrice { get; set; }
        public required string OcopTypeId { get; set; }
        public DateTime? UpdateAt { get; set; } = DateTime.UtcNow;
        public required string CompanyId { get; set; }
        public required int OcopPoint { get; set; }
        public required int OcopYearRelease { get; set; }
        public required string TagId { get; set; }
        public required string SellingLinkId { get; set; }
    }
}
