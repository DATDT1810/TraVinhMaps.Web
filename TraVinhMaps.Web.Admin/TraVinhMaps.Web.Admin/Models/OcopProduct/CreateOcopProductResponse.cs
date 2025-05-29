using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace TraVinhMaps.Web.Admin.Models.OcopProduct
{
    public class CreateOcopProductResponse<T>
    {
        public Value value { get; set; }
        public List<object> formatters { get; set; } 
        public List<object> contentTypes { get; set; } 
        public object declaredType { get; set; } 
        public int statusCode { get; set; }

        public class Value
        {
            public T data { get; set; }
            public string message { get; set; }
            public string status { get; set; }
            public int statusCode { get; set; }
            public object errors { get; set; } 
        }
    }
}