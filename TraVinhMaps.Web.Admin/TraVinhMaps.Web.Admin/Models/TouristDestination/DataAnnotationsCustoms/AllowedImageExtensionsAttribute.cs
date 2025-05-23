using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace TraVinhMaps.Web.Admin.Models.TouristDestination.DataAnnotationsCustoms
{
    public class AllowedImageExtensionsAttribute : ValidationAttribute
    {
        private readonly List<string> _extensions;

        public AllowedImageExtensionsAttribute(string[] extensions)
        {
            _extensions = extensions.ToList();
        }

        protected override ValidationResult IsValid(object value, ValidationContext validationContext)
        {
            var files = value as List<IFormFile>;
            if (files == null || files.Count == 0)
                return ValidationResult.Success;

            foreach (var file in files)
            {
                var extension = Path.GetExtension(file.FileName)?.ToLowerInvariant();
                if (string.IsNullOrEmpty(extension) || !_extensions.Contains(extension))
                {
                    return new ValidationResult($"Only the following file extensions are allowed: {string.Join(", ", _extensions)}");
                }
            }

            return ValidationResult.Success;
        }
    }
}