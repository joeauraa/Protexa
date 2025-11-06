import { CameraView, useCameraPermissions } from 'expo-camera';
import { Platform } from 'react-native';

export class CameraService {
  static async captureIntruderPhoto(): Promise<string | null> {
    if (Platform.OS === 'web') {
      return null;
    }

    try {
      return 'intruder_photo_placeholder.jpg';
    } catch (error) {
      console.error('Error capturing photo:', error);
      return null;
    }
  }

  static async hasPermission(): Promise<boolean> {
    if (Platform.OS === 'web') {
      return false;
    }

    try {
      const { status } = await CameraView.getCameraPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      return false;
    }
  }

  static async requestPermission(): Promise<boolean> {
    if (Platform.OS === 'web') {
      return false;
    }

    try {
      const { status } = await CameraView.requestCameraPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      return false;
    }
  }
}
