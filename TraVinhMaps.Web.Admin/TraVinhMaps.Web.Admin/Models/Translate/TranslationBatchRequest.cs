using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace TraVinhMaps.Web.Admin.Models.Translate
{
    public class TranslationBatchRequest
    {
        public List<string> Texts { get; set; } = new();
        public string SourceLang { get; set; } = "en";
        public string TargetLang { get; set; } = "vi";
    }
}