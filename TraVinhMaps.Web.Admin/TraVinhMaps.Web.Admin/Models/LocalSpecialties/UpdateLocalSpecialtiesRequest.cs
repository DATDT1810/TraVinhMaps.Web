using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace TraVinhMaps.Web.Admin.Models.LocalSpecialties
{
    public class UpdateLocalSpecialtiesRequest
    {
        [Required(ErrorMessage = "Id is required.")]
        public string Id { get; set; } = default!;

        [Required(ErrorMessage = "Food name is required.")]
        [StringLength(100, MinimumLength = 5, ErrorMessage = "Food name must be between 5 and 100 characters.")]
        public string FoodName { get; set; } = default!;

        [Required(ErrorMessage = "Description is required.")]
        [StringLength(3000, MinimumLength = 10, ErrorMessage = "Description must be between 10 and 3000 characters.")]
        public string Description { get; set; } = default!;

        [Required(ErrorMessage = "TagId is required.")]
        public string TagId { get; set; } = default!;

        public bool Status { get; set; } = true;
        public DateTime? UpdateAt { get; set; } = DateTime.UtcNow;
    }
}