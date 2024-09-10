// DeliveryCheck.js
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

  const handleLocationClick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setMapCenter([latitude, longitude]);
        },
        (error) => {
          console.error("Error fetching current location:", error);
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  const sendLocationToBackend = () => {
    if (selectedLocation) {
      fetch('https://your-backend-url.com/api/delivery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude: selectedLocation[0],
          longitude: selectedLocation[1],
        }),
      })
        .then(response => response.json())
        .then(data => {
          console.log('Success:', data);
        })
        .catch((error) => {
          console.error('Error:', error);
        });
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
        <Marker position={mapCenter} icon={customIcon} />
        <DistanceCalculator
          setMapCenter={setMapCenter}
          setAlertVisible={setAlertVisible}
          setSelectedLocation={setSelectedLocation}
        />
        <MapUpdater center={mapCenter} />
      </MapContainer>
      <button onClick={handleLocationClick}>Use Current Location</button>
      <button onClick={sendLocationToBackend}>Submit Delivery Location</button>
      {isAlertVisible && <div className="alert">Delivery address is outside the 1-mile radius.</div>}
    </div>
  );
};

export default DeliveryCheck;
