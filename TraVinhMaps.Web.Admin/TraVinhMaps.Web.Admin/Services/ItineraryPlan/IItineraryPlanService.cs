using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TraVinhMaps.Web.Admin.Models.ItineraryPlans;

namespace TraVinhMaps.Web.Admin.Services.ItineraryPlan
{
    public interface IItineraryPlanService
    {
        Task<IEnumerable<ItineraryPlanResponse>> ListAllAsync(CancellationToken cancellationToken = default);
        Task<ItineraryPlanResponse> GetItineraryPlanById(string id);
        Task<ItineraryPlanResponse> CreateItineraryPlan(ItineraryPlanRequest itineraryPlanRequest);
        Task<ItineraryPlanResponse> UpdateItineraryPlan(UpdateItineraryPlanResponse updateItineraryPlanResponse);
        Task<bool> DeleteItineraryPlan(string id);
        Task<bool> RestoreItineraryPlan(string id);
    }
}