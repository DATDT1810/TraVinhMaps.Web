using TraVinhMaps.Web.Admin.Services.EventAndFestivalFeature;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Http;
using TraVinhMaps.Web.Admin.Services.Auth;
using TraVinhMaps.Web.Admin.Services.Notifications;
using TraVinhMaps.Web.Admin.Services.TouristDestination;
using TraVinhMaps.Web.Admin.Services.Users;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllersWithViews();

// Register session services
builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(30);
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
    options.Cookie.SecurePolicy = CookieSecurePolicy.Always; // Ensure cookies are only sent over HTTPS
    options.Cookie.SameSite = SameSiteMode.Strict; // Protect against CSRF attacks
});

// Register IUserService
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<INotificationsService, NotificationsService>();
// Register TouristDestination
builder.Services.AddScoped<IDestinationService, DestinationService>();
//Register Event And Festival
builder.Services.AddScoped<IEventAndFestivalService, EventAndFestivalService>();

builder.Services.AddScoped<IAuthService, AuthService>();

// Configure cookie authentication
builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.LoginPath = "/Authen";
        options.LogoutPath = "/Authen/Logout";
        options.AccessDeniedPath = "/Authen/AccessDenied"; // Add path for access denied
        options.Cookie.HttpOnly = true;
        options.Cookie.SecurePolicy = CookieSecurePolicy.Always; // Ensure cookies are only sent over HTTPS
        options.Cookie.SameSite = SameSiteMode.Strict; // Protect against CSRF attacks
        options.ExpireTimeSpan = TimeSpan.FromHours(24);
        options.SlidingExpiration = true;
        options.Cookie.Name = "TVMaps.Auth"; // Custom name for the cookie
    });

// Add Antiforgery services for CSRF protection
builder.Services.AddAntiforgery(options => 
{
   // options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
    options.Cookie.HttpOnly = true;
    options.Cookie.SameSite = SameSiteMode.Strict;
});

builder.Services.AddHttpClient("ApiClient", client =>
{
    client.BaseAddress = new Uri("https://localhost:7162/");
    client.Timeout = TimeSpan.FromMinutes(5); // config wait time out with 5 minutes
});

// Add data protection services for more secure token storage
builder.Services.AddDataProtection();

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

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();
