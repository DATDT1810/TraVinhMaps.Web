using System.ComponentModel.DataAnnotations;

namespace TraVinhMaps.Web.Admin.Models.Auth
{
    public class ForgotPasswordViewModel
    {
        [Required(ErrorMessage = "Email or phone number is required")]
        [Display(Name = "Email or Phone Number")]
        public string Identifier { get; set; }
    }
} 