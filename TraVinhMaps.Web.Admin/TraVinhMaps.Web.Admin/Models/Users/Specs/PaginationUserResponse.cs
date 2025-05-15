using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Threading.Tasks;

namespace TraVinhMaps.Web.Admin.Models.Users.Specs
{
    public class PaginationUserResponse
    {
        public class Pagination<T> where T : class
        {
            public Pagination(int pageIndex, int pageSize, int count, IReadOnlyList<T> data)
            {
                PageIndex = pageIndex;
                PageSize = pageSize;
                Count = count;
                Data = data ?? throw new ArgumentNullException(nameof(data));
            }

            public Pagination()
            {
                // Generate a default value to avoid null reference
                Data = new List<T>().AsReadOnly();
            }

            public int PageIndex { get; set; }
            public int PageSize { get; set; }
            public long Count { get; set; }
            public IReadOnlyList<T> Data { get; set; }
            public int TotalPages => PageSize > 0 ? (int)Math.Ceiling((double)Count / PageSize) : 0;
        }
    }
}