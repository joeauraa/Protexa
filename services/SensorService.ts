import { LightSensor, Accelerometer } from 'expo-sensors';
import { Platform } from 'react-native';

export class SensorService {
  private static proximityThreshold = 0.1;
  private static lightThreshold = 10;

  static async isInPocket(): Promise<boolean> {
    if (Platform.OS === 'web') {
      return false;
    }

    try {
      const isLightCovered = await this.checkLightSensor();
      const isFlat = await this.checkOrientation();

      return isLightCovered || isFlat;
    } catch (error) {
      console.error('Error checking pocket status:', error);
      return false;
    }
  }

  private static async checkLightSensor(): Promise<boolean> {
    return new Promise((resolve) => {
      const subscription = LightSensor.addListener((data) => {
        subscription.remove();
        resolve(data.illuminance < this.lightThreshold);
      });

      setTimeout(() => {
        subscription.remove();
        resolve(false);
      }, 500);
    });
  }

  private static async checkOrientation(): Promise<boolean> {
    return new Promise((resolve) => {
      const subscription = Accelerometer.addListener((data) => {
        subscription.remove();

        const isFlat = Math.abs(data.z) > 9;
        const isFaceDown = data.z < -9;

        resolve(isFlat || isFaceDown);
      });

      setTimeout(() => {
        subscription.remove();
        resolve(false);
      }, 500);
    });
  }

  static startProximityMonitoring(callback: (isNear: boolean) => void) {
    if (Platform.OS === 'web') {
      return () => {};
    }

    const lightSubscription = LightSensor.addListener((data) => {
      callback(data.illuminance < this.lightThreshold);
    });

    const accelSubscription = Accelerometer.addListener((data) => {
      const isFaceDown = data.z < -9;
      if (isFaceDown) callback(true);
    });

    Accelerometer.setUpdateInterval(1000);
    LightSensor.setUpdateInterval(1000);

    return () => {
      lightSubscription.remove();
      accelSubscription.remove();
    };
  }
}
