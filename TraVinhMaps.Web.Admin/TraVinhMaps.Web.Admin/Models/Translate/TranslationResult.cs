using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace TraVinhMaps.Web.Admin.Models.Translate
{
    public class TranslationResult
    {
        public string TranslatedText { get; set; } = default!;
        public bool FromCache { get; set; }
        public string ModelUsed { get; set; } = default!;
        public decimal? Cost { get; set; }
    }
}