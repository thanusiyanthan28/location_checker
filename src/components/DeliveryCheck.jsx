import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './DeliveryCheck.css';

const center = [51.4457991, -0.165856]; // Your pizza shop location
const radius = 1609.34; // 1 mile in meters

// Create a custom icon
const customIcon = new L.Icon({
  iconUrl: '/pizza-icon.png', // Path to your icon image
  iconSize: [32, 32], // Size of the icon
  iconAnchor: [16, 32], // Point of the icon which will correspond to marker's location
  popupAnchor: [0, -32] // Point from which the popup should open relative to the iconAnchor
});

const DistanceCalculator = ({ setMapCenter, setAlertVisible, setSelectedLocation }) => {
  const map = useMap();

  map.on('click', (e) => {
    const selectedLocation = [e.latlng.lat, e.latlng.lng];
    setMapCenter(selectedLocation);
    setSelectedLocation(selectedLocation);
    const distance = map.distance(
      L.latLng(center[0], center[1]),
      L.latLng(e.latlng.lat, e.latlng.lng)
    );
    if (distance > radius) {
      setAlertVisible(true);
    } else {
      setAlertVisible(false);
    }
  });

  return null;
};

const DeliveryCheck = () => {
  const [mapCenter, setMapCenter] = useState(center);
  const [isAlertVisible, setAlertVisible] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);

  // Function to get current location using browser geolocation API
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const currentLocation = [latitude, longitude];
          console.log('Current Location (GPS):', currentLocation);
          setMapCenter(currentLocation);
          setSelectedLocation(currentLocation);
        },
        (error) => {
          console.error("Error fetching current location:", error);
          // If GPS fails, use Google Geolocation API as fallback
          getCurrentLocationFromGoogle();
        },
        {
          enableHighAccuracy: true, // Enable high accuracy
          timeout: 10000, // Set timeout to 10 seconds
          maximumAge: 0 // Don't use cached location
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
      // Fallback to Google API
      getCurrentLocationFromGoogle();
    }
  };

  // Fallback using Google Geolocation API
  const getCurrentLocationFromGoogle = () => {
    fetch(`https://www.googleapis.com/geolocation/v1/geolocate?key=YOUR_GOOGLE_API_KEY`, {
      method: 'POST',
    })
      .then(response => response.json())
      .then(data => {
        const currentLocation = [data.location.lat, data.location.lng];
        console.log('Current Location (Google):', currentLocation);

        // Update map center and selected location
        setMapCenter(currentLocation);
        setSelectedLocation(currentLocation);
      })
      .catch(error => {
        console.error('Error fetching current location from Google:', error);
      });
  };

  const handleLocationClick = () => {
    getCurrentLocation();
  };

  const openLocationInGoogleMaps = () => {
    if (selectedLocation) {
      const googleMapsUrl = `https://www.google.com/maps?q=${selectedLocation[0]},${selectedLocation[1]}`;
      window.open(googleMapsUrl, '_blank'); // Open in a new tab
    } else {
      alert('No delivery location selected.');
    }
  };

  const showRouteInGoogleMaps = () => {
    if (selectedLocation) {
      const googleMapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${center[0]},${center[1]}&destination=${selectedLocation[0]},${selectedLocation[1]}&travelmode=driving`;
      window.open(googleMapsDirectionsUrl, '_blank'); // Open in a new tab
    } else {
      alert('No delivery location selected.');
    }
  };

  const MapUpdater = ({ center }) => {
    const map = useMap();

    // Update the map view whenever the center changes
    React.useEffect(() => {
      if (map) {
        map.setView(center, 15); // Adjust zoom level here
      }
    }, [center, map]);

    return null;
  };

  return (
    <div className="delivery-check">
      <MapContainer
        id="map"
        center={mapCenter}
        zoom={15}
        style={{ height: '400px', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Circle center={center} radius={radius} color="blue" fillOpacity={0.2} />
        <Marker position={center} icon={customIcon} />
        {selectedLocation && <Marker position={selectedLocation} icon={customIcon} />}
        <DistanceCalculator
          setMapCenter={setMapCenter}
          setAlertVisible={setAlertVisible}
          setSelectedLocation={setSelectedLocation}
        />
        <MapUpdater center={mapCenter} />
      </MapContainer>
      <button onClick={handleLocationClick}>Use Current Location</button>
      <button onClick={openLocationInGoogleMaps}>Submit Delivery Location</button>
      <button onClick={showRouteInGoogleMaps}>Route</button>
      {isAlertVisible && <div className="alert">Delivery address is outside the 1-mile radius.</div>}
    </div>
  );
};

export default DeliveryCheck;
