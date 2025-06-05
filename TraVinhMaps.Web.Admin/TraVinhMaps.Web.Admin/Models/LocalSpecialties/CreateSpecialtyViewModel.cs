using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace TraVinhMaps.Web.Admin.Models.LocalSpecialties
{
    public class CreateSpecialtyViewModel
    {
        [Required(ErrorMessage = "Food name is required.")]
        [StringLength(100, MinimumLength = 5, ErrorMessage = "Food name must be between 5 and 100 characters.")]
        public string FoodName { get; set; } = default!;

        [Required(ErrorMessage = "Description is required.")]
        [StringLength(3000, MinimumLength = 10, ErrorMessage = "Description must be between 10 and 3000 characters.")]
        public string Description { get; set; } = default!;

        [Required(ErrorMessage = "TagId is required.")]
        public string TagId { get; set; } = default!;

        // Danh sách địa điểm
        public List<LocationViewModel> Locations { get; set; } = new List<LocationViewModel>();

        // Danh sách hình ảnh
        public List<IFormFile> Images { get; set; } = new List<IFormFile>();
    }

    public class LocationViewModel
    {
        [Required(ErrorMessage = "Location name is required.")]
        public string Name { get; set; } = default!;

        [Required(ErrorMessage = "Location address is required.")]
        public string Address { get; set; } = default!;

        [Required(ErrorMessage = "MarkerId is required.")]
        public string MarkerId { get; set; } = default!;

        [Required(ErrorMessage = "Longitude is required.")]
        [Range(-180, 180, ErrorMessage = "Longitude must be between -180 and 180.")]
        public double Longitude { get; set; }

        [Required(ErrorMessage = "Latitude is required.")]
        [Range(-90, 90, ErrorMessage = "Latitude must be between -90 and 90.")]
        public double Latitude { get; set; }
    }
}