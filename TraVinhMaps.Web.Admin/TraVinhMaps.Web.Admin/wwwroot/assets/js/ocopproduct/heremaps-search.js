/**
 * Performs a geocoding search using the HERE Maps API.
 * Handles cases where an address is not found by falling back to a default location
 * and providing user feedback.
 *
 * @param {H.service.Platform} platform An initialized HERE Maps platform object.
 * @param {H.Map} map The map instance to display results on.
 * @param {string} address The address to search for.
 * @param {HTMLInputElement} addressInputEl The input element for the address.
 * @param {HTMLInputElement} latInputEl The input element for latitude.
 * @param {HTMLInputElement} lngInputEl The input element for longitude.
 * @param {HTMLElement} warningEl The element to display warning messages in.
 */
function searchAddress(platform, map, address, addressInputEl, latInputEl, lngInputEl, warningEl) {
    if (!address) {
        warningEl.innerHTML = 'Please enter an address to search.';
        warningEl.style.display = 'block';
        return;
    }

    const geocoder = platform.getSearchService();

    // Clear previous warnings
    warningEl.innerHTML = '';
    warningEl.style.display = 'none';

    // Geocode the user-provided address, biased towards Vietnam
    geocoder.geocode({ q: address, in: 'countryCode:VNM' }, (result) => {
        if (result.items.length > 0) {
            const location = result.items[0];
            const { lat, lng } = location.position;
            const addressLabel = location.address.label;

            map.setCenter({ lat, lng });
            map.setZoom(17);

            // Remove previous markers and add a new one
            // Assuming the map has only one marker for the location search
            map.removeObjects(map.getObjects().filter(o => o instanceof H.map.Marker));
            const marker = new H.map.Marker({ lat, lng });
            map.addObject(marker);

            latInputEl.value = lat.toFixed(6);
            lngInputEl.value = lng.toFixed(6);

            // If the result is not very precise (e.g., not a specific house number), warn the user
            // and keep their original input.
            if (location.resultType !== 'houseNumber' && location.resultType !== 'pointAddress') {
                addressInputEl.value = address; // Keep the user's typed address
                warningEl.innerHTML = `We couldn't find an exact match. The marker has been placed at the closest location found for "${addressLabel}". Please verify the location on the map.`;
                warningEl.style.display = 'block';
            } else {
                addressInputEl.value = addressLabel; // Update with the canonical address
            }
        } else {
            // Address not found. Per requirements, we need to:
            // 1. Keep the user's entered address.
            // 2. Show a warning.
            // 3. Get coordinates for a "nearby" place and show a marker.
            // We'll use "Tra Vinh" as the fallback "nearby" location.

            addressInputEl.value = address; // Keep user's input

            warningEl.innerHTML = `The address "${address}" could not be found. Showing a central point in Tra Vinh as a reference. Please drag the marker to the correct location or try a different address.`;
            warningEl.style.display = 'block';
            
            // Fallback geocode for "Tra Vinh city"
            geocoder.geocode({ q: 'Thành phố Trà Vinh, Trà Vinh, Việt Nam' }, (fallbackResult) => {
                if (fallbackResult.items.length > 0) {
                    const fallbackLocation = fallbackResult.items[0];
                    const { lat, lng } = fallbackLocation.position;

                    map.setCenter({ lat, lng });
                    map.setZoom(13);

                    map.removeObjects(map.getObjects().filter(o => o instanceof H.map.Marker));
                    const marker = new H.map.Marker({ lat, lng });
                    map.addObject(marker);

                    // Update coordinates to the fallback location
                    latInputEl.value = lat.toFixed(6);
                    lngInputEl.value = lng.toFixed(6);
                } else {
                    // If even the fallback fails, we can't do much more.
                    // The warning is already displayed.
                    console.error('HERE Maps fallback search failed.');
                }
            }, (error) => {
                console.error('HERE Maps Fallback Geocoding error:', error);
            });
        }
    }, (error) => {
        console.error('HERE Maps Geocoding error:', error);
        warningEl.innerHTML = 'An error occurred while searching for the address. Please check your connection and try again.';
        warningEl.style.display = 'block';
    });
}
