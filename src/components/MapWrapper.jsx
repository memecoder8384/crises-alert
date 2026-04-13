import React from 'react';
import { GoogleMap, useJsApiLoader, Marker, Circle } from '@react-google-maps/api';

const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

// Default center if none provided (e.g., somewhere central)
const defaultCenter = {
  lat: 40.7128,
  lng: -74.0060
};

/**
 * Shared Map component.
 * @param {Array} incidents - List of incident objects {id, location: {lat, lng}, type}
 * @param {Array} safeZones - List of safe zone objects {id, location: {lat, lng}, radius}
 * @param {Object} center - Map center 
 * @param {Object} userLocation - User's current location to show a blue dot
 */
const MapWrapper = ({ incidents = [], safeZones = [], center = defaultCenter, userLocation = null, zoom = 12 }) => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  });

  if (loadError) {
    return <div className="loading-screen">Error loading maps. Please check API Key.</div>;
  }

  if (!isLoaded) {
    return <div className="loading-screen">Loading Map...</div>;
  }

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={center}
      zoom={zoom}
      options={{
        disableDefaultUI: true,
        zoomControl: true,
      }}
    >
      {/* Render Incident Markers */}
      {incidents.map((incident) => {
        const severity = incident.severity || 1;
        const color = severity >= 4 ? '#e11d48' : severity === 3 ? '#f59e0b' : '#405f91';
        return (
        <Marker 
          key={incident.id} 
          position={incident.location}
          // Dynamic marker color based on severity condition
          icon={{
            path: window.google.maps.SymbolPath.CIRCLE,
            fillColor: color,
            fillOpacity: 0.9,
            strokeWeight: 2,
            strokeColor: '#fff',
            scale: 8 + (severity * 0.5) // Slightly larger dots for high severity
          }}
        />
      )})}

      {/* Render Safe Zones as Green Circles */}
      {safeZones.map((zone) => (
        <Circle
          key={zone.id}
          center={zone.location}
          radius={zone.radius || 1000} // Radius in meters
          options={{
            fillColor: '#10b981', // var(--color-safe)
            fillOpacity: 0.3,
            strokeColor: '#059669',
            strokeOpacity: 0.8,
            strokeWeight: 2,
          }}
        />
      ))}

      {/* Render User Location as Blue Dot */}
      {userLocation && (
        <Marker
          position={userLocation}
          icon={{
            path: window.google.maps.SymbolPath.CIRCLE,
            fillColor: '#3b82f6', // var(--color-brand)
            fillOpacity: 1,
            strokeWeight: 3,
            strokeColor: '#fff',
            scale: 8
          }}
          title="Your Location"
        />
      )}
      
      {/* Route finding logic can be injected here or as a child */}
    </GoogleMap>
  );
};

export default React.memo(MapWrapper);
