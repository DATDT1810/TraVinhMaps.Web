using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace TraVinhMaps.Web.Admin.Models.Notifications
{
    public class NotificationRequest
    {
        [Required(ErrorMessage = "Title is required.")]
        public string Title { get; set; }

        [Required(ErrorMessage = "Content is required.")]
        public string Content { get; set; }

        public bool IsRead { get; set; }

        [Required(ErrorMessage = "Please select an icon.")]
        public string IconCode { get; set; }

    }
}