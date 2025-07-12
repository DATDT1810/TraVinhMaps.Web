// A global variable to hold the map instance
let map;
let marker;
let platform;
let ui;
let debounceTimer; // For debouncing search input

/**
 * Initializes the HERE Map, adds a draggable marker, and sets up event listeners.
 * @param {number} lat Initial latitude for the map center.
 * @param {number} lng Initial longitude for the map center.
 */
function initializeMap(lat, lng) {
    if (!platform) {
        platform = new H.service.Platform({ apikey: window.HERE_API_KEY });
    }

    const defaultLayers = platform.createDefaultLayers();
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;
    mapContainer.innerHTML = '';

    map = new H.Map(mapContainer, defaultLayers.vector.normal.map, {
        center: { lat, lng },
        zoom: 15,
        pixelRatio: window.devicePixelRatio || 1
    });

    const behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));
    ui = H.ui.UI.createDefault(map, defaultLayers);
    
    const icon = createMarkerIcon();
    marker = new H.map.Marker({ lat, lng }, { volatility: true, icon: icon });
    marker.draggable = true;
    map.addObject(marker);

    addMapEventListeners(map, marker, behavior);
    updateFormFieldsFromMap({ lat, lng });
}

/**
 * Creates a custom SVG icon for the map marker.
 * @returns {H.map.Icon} A HERE Maps icon object.
 */
function createMarkerIcon() {
    const svgMarkup = `<svg width="32" height="32" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
        <path fill="#4CAF50" d="M24 4C16.26 4 10 10.26 10 18c0 9.74 14 26 14 26s14-16.26 14-26c0-7.74-6.26-14-14-14z"/>
        <circle cx="24" cy="18" r="6" fill="white"/>
        </svg>`;
    return new H.map.Icon(svgMarkup);
}

/**
 * Sets up event listeners for map interactions like dragging and tapping.
 * @param {H.Map} map The map instance.
 * @param {H.map.Marker} marker The marker instance.
 * @param {H.mapevents.Behavior} behavior The map behavior instance.
 */
function addMapEventListeners(map, marker, behavior) {
    // Event listener for when dragging starts on a marker
    map.addEventListener('dragstart', (ev) => {
        const target = ev.target;
        // Check if the dragged object is a marker
        if (target instanceof H.map.Marker) {
            // Disable the map's default panning behavior
            behavior.disable(H.mapevents.Behavior.Feature.PANNING);
        }
    }, false);

    // Event listener for when dragging ends
    map.addEventListener('dragend', (ev) => {
        const target = ev.target;
        if (target instanceof H.map.Marker) {
            // Re-enable the map's default panning behavior
            behavior.enable(H.mapevents.Behavior.Feature.PANNING);
            // Update the form with the new coordinates
            updateFormFieldsFromMap(target.getGeometry());
        }
    }, false);

    // Event listener for the drag event itself
    map.addEventListener('drag', (ev) => {
        const target = ev.target;
        const pointer = ev.currentPointer;
        if (target instanceof H.map.Marker) {
            // Update the marker's position on the map
            target.setGeometry(map.screenToGeo(pointer.viewportX, pointer.viewportY));
        }
    }, false);

    // Event listener for tap/click events on the map
    map.addEventListener('tap', (ev) => {
        // Get the geographical coordinates from the screen coordinates of the tap
        const coord = map.screenToGeo(ev.currentPointer.viewportX, ev.currentPointer.viewportY);
        // Move the marker to the tapped location
        marker.setGeometry(coord);
        // Update the address and coordinate fields in the form
        updateFormFieldsFromMap(coord);
    });
}

/**
 * Updates the form's lat, lng, and address fields based on the marker's position.
 * @param {H.geo.Point} coord The coordinate object {lat, lng}.
 * @param {string | null} addressLabel An optional address label to prevent reverse geocoding.
 */
function updateFormFieldsFromMap(coord, addressLabel = null) {
    const lat = coord.lat;
    const lng = coord.lng;

    document.getElementById('latitude').value = lat.toFixed(6);
    document.getElementById('longitude').value = lng.toFixed(6);

    const addressEl = document.getElementById('Address');

    if (addressLabel) {
        addressEl.value = addressLabel;
        return; 
    }

    addressEl.value = 'Retrieving address...';

    const geocodingService = platform.getSearchService();
    geocodingService.reverseGeocode({ at: `${lat},${lng}` },
        (result) => {
            let address = "Unknown address";
            if (result.items && result.items.length > 0) {
                address = result.items[0].address.label;
            }
            addressEl.value = address;
        },
        (error) => {
            console.error('Reverse Geocode failed', error);
            addressEl.value = "Could not retrieve address";
        }
    );
}

/**
 * Geocodes an address string from the search box and updates the map.
 * @param {string} address The address to search for.
 */
function geocodeAddress(address) {
    const geocoder = platform.getSearchService();
    const addressEl = document.getElementById('Address');
    addressEl.value = 'Searching...';

    geocoder.geocode({ q: address, in: 'countryCode:VNM' },
        (result) => {
            if (result.items.length > 0) {
                const location = result.items[0];
                map.setCenter(location.position);
                marker.setGeometry(location.position);
                updateFormFieldsFromMap(location.position, location.address.label);
            } else {
                addressEl.value = 'Address not found.';
            }
        },
        (error) => {
            console.error('Geocode error:', error);
            addressEl.value = 'Error searching for address.';
        }
    );
}

/**
 * Fetches and displays address suggestions as the user types in the search box.
 * @param {string} query The search query.
 */
async function getAddressSuggestions(query) {
    const suggestionsContainer = document.getElementById('addressSuggestions');
    if (!query || query.length < 2) {
        suggestionsContainer.innerHTML = '';
        return;
    }

    const url = `https://autosuggest.search.hereapi.com/v1/autosuggest?q=${encodeURIComponent(query)}&apiKey=${window.HERE_API_KEY}&at=${map.getCenter().lat},${map.getCenter().lng}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        
        suggestionsContainer.innerHTML = '';
        if (data.items) {
            data.items.forEach(item => {
                if (!item.position) return;
                const suggestionEl = document.createElement('a');
                suggestionEl.href = '#';
                suggestionEl.className = 'list-group-item list-group-item-action';
                suggestionEl.textContent = item.title;
                suggestionEl.onclick = (e) => {
                    e.preventDefault();
                    suggestionsContainer.innerHTML = '';
                    map.setCenter(item.position);
                    marker.setGeometry(item.position);
                    updateFormFieldsFromMap(item.position, item.title);
                };
                suggestionsContainer.appendChild(suggestionEl);
            });
        }
    } catch (error) {
        console.error('Address suggestion fetch error:', error);
    }
}

/**
 * Entry point: Initializes the map and all related event listeners.
 */
document.addEventListener('DOMContentLoaded', () => {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;

    const lat = parseFloat(mapContainer.dataset.latitude) || 9.9513;
    const lng = parseFloat(mapContainer.dataset.longitude) || 106.3346;
    
    initializeMap(lat, lng);
    
    const searchButton = document.getElementById('searchAddressBtn');
    const addressInput = document.getElementById('Address');
    const suggestionsContainer = document.getElementById('addressSuggestions');

    searchButton.addEventListener('click', () => geocodeAddress(addressInput.value));
    addressInput.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => getAddressSuggestions(addressInput.value), 300);
    });
    
    document.addEventListener('click', (e) => {
        if (!suggestionsContainer.contains(e.target) && e.target !== addressInput) {
            suggestionsContainer.innerHTML = '';
        }
    });
});

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
                const lat = parseFloat(mapContainer.dataset.latitude) || 9.9513;
                const lng = parseFloat(mapContainer.dataset.longitude) || 106.3346;
                initializeMap(lat, lng);
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