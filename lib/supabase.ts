import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface SecuritySettings {
  id: string;
  user_id: string;
  pin_code: string;
  max_attempts: number;
  lockout_duration: number;
  alarm_enabled: boolean;
  camera_enabled: boolean;
  location_enabled: boolean;
  proximity_mode_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface IntruderAttempt {
  id: string;
  user_id: string;
  attempt_count: number;
  image_url?: string;
  latitude?: number;
  longitude?: number;
  location_address?: string;
  device_info?: Record<string, any>;
  timestamp: string;
}

export interface SecurityEvent {
  id: string;
  user_id: string;
  event_type: 'unlock_success' | 'unlock_fail' | 'alarm_triggered' | 'proximity_activated' | 'lockout_started';
  details?: Record<string, any>;
  timestamp: string;
}
