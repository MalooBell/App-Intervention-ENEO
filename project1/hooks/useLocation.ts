import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

interface LocationData {
  latitude: number;
  longitude: number;
}

interface UseLocationReturn {
  location: LocationData | null;
  isLoading: boolean;
  error: string | null;
  hasPermission: boolean;
  requestPermission: () => Promise<boolean>;
}

export const useLocation = (): UseLocationReturn => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);

  const checkPermission = async () => {
    const { status } = await Location.getForegroundPermissionsAsync();
    setHasPermission(status === 'granted');
    return status === 'granted';
  };

  const requestPermission = async (): Promise<boolean> => {
    try {
      setError(null);
      const { status } = await Location.requestForegroundPermissionsAsync();
      const granted = status === 'granted';
      setHasPermission(granted);
      
      if (granted) {
        await getCurrentLocation();
      } else {
        setError('Permission de localisation refusée');
      }
      
      return granted;
    } catch (err) {
      setError('Erreur lors de la demande de permission');
      return false;
    }
  };

  const getCurrentLocation = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    } catch (err) {
      setError('Impossible d\'obtenir la localisation');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkPermission();
  }, []);

  return {
    location,
    isLoading,
    error,
    hasPermission,
    requestPermission,
  };
};