namespace TraVinhMaps.Web.Admin.Models
{
    public class BaseResponseModel<T>
    {
        public T Data { get; set; }
        public string Message { get; set; }
        public string Status { get; set; }
        public int StatusCode { get; set; }
        public string? Error { get; set; }
    }

    public class BaseResponseModel
    {
        public string Data { get; set; }
        public string Message { get; set; }
        public string Status { get; set; }
        public int StatusCode { get; set; }
        public string? Error { get; set; }
    }
}

