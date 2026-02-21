import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface FancyToggleProps {
  isOn: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export default function FancyToggle({ isOn, onToggle, disabled }: FancyToggleProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.toggle, isOn && styles.toggleOn, disabled && styles.toggleDisabled]}
        onPress={onToggle}
        disabled={disabled}
      >
        <View style={[styles.circle, isOn && styles.circleOn]} />
      </TouchableOpacity>
      <Text style={[styles.label, isOn && styles.labelOn]}>{isOn ? 'ON' : 'OFF'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  toggle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#333',
    borderWidth: 3,
    borderColor: '#666',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: 6,
  },
  toggleOn: {
    backgroundColor: '#00ff99',
    borderColor: '#00ff99',
    alignItems: 'flex-end',
    paddingLeft: 0,
    paddingRight: 6,
  },
  toggleDisabled: {
    opacity: 0.5,
  },
  circle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#00ff99',
  },
  circleOn: {
    backgroundColor: '#333',
  },
  label: {
    marginTop: 16,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#999',
  },
  labelOn: {
    color: '#00ff99',
  },
});
