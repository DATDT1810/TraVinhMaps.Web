using System;

namespace TraVinhMaps.Web.Admin.Models.Users
{
    public class UserProfileModel
    {
        public string Id { get; set; }
        public string UserName { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
        public string Password { get; set; }
        public string Avatar { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string RoleName { get; set; }
        public bool IsForbidden { get; set; }
        public bool Status { get; set; }
        
        // Helper properties for the view
        public bool IsEmailVerified => Status;
        public bool IsActive => !IsForbidden;
        public string DisplayName => !string.IsNullOrEmpty(UserName) ? UserName : Email?.Split('@')[0];
        public string FormattedCreatedDate => CreatedAt?.ToString("MMM dd, yyyy") ?? "N/A";
        public string FormattedCreatedDateTime => CreatedAt?.ToString("yyyy-MM-dd HH:mm:ss") ?? "N/A";
        public string FormattedUpdatedDateTime => UpdatedAt?.ToString("yyyy-MM-dd HH:mm:ss") ?? "Not updated yet";
    }
} 