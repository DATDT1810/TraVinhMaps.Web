using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;

namespace TraVinhMaps.Web.Admin.Models.EventAndFestivalFeature.Mappers
{
    public static class EventAndFestivalMapper
    {
            private static readonly Lazy<IMapper> lazy = new Lazy<IMapper>(() =>
{
   var config = new MapperConfiguration(cfg =>
   {
       cfg.ShouldMapProperty = p => p.GetMethod.IsPublic || p.GetMethod.IsAssembly;
       cfg.AddProfile<EventAndFestivalMappingProfile>();
   });
   var mapper = config.CreateMapper();
   return mapper;
});

        public static IMapper Mapper => lazy.Value;
    }
}