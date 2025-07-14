document.addEventListener('DOMContentLoaded', function () {
    const addressInput = document.getElementById('Address');
    const searchButton = document.getElementById('searchAddressBtn');
    const suggestionsContainer = document.getElementById('addressSuggestions');
    const apiKey = window.HERE_API_KEY;

    if (!addressInput || !searchButton || !suggestionsContainer) {
        console.error('Search elements not found.');
        return;
    }

    // Function to fetch address suggestions from HERE API
    async function getAddressSuggestions(query) {
        if (!apiKey) {
            console.error('HERE Maps API key is missing.');
            return;
        }
        if (query.length < 3) {
            suggestionsContainer.innerHTML = '';
            return;
        }

        const url = `https://autosuggest.search.hereapi.com/v1/autosuggest?q=${encodeURIComponent(query)}&apiKey=${apiKey}&at=9.9513,106.3346`; // Default to Tra Vinh

        try {
            const response = await fetch(url);
            const data = await response.json();
            displaySuggestions(data.items);
        } catch (error) {
            console.error('Error fetching address suggestions:', error);
        }
    }

    // Function to display suggestions
    function displaySuggestions(items) {
        suggestionsContainer.innerHTML = '';
        if (!items || items.length === 0) {
            return;
        }

        items.forEach(item => {
            const suggestionElement = document.createElement('a');
            suggestionElement.href = '#';
            suggestionElement.className = 'list-group-item list-group-item-action';
            suggestionElement.textContent = item.title;
            suggestionElement.dataset.latitude = item.position.lat;
            suggestionElement.dataset.longitude = item.position.lng;
            suggestionElement.addEventListener('click', function (e) {
                e.preventDefault();
                addressInput.value = item.title;
                suggestionsContainer.innerHTML = '';
                updateMapAndForm(item.position.lat, item.position.lng);
            });
            suggestionsContainer.appendChild(suggestionElement);
        });
    }

    // Function to geocode the address from the input field
    function geocodeAddress(query) {
        if (!platform) {
            console.error('HERE Maps platform is not initialized.');
            return;
        }

        const geocoder = platform.getSearchService();
        geocoder.geocode({ q: query, in: 'countryCode:VNM' }, 
            (result) => {
                if (result.items.length > 0) {
                    const location = result.items[0];
                    updateMapAndForm(location.position.lat, location.position.lng);
                    // Also update the address field with the canonical address
                    document.getElementById('Address').value = location.address.label;
                } else {
                    console.warn(`Geocoding failed: No results found for "${query}"`);
                }
            }, 
            (error) => {
                console.error('Geocoding error:', error);
            }
        );
    }

    // Function to update map and form fields
    function updateMapAndForm(latitude, longitude) {
        document.getElementById('latitude').value = latitude.toFixed(6);
        document.getElementById('longitude').value = longitude.toFixed(6);

        if (window.updateMapFromForm) {
            window.updateMapFromForm();
        }
    }

    // Event listeners
    searchButton.addEventListener('click', () => geocodeAddress(addressInput.value));
    addressInput.addEventListener('input', () => getAddressSuggestions(addressInput.value));

    // Hide suggestions when clicking outside
    document.addEventListener('click', function (e) {
        if (!suggestionsContainer.contains(e.target) && e.target !== addressInput) {
            suggestionsContainer.innerHTML = '';
        }
    });
}); 