using TraVinhMaps.Web.Admin.Services.CommunityTips;
using TraVinhMaps.Web.Admin.Services.Notifications;
using TraVinhMaps.Web.Admin.Services.Tags;
using TraVinhMaps.Web.Admin.Services.Users;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllersWithViews();

// Register IUserServiceComunityTips
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<INotificationsService, NotificationsService>();
builder.Services.AddScoped<ICommunityTipsService, CommunityTipsService>();
builder.Services.AddScoped<ITagService, TagService>();


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
