// Add localStorage functionality to persist dark mode
(function() {
    // Check for saved theme preference on page load
    document.addEventListener('DOMContentLoaded', function() {
        const darkModeEnabled = localStorage.getItem('darkMode') === 'enabled';
        if (darkModeEnabled && !document.body.classList.contains('dark-only')) {
            document.body.classList.add('dark-only');
        }
    });

    // Find the existing click handler for the mode toggle and enhance it
    // We'll use MutationObserver to detect when the dark-only class is added/removed
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.attributeName === 'class') {
                const hasDarkClass = document.body.classList.contains('dark-only');
                localStorage.setItem('darkMode', hasDarkClass ? 'enabled' : 'disabled');
            }
        });
    });

    // Start observing the body element for class changes
    observer.observe(document.body, { attributes: true });
})();

// Original customizer code below 