using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;

namespace TraVinhMaps.Web.Admin.Models.TouristDestination.Mappers
{
    public class DestinationMappingProfile : Profile
    {
        public DestinationMappingProfile()
        {
            CreateMap<TouristDestinationResponse, UpdateDestinationRequest>().ReverseMap();
            CreateMap<HistoryStoryRequest, HistoryStoryUpdateRequest>().ReverseMap();
            CreateMap<TouristDestinationRequest, TouristDestinationViewRequest>().ReverseMap();
            CreateMap<UpdateDestinationViewRequest, TouristDestinationResponse>().ReverseMap();
            CreateMap<UpdateDestinationRequest, UpdateDestinationViewRequest>().ReverseMap();
        }
    }
}