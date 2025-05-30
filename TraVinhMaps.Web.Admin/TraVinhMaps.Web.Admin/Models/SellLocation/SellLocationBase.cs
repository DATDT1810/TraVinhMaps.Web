namespace TraVinhMaps.Web.Admin.Models.SellLocation
{
    public class SellLocationBase<T>
    {
        public T data { get; set; }
        public string message { get; set; }
        public string status { get; set; }
        public int statusCode { get; set; }
        public bool? errors { get; set; }
    }
}
