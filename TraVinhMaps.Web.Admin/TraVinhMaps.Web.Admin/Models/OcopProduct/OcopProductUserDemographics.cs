using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace TraVinhMaps.Web.Admin.Models.OcopProduct
{
    public class OcopProductUserDemographics
    {
        public string Id { get; set; } = default!; // ID sản phẩm OCOP
        public string ProductName { get; set; } = default!; // Tên sản phẩm
        public string AgeGroup { get; set; } = default!; // Nhóm tuổi (<18, 18-25, 26-35, 36-50, >50)
        public string Hometown { get; set; } = default!; // Quê quán (chuẩn hóa, ví dụ: "TP. Cần Thơ")
        public long UserCount { get; set; } // Số lượng người dùng
    }
}