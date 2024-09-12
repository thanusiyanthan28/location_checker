import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './DeliveryCheck.css';

const center = [51.4457991, -0.165856]; // Your pizza shop location
const radius = 1609.34; // 1 mile in meters

// Create a custom icon for the pizza shop
const pizzaShopIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3595/3595455.png', // External pizza shop icon image URL
  iconSize: [32, 32], // Size of the icon
  iconAnchor: [16, 32], // Point of the icon which will correspond to marker's location
  popupAnchor: [0, -32] // Point from which the popup should open relative to the iconAnchor
});

// Create a custom icon for the selected delivery location
const locationIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png', // External location marker icon URL
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
  const [address, setAddress] = useState('');

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
        },
        {
          enableHighAccuracy: true, // Enable high accuracy
          timeout: 10000, // Set timeout to 10 seconds
          maximumAge: 0 // Don't use cached location
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  // Fetch the address using Nominatim API (OpenStreetMap)
  const getAddressFromCoordinates = () => {
    if (selectedLocation) {
      const [lat, lng] = selectedLocation;
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
        .then(response => response.json())
        .then(data => {
          if (data && data.display_name) {
            const userAddress = data.display_name;
            setAddress(userAddress);
            alert(`Selected Address: ${userAddress}`);
            console.log(userAddress)
          } else {
            alert('Address not found.');
          }
        })
        .catch(error => {
          console.error('Error fetching address from Nominatim:', error);
        });
    } else {
      alert('No delivery location selected.');
    }
  };

  const handleLocationClick = () => {
    getCurrentLocation();
  };

  const openLocationInGoogleMaps = (userAddress) => {
    if (selectedLocation) {
      const googleMapsUrl = `https://www.google.com/maps?q=${selectedLocation[0]},${selectedLocation[1]}`;
      console.log(selectedLocation)
     
      //window.open(googleMapsUrl, '_blank'); // Open in a new tab
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
        <Marker position={center} icon={pizzaShopIcon} />
        {selectedLocation && <Marker position={selectedLocation} icon={locationIcon} />}
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
      <button onClick={getAddressFromCoordinates}>Address</button>
      {isAlertVisible && <div className="alert">Delivery address is outside the 1-mile radius.</div>}
    </div>
  );
};

export default DeliveryCheck;
