using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;

namespace TraVinhMaps.Web.Admin.Models.TouristDestination.Mappers
{
    public static class DestinationMapper
    {
        private static readonly Lazy<IMapper> lazy = new Lazy<IMapper>(() =>
{
   var config = new MapperConfiguration(cfg =>
   {
       cfg.ShouldMapProperty = p => p.GetMethod.IsPublic || p.GetMethod.IsAssembly;
       cfg.AddProfile<DestinationMappingProfile>();
   });
   var mapper = config.CreateMapper();
   return mapper;
});

        public static IMapper Mapper => lazy.Value;
    }
}