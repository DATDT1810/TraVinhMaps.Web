using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace TraVinhMaps.Web.Admin.Models.LocalSpecialties
{
    public class LocalSpecialtiesFormatBase<T>
    {
        public T Value { get; set; }
        public List<string> Formatters { get; set; }
        public List<string> ContentTypes { get; set; }
        public object DeclaredType { get; set; }
        public int StatusCode { get; set; }
    }
}