import * as Crypto from 'expo-crypto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import * as Device from 'expo-device';

const DEVICE_ID_KEY = 'secure_lock_device_id';

export class SecurityService {
  private static deviceId: string | null = null;

  static async getDeviceId(): Promise<string> {
    if (this.deviceId) return this.deviceId;

    let deviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);

    if (!deviceId) {
      deviceId = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        `${Device.modelName}-${Device.osVersion}-${Date.now()}`
      );
      await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
    }

    this.deviceId = deviceId;
    return deviceId;
  }

  static async hashPin(pin: string): Promise<string> {
    return await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      pin
    );
  }

  static async getSecuritySettings() {
    const deviceId = await this.getDeviceId();

    const { data, error } = await supabase
      .from('security_settings')
      .select('*')
      .eq('user_id', deviceId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  static async createSecuritySettings(pin: string) {
    const deviceId = await this.getDeviceId();
    const hashedPin = await this.hashPin(pin);

    const { data, error } = await supabase
      .from('security_settings')
      .insert({
        user_id: deviceId,
        pin_code: hashedPin,
        max_attempts: 4,
        lockout_duration: 30,
        alarm_enabled: true,
        camera_enabled: true,
        location_enabled: true,
        proximity_mode_enabled: true,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateSecuritySettings(updates: Partial<any>) {
    const deviceId = await this.getDeviceId();

    if (updates.pin_code) {
      updates.pin_code = await this.hashPin(updates.pin_code);
    }

    const { data, error } = await supabase
      .from('security_settings')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('user_id', deviceId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async verifyPin(inputPin: string): Promise<boolean> {
    const settings = await this.getSecuritySettings();
    if (!settings) return false;

    const hashedInput = await this.hashPin(inputPin);
    return hashedInput === settings.pin_code;
  }

  static async logSecurityEvent(
    eventType: 'unlock_success' | 'unlock_fail' | 'alarm_triggered' | 'proximity_activated' | 'lockout_started',
    details?: Record<string, any>
  ) {
    const deviceId = await this.getDeviceId();

    const { error } = await supabase
      .from('security_events')
      .insert({
        user_id: deviceId,
        event_type: eventType,
        details,
        timestamp: new Date().toISOString(),
      });

    if (error) console.error('Error logging security event:', error);
  }

  static async logIntruderAttempt(
    attemptCount: number,
    imageUrl?: string,
    location?: { latitude: number; longitude: number; address?: string }
  ) {
    const deviceId = await this.getDeviceId();

    const deviceInfo = {
      brand: Device.brand,
      model: Device.modelName,
      osName: Device.osName,
      osVersion: Device.osVersion,
    };

    const { error } = await supabase
      .from('intruder_attempts')
      .insert({
        user_id: deviceId,
        attempt_count: attemptCount,
        image_url: imageUrl,
        latitude: location?.latitude,
        longitude: location?.longitude,
        location_address: location?.address,
        device_info: deviceInfo,
        timestamp: new Date().toISOString(),
      });

    if (error) console.error('Error logging intruder attempt:', error);
  }

  static async getIntruderAttempts() {
    const deviceId = await this.getDeviceId();

    const { data, error } = await supabase
      .from('intruder_attempts')
      .select('*')
      .eq('user_id', deviceId)
      .order('timestamp', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getSecurityEvents() {
    const deviceId = await this.getDeviceId();

    const { data, error } = await supabase
      .from('security_events')
      .select('*')
      .eq('user_id', deviceId)
      .order('timestamp', { ascending: false });

    if (error) throw error;
    return data || [];
  }
}
