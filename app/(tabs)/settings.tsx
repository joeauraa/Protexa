import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SecurityService } from '@/services/SecurityService';
import { Shield, Bell, Camera, MapPin, Radio } from 'lucide-react-native';

export default function Settings() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [changingPin, setChangingPin] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmNewPin, setConfirmNewPin] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await SecurityService.getSecuritySettings();
      setSettings(data);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: string, value: any) => {
    try {
      await SecurityService.updateSecuritySettings({ [key]: value });
      setSettings({ ...settings, [key]: value });
    } catch (error) {
      Alert.alert('Error', 'Failed to update setting');
    }
  };

  const handleChangePin = async () => {
    if (newPin.length !== 4) {
      Alert.alert('Error', 'PIN must be 4 digits');
      return;
    }

    if (newPin !== confirmNewPin) {
      Alert.alert('Error', 'PINs do not match');
      return;
    }

    try {
      await SecurityService.updateSecuritySettings({ pin_code: newPin });
      Alert.alert('Success', 'PIN changed successfully');
      setChangingPin(false);
      setNewPin('');
      setConfirmNewPin('');
    } catch (error) {
      Alert.alert('Error', 'Failed to change PIN');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading settings...</Text>
      </View>
    );
  }

  if (!settings) {
    return (
      <View style={styles.container}>
        <Text>No settings found. Please set up your PIN first.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Shield size={20} color="#2196F3" />
          <Text style={styles.sectionTitle}>Security</Text>
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Maximum Failed Attempts</Text>
            <Text style={styles.settingDescription}>
              Number of wrong attempts before alarm triggers
            </Text>
          </View>
          <TextInput
            style={styles.input}
            value={String(settings.max_attempts)}
            onChangeText={(text) => {
              const num = parseInt(text) || 4;
              updateSetting('max_attempts', num);
            }}
            keyboardType="number-pad"
            maxLength={2}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Lockout Duration (seconds)</Text>
            <Text style={styles.settingDescription}>
              How long device stays locked after max attempts
            </Text>
          </View>
          <TextInput
            style={styles.input}
            value={String(settings.lockout_duration)}
            onChangeText={(text) => {
              const num = parseInt(text) || 30;
              updateSetting('lockout_duration', num);
            }}
            keyboardType="number-pad"
            maxLength={3}
          />
        </View>

        <TouchableOpacity
          style={styles.buttonPrimary}
          onPress={() => setChangingPin(!changingPin)}
        >
          <Text style={styles.buttonText}>Change PIN</Text>
        </TouchableOpacity>

        {changingPin && (
          <View style={styles.pinChangeContainer}>
            <TextInput
              style={styles.pinInput}
              placeholder="New PIN (4 digits)"
              value={newPin}
              onChangeText={setNewPin}
              keyboardType="number-pad"
              maxLength={4}
              secureTextEntry
            />
            <TextInput
              style={styles.pinInput}
              placeholder="Confirm New PIN"
              value={confirmNewPin}
              onChangeText={setConfirmNewPin}
              keyboardType="number-pad"
              maxLength={4}
              secureTextEntry
            />
            <TouchableOpacity
              style={styles.buttonSecondary}
              onPress={handleChangePin}
            >
              <Text style={styles.buttonText}>Save New PIN</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Bell size={20} color="#2196F3" />
          <Text style={styles.sectionTitle}>Alarm & Alerts</Text>
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Alarm Sound</Text>
            <Text style={styles.settingDescription}>
              Play loud alarm on max failed attempts
            </Text>
          </View>
          <Switch
            value={settings.alarm_enabled}
            onValueChange={(value) => updateSetting('alarm_enabled', value)}
          />
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Camera size={20} color="#2196F3" />
          <Text style={styles.sectionTitle}>Intruder Detection</Text>
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Capture Photo</Text>
            <Text style={styles.settingDescription}>
              Take photo using front camera on intrusion
            </Text>
          </View>
          <Switch
            value={settings.camera_enabled}
            onValueChange={(value) => updateSetting('camera_enabled', value)}
          />
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MapPin size={20} color="#2196F3" />
          <Text style={styles.sectionTitle}>Location Tracking</Text>
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Track Location</Text>
            <Text style={styles.settingDescription}>
              Log GPS location during security events
            </Text>
          </View>
          <Switch
            value={settings.location_enabled}
            onValueChange={(value) => updateSetting('location_enabled', value)}
          />
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Radio size={20} color="#2196F3" />
          <Text style={styles.sectionTitle}>Proximity Sensor</Text>
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Pocket Mode</Text>
            <Text style={styles.settingDescription}>
              Keep screen locked when phone is in pocket or face down
            </Text>
          </View>
          <Switch
            value={settings.proximity_mode_enabled}
            onValueChange={(value) =>
              updateSetting('proximity_mode_enabled', value)
            }
          />
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Secure Lock v1.0</Text>
        <Text style={styles.footerSubtext}>
          Advanced security lock screen with intruder detection
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
  },
  section: {
    backgroundColor: '#FFF',
    marginTop: 12,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: '#666',
  },
  input: {
    width: 60,
    height: 40,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    textAlign: 'center',
    fontSize: 16,
  },
  buttonPrimary: {
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonSecondary: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  pinChangeContainer: {
    marginTop: 16,
  },
  pinInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  footerSubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
});
