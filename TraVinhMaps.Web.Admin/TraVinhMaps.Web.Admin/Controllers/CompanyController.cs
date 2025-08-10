using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using TraVinhMaps.Web.Admin.Models;
using TraVinhMaps.Web.Admin.Models.Company;
using TraVinhMaps.Web.Admin.Models.Contact;
using TraVinhMaps.Web.Admin.Models.Location;
using TraVinhMaps.Web.Admin.Services.Company;

namespace TraVinhMaps.Web.Admin.Controllers
{
    [Route("Admin/Company")]
    public class CompanyController : Controller
    {
        private readonly ICompanyService _companyService;
        public CompanyController(ICompanyService companyService)
        {
            _companyService = companyService;
        }

        // GET: Company/Index
        public async Task<IActionResult> Index()
        {
            ViewData["Title"] = "Company Management";
            ViewData["Breadcrumb"] = new List<BreadcrumbItem>
            {
                new BreadcrumbItem { Title = "Company Management", Url = Url.Action("Index", "Company")! },
                new BreadcrumbItem { Title = "Company List" } // default URL for the current page
            };
            
            var listCompany = await _companyService.ListAllAsync();
            return View(listCompany);
        }

        // GET: Company/DetailCompany
        [HttpGet("DetailCompany")]
        public async Task<IActionResult> DetailCompany(string id)
        {
            ViewData["Title"] = "Company Details";
            ViewData["Breadcrumb"] = new List<BreadcrumbItem>
            {
                new BreadcrumbItem { Title = "Company Management", Url = Url.Action("Index", "Company")! },
                new BreadcrumbItem { Title = "Company Details" } // default URL for the current page
            };
            var company = await _companyService.GetByIdAsync(id);
            return View(company);
        }

        // GET: Company/CreateCompany
        [HttpGet("CreateCompany")]
        public async Task<IActionResult> CreateCompany()
        {
            var model = new CompanyViewModel
            {
                Name = string.Empty,
                Address = string.Empty,
                Locations = new List<LocationResponse> { new LocationResponse() }, 
                Contact = new ContactResponse()
            };
            return View(model);
        }

        // POST: Company/CreateCompanyPost
        [HttpPost("CreateCompanyPost")]

        public async Task<IActionResult> CreateCompanyPost(CompanyViewModel companyViewModel, CancellationToken cancellationToken = default)
        {
            if (!ModelState.IsValid)
            {
                var errorMessages = ModelState.Where(ms => ms.Value.Errors.Count > 0)
                                            .Select(ms => $"Key: {ms.Key}, Errors: {string.Join(", ", ms.Value.Errors.Select(e => e.ErrorMessage))}")
                                            .ToList();
                return View("CreateCompany", companyViewModel);
            }
            try
            {
                var result = await _companyService.AddAsync(companyViewModel, cancellationToken);
                if (result == null)
                {
                    throw new Exception("Result is null");
                }

                if (result.value == null)
                {
                    throw new Exception("Result.value is null");
                }
                var createCompany = new CompanyResponse
                {
                    Id = result.value.data.Id,
                    Name = result.value.data.Name,
                    Address = result.value.data.Address,
                    Locations = result.value.data.Locations,
                    Contact = result.value.data.Contact,
                    CreatedAt = result.value.data.CreatedAt,
                    UpdateAt = result.value.data.UpdateAt
                };
                Console.WriteLine("Data: " + createCompany);
                TempData["SuccessMessage"] = "Company created successfully!";
                return RedirectToAction("Index");
            }
            catch (HttpRequestException ex)
            {
                TempData["ErrorMessage"] = $"{ex.Message}";
                return View("CreateCompany", companyViewModel);
            }
            catch (Exception ex)
            {
                TempData["ErrorMessage"] = $"Something went wrong, please try again: {ex.Message}";
                return View("CreateCompany", companyViewModel);
            }
        }

        // GET: Company/UpdateCompany
        [HttpGet("UpdateCompany")]
        public async Task<IActionResult> UpdateCompany(string id)
        {
            ViewData["Title"] = "Update Company";
            ViewData["Breadcrumb"] = new List<BreadcrumbItem>
            {
                new BreadcrumbItem { Title = "Company Management", Url = Url.Action("Index", "Company")! },
                new BreadcrumbItem { Title = "Update Company" } // default URL for the current page
            };
            var findCompany = await _companyService.GetByIdAsync(id);
            if (findCompany == null)
            {
                return NotFound("Company not found.");
            }

            UpdateCompanyRequest updateCompanyRequest = new UpdateCompanyRequest
            {
                Id = findCompany.Id,
                Name = findCompany.Name,
                Address = findCompany.Address,
                Locations = findCompany.Locations?.Select(l => new LocationResponse
                {
                    Type = string.IsNullOrEmpty(l.Type) ? "Point" : l.Type.ToLower() == "point" ? "Point" : l.Type,
                    Latitude = l.Latitude,
                    Longitude = l.Longitude
                }).ToList() ?? new List<LocationResponse> { new LocationResponse { Type = "Point", Latitude = 0, Longitude = 0 } },
                Contact = findCompany.Contact,
                UpdateAt = findCompany.UpdateAt
            };

            ModelState.Clear();
            return View(updateCompanyRequest);
        }

        // POST: Company/UpdateCompanyPost
        [HttpPost("UpdateCompanyPost")]
        public async Task<IActionResult> UpdateCompanyPost(CompanyResponse request, CancellationToken cancellationToken = default)
        {
            var existingCompany = await _companyService.GetByIdAsync(request.Id);
            if (existingCompany == null)
            {
                return NotFound();
            }
            var updateCompanyRequest = new UpdateCompanyRequest
            {
                Id = request.Id,
                Name = request.Name,
                Address = request.Address,
                Locations = request.Locations,
                Contact = request.Contact,
                UpdateAt = request.UpdateAt
            };

            try
            {
                await _companyService.UpdateAsync(updateCompanyRequest);
            }
            catch (Exception ex)
            {
                TempData["ErrorMessage"] = $"{ex.Message}";
                return View("UpdateOcopType", updateCompanyRequest);
            }
            TempData["SuccessMessage"] = "Company updated successfully!";
            return RedirectToAction("Index");
        }
    }
}