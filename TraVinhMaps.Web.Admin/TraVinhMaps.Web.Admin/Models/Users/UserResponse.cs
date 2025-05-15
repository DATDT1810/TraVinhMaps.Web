using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Text.Json.Serialization;
namespace TraVinhMaps.Web.Admin.Models.Users
{
    public class UserResponse
    {
        public string Id { get; set; }
        public string? Username { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Email { get; set; }
        [JsonPropertyName("profile")] 
        public Profile? UserProfile { get; set; }
        public List<Favorite>? Favorites { get; set; }
        public bool IsForbidden { get; set; }
        public bool Status { get; set; }
        public required DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        public class Profile
        {
            public string? FullName { get; set; }
            public DateOnly? DateOfBirth { get; set; }
            public string? PhoneNumber { get; set; }
            public string? Gender { get; set; }
            public string? Address { get; set; }
            public string? Avatar { get; set; }
        }

        public class Favorite
        {
            public string? ItemId { get; set; }
            public string? ItemType { get; set; }
            public DateTime? UpdateAt { get; set; }
        }
    }
}