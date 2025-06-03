using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace TraVinhMaps.Web.Admin.Models.Markers
{
    public class EditMarkerPictureRequest
    {
        public string Id { get; set; }
        public IFormFile NewImageFile { get; set; }
        public string CurrentUrlImage { get; set; }
    }
}