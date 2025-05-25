using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace TraVinhMaps.Web.Admin.Models.Tags
{
    public class TagsResponse
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Image { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}