namespace TraVinhMaps.Web.Admin.Models.Auth
{
    // the model user for get the value with the data is contextId
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
        public string? Errors { get; set; }
    }

    public class AuthenData
    {
        public string SessionId { get; set; }
        public string RefreshToken { get; set; }
        public string Role { get; set; }
    }

    public class ContextData
    {
        public string Token { get; set; }
    }
}