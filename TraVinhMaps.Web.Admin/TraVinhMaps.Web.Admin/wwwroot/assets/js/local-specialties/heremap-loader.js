function loadMap(mapContainer) {
    // This API key is set in a script tag in the Razor view
    const apiKey = window.HERE_API_KEY;
    if (!apiKey) {
        console.error("HERE Maps API key is missing.");
        mapContainer.innerHTML = '<div style="text-align: center; padding: 20px; color: #888;">Configuration Error</div>';
        return;
    }

    const platform = new H.service.Platform({
        'apikey': apiKey
    });
    const defaultLayers = platform.createDefaultLayers();

    const latitude = parseFloat(mapContainer.dataset.latitude);
    const longitude = parseFloat(mapContainer.dataset.longitude);

    if (isNaN(latitude) || isNaN(longitude) || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180 || (latitude === 0 && longitude === 0)) {
        console.error(`Invalid or null coordinates: Lat=${latitude}, Lng=${longitude}`);
        mapContainer.innerHTML = '<div style="text-align: center; padding: 20px; color: #888;">Map not available.<br>Invalid or missing coordinates.</div>';
        return;
    }

    try {
        const map = new H.Map(
            mapContainer,
            defaultLayers.vector.normal.map,
            {
                zoom: 14,
                center: { lat: latitude, lng: longitude },
                pixelRatio: window.devicePixelRatio || 1
            }
        );

        window.addEventListener('resize', () => map.getViewPort().resize());

        const behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));
        const ui = H.ui.UI.createDefault(map, defaultLayers);

        // Custom green marker icon
        const svgMarkup = `<svg width="32" height="32" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path fill="#4CAF50" d="M24 4C16.26 4 10 10.26 10 18c0 9.74 14 26 14 26s14-16.26 14-26c0-7.74-6.26-14-14-14z"/>
            <circle cx="24" cy="18" r="6" fill="white"/>
            </svg>`;

        const icon = new H.map.Icon(svgMarkup);
        const marker = new H.map.Marker({ lat: latitude, lng: longitude }, { icon: icon });
        map.addObject(marker);
        
        const card = mapContainer.closest('.location-card');

        // Add event listener to the map to open the edit modal when clicked
        map.addEventListener('tap', function (evt) {
            // Check if there is a map object (like a marker) at the tapped position.
            const objectAtTap = map.getObjectAt(evt.currentPointer.x, evt.currentPointer.y);
            
            // If an object exists at the tap location, it's likely the marker. 
            // We let the marker's own 'tap' event handle it and do nothing here.
            if (objectAtTap) {
                return;
            }

            // If no object was found, it means the user clicked the map background.
            // In that case, we trigger the edit modal.
            if (card) {
                const editButton = card.querySelector('.edit-location-btn');
                if (editButton) {
                    editButton.click();
                }
            }
        });

        if (card) {
            marker.addEventListener('tap', () => {
                const searchService = platform.getSearchService();

                searchService.reverseGeocode({
                    at: `${latitude},${longitude}`
                }, (result) => {
                    const locationNameElement = card.querySelector('h5');
                    const locationName = locationNameElement ? locationNameElement.textContent.trim() : 'N/A';
                    let addressLabel = "Unknown";

                    if (result.items.length > 0) {
                        addressLabel = result.items[0].address.label;
                    }

                    const bubbleContent = `
                        <div style="min-width: 250px; font-size: 14px; line-height: 1.4;">
                            <div style="font-weight: bold; font-size: 16px; margin-bottom: 8px;">${locationName}</div>
                            <div style="color: #555;">${addressLabel}</div>
                        </div>`;

                    const bubble = new H.ui.InfoBubble(
                        { lat: latitude, lng: longitude },
                        { content: bubbleContent }
                    );
                    ui.addBubble(bubble);

                }, (error) => {
                    console.error('Reverse Geocoding failed:', error);
                    const locationNameElement = card.querySelector('h5');
                    const locationName = locationNameElement ? locationNameElement.textContent.trim() : 'N/A';
                    const bubbleContent = `
                        <div style="min-width: 250px; font-size: 14px; line-height: 1.4;">
                            <div style="font-weight: bold; font-size: 16px; margin-bottom: 8px;">${locationName}</div>
                            <div style="color: #555;">Unknown</div>
                        </div>`;
                    const bubble = new H.ui.InfoBubble(
                        { lat: latitude, lng: longitude },
                        { content: bubbleContent }
                    );
                    ui.addBubble(bubble);
                });
            });
        }

    } catch (e) {
        console.error(`An error occurred during HERE Map initialization:`, e);
        mapContainer.innerHTML = '<div style="text-align: center; padding: 20px; color: #888;">Error loading map.</div>';
    }
}

function initializeMapObserver() {
    const mapContainers = document.querySelectorAll('.here-map-container');

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const mapContainer = entry.target;
                loadMap(mapContainer);
                // Stop observing the container once the map is loaded
                observer.unobserve(mapContainer);
            }
        });
    }, {
        // Start loading the map when it's 200px away from the viewport
        rootMargin: '200px'
    });

    mapContainers.forEach(container => {
        observer.observe(container);
    });
}


// Wait for the DOM to be fully loaded before initializing maps
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeMapObserver);
} else {
    // The DOM is already ready
    initializeMapObserver();
}
