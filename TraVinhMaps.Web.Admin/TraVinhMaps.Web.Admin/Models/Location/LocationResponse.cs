namespace TraVinhMaps.Web.Admin.Models.Location
{
    public class LocationResponse
    {
        public string? Type { get; set; }
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
