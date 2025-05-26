using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using System;
using System.ComponentModel.DataAnnotations;
using System.Globalization;

namespace TraVinhMaps.Web.Admin.Models.EventAndFestivalFeature.DataAnnotationsCustoms
{
    public class DateNotInPastAttribute : ValidationAttribute, IClientModelValidator
    {
        private readonly string _dateFormat;

        public DateNotInPastAttribute(string dateFormat = "MM/dd/yyyy")
        {
            _dateFormat = dateFormat;
            ErrorMessage = $"Date must not be in the past and in format {_dateFormat}.";
        }

        protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
        {
            if (value == null || string.IsNullOrWhiteSpace(value.ToString()))
            {
                return new ValidationResult("Date is required.");
            }

            string dateString = value.ToString()!;

            if (!DateTime.TryParseExact(dateString, _dateFormat, CultureInfo.InvariantCulture, DateTimeStyles.None, out DateTime parsedDate))
            {
                return new ValidationResult($"Date must be in the format {_dateFormat}.");
            }

            if (parsedDate.Date < DateTime.Today)
            {
                return new ValidationResult("Date cannot be in the past.");
            }

            return ValidationResult.Success;
        }

        // Gắn attribute để jQuery Validation hiểu
        public void AddValidation(ClientModelValidationContext context)
        {
            MergeAttribute(context.Attributes, "data-val", "true");
            MergeAttribute(context.Attributes, "data-val-datenotinpast", ErrorMessage);
            MergeAttribute(context.Attributes, "data-val-datenotinpast-format", _dateFormat);
        }

        private bool MergeAttribute(IDictionary<string, string> attributes, string key, string value)
        {
            if (attributes.ContainsKey(key)) return false;
            attributes.Add(key, value);
            return true;
        }
    }
}
