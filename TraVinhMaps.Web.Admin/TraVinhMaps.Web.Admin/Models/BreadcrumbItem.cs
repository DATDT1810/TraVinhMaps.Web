using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace TraVinhMaps.Web.Admin.Models
{
    public class BreadcrumbItem
    {
        public string Title { get; set; } = default!;
        public string Url { get; set; } = default!;
    }
}