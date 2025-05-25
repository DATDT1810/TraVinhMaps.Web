// Session handler for detecting 401 responses and session expiration
(function() {
    // Flag to prevent multiple alerts
    let sessionExpiredAlertShown = false;
    
    // Function to show session expired alert and redirect to login
    function handleSessionExpired() {
        // Prevent multiple alerts
        if (sessionExpiredAlertShown || document.querySelector('.swal2-container')) {
            return;
        }
        
        sessionExpiredAlertShown = true;
        
        // Use SweetAlert to show the session expired message
        Swal.fire({
            title: 'Session Expired',
            text: 'The Session is expired. Please Login Again',
            icon: 'warning',
            confirmButtonText: 'Log In',
            confirmButtonColor: '#dc3545',
            allowOutsideClick: false,
            allowEscapeKey: false
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.href = '/Authen';
            } else {
                // Even if user somehow dismisses, still redirect
                window.location.href = '/Authen';
            }
        });
    }

    // Function to validate session
    function validateSession() {
        $.ajax({
            url: '/api/session/validate',
            method: 'GET',
            cache: false,
            success: function(response) {
                // Session is valid, reset the flag
                sessionExpiredAlertShown = false;
            },
            error: function(xhr) {
                if (xhr.status === 401) {
                    handleSessionExpired();
                }
            }
        });
    }

    // Set up global AJAX error handler for 401 responses
    $(document).ajaxError(function(event, xhr) {
        if (xhr.status === 401) {
            handleSessionExpired();
        }
    });

    // Override fetch API to catch 401 responses
    const originalFetch = window.fetch;
    window.fetch = function() {
        return originalFetch.apply(this, arguments)
            .then(response => {
                if (response.status === 401) {
                    handleSessionExpired();
                }
                return response;
            });
    };

    // Override XMLHttpRequest to catch 401 responses
    const originalXHROpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function() {
        this.addEventListener('load', function() {
            if (this.status === 401) {
                handleSessionExpired();
            }
        });
        originalXHROpen.apply(this, arguments);
    };

    // Validate session on page load
    $(document).ready(function() {
        validateSession();
    });

    // Validate session periodically (every 3 minutes)
    setInterval(validateSession, 3 * 60 * 1000);
})(); 