using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace TraVinhMaps.Web.Admin.Models.CommunityTips
{
    public class CommunityTipsRequest
    {
        [Required(ErrorMessage = "The Title is required.")]
        [MinLength(10, ErrorMessage = "Title must be at least 20 characters long.")]
        [MaxLength(100, ErrorMessage = "Title can be at most 100 characters long.")]
        public string Title { get; set; }

        [Required(ErrorMessage = "The Content is required.")]
        [MinLength(10, ErrorMessage = "Content must be at least 20 characters long.")]
        [MaxLength(1000, ErrorMessage = "Content can be at most 1000 characters long.")]
        public string Content { get; set; }
        public DateTime? UpdateAt { get; set; }
        public bool Status { get; set; }

        [Required(ErrorMessage = "The TagId is required.")]
        public string TagId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}