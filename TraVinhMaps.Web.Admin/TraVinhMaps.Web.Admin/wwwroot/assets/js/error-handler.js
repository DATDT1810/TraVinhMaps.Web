// Global error handler for API responses and session expiration
(function() {
    // Function to handle different types of errors
    function handleApiError(status, message) {
        // Prevent multiple alerts
        if (document.querySelector('.swal2-container')) {
            return;
        }
        
        // Handle different error types
        switch (status) {
            case 401:
                // Session expired, handled by session-handler.js
                return;
            case 403:
                // Forbidden - Access denied
                Swal.fire({
                    title: 'Access Denied',
                    text: message || 'You do not have permission to access this resource.',
                    icon: 'error',
                    confirmButtonColor: '#dc3545'
                });
                break;
            case 404:
                // Not found
                Swal.fire({
                    title: 'Not Found',
                    text: message || 'The requested resource could not be found.',
                    icon: 'warning',
                    confirmButtonColor: '#ffc107'
                });
                break;
            case 500:
            case 502:
            case 503:
            case 504:
                // Server errors
                Swal.fire({
                    title: 'Server Error',
                    text: message || 'An error occurred while processing your request. Please try again later.',
                    icon: 'error',
                    confirmButtonColor: '#dc3545'
                });
                break;
            default:
                // Other errors
                if (status >= 400) {
                    Swal.fire({
                        title: 'Error',
                        text: message || 'An error occurred while processing your request.',
                        icon: 'error',
                        confirmButtonColor: '#dc3545'
                    });
                }
        }
    }

    // Set up global AJAX error handler
    $(document).ajaxError(function(event, xhr, settings) {
        if (xhr.status !== 401) { // Session expiration is handled by session-handler.js
            handleApiError(xhr.status, xhr.responseJSON?.message || xhr.statusText);
        }
    });

    // Override fetch API to catch errors
    const originalFetch = window.fetch;
    window.fetch = function() {
        return originalFetch.apply(this, arguments)
            .then(response => {
                if (!response.ok && response.status !== 401) {
                    response.json().then(data => {
                        handleApiError(response.status, data?.message || response.statusText);
                    }).catch(() => {
                        handleApiError(response.status, response.statusText);
                    });
                }
                return response;
            });
    };

    // Make the error handler available globally
    window.handleApiError = handleApiError;
})(); 