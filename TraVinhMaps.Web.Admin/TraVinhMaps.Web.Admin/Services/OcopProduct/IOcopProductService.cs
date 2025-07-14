using System.Linq.Expressions;
using TraVinhMaps.Web.Admin.Models.OcopProduct;
using TraVinhMaps.Web.Admin.Models.SellLocation;

namespace TraVinhMaps.Web.Admin.Services.OcopProduct
{
    public interface IOcopProductService
    {
        Task<OcopProductResponse> GetByIdAsync(string id, CancellationToken cancellationToken = default);
        Task<IEnumerable<OcopProductResponse>> ListAllAsync(CancellationToken cancellationToken = default);
        Task<CreateOcopProductResponse<OcopProductResponse>> AddAsync(OcopProductViewModel entity, CancellationToken cancellationToken = default);
        Task<OcopProductMessage> UpdateAsync(UpdateOcopProductRequest entity, CancellationToken cancellationToken = default);
        Task<OcopProductMessage> DeleteOcopProductAsync(string id, CancellationToken cancellationToken = default);
        Task<OcopProductMessage> RestoreOcopProductAsync(string id, CancellationToken cancellationToken = default);
        Task<long> CountAsync(Expression<Func<OcopProductResponse, bool>> predicate = null, CancellationToken cancellationToken = default);
        Task<IEnumerable<OcopProductResponse>> GetOcopProductByOcopTypeId(string ocopTypeId, CancellationToken cancellationToken = default);
        Task<IEnumerable<OcopProductResponse>> GetOcopProductByCompanyId(string companyId, CancellationToken cancellationToken = default);
        Task<OcopProductResponse> GetOcopProductByName(string name, CancellationToken cancellationToken = default);
        Task<List<string>> AddImageOcopProduct(string id, List<IFormFile> imageFiles, CancellationToken cancellationToken = default);
        Task<DeleteImageOcopProductResponse> DeleteImageOcopProduct(string id, string imageUrl, CancellationToken cancellationToken = default);
        Task<SellLocationResponse> AddSellLocation(string id, SellLocationResponse sellLocation, CancellationToken cancellationToken = default);
        Task<UpdateSellLocationResponse> UpdateSellLocation(string id, SellLocationResponse sellLocation, CancellationToken cancellationToken = default);
        Task<DeleteSellLocationResponse> DeleteSellLocation(string ocopProductId, string sellLocationName, CancellationToken cancellationToken = default);
        Task<ProductLookUpResponse> GetLookUpAsync();
        // Analytics
        Task<IEnumerable<OcopProductAnalytics>> GetProductAnalyticsAsync(string timeRange = "month", DateTime? startDate = null, DateTime? endDate = null, CancellationToken cancellationToken = default);
        Task<IEnumerable<OcopProductUserDemographics>> GetUserDemographicsAsync(string timeRange = "month", DateTime? startDate = null, DateTime? endDate = null, CancellationToken cancellationToken = default);
        // Top Interacted OCOP Products
        Task<IEnumerable<OcopProductAnalytics>> GetTopProductsByInteractionsAsync(int top = 5, string timeRange = "month", DateTime? startDate = null, DateTime? endDate = null, CancellationToken cancellationToken = default);
        // Top Wishlisted OCOP Products
        Task<IEnumerable<OcopProductAnalytics>> GetTopProductsByFavoritesAsync(int top = 5, string timeRange = "month", DateTime? startDate = null, DateTime? endDate = null, CancellationToken cancellationToken = default);
        // OCOP Product Comparison
        Task<IEnumerable<OcopProductAnalytics>> CompareProductsAsync(IEnumerable<string> productIds, string timeRange = "month", DateTime? startDate = null, DateTime? endDate = null, CancellationToken cancellationToken = default);
    }
}
