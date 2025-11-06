import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface PinInputProps {
  onPinComplete: (pin: string) => void;
  pinLength?: number;
  error?: string;
}

export function PinInput({ onPinComplete, pinLength = 4, error }: PinInputProps) {
  const [pin, setPin] = useState('');

  const handleNumberPress = (num: string) => {
    if (pin.length < pinLength) {
      const newPin = pin + num;
      setPin(newPin);

      if (newPin.length === pinLength) {
        setTimeout(() => {
          onPinComplete(newPin);
          setPin('');
        }, 100);
      }
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
  };

  const renderDots = () => {
    return (
      <View style={styles.dotsContainer}>
        {Array.from({ length: pinLength }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index < pin.length ? styles.dotFilled : styles.dotEmpty,
            ]}
          />
        ))}
      </View>
    );
  };

  const numberPad = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['', '0', '⌫'],
  ];

  return (
    <View style={styles.container}>
      {renderDots()}

      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      <View style={styles.keypadContainer}>
        {numberPad.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.keypadRow}>
            {row.map((num) => (
              <TouchableOpacity
                key={num}
                style={[
                  styles.keypadButton,
                  num === '' && styles.keypadButtonEmpty,
                ]}
                onPress={() => {
                  if (num === '⌫') {
                    handleDelete();
                  } else if (num !== '') {
                    handleNumberPress(num);
                  }
                }}
                disabled={num === ''}
              >
                <Text style={styles.keypadButtonText}>{num}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    marginBottom: 40,
    gap: 16,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  dotEmpty: {
    backgroundColor: '#E0E0E0',
  },
  dotFilled: {
    backgroundColor: '#2196F3',
  },
  errorText: {
    color: '#F44336',
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
  keypadContainer: {
    width: '100%',
    maxWidth: 300,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  keypadButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  keypadButtonEmpty: {
    backgroundColor: 'transparent',
    elevation: 0,
    shadowOpacity: 0,
  },
  keypadButtonText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
  },
});
