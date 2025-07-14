namespace TraVinhMaps.Web.Admin.Models.Markers
{
    public class MarkerResponse
    {
        public string Id { get; set; }
        public DateTime CreatedAt { get; set; }
        public string Name { get; set; }
        public string? Image { get; set; }
        public bool Status { get; set; }
    }
}