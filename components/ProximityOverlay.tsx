import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SensorService } from '@/services/SensorService';

interface ProximityOverlayProps {
  enabled: boolean;
}

export function ProximityOverlay({ enabled }: ProximityOverlayProps) {
  const [isNear, setIsNear] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setIsNear(false);
      return;
    }

    const unsubscribe = SensorService.startProximityMonitoring(setIsNear);

    return () => {
      unsubscribe();
    };
  }, [enabled]);

  if (!isNear) return null;

  return (
    <View style={styles.overlay}>
      <Text style={styles.text}>Screen Locked</Text>
      <Text style={styles.subtext}>Proximity sensor active</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  text: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  subtext: {
    color: '#AAA',
    fontSize: 14,
  },
});
