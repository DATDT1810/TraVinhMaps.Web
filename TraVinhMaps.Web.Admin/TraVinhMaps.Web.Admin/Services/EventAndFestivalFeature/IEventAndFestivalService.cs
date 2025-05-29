using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TraVinhMaps.Web.Admin.Models.EventAndFestivalFeature;

namespace TraVinhMaps.Web.Admin.Services.EventAndFestivalFeature
{
    public interface IEventAndFestivalService
    {
        Task<IEnumerable<EventAndFestivalResponse>> ListAllAsync(CancellationToken cancellationToken = default);
        Task<EventAndFestivalResponse> CreateEventAndFestival(CreateEventAndFestivalRequest createEventAndFestivalRequest);
        Task<List<String>> AddEventAndFestivalImage(AddImageEventAndFestivalRequest addImageEventAndFestivalRequest);
        Task<bool> DeleteEventAndFestivalImage(DeleteEventAndFestivalImage deleteEventAndFestivalImage);
        Task<EventAndFestivalResponse> UpdateEventAndFestival(UpdateEventAndFestivalRequest updateEventAndFestivalRequest);
        Task<bool> DeleteEventAndFestival(string id);
        Task<bool> RestoreEventAndFestival(string id);
        Task<EventAndFestivalResponse> GetEventAndFestivalById(string id);
    }
}