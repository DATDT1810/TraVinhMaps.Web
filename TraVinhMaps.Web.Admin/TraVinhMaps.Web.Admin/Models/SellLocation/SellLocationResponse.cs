using TraVinhMaps.Web.Admin.Models.Location;

namespace TraVinhMaps.Web.Admin.Models.SellLocation
{
    public class SellLocationResponse
    {
        public string Id { get; set; }
        public string? LocationName { get; set; }
        public string? LocationAddress { get; set; }
        public LocationResponse? Location { get; set; }
    }
}
