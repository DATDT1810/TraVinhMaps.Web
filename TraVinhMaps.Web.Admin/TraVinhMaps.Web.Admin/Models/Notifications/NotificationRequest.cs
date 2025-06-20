using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace TraVinhMaps.Web.Admin.Models.Notifications
{
    public class NotificationRequest
    {
        [Required(ErrorMessage = "The Title is required.")]
        [StringLength(100, MinimumLength = 10, ErrorMessage = "Title must be between 10 and 100 characters.")]
        public string Title { get; set; }

        [Required(ErrorMessage = "The Content is required.")]
        [StringLength(1000, MinimumLength = 10, ErrorMessage = "Content must be between 10 and 1000 characters.")]
        public string Content { get; set; }

        [Required(ErrorMessage = "Please select an icon.")]
        public string IconCode { get; set; }

    }
}