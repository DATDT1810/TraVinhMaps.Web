using DotNetEnv;
using Microsoft.AspNetCore.Authentication.Cookies;
using TraVinhMaps.Web.Admin.Extensions;
using TraVinhMaps.Web.Admin.Services.Admin;
using TraVinhMaps.Web.Admin.Services.Auth;
using TraVinhMaps.Web.Admin.Services.CommunityTips;
using TraVinhMaps.Web.Admin.Services.EventAndFestivalFeature;
using TraVinhMaps.Web.Admin.Services.Notifications;
using TraVinhMaps.Web.Admin.Services.Tags;
using TraVinhMaps.Web.Admin.Services.TouristDestination;
using TraVinhMaps.Web.Admin.Services.Users;
var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllersWithViews();

// Register IUserService
builder.Services.AddScoped<IUserService, UserService>();
// Register IAdminService
builder.Services.AddScoped<IAdminService, AdminService>();
// Register INotificationsService
builder.Services.AddScoped<INotificationsService, NotificationsService>();
// Register ICommunityTipsService
builder.Services.AddScoped<ICommunityTipsService, CommunityTipsService>();
// Register ITagService
builder.Services.AddScoped<ITagService, TagService>();
// Register TouristDestination
builder.Services.AddScoped<IDestinationService, DestinationService>();
// Register Event And Festival
builder.Services.AddScoped<IEventAndFestivalService, EventAndFestivalService>();
//  Register AuthService
builder.Services.AddScoped<IAuthService, AuthService>();
// Register ITokenService
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddHttpContextAccessor();
// Load environment variables from .env file
Env.Load();
// Add environment variables to configuration 
builder.Configuration.AddEnvironmentVariables();

// Register session services
builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromDays(1);
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
    options.Cookie.SecurePolicy = CookieSecurePolicy.Always; // Ensure cookies are only sent over HTTPS
    options.Cookie.SameSite = SameSiteMode.Lax; // Changed from Strict to Lax to allow cross-site redirects for OAuth
});

// Register IUserService
builder.Services.AddScoped<IUserService, UserService>();
// Register INotificationsService
builder.Services.AddScoped<INotificationsService, NotificationsService>();
// Register TouristDestination
builder.Services.AddScoped<IDestinationService, DestinationService>();
//Register Event And Festival
builder.Services.AddScoped<IEventAndFestivalService, EventAndFestivalService>();
// Register IAuthService
builder.Services.AddScoped<IAuthService, AuthService>();

// Configure cookie authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
    options.DefaultSignInScheme = CookieAuthenticationDefaults.AuthenticationScheme;
    options.DefaultAuthenticateScheme = CookieAuthenticationDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = CookieAuthenticationDefaults.AuthenticationScheme; // Set the default challenge scheme to cookie authentication
})
    .AddCookie(options =>
    {
        options.LoginPath = "/Authen";
        options.LogoutPath = "/Authen/Logout";
        options.AccessDeniedPath = "/Authen/AccessDenied"; // Add path for access denied
        options.Cookie.HttpOnly = true;
        options.Cookie.SecurePolicy = CookieSecurePolicy.Always; // Ensure cookies are only sent over HTTPS
        options.Cookie.SameSite = SameSiteMode.Lax; // Changed from Strict to Lax to allow cross-site redirects for OAuth
        options.ExpireTimeSpan = TimeSpan.FromHours(24);
        //options.SlidingExpiration = true;
        options.Cookie.Name = "TVMaps.Auth"; // Custom name for the cookie
    })
    .AddGoogle(googleOptions =>
    {
        // Try to get from environment variables first, then fall back to configuration
        googleOptions.ClientId = Environment.GetEnvironmentVariable("GOOGLE_CLIENT_ID"); ;
        googleOptions.ClientSecret = Environment.GetEnvironmentVariable("GOOGLE_CLIENT_SECRET");
        // googleOptions.CallbackPath = "/Authen/signin-google"; // Use a simpler path that matches Google's expectations
    });

// Add Antiforgery services for CSRF protection
builder.Services.AddAntiforgery(options =>
{
    // options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
    options.Cookie.HttpOnly = true;
    options.Cookie.SameSite = SameSiteMode.Lax; // Changed from Strict to Lax
});

builder.Services.AddTransient<AuthHttpMessageHandler>();
// Register for The request must have the sessionId in the Header
builder.Services.AddHttpClient("ApiClient", client =>
{
    client.BaseAddress = new Uri("https://localhost:7162/");
    client.Timeout = TimeSpan.FromMinutes(5); // config wait time out with 5 minutes
}).AddHttpMessageHandler<AuthHttpMessageHandler>();

// Add a client without the auth handler for token refresh to avoid circular dependencies
builder.Services.AddHttpClient("ApiClientNoAuth", client =>
{
    client.BaseAddress = new Uri("https://localhost:7162/");
    client.Timeout = TimeSpan.FromMinutes(5);
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}
else
{
    app.UseDeveloperExceptionPage();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

// Use session before authentication
app.UseSession();

app.UseAuthentication();
app.UseAuthorization();

// Add session expiration middleware after authentication but before handling routes
app.UseSessionExpiration();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();
