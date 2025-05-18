using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Mvc.Rendering;

namespace TraVinhMaps.Web.Admin.Helper
{
    public static class HtmlHelpers
    {
        /// <summary>
        /// Cắt text sau n từ và thêm dấu “ … ” (ellipsis).
        /// </summary>
        public static IHtmlContent TruncateWords(this IHtmlHelper html, string? text, int wordCount)
        {
            if (string.IsNullOrWhiteSpace(text)) return HtmlString.Empty;

            var words = text.Split(' ', StringSplitOptions.RemoveEmptyEntries);
            if (words.Length <= wordCount) return new HtmlString(text);

            var truncated = string.Join(' ', words.Take(wordCount)) + " …";
            return new HtmlString(truncated);
        }
    }
}