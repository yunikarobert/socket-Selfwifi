import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Linking, Platform } from 'react-native';

interface WifiScannerProps {
  onConnected: (espIp: string) => void;
}

export default function WifiScanner({ onConnected }: WifiScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'connected'>('idle');
  const ESP_DEFAULT_IP = '192.168.4.1';

  const testESPConnection = async () => {
    setConnectionStatus('testing');
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch(`http://${ESP_DEFAULT_IP}/status`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      
      if (response.ok) {
        setConnectionStatus('connected');
        onConnected(ESP_DEFAULT_IP);
        Alert.alert('Success', `Connected to ESP at ${ESP_DEFAULT_IP}`);
      } else {
        Alert.alert('Error', 'ESP device not responding. Check WiFi connection.');
        setConnectionStatus('idle');
      }
    } catch (e) {
      Alert.alert('Error', `Cannot reach ESP at ${ESP_DEFAULT_IP}.\n\n✓ Make sure your phone is connected to the ESP's WiFi hotspot first.\n✓ Check that the ESP is powered on.`);
      setConnectionStatus('idle');
    }
  };

  const openWifiSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('App-prefs:root=WIFI');
    } else {
      Linking.openURL('android.settings.WIFI_SETTINGS');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔌 Connect to ESP Hotspot</Text>
      
      <View style={styles.instructionBox}>
        <Text style={styles.instructionTitle}>📍 Setup Steps:</Text>
        <Text style={styles.instructionText}>1. Open WiFi Settings on your phone</Text>
        <Text style={styles.instructionText}>2. Look for "ESP_xxxxx" or similar network</Text>
        <Text style={styles.instructionText}>3. Connect to it (usually no password)</Text>
        <Text style={styles.instructionText}>4. Return here and tap "Test Connection"</Text>
      </View>

      <TouchableOpacity
        style={[styles.button, styles.buttonSecondary]}
        onPress={openWifiSettings}
        disabled={connectionStatus === 'testing'}
      >
        <Text style={styles.buttonText}>⚙️ Open WiFi Settings</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.buttonPrimary, connectionStatus === 'testing' && styles.buttonDisabled]}
        onPress={testESPConnection}
        disabled={connectionStatus === 'testing'}
      >
        {connectionStatus === 'testing' ? (
          <>
            <ActivityIndicator color="#222" size="small" style={{ marginRight: 8 }} />
            <Text style={[styles.buttonText, styles.buttonPrimaryText]}>Testing Connection...</Text>
          </>
        ) : connectionStatus === 'connected' ? (
          <Text style={[styles.buttonText, styles.buttonPrimaryText]}>✓ Connected to ESP</Text>
        ) : (
          <Text style={[styles.buttonText, styles.buttonPrimaryText]}>🔗 Test Connection to ESP</Text>
        )}
      </TouchableOpacity>

      {connectionStatus === 'connected' && (
        <View style={styles.successBox}>
          <Text style={styles.successText}>✓ Connected to ESP Hotspot!</Text>
          <Text style={styles.successSubtext}>Device IP: {ESP_DEFAULT_IP}</Text>
          <Text style={styles.successSubtext}>You can now control the socket</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#333',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00ff99',
    marginBottom: 16,
  },
  instructionBox: {
    backgroundColor: '#222',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  instructionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 12,
    color: '#aaa',
    marginBottom: 4,
    lineHeight: 18,
  },
  button: {
    backgroundColor: '#333',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#555',
  },
  buttonSecondary: {
    backgroundColor: '#333',
    borderColor: '#00ff99',
  },
  buttonPrimary: {
    backgroundColor: '#00ff99',
    borderColor: '#00ff99',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  buttonPrimaryText: {
    color: '#222',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  successBox: {
    backgroundColor: '#1a3a1a',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#00ff99',
    alignItems: 'center',
  },
  successText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#00ff99',
  },
  successSubtext: {
    fontSize: 12,
    color: '#aaa',
    marginTop: 4,
  },
});
