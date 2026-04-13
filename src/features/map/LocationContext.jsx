/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState } from 'react';

const LocationContext = createContext();

export const useLocationStore = () => useContext(LocationContext);

export const LocationProvider = ({ children }) => {
  const [mapCenter, setMapCenter] = useState({ lat: 40.7128, lng: -74.0060 });
  const [userLocation, setUserLocation] = useState(null);

  const requestLocation = (onSuccess, onError) => {
    if (!navigator.geolocation) {
      if (onError) onError(new Error("Geolocation is not supported by your browser."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc = { lat: position.coords.latitude, lng: position.coords.longitude };
        setMapCenter(loc);
        setUserLocation(loc);
        if (onSuccess) onSuccess(loc);
      },
      (err) => {
        if (onError) onError(err);
      }
    );
  };

  return (
    <LocationContext.Provider value={{ mapCenter, setMapCenter, userLocation, setUserLocation, requestLocation }}>
      {children}
    </LocationContext.Provider>
  );
};
