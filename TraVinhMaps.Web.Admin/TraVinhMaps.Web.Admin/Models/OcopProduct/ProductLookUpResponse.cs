using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace TraVinhMaps.Web.Admin.Models.OcopProduct
{
    public class ProductLookUpResponseWrapper
    {
        [JsonPropertyName("data")]
        public ProductLookUpData Data { get; set; }
        
        [JsonPropertyName("message")]
        public string Message { get; set; }
        
        [JsonPropertyName("status")]
        public string Status { get; set; }
        
        [JsonPropertyName("statusCode")]
        public int StatusCode { get; set; }
        
        [JsonPropertyName("errors")]
        public object Errors { get; set; }
    }

    public class ProductLookUpData
    {
       [JsonPropertyName("ocopTypes")]
       public List<OcopTypeResponse> OcopTypes { get; set; }
       
       [JsonPropertyName("companies")]
       public List<CompanyResponse> Companies { get; set; }
       
       [JsonPropertyName("tags")]
       public TagResponse Tags { get; set; }
    }

    public class ProductLookUpResponse
    {
       public List<OcopTypeResponse> OcopTypes { get; set; }
       public List<CompanyResponse> Companies { get; set; }
       public List<TagResponse> Tags { get; set; }
    }

    public class TagResponse
    {
        [JsonPropertyName("id")]
        public string Id { get; set; }
        
        [JsonPropertyName("name")]
        public string Name { get; set; }
    }

    public class OcopTypeResponse
    {
        [JsonPropertyName("id")]
        public string Id { get; set; }
        
        [JsonPropertyName("name")]
        public string Name { get; set; }
    }

    public class CompanyResponse
    {
        [JsonPropertyName("id")]
        public string Id { get; set; }
        
        [JsonPropertyName("name")]
        public string Name { get; set; }
    }
}