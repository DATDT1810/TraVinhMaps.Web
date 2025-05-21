using System.ComponentModel.DataAnnotations;

namespace TraVinhMaps.Web.Admin.Models.Auth
{
    public class LoginViewModel
    {
        [Required(ErrorMessage = "Email or Phonenumber is required")]
        [Display(Name = "Email or Phonenumber")]
        public string Identifier { get; set; }

        [Required(ErrorMessage = "Password is required")]
        [Display(Name = "Password")]
        public string Password { get; set; }

        [Display(Name = "Remember me")]
        public bool RememberMe { get; set; } = false;
    }

    public class OtpVerificationViewModel
    {
        [Required(ErrorMessage = "Verification code is required")]
        [Display(Name = "Verification Code")]
        public string OtpCode { get; set; }

        public string Token { get; set; }
        
        public string UserIdentifier { get; set; }
    }
}