import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { PinInput } from '@/components/PinInput';
import { ProximityOverlay } from '@/components/ProximityOverlay';
import { SecurityService } from '@/services/SecurityService';
import { AlarmService } from '@/services/AlarmService';
import { CameraService } from '@/services/CameraService';
import { LocationService } from '@/services/LocationService';

export default function LockScreen() {
  const [isSetup, setIsSetup] = useState(false);
  const [isLocked, setIsLocked] = useState(true);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [error, setError] = useState('');
  const [isLockout, setIsLockout] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const [setupMode, setSetupMode] = useState(false);
  const [confirmPin, setConfirmPin] = useState('');

  useEffect(() => {
    checkSetup();
  }, []);

  const checkSetup = async () => {
    try {
      const existingSettings = await SecurityService.getSecuritySettings();
      if (existingSettings) {
        setIsSetup(true);
        setSettings(existingSettings);
      } else {
        setSetupMode(true);
        setIsLocked(false);
      }
    } catch (error) {
      console.error('Error checking setup:', error);
    }
  };

  const handleSetupPin = async (pin: string) => {
    if (!confirmPin) {
      setConfirmPin(pin);
      setError('Enter PIN again to confirm');
      return;
    }

    if (pin !== confirmPin) {
      setError('PINs do not match. Try again.');
      setConfirmPin('');
      return;
    }

    try {
      const newSettings = await SecurityService.createSecuritySettings(pin);
      setSettings(newSettings);
      setIsSetup(true);
      setSetupMode(false);
      setIsLocked(true);
      setError('');
      setConfirmPin('');
    } catch (error) {
      setError('Failed to set up PIN. Try again.');
    }
  };

  const handlePinComplete = async (pin: string) => {
    if (setupMode) {
      handleSetupPin(pin);
      return;
    }

    if (isLockout) {
      setError('Device is locked. Please wait.');
      return;
    }

    const isValid = await SecurityService.verifyPin(pin);

    if (isValid) {
      setIsLocked(false);
      setFailedAttempts(0);
      setError('');
      await SecurityService.logSecurityEvent('unlock_success');
    } else {
      const newFailedAttempts = failedAttempts + 1;
      setFailedAttempts(newFailedAttempts);
      setError(`Incorrect PIN. ${settings?.max_attempts - newFailedAttempts} attempts remaining.`);

      await SecurityService.logSecurityEvent('unlock_fail', {
        attempts: newFailedAttempts,
      });

      if (newFailedAttempts >= settings?.max_attempts) {
        handleMaxAttemptsReached();
      }
    }
  };

  const handleMaxAttemptsReached = async () => {
    setIsLockout(true);

    if (settings?.alarm_enabled) {
      await AlarmService.playAlarmSound();
      await SecurityService.logSecurityEvent('alarm_triggered');
    }

    let imageUrl = null;
    if (settings?.camera_enabled) {
      const hasPermission = await CameraService.requestPermission();
      if (hasPermission) {
        imageUrl = await CameraService.captureIntruderPhoto();
      }
    }

    let location = null;
    if (settings?.location_enabled) {
      const hasPermission = await LocationService.requestPermission();
      if (hasPermission) {
        location = await LocationService.getCurrentLocation();
      }
    }

    await SecurityService.logIntruderAttempt(failedAttempts, imageUrl || undefined, location || undefined);

    await SecurityService.logSecurityEvent('lockout_started', {
      duration: settings?.lockout_duration,
    });

    setTimeout(async () => {
      await AlarmService.stopAlarmSound();
      setIsLockout(false);
      setFailedAttempts(0);
      setError('');
    }, (settings?.lockout_duration || 30) * 1000);

    setError(`Too many failed attempts! Device locked for ${settings?.lockout_duration} seconds.`);
  };

  if (setupMode) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Set Up Your PIN</Text>
        <Text style={styles.subtitle}>
          {confirmPin ? 'Confirm your PIN' : 'Enter a 4-digit PIN'}
        </Text>
        <PinInput onPinComplete={handleSetupPin} error={error} />
      </View>
    );
  }

  if (!isLocked) {
    return (
      <View style={styles.container}>
        <Text style={styles.unlockedText}>Device Unlocked</Text>
        <Text style={styles.subtitle}>Lock screen is active in background</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {settings?.proximity_mode_enabled && (
        <ProximityOverlay enabled={settings.proximity_mode_enabled} />
      )}

      <Text style={styles.title}>Secure Lock</Text>
      <Text style={styles.subtitle}>Enter your PIN to unlock</Text>

      <PinInput onPinComplete={handlePinComplete} error={error} />

      {isLockout && (
        <View style={styles.lockoutContainer}>
          <Text style={styles.lockoutText}>DEVICE LOCKED</Text>
          <Text style={styles.lockoutSubtext}>Security measures activated</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
  },
  unlockedText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 8,
  },
  lockoutContainer: {
    marginTop: 40,
    padding: 20,
    backgroundColor: '#F44336',
    borderRadius: 12,
    alignItems: 'center',
  },
  lockoutText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
  },
  lockoutSubtext: {
    fontSize: 14,
    color: '#FFEBEE',
  },
});
