using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace TraVinhMaps.Web.Admin.Models.Review
{
    public class ReviewBase<T>
    {
        public T Data { get; set; }
        public string Message { get; set; }
        public string Status { get; set; }
        public int StatusCode { get; set; }
        public object Errors { get; set; }
    }
}