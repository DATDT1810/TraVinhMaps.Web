using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using TraVinhMaps.Web.Admin.Models.Review;

namespace TraVinhMaps.Web.Admin.Services.Review
{
    public interface IReviewService
    {
        Task<ReviewResponse> GetReviewByIdAsync(string id, CancellationToken cancellationToken = default);
        Task<IEnumerable<ReviewResponse>> GetLatestReviewsAsync(int count = 5, CancellationToken cancellationToken = default);
        Task<IEnumerable<ReviewResponse>> FilterReviewsAsync(string? destinationId, int? rating, DateTime? startAt, DateTime? endAt, CancellationToken cancellationToken = default);
        Task<IEnumerable<ReviewResponse>> ListAllAsync(CancellationToken cancellationToken = default);
        Task<long> CountAsync(Expression<Func<ReviewResponse, bool>> predicate = null, CancellationToken cancellationToken = default);
    }
}