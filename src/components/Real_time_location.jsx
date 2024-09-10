// MapComponent.js
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const MapComponent = () => {
  const [position, setPosition] = useState(null);
  const [map, setMap] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setPosition([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error(error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }, []);

  const handleMapLoad = (mapInstance) => {
    setMap(mapInstance);
    if (position) {
      mapInstance.setView(position, 13);
    }
  };

  const ZoomToLocation = () => {
    if (map && position) {
      map.setView(position, 13);
    }
  };

  return (
    <div>
      <button onClick={ZoomToLocation} style={{ margin: '10px' }}>
        Zoom to Current Location
      </button>
      <MapContainer
        center={position || [51.4457991, -0.165856]}
        zoom={13}
        style={{ height: '600px', width: '100%' }}
        whenCreated={handleMapLoad}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {position && <Marker position={position} />}
      </MapContainer>
    </div>
  );
};

export default MapComponent;
