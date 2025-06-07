using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace TraVinhMaps.Web.Admin.Models.SellingLink
{
    public class SellingLinkMessage
    {
        public string Message { get; set; }
        public string Status { get; set; }
        public int StatusCode { get; set; }
        public object Errors { get; set; }
    }
}