// A global variable to hold the map instance
let editMap;
let editMarker;
let addMap;
let addMarker;
let platform;
let ui;
let debounceTimer;

function initializeEditMap(lat, lng) {
    if (!platform) {
        platform = new H.service.Platform({
            apikey: window.HERE_API_KEY
        });
    }
    
    const defaultLayers = platform.createDefaultLayers();
    const mapContainer = document.getElementById('editMapContainer');
    if (!mapContainer) return;
    mapContainer.innerHTML = ''; // Clear previous map

    editMap = new H.Map(mapContainer, defaultLayers.vector.normal.map, {
        center: { lat: lat, lng: lng },
        zoom: 15,
        pixelRatio: window.devicePixelRatio || 1
    });

    const behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(editMap));
    ui = H.ui.UI.createDefault(editMap, defaultLayers);

    const icon = createMarkerIcon();

    // Make the marker draggable
    editMarker = new H.map.Marker({ lat, lng }, { volatility: true, icon: icon });
    editMarker.draggable = true;
    editMap.addObject(editMarker);

    addMapEventListeners(editMap, editMarker, behavior, 'editLatitude', 'editLongitude', 'editAddress');
}

function initializeAddMap() {
    if (!platform) {
        platform = new H.service.Platform({
            apikey: window.HERE_API_KEY
        });
    }
    const defaultLayers = platform.createDefaultLayers();
    const mapContainer = document.getElementById('addMapContainer');
    if (!mapContainer) return;
    mapContainer.innerHTML = ''; // Clear previous map

    // Default to a central location in Tra Vinh
    const defaultCoords = { lat: 9.93, lng: 106.33 };

    addMap = new H.Map(mapContainer, defaultLayers.vector.normal.map, {
        center: defaultCoords,
        zoom: 12,
        pixelRatio: window.devicePixelRatio || 1
    });

    const behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(addMap));
    ui = H.ui.UI.createDefault(addMap, defaultLayers);
    
    const icon = createMarkerIcon();

    addMarker = new H.map.Marker(defaultCoords, { volatility: true, icon: icon });
    addMarker.draggable = true;
    addMap.addObject(addMarker);
    
    addMapEventListeners(addMap, addMarker, behavior, 'addLatitude', 'addLongitude', 'addAddress');
    updateFormFieldsFromMap(defaultCoords, 'addLatitude', 'addLongitude', 'addAddress');
}


function createMarkerIcon() {
    const svgMarkup = `<svg width="32" height="32" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
        <path fill="#4CAF50" d="M24 4C16.26 4 10 10.26 10 18c0 9.74 14 26 14 26s14-16.26 14-26c0-7.74-6.26-14-14-14z"/>
        <circle cx="24" cy="18" r="6" fill="white"/>
        </svg>`;
    return new H.map.Icon(svgMarkup);
}

function addMapEventListeners(map, marker, behavior, latId, lngId, addressId) {
    map.addEventListener('dragstart', function(ev) {
        if (ev.target instanceof H.map.Marker) {
            behavior.disable();
        }
    }, false);

    map.addEventListener('dragend', function(ev) {
        if (ev.target instanceof H.map.Marker) {
            behavior.enable();
            updateFormFieldsFromMap(ev.target.getGeometry(), latId, lngId, addressId);
        }
    }, false);

    map.addEventListener('drag', function(ev) {
        const target = ev.target,
              pointer = ev.currentPointer;
        if (target instanceof H.map.Marker) {
            target.setGeometry(map.screenToGeo(pointer.x, pointer.y));
        }
    }, false);

    map.addEventListener('tap', function(evt) {
        const coord = map.screenToGeo(evt.currentPointer.x, evt.currentPointer.y);
        marker.setGeometry(coord);
        updateFormFieldsFromMap(coord, latId, lngId, addressId);
    });
}

function updateFormFieldsFromMap(coord, latId, lngId, addressId) {
    const lat = coord.lat;
    const lng = coord.lng;

    document.getElementById(latId).value = lat.toFixed(6);
    document.getElementById(lngId).value = lng.toFixed(6);

    const geocodingService = platform.getSearchService();
    geocodingService.reverseGeocode({
        at: `${lat},${lng}`
    }, (result) => {
        let address = "Unknown address";
        if (result.items.length > 0) {
            address = result.items[0].address.label;
        }
        document.getElementById(addressId).value = address;
    }, (error) => {
        console.error('Reverse Geocode failed', error);
        document.getElementById(addressId).value = "Could not retrieve address";
    });
}

function updateMapFromAddress(map, marker, addressId, latId, lngId) {
    const address = document.getElementById(addressId).value;
    if (!address) return;

    const geocodingService = platform.getSearchService();
    geocodingService.geocode({
        q: address
    }, (result) => {
        if (result.items.length > 0) {
            const location = result.items[0].position;
            map.setCenter(location);
            marker.setGeometry(location);
            document.getElementById(latId).value = location.lat.toFixed(6);
            document.getElementById(lngId).value = location.lng.toFixed(6);
        } else {
            // User might still be typing
        }
    }, (error) => {
        console.error('Geocode failed', error);
    });
}

function getAddressSuggestions(query, map, suggestionsContainerId, addressId) {
    const suggestionsContainer = document.getElementById(suggestionsContainerId);
    if (!query) {
        suggestionsContainer.innerHTML = '';
        suggestionsContainer.style.display = 'none';
        return;
    }

    const autosuggestService = platform.getSearchService();
    autosuggestService.discover({
        q: query,
        at: `${map.getCenter().lat},${map.getCenter().lng}`
    }, (result) => {
        suggestionsContainer.innerHTML = '';
        if (result.items.length > 0) {
            result.items.forEach(item => {
                const suggestionItem = document.createElement('a');
                suggestionItem.href = '#';
                suggestionItem.className = 'list-group-item list-group-item-action';
                suggestionItem.innerHTML = item.address.label;
                suggestionItem.addEventListener('click', (e) => {
                    e.preventDefault();
                    document.getElementById(addressId).value = item.address.label;
                    suggestionsContainer.innerHTML = '';
                    suggestionsContainer.style.display = 'none';
                    if (addressId === 'editAddress') {
                        updateMapFromAddress(editMap, editMarker, 'editAddress', 'editLatitude', 'editLongitude');
                    } else {
                        updateMapFromAddress(addMap, addMarker, 'addAddress', 'addLatitude', 'addLongitude');
                    }
                });
                suggestionsContainer.appendChild(suggestionItem);
            });
            suggestionsContainer.style.display = 'block';
        } else {
            suggestionsContainer.style.display = 'none';
        }
    }, (error) => {
        console.error('Autosuggest failed', error);
        suggestionsContainer.style.display = 'none';
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // Edit Modal Logic
    const editLocationModal = document.getElementById('editLocationModal');
    if (editLocationModal) {
        editLocationModal.addEventListener('shown.bs.modal', function(event) {
            const button = event.relatedTarget;
            const lat = parseFloat(button.getAttribute('data-latitude'));
            const lng = parseFloat(button.getAttribute('data-longitude'));
            initializeEditMap(lat, lng);
        });
    }

    const searchAddressBtnEdit = document.getElementById('searchAddressBtnEdit');
    if (searchAddressBtnEdit) {
        searchAddressBtnEdit.addEventListener('click', () => updateMapFromAddress(editMap, editMarker, 'editAddress', 'editLatitude', 'editLongitude'));
    }

    const locationAddressInputEdit = document.getElementById('editAddress');
    if (locationAddressInputEdit) {
        locationAddressInputEdit.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                getAddressSuggestions(locationAddressInputEdit.value, editMap, 'addressSuggestionsEdit', 'editAddress');
            }, 300);
        });
    }

    // Add Modal Logic
    const addLocationModal = document.getElementById('addLocationModal');
    if (addLocationModal) {
        addLocationModal.addEventListener('shown.bs.modal', function() {
            initializeAddMap();
        });
    }

    const searchAddressBtnAdd = document.getElementById('searchAddressBtnAdd');
    if (searchAddressBtnAdd) {
        searchAddressBtnAdd.addEventListener('click', () => updateMapFromAddress(addMap, addMarker, 'addAddress', 'addLatitude', 'addLongitude'));
    }

    const locationAddressInputAdd = document.getElementById('addAddress');
    if (locationAddressInputAdd) {
        locationAddressInputAdd.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                getAddressSuggestions(locationAddressInputAdd.value, addMap, 'addressSuggestionsAdd', 'addAddress');
            }, 300);
        });
    }
    
    // Hide suggestions when clicking elsewhere
    document.addEventListener('click', function(event) {
        const suggestionsContainerEdit = document.getElementById('addressSuggestionsEdit');
        if (suggestionsContainerEdit && !suggestionsContainerEdit.contains(event.target) && event.target !== locationAddressInputEdit) {
            suggestionsContainerEdit.style.display = 'none';
        }
        
        const suggestionsContainerAdd = document.getElementById('addressSuggestionsAdd');
        if (suggestionsContainerAdd && !suggestionsContainerAdd.contains(event.target) && event.target !== locationAddressInputAdd) {
            suggestionsContainerAdd.style.display = 'none';
        }
    });
});
