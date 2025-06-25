using System.ComponentModel.DataAnnotations;

namespace TraVinhMaps.Web.Admin.Models.Location
{
    public class LocationResponse
    {
        [Required(ErrorMessage = "Type is required.")]
        public string? Type { get; set; }
        [Required(ErrorMessage = "Longitude is required.")]
        [Range(-180, 180, ErrorMessage = "Longitude must be between -180 and 180.")]
        public double? Longitude
        {
            get => Coordinates != null && Coordinates.Count > 0 ? Coordinates[0] : null;
            set
            {
                if (Coordinates == null)
                {
                    Coordinates = new List<double> { 0, 0 };
                }

                if (Coordinates.Count == 0)
                {
                    Coordinates.Add(value ?? 0);
                    Coordinates.Add(0);
                }
                else
                {
                    Coordinates[0] = value ?? 0;
                }
            }
        }
        [Required(ErrorMessage = "Latitude is required.")]
        [Range(-90, 90, ErrorMessage = "Latitude must be between -90 and 90.")]
        public double? Latitude
        {
            get => Coordinates != null && Coordinates.Count > 1 ? Coordinates[1] : null;
            set
            {
                if (Coordinates == null)
                {
                    Coordinates = new List<double> { 0, 0 };
                }

                if (Coordinates.Count == 1)
                {
                    Coordinates.Add(value ?? 0);
                }
                else if (Coordinates.Count > 1)
                {
                    Coordinates[1] = value ?? 0;
                }
            }
        }

        public List<double>? Coordinates { get; set; } = new() { 0, 0 };
    }
}
