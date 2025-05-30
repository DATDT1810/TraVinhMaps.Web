using Microsoft.AspNetCore.Http;

namespace TraVinhMaps.Web.Admin.Models.Users
{
    public class AdminProfileUpdateRequest
    {
        public string Id { get; set; }
        public string? UserName { get; set; }
        public string? Email { get; set; }
        public string? PhoneNumber { get; set; }
        public IFormFile? Avatar { get; set; }
    }
} 