using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace TraVinhMaps.Web.Admin.Models.SellingLink
{
    public class CreateSellingLinkRequest
    {
        public required string Tittle { get; set; }
        public required string Link { get; set; }
    }
}