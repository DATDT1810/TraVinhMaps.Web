using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace TraVinhMaps.Web.Admin.Models.TouristDestination.DataAnnotationsCustoms
{
    public class ValidateCoordinatesAttribute : ValidationAttribute
    {
        public override bool IsValid(object? value)
        {
            if (value is List<double> coordinates)
            {
                if (coordinates.Count != 2)
                {
                    ErrorMessage = "Coordinates must have exactly 2 values: longitude and latitude.";
                    return false;
                }

                // Kiểm tra giá trị không phải mặc định hoặc không hợp lệ
                if (double.IsNaN(coordinates[0]) || double.IsNaN(coordinates[1]))
                {
                    ErrorMessage = "Longitude and latitude must be valid numbers.";
                    return false;
                }

                return true;
            }

            ErrorMessage = "Coordinates are required.";
            return false;
        }
    }
}