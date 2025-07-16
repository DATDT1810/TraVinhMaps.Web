using TraVinhMaps.Web.Admin.Models.SellLocation;

namespace TraVinhMaps.Web.Admin.Models.OcopProduct
{
    public class OcopProductResponse
    {
        public required string Id { get; set; }
        public required string ProductName { get; set; }
        public string? ProductDescription { get; set; }
        public List<string>? ProductImage { get; set; }
        public string? ProductPrice { get; set; }
        public required string OcopTypeId { get; set; }
        public required bool Status { get; set; }
        public List<SellLocationResponse>? Sellocations { get; set; }
        public required string CompanyId { get; set; }
        public required int OcopPoint { get; set; }
        public required int OcopYearRelease { get; set; }
        public required string TagId { get; set; }
        public required DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdateAt { get; set; } = DateTime.Now;
    }
}
