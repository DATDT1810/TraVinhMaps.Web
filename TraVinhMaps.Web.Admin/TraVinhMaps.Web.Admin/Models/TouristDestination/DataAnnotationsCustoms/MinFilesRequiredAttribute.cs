using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace TraVinhMaps.Web.Admin.Models.TouristDestination.DataAnnotationsCustoms
{
    public class MinFilesRequiredAttribute : ValidationAttribute
    {
        private readonly int _minFiles;

        public MinFilesRequiredAttribute(int minFiles)
        {
            _minFiles = minFiles;
        }

        protected override ValidationResult IsValid(object value, ValidationContext validationContext)
        {
            var fileList = value as IList<IFormFile>;

            if (fileList == null || fileList.Count < _minFiles)
            {
                return new ValidationResult(ErrorMessage ?? $"At least {_minFiles} image(s) is required.");
            }

            return ValidationResult.Success;
        }
    }
}