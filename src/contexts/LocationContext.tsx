import React, { createContext, useContext, useState, useCallback } from 'react';
import type { GPSLocation } from '../types';

interface LocationContextValue {
  location: GPSLocation | null;
  error: string | null;
  loading: boolean;
  permissionDenied: boolean;
  requestLocation: () => void;
  setManualLocation: (loc: GPSLocation) => void;
}

const LocationContext = createContext<LocationContextValue | undefined>(undefined);

export function useLocation(): LocationContextValue {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error('useLocation must be used within LocationProvider');
  return ctx;
}

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useState<GPSLocation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setLoading(true);
    setError(null);
    setPermissionDenied(false);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
          isManual: false,
        });
        setLoading(false);
        setError(null);
      },
      (err) => {
        setLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setPermissionDenied(true);
          setError('Location permission denied. Please enable location access in your browser settings.');
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setError('Location information is unavailable. Please try again.');
        } else if (err.code === err.TIMEOUT) {
          setError('Location request timed out. Please try again.');
        } else {
          setError('An unknown error occurred while retrieving location.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000,
      }
    );
  }, []);

  const setManualLocation = useCallback((loc: GPSLocation) => {
    setLocation({ ...loc, isManual: true });
    setError(null);
    setPermissionDenied(false);
  }, []);

  return (
    <LocationContext.Provider
      value={{
        location,
        error,
        loading,
        permissionDenied,
        requestLocation,
        setManualLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}
