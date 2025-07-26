// HERE Maps integration for Tourist Destination Detail page
let map;
let platform;
let mapInitialized = false;

// Initialize the HERE Map
function initDetailMap(latitude, longitude) {
    // Prevent duplicate initialization
    if (mapInitialized) return;

    try {
        const apiKey = window.HERE_API_KEY;

        // Check if API key is provided
        if (!apiKey || apiKey === '') {
            console.error('HERE Maps API key is missing');
            showMapError('API key for HERE Maps is missing.');
            return;
        }

        // Check if latitude and longitude are valid numbers
        if (isNaN(latitude) || isNaN(longitude)) {
            console.error('Invalid latitude or longitude values');
            latitude = 9.9513; // Default to Tra Vinh
            longitude = 106.3346;
            showMapWarning('Using default coordinates due to invalid input.');
        }

        // Initialize the platform with the API key
        platform = new H.service.Platform({
            'apikey': apiKey
        });

        // Obtain the default map types from the platform object
        const defaultLayers = platform.createDefaultLayers();

        // Use requestAnimationFrame for smoother rendering
        requestAnimationFrame(() => {
            // Instantiate the map
            map = new H.Map(
                document.getElementById('map'),
                defaultLayers.vector.normal.map,
                {
                    pixelRatio: window.devicePixelRatio || 1,
                    zoom: 15,
                    center: { lat: latitude, lng: longitude }
                }
            );

            // Add map events behavior (for zooming and panning)
            new H.mapevents.Behavior(new H.mapevents.MapEvents(map));

            // Create default UI
            H.ui.UI.createDefault(map, defaultLayers);

            // Enable dynamic resizing of the map
            window.addEventListener('resize', () => map.getViewPort().resize());

            // Add a marker at the specified location
            addStaticMarker(latitude, longitude);

            mapInitialized = true;
        });
    } catch (error) {
        console.error('Error initializing HERE Maps:', error);
        showMapError('Failed to initialize HERE Maps: ' + error.message);
    }
}

// Add a static (non-draggable) marker to the map
function addStaticMarker(latitude, longitude) {
    try {
        const svgMarkup = `<svg width="32" height="32" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path fill="#4CAF50" d="M24 4C16.26 4 10 10.26 10 18c0 9.74 14 26 14 26s14-16.26 14-26c0-7.74-6.26-14-14-14z"/>
            <circle cx="24" cy="18" r="6" fill="white"/>
            </svg>`;
        const icon = new H.map.Icon(svgMarkup);

        const marker = new H.map.Marker({ lat: latitude, lng: longitude }, { icon: icon });

        // Add the marker to the map
        map.addObject(marker);

    } catch (error) {
        console.error('Error adding static marker:', error);
        showMapError('Failed to add marker: ' + error.message);
    }
}

// Show error message on the map
function showMapError(message) {
    const mapDiv = document.getElementById('map');
    if (!mapDiv) return;
    const errorDiv = document.createElement('div');
    errorDiv.className = 'map-error';
    errorDiv.innerHTML = `<div class="alert alert-danger" role="alert">${message}</div>`;
    errorDiv.style.cssText = 'position: absolute; top: 10px; left: 10px; right: 10px; z-index: 1000;';
    mapDiv.appendChild(errorDiv);
    setTimeout(() => { if (errorDiv.parentNode === mapDiv) mapDiv.removeChild(errorDiv); }, 5000);
}

// Show warning message on the map
function showMapWarning(message) {
    const mapDiv = document.getElementById('map');
    if (!mapDiv) return;
    const warningDiv = document.createElement('div');
    warningDiv.className = 'map-warning';
    warningDiv.innerHTML = `<div class="alert alert-warning" role="alert">${message}</div>`;
    warningDiv.style.cssText = 'position: absolute; top: 10px; left: 10px; right: 10px; z-index: 1000;';
    mapDiv.appendChild(warningDiv);
    setTimeout(() => { if (warningDiv.parentNode === mapDiv) mapDiv.removeChild(warningDiv); }, 5000);
}

// Use IntersectionObserver to initialize map only when it's visible
function initializeMapObserver() {
    const mapContainer = document.querySelector('.here-map-container');
    if (!mapContainer) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // A short delay can help ensure that the tab pane is fully visible
                setTimeout(() => {
                    initDetailMap(parseFloat(mapContainer.dataset.latitude), parseFloat(mapContainer.dataset.longitude));
                    observer.unobserve(entry.target);
                }, 100);
            }
        });
    }, {
        rootMargin: '100px'
    });

    observer.observe(mapContainer);
}

// Handle tab switching to re-trigger map initialization if needed
document.addEventListener('DOMContentLoaded', () => {
    const mapTab = document.querySelector('a[data-bs-toggle="tab"][href="#top-map"]');
    if (mapTab) {
        mapTab.addEventListener('shown.bs.tab', function () {
            if (!mapInitialized) {
                initializeMapObserver();
            }
            // Also, force a resize to fix potential rendering issues in a hidden tab
            if (map) {
                map.getViewPort().resize();
            }
        });
    }

    // Initial check in case the map tab is already active on page load
    if (document.querySelector('#top-map')?.classList.contains('active')) {
        initializeMapObserver();
    }
});
