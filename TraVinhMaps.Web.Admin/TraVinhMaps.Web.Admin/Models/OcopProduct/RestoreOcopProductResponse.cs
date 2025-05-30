using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace TraVinhMaps.Web.Admin.Models.OcopProduct
{
    public class RestoreOcopProductResponse
    {
        public string message { get; set; }
        public string status { get; set; }
        public int statusCode { get; set; }
        public object errors { get; set; }
    }
}