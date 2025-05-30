namespace TraVinhMaps.Web.Admin.Models.OcopProduct
{
    public class OcopProductBase<T>
    {
        public T Data { get; set; }
        public string message { get; set; }
        public string status { get; set; }
        public int statusCode { get; set; }
        public bool? errors { get; set; }
    }
}
