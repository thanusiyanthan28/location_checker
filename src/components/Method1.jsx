import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import "./Method1.css"

// Your shop location coordinates
const SHOP_LAT = 51.4457991;
const SHOP_LNG = -0.165856;

// Radius of 1 mile in kilometers
const CIRCLE_RADIUS_KM = 1.60934;

const LocationUpdater = ({ position, setPosition }) => {
  useMapEvents({
    click(event) {
      setPosition({
        lat: event.latlng.lat,
        lng: event.latlng.lng,
      });
    },
  });
  return null;
};

// Update with a new icon URL
const customIconUrl = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/svgs/solid/map-pin.svg';

const DeliveryLocation = () => {
  const [userLocation, setUserLocation] = useState({ lat: SHOP_LAT, lng: SHOP_LNG });
  const [address, setAddress] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [distance, setDistance] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if Leaflet is loaded
    if (typeof L === 'undefined') {
      console.error('Leaflet is not loaded');
    }
  }, []);

  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371; // Earth's radius in kilometers
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleAddressChange = async (e) => {
    setAddress(e.target.value);
    setLoading(true);
    try {
      const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
        params: {
          q: e.target.value,
          format: 'json',
          addressdetails: 1,
          limit: 5, // Limit results to 5
        },
      });

      if (response.data) {
        setSuggestions(response.data);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      setError("Error fetching suggestions.");
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSelectedSuggestion(suggestion);
    setUserLocation({
      lat: parseFloat(suggestion.lat),
      lng: parseFloat(suggestion.lon),
    });
    setAddress(suggestion.display_name);
    setSuggestions([]);
  };

  const validateLocation = () => {
    const dist = calculateDistance(SHOP_LAT, SHOP_LNG, userLocation.lat, userLocation.lng);
    setDistance(dist);
    if (dist > 1) {
      setError(`Error: Your distance is more than 1 km. (${dist.toFixed(2)} km)`);
    } else {
      setError("");
      alert("Location accepted!");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Adjust Delivery Location</h1>

      <label>
        Enter Address:
        <input
          type="text"
          value={address}
          onChange={handleAddressChange}
          style={{ margin: "10px", padding: "5px", width: "300px" }}
        />
      </label>

      <div style={{ position: "relative" }}>
        {loading && <p>Loading...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
        {suggestions.length > 0 && (
          <ul style={{ listStyle: "none", padding: 0, margin: 0, border: "1px solid #ccc", position: "absolute", backgroundColor: "#fff", width: "300px" }}>
            {suggestions.map((suggestion, index) => (
              <li
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                style={{ padding: "10px", cursor: "pointer", borderBottom: "1px solid #ccc" }}
              >
                {suggestion.display_name}
              </li>
            ))}
          </ul>
        )}
      </div>

      <button onClick={validateLocation} style={{ padding: "10px", margin: "10px" }}>
        Validate Location
      </button>

      <MapContainer center={[userLocation.lat, userLocation.lng]} zoom={15} style={{ height: "400px", width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker 
          position={[userLocation.lat, userLocation.lng]} 
          icon={L.icon({ 
            iconUrl: customIconUrl, 
            iconSize: [32, 32], // Size of the icon
            iconAnchor: [16, 32], // Anchor position of the icon
            popupAnchor: [0, -32], // Popup anchor position
          })}
          draggable={true}
          eventHandlers={{
            dragend: (event) => {
              setUserLocation({
                lat: event.target.getLatLng().lat,
                lng: event.target.getLatLng().lng,
              });
            },
          }}
        >
          <Popup>
            Your current location.
          </Popup>
        </Marker>
        <LocationUpdater position={userLocation} setPosition={setUserLocation} />

        {/* Draw the circle around the shop location */}
        {SHOP_LAT && SHOP_LNG && (
          <Circle 
            center={[SHOP_LAT, SHOP_LNG]} 
            radius={CIRCLE_RADIUS_KM * 1000} // Radius in meters (1 mile = 1.60934 km)
            pathOptions={{ color: 'blue', weight: 2, opacity: 0.5 }}
          />
        )}
      </MapContainer>

      <p>Distance to shop: {distance !== null ? distance.toFixed(2) + " km" : "Calculating..."}</p>
    </div>
  );
};

export default DeliveryLocation;
