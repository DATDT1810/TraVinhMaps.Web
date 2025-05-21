namespace TraVinhMaps.Web.Admin.Models.Auth
{
    public class TokenResponse
    {
        public string Data { get; set; }
        public string Message { get; set; }
        public string Status { get; set; }
        public int StatusCode { get; set; }
        public string? Error { get; set; }
    }

    public class AuthenticationResponse
    {
        public string Data { get; set; }
        public string Message { get; set; }
        public string Status { get; set; }
        public int StatusCode { get; set; }
        public string Errors { get; set; }
    }

    public class Data
    {
        public string SessionId { get; set; }
        public string RefreshToken { get; set; }
    }
}