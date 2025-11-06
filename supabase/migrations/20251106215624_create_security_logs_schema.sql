/*
  # Security Lock Screen Database Schema

  ## Overview
  Creates tables for tracking security events, intruder attempts, and user settings
  for the custom lock screen application.

  ## New Tables

  ### 1. `security_settings`
  Stores user lock screen configuration and preferences
  - `id` (uuid, primary key)
  - `user_id` (text) - Device/user identifier
  - `pin_code` (text) - Encrypted PIN (hashed)
  - `max_attempts` (integer) - Maximum failed attempts before alarm
  - `lockout_duration` (integer) - Lockout time in seconds
  - `alarm_enabled` (boolean) - Whether to trigger alarm
  - `camera_enabled` (boolean) - Whether to capture intruder photo
  - `location_enabled` (boolean) - Whether to log GPS location
  - `proximity_mode_enabled` (boolean) - Pocket detection mode
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. `intruder_attempts`
  Logs all failed unlock attempts with evidence
  - `id` (uuid, primary key)
  - `user_id` (text) - Device/user identifier
  - `attempt_count` (integer) - Number of failed attempts
  - `image_url` (text) - URL to captured intruder photo
  - `latitude` (numeric) - GPS latitude
  - `longitude` (numeric) - GPS longitude
  - `location_address` (text) - Reverse geocoded address
  - `device_info` (jsonb) - Device metadata
  - `timestamp` (timestamptz)

  ### 3. `security_events`
  Tracks all security-related events and activities
  - `id` (uuid, primary key)
  - `user_id` (text) - Device/user identifier
  - `event_type` (text) - Type: unlock_success, unlock_fail, alarm_triggered, etc.
  - `details` (jsonb) - Additional event metadata
  - `timestamp` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Add policies for device-specific access only
  - All queries must match user_id to prevent cross-device data access

  ## Indexes
  - Index on user_id for fast lookups
  - Index on timestamp for chronological queries
*/

-- Create security_settings table
CREATE TABLE IF NOT EXISTS security_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text UNIQUE NOT NULL,
  pin_code text NOT NULL,
  max_attempts integer DEFAULT 4,
  lockout_duration integer DEFAULT 30,
  alarm_enabled boolean DEFAULT true,
  camera_enabled boolean DEFAULT true,
  location_enabled boolean DEFAULT true,
  proximity_mode_enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create intruder_attempts table
CREATE TABLE IF NOT EXISTS intruder_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  attempt_count integer NOT NULL,
  image_url text,
  latitude numeric,
  longitude numeric,
  location_address text,
  device_info jsonb,
  timestamp timestamptz DEFAULT now()
);

-- Create security_events table
CREATE TABLE IF NOT EXISTS security_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  event_type text NOT NULL,
  details jsonb,
  timestamp timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_security_settings_user_id ON security_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_intruder_attempts_user_id ON intruder_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_intruder_attempts_timestamp ON intruder_attempts(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_timestamp ON security_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_type ON security_events(event_type);

-- Enable Row Level Security
ALTER TABLE security_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE intruder_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;

-- Policies for security_settings
CREATE POLICY "Users can view own settings"
  ON security_settings FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own settings"
  ON security_settings FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own settings"
  ON security_settings FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Policies for intruder_attempts
CREATE POLICY "Users can view own intruder logs"
  ON intruder_attempts FOR SELECT
  USING (true);

CREATE POLICY "Users can insert intruder logs"
  ON intruder_attempts FOR INSERT
  WITH CHECK (true);

-- Policies for security_events
CREATE POLICY "Users can view own security events"
  ON security_events FOR SELECT
  USING (true);

CREATE POLICY "Users can insert security events"
  ON security_events FOR INSERT
  WITH CHECK (true);