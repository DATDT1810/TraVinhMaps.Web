// HERE Maps integration for Tourist Destination Edit page
let map;
let marker;
let behavior;
let platform;
let defaultLayers;
let apikey;
let mapInitialized = false;

// Initialize the HERE Map
function initMap( latitude, longitude) {
    // Prevent duplicate initialization
    if (mapInitialized) return;
    
    try {
       const apiKey = window.HERE_API_KEY;
        
        // Check if API key is provided
        if (!apiKey || apiKey === '') {
            console.error('HERE Maps API key is missing');
            showMapError('API key for HERE Maps is missing. Please check your environment variables.');
            return;
        }
        
        // Check if latitude and longitude are valid numbers
        if (isNaN(latitude) || isNaN(longitude)) {
            console.error('Invalid latitude or longitude values');
            // Set default values for Tra Vinh, Vietnam
            latitude = 9.9513;
            longitude = 106.3346;
            showMapWarning('Using default coordinates for Tra Vinh (9.9513, 106.3346) due to invalid input.');
        }
        
        // Initialize the platform with the API key
        platform = new H.service.Platform({
            'apikey': apiKey
        });
        
        // Obtain the default map types from the platform object
        defaultLayers = platform.createDefaultLayers();
        
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
            
            // Add map events behavior
            behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));
            
            // Create default UI
            const ui = H.ui.UI.createDefault(map, defaultLayers);
            
            // Enable dynamic resizing of the map
            window.addEventListener('resize', () => map.getViewPort().resize());
            
            // Add a marker at the specified location
            addMarker(latitude, longitude);
            
            // Add click event to the map to update marker position
            map.addEventListener('tap', function(evt) {
                const coord = map.screenToGeo(evt.currentPointer.viewportX, evt.currentPointer.viewportY);
                updateMarker(coord.lat, coord.lng);
                reverseGeocode(coord.lat, coord.lng);
            });
            
            mapInitialized = true;
            
            // Hide the loading indicator
            const loadingElement = document.getElementById('map-loading');
            if (loadingElement) {
                loadingElement.style.display = 'none';
            }
        });
    } catch (error) {
        console.error('Error initializing HERE Maps:', error);
        showMapError('Failed to initialize HERE Maps: ' + error.message);
    }
}

// Add a marker to the map
function addMarker(latitude, longitude) {
    try {
        // Remove existing marker if any
        if (marker && marker.getGeometry()) {
            map.removeObject(marker);
        }
        
        // Create a new marker
        const svgMarkup = `<svg width="32" height="32" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path fill="#4CAF50" d="M24 4C16.26 4 10 10.26 10 18c0 9.74 14 26 14 26s14-16.26 14-26c0-7.74-6.26-14-14-14z"/>
            <circle cx="24" cy="18" r="6" fill="white"/>
            </svg>`;
        const icon = new H.map.Icon(svgMarkup);
        
        marker = new H.map.Marker({ lat: latitude, lng: longitude }, { icon: icon, volatility: true });
        
        // Add the marker to the map
        map.addObject(marker);
        
        // Make the marker draggable
        enableMarkerDrag();
        
        // Update the form fields with the marker position
        updateFormFields(latitude, longitude);
    } catch (error) {
        console.error('Error adding marker:', error);
        showMapError('Failed to add marker: ' + error.message);
    }
}

// Update marker position
function updateMarker(latitude, longitude) {
    try {
        // Update the marker position
        marker.setGeometry({ lat: latitude, lng: longitude });
        
        // Update the form fields with the new position
        updateFormFields(latitude, longitude);
    } catch (error) {
        console.error('Error updating marker:', error);
        showMapError('Failed to update marker: ' + error.message);
    }
}

// Enable marker drag functionality
function enableMarkerDrag() {
    try {
        // Add drag event listeners
        marker.draggable = true;
        
        map.addEventListener('dragstart', (ev) => {
            if (ev.target === marker) behavior.disable();
        }, false);
        
        map.addEventListener('dragend', (ev) => {
            if (ev.target === marker) {
                behavior.enable();
                updateFormFields(ev.target.getGeometry().lat, ev.target.getGeometry().lng);
            }
        }, false);
        
        map.addEventListener('drag', (ev) => {
            if (ev.target === marker) {
                ev.target.setGeometry(map.screenToGeo(ev.currentPointer.viewportX, ev.currentPointer.viewportY));
            }
        }, false);
    } catch (error) {
        console.error('Error enabling marker drag:', error);
        showMapError('Failed to make marker draggable: ' + error.message);
    }
}

// Update the form fields with the marker position
function updateFormFields(latitude, longitude) {
    try {
        const latitudeInput = document.getElementById('latitude');
        const longitudeInput = document.getElementById('longitude');
        
        if (!latitudeInput || !longitudeInput) {
            console.error('Latitude or longitude input fields not found');
            return;
        }
        
        latitudeInput.value = latitude.toFixed(6);
        longitudeInput.value = longitude.toFixed(6);
    } catch (error) {
        console.error('Error updating form fields:', error);
    }
}

// Function to be called when latitude or longitude inputs change
function updateMapFromForm() {
    try {
        const latitude = parseFloat(document.getElementById('latitude').value);
        const longitude = parseFloat(document.getElementById('longitude').value);
        
        if (!isNaN(latitude) && !isNaN(longitude)) {
            // Update the map center
            map.setCenter({ lat: latitude, lng: longitude });
            
            // Update the marker position
            updateMarker(latitude, longitude);
        }
    } catch (error) {
        console.error('Error updating map from form:', error);
        showMapError('Failed to update map from form input: ' + error.message);
    }
}

// Show error message on the map
function showMapError(message) {
    const mapDiv = document.getElementById('map');
    if (!mapDiv) return;
    
    // Create error overlay
    const errorDiv = document.createElement('div');
    errorDiv.className = 'map-error';
    errorDiv.innerHTML = `<div class="alert alert-danger" role="alert">${message}</div>`;
    errorDiv.style.position = 'absolute';
    errorDiv.style.top = '10px';
    errorDiv.style.left = '10px';
    errorDiv.style.right = '10px';
    errorDiv.style.zIndex = '1000';
    
    mapDiv.appendChild(errorDiv);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (errorDiv.parentNode === mapDiv) {
            mapDiv.removeChild(errorDiv);
        }
    }, 5000);
}

// Show warning message on the map
function showMapWarning(message) {
    const mapDiv = document.getElementById('map');
    if (!mapDiv) return;
    
    // Create warning overlay
    const warningDiv = document.createElement('div');
    warningDiv.className = 'map-warning';
    warningDiv.innerHTML = `<div class="alert alert-warning" role="alert">${message}</div>`;
    warningDiv.style.position = 'absolute';
    warningDiv.style.top = '10px';
    warningDiv.style.left = '10px';
    warningDiv.style.right = '10px';
    warningDiv.style.zIndex = '1000';
    
    mapDiv.appendChild(warningDiv);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (warningDiv.parentNode === mapDiv) {
            mapDiv.removeChild(warningDiv);
        }
    }, 5000);
}

function initializeMapObserver() {
    const mapContainer = document.querySelector('.here-map-container');
    if (!mapContainer) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                initMap( parseFloat(mapContainer.dataset.latitude), parseFloat(mapContainer.dataset.longitude));
                observer.unobserve(entry.target);
            }
        });
    }, {
        rootMargin: '100px'
    });

    observer.observe(mapContainer);
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeMapObserver);
} else {
    initializeMapObserver();
}

// Function to perform reverse geocoding
function reverseGeocode(latitude, longitude) {
    const geocoder = platform.getSearchService();
    geocoder.reverseGeocode({
        at: `${latitude.toFixed(6)},${longitude.toFixed(6)}`
    }, (result) => {
        if (result.items.length > 0) {
            document.getElementById('Address').value = result.items[0].address.label;
        } else {
            console.warn('Could not reverse geocode the selected location.');
            document.getElementById('Address').value = 'Address not found';
        }
    }, (error) => {
        console.error('Reverse geocoding failed:', error);
        document.getElementById('Address').value = 'Error finding address';
    });
} 