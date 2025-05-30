using System.Net;
using System.Text;
using TraVinhMaps.Web.Admin.Services.Auth;

namespace TraVinhMaps.Web.Admin.Extensions
{
    public class AuthHttpMessageHandler : DelegatingHandler
    {
        private readonly ITokenService _tokenService;
        private static readonly HttpRequestOptionsKey<bool> RetryFlagKey = new("X-Retry-Attempted");
        public AuthHttpMessageHandler(ITokenService tokenService)
        {
            _tokenService = tokenService;
        }

        protected override async Task<HttpResponseMessage> SendAsync(
       HttpRequestMessage request, CancellationToken cancellationToken)
        {
            var sessionId = _tokenService.GetSessionId();
            if (!string.IsNullOrEmpty(sessionId))
            {
                request.Headers.Add("sessionId", sessionId);
            }

            var response = await base.SendAsync(request, cancellationToken);

            // If unauthorized, try to refresh tokens and retry once
            if (response.StatusCode == HttpStatusCode.Unauthorized && (!request.Options.TryGetValue(RetryFlagKey, out var hasRetried) || !hasRetried))
            {
                await _tokenService.RefreshTokensIfNeededAsync();

                // Get the new token and retry the request
                sessionId = _tokenService.GetSessionId();
                if (!string.IsNullOrEmpty(sessionId))
                {
                    // Create new request (can't reuse the old one)
                    var newRequest = new HttpRequestMessage(request.Method, request.RequestUri);
                    newRequest.Headers.Add("sessionId", sessionId);

                    // Copy content if present
                    if (request.Content != null)
                    {
                        var content = await request.Content.ReadAsStringAsync();
                        newRequest.Content = new StringContent(content, Encoding.UTF8, "application/json");
                    }

                    newRequest.Options.Set(RetryFlagKey, true);

                    return await base.SendAsync(newRequest, cancellationToken);
                }
            }

            return response;
        }
    }
}
