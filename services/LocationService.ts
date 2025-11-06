import * as Location from 'expo-location';
import { Platform } from 'react-native';

export interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
}

export class LocationService {
  static async getCurrentLocation(): Promise<LocationData | null> {
    if (Platform.OS === 'web') {
      return null;
    }

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const address = await this.reverseGeocode(
        location.coords.latitude,
        location.coords.longitude
      );

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        address,
      };
    } catch (error) {
      console.error('Error getting location:', error);
      return null;
    }
  }

  private static async reverseGeocode(
    latitude: number,
    longitude: number
  ): Promise<string | undefined> {
    try {
      const result = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (result.length > 0) {
        const location = result[0];
        return `${location.street || ''}, ${location.city || ''}, ${location.region || ''}, ${location.country || ''}`.trim();
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
    }
    return undefined;
  }

  static async hasPermission(): Promise<boolean> {
    if (Platform.OS === 'web') {
      return false;
    }

    const { status } = await Location.getForegroundPermissionsAsync();
    return status === 'granted';
  }

  static async requestPermission(): Promise<boolean> {
    if (Platform.OS === 'web') {
      return false;
    }

    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  }
}
