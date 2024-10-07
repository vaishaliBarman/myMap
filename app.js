// Replace with your actual Mapbox access token
mapboxgl.accessToken = 'pk.eyJ1IjoicmFrc2hpdGEtMjYiLCJhIjoiY20xdnFqaHZ0MGNqaDJpczl4MDF5M2pqciJ9._oHfI_VsnP2I5nwm-7NGGQ'; // <-- Replace this with your Mapbox token

// Initialize the Mapbox map
const map = new mapboxgl.Map({
    container: 'map', // Container ID
    style: 'mapbox://styles/mapbox/streets-v11', // Map style
    center: [0, 20], // Initial map center [lng, lat]
    zoom: 2 // Initial zoom level
});

// Add navigation controls (zoom in/out, rotate, etc.)
map.addControl(new mapboxgl.NavigationControl());

// Initialize variables to store markers and coordinates for Distance Calculation
let startMarker = null;
let endMarker = null;
let startCoordinates = null;
let endCoordinates = null;

// Function to create a marker
function createMarker(coordinates, color) {
    return new mapboxgl.Marker({ color: color })
        .setLngLat(coordinates)
        .addTo(map);
}

// Function to fetch autocomplete suggestions
async function fetchAutocomplete(query) {
    const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?autocomplete=true&limit=5&access_token=${mapboxgl.accessToken}`);
    const data = await response.json();
    return data.features;
}

// Debounce function to limit API calls
function debounce(func, delay) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

// ---------------------------------------
// General Search Functionality
// ---------------------------------------
const generalSearchInput = document.getElementById('general-search');
const generalAutocompleteList = document.getElementById('general-autocomplete-list');

generalSearchInput.addEventListener('input', debounce(async function() {
    const query = this.value;
    generalAutocompleteList.innerHTML = ''; // Clear previous suggestions

    if (!query) return;

    try {
        const suggestions = await fetchAutocomplete(query);
        suggestions.forEach(place => {
            const item = document.createElement('div');
            item.textContent = place.place_name;
            item.addEventListener('click', () => {
                // Set search input to selected suggestion
                generalSearchInput.value = place.place_name;
                generalAutocompleteList.innerHTML = '';

                // Fly to the selected location
                map.flyTo({
                    center: place.geometry.coordinates,
                    zoom: 12
                });
            });
            generalAutocompleteList.appendChild(item);
        });
    } catch (error) {
        console.error('Error fetching general autocomplete:', error);
    }
}, 300)); // 300ms delay

// Close the general autocomplete list if the user clicks outside of it
document.addEventListener('click', function (e) {
    if (e.target !== generalSearchInput) {
        generalAutocompleteList.innerHTML = '';
    }
});

// ---------------------------------------
// Distance Calculation Search Functionality
// ---------------------------------------

// Start Location Search
const startSearchInput = document.getElementById('start-search');
const startAutocompleteList = document.getElementById('start-autocomplete-list');

startSearchInput.addEventListener('input', debounce(async function() {
    const query = this.value;
    startAutocompleteList.innerHTML = ''; // Clear previous suggestions

    if (!query) return;

    try {
        const suggestions = await fetchAutocomplete(query);
        suggestions.forEach(place => {
            const item = document.createElement('div');
            item.textContent = place.place_name;
            item.addEventListener('click', () => {
                // Set search input to selected suggestion
                startSearchInput.value = place.place_name;
                startAutocompleteList.innerHTML = '';

                // Fly to the selected location
                map.flyTo({
                    center: place.geometry.coordinates,
                    zoom: 12
                });

                // Remove existing start marker if any
                if (startMarker) {
                    startMarker.remove();
                    removeRoute();
                }

                // Add new start marker
                startMarker = createMarker(place.geometry.coordinates, 'red');
                startCoordinates = place.geometry.coordinates;
            });
            startAutocompleteList.appendChild(item);
        });
    } catch (error) {
        console.error('Error fetching start autocomplete:', error);
    }
}, 300)); // 300ms delay

// Close the start autocomplete list if the user clicks outside of it
document.addEventListener('click', function (e) {
    if (e.target !== startSearchInput) {
        startAutocompleteList.innerHTML = '';
    }
});

// End Location Search
const endSearchInput = document.getElementById('end-search');
const endAutocompleteList = document.getElementById('end-autocomplete-list');

endSearchInput.addEventListener('input', debounce(async function() {
    const query = this.value;
    endAutocompleteList.innerHTML = ''; // Clear previous suggestions

    if (!query) return;

    try {
        const suggestions = await fetchAutocomplete(query);
        suggestions.forEach(place => {
            const item = document.createElement('div');
            item.textContent = place.place_name;
            item.addEventListener('click', () => {
                // Set search input to selected suggestion
                endSearchInput.value = place.place_name;
                endAutocompleteList.innerHTML = '';

                // Fly to the selected location
                map.flyTo({
                    center: place.geometry.coordinates,
                    zoom: 12
                });

                // Remove existing end marker if any
                if (endMarker) {
                    endMarker.remove();
                    removeRoute();
                }

                // Add new end marker
                endMarker = createMarker(place.geometry.coordinates, 'blue');
                endCoordinates = place.geometry.coordinates;
            });
            endAutocompleteList.appendChild(item);
        });
    } catch (error) {
        console.error('Error fetching end autocomplete:', error);
    }
}, 300)); // 300ms delay

// Close the end autocomplete list if the user clicks outside of it
document.addEventListener('click', function (e) {
    if (e.target !== endSearchInput) {
        endAutocompleteList.innerHTML = '';
    }
});

// Function to calculate distance using Mapbox Directions API
async function calculateDistance(start, end, mode) {
    try {
        const url = `https://api.mapbox.com/directions/v5/mapbox/${mode}/${start};${end}?geometries=geojson&access_token=${mapboxgl.accessToken}&overview=full`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.routes && data.routes.length > 0) {
            const route = data.routes[0].geometry;
            displayRoute(route);
            return data.routes[0].distance; // Distance in meters
        } else {
            throw new Error('No route found');
        }
    } catch (error) {
        console.error('Error calculating distance:', error);
        alert('Unable to calculate distance. Please try again.');
        return null;
    }
}

// Function to display route on the map
function displayRoute(route) {
    // Remove existing route layer and source if any
    if (map.getLayer('route')) {
        map.removeLayer('route');
    }
    if (map.getSource('route')) {
        map.removeSource('route');
    }

    map.addSource('route', {
        'type': 'geojson',
        'data': {
            'type': 'Feature',
            'geometry': route
        }
    });

    map.addLayer({
        'id': 'route',
        'type': 'line',
        'source': 'route',
        'layout': {
            'line-join': 'round',
            'line-cap': 'round'
        },
        'paint': {
            'line-color': '#0074D9',
            'line-width': 4
        }
    });
}

// Function to remove route from the map
function removeRoute() {
    if (map.getLayer('route')) {
        map.removeLayer('route');
    }
    if (map.getSource('route')) {
        map.removeSource('route');
    }
}

// Handle distance calculation on button click
document.getElementById('calculate-distance').addEventListener('click', async () => {
    // Ensure both start and end locations are selected
    if (!startCoordinates) {
        alert('Please search and select a starting location first.');
        return;
    }

    if (!endCoordinates) {
        alert('Please search and select a destination location.');
        return;
    }

    // Get the selected transportation mode
    const mode = document.getElementById('transportation').value;

    // Calculate distance
    const distance = await calculateDistance(
        startCoordinates.join(','),
        endCoordinates.join(','),
        mode
    );

    if (distance !== null) {
        const distanceInKm = (distance / 1000).toFixed(2);
        document.getElementById('distance-result').textContent = `Distance: ${distanceInKm} km (${capitalizeFirstLetter(mode)})`;
    }
});

// Function to capitalize the first letter of a string
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Function to get user's current location
function getUserLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by your browser.'));
        } else {
            navigator.geolocation.getCurrentPosition(position => {
                const coords = [position.coords.longitude, position.coords.latitude];
                resolve(coords);
            }, () => {
                reject(new Error('Unable to retrieve your location.'));
            });
        }
    });
}

// Handle 'Use My Location' button click (sets the end location)
document.getElementById('use-my-location').addEventListener('click', async () => {
    try {
        const userCoords = await getUserLocation();
        map.flyTo({
            center: userCoords,
            zoom: 12
        });

        // Remove existing end marker and route if any
        if (endMarker) {
            endMarker.remove();
            removeRoute();
        }

        // Add end marker at user's location
        endMarker = createMarker(userCoords, 'blue');
        endCoordinates = userCoords;

        // Optionally, calculate distance automatically if start is set
        if (startCoordinates) {
            const mode = document.getElementById('transportation').value;
            const distance = await calculateDistance(
                startCoordinates.join(','),
                endCoordinates.join(','),
                mode
            );

            if (distance !== null) {
                const distanceInKm = (distance / 1000).toFixed(2);
                document.getElementById('distance-result').textContent = `Distance: ${distanceInKm} km (${capitalizeFirstLetter(mode)})`;
            }
        }

    } catch (error) {
        alert(error.message);
    }
});
