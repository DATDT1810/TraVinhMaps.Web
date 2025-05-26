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