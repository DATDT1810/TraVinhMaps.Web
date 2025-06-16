using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using TraVinhMaps.Web.Admin.Models.Feedback;

namespace TraVinhMaps.Web.Admin.Services.Feedback
{
    public interface IFeedbackService
    {
        // Retrieve feedback by ID
        Task<FeedbackResponse> GetByIdAsync(string id, CancellationToken cancellationToken = default);

        // Retrieve all feedback
        Task<IEnumerable<FeedbackResponse>> ListAllAsync(CancellationToken cancellationToken = default);

        // Retrieve feedback based on a predicate
        Task<IEnumerable<FeedbackResponse>> ListAsync(Expression<Func<FeedbackResponse, bool>> predicate, CancellationToken cancellationToken = default);
    }
}