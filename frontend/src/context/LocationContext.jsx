import React, { createContext, useContext, useState, useEffect } from 'react';

const LocationContext = createContext(null);

export const PRESET_LOCATIONS = [
  { name: 'Noida Sector 62', city: 'Noida', lat: 28.6280, lng: 77.3649 },
  { name: 'Noida Sector 18', city: 'Noida', lat: 28.5708, lng: 77.3261 },
  { name: 'Connaught Place, Delhi', city: 'Delhi', lat: 28.6315, lng: 77.2167 },
  { name: 'Nehru Place, Delhi', city: 'Delhi', lat: 28.5492, lng: 77.2514 },
  { name: 'DLF Cyber City, Gurgaon', city: 'Gurugram', lat: 28.4952, lng: 77.0895 },
  { name: 'Raj Nagar, Ghaziabad', city: 'Ghaziabad', lat: 28.6836, lng: 77.4431 },
  { name: 'Sahibabad, Ghaziabad', city: 'Ghaziabad', lat: 28.6720, lng: 77.3450 },
];

export const LocationProvider = ({ children }) => {
  // Default to Noida Sector 62
  const [coordinates, setCoordinates] = useState({ lat: 28.6280, lng: 77.3649 });
  const [locationName, setLocationName] = useState('Noida Sector 62');
  const [radiusKm, setRadiusKm] = useState(25);
  const [locationPermission, setLocationPermission] = useState('prompt'); // 'prompt', 'granted', 'denied'
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);

  // Request browser geolocation
  const requestBrowserLocation = () => {
    if (!navigator.geolocation) {
      setLocationPermission('denied');
      return;
    }

    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCoordinates({ lat: latitude, lng: longitude });
        setLocationPermission('granted');
        setLocationName('Current GPS Location');
        setLoadingLocation(false);
        localStorage.setItem('nearhire_loc', JSON.stringify({ lat: latitude, lng: longitude, name: 'Current GPS Location' }));
      },
      (error) => {
        console.warn('Geolocation access denied or unavailable:', error.message);
        setLocationPermission('denied');
        setLoadingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Set manual location from preset or search
  const setManualLocation = (preset) => {
    setCoordinates({ lat: preset.lat, lng: preset.lng });
    setLocationName(preset.name);
    localStorage.setItem('nearhire_loc', JSON.stringify({ lat: preset.lat, lng: preset.lng, name: preset.name }));
    setShowLocationModal(false);
  };

  useEffect(() => {
    const saved = localStorage.getItem('nearhire_loc');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.lat && parsed.lng) {
          setCoordinates({ lat: parsed.lat, lng: parsed.lng });
          setLocationName(parsed.name || 'Selected Location');
          return;
        }
      } catch (e) {}
    }

    // Auto prompt on initial load
    requestBrowserLocation();
  }, []);

  return (
    <LocationContext.Provider
      value={{
        coordinates,
        locationName,
        radiusKm,
        setRadiusKm,
        locationPermission,
        loadingLocation,
        showLocationModal,
        setShowLocationModal,
        requestBrowserLocation,
        setManualLocation,
        PRESET_LOCATIONS,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) throw new Error('useLocation must be used within a LocationProvider');
  return context;
};
