using TraVinhMaps.Web.Admin.Services.EventAndFestivalFeature;
using TraVinhMaps.Web.Admin.Services.Notifications;
using TraVinhMaps.Web.Admin.Services.TouristDestination;
using TraVinhMaps.Web.Admin.Services.Users;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllersWithViews();

// Register IUserService
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<INotificationsService, NotificationsService>();
// Register TouristDestination
builder.Services.AddScoped<IDestinationService, DestinationService>();
//Register Event And Festival
builder.Services.AddScoped<IEventAndFestivalService, EventAndFestivalService>();


builder.Services.AddHttpClient("ApiClient", client =>
{
    client.BaseAddress = new Uri("https://localhost:7162/");
    client.Timeout = TimeSpan.FromMinutes(2); // optional
});


var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();
