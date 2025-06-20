using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace TraVinhMaps.Web.Admin.Models.LocalSpecialties
{
    public class AddLocationRequest
    {
        public string Id { get; set; }
        
        [Required(ErrorMessage = "Name is required.")]
        public string Name { get; set; } = default!;

        [Required(ErrorMessage = "Address is required.")]
        public string Address { get; set; } = default!;

        // [Required(ErrorMessage = "MarkerId is required.")]
        // public string MarkerId { get; set; } = default!;

        [Required(ErrorMessage = "Location is required.")]
        public LocationRequest Location { get; set; } = default!;

        public LocalSpecialtyLocation ToLocationModel() => new LocalSpecialtyLocation
        {
            Name = this.Name,
            Address = this.Address,
            Location = new Location
            {
                Type = this.Location.Type,
                Coordinates = this.Location.Coordinates
            }
        };
    }

    public class LocationRequest
    {
        [Required(ErrorMessage = "Type is required.")]
        public string Type { get; set; } = "Point";

        [Required(ErrorMessage = "Coordinates are required.")]
        public List<double> Coordinates { get; set; } = default!; // [longitude, latitude]
    }
}