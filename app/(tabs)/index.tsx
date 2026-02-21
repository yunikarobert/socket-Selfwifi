import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';
import FancyToggle from '../components/FancyToggle';
import ScheduleList from '../components/ScheduleList';
import TimerControl from '../components/TimerControl';
import WifiScanner from '../components/WifiScanner';

export default function HomeScreen() {
  const [espIp, setEspIp] = useState('192.168.4.1');
  const [isOn, setIsOn] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const getCurrentState = async () => {
    try {
      const res = await fetch(`http://${espIp}/status`);
      const text = await res.text();
      const isOnNow = text.toLowerCase().includes('on') || text.toLowerCase().includes('1');
      setIsOn(isOnNow);
    } catch (e) {
      console.log('Failed to fetch status', e);
    }
  };

  const togglePower = async () => {
    if (isToggling) return;
    setIsToggling(true);
    try {
      const action = isOn ? 'off' : 'on';
      await fetch(`http://${espIp}/${action}`);
      await new Promise(r => setTimeout(r, 500));
      await getCurrentState();
    } catch (e) {
      Alert.alert('Error', `Failed to toggle power: ${e}`);
    } finally {
      setIsToggling(false);
    }
  };

  useEffect(() => {
    getCurrentState();
    const polling = setInterval(getCurrentState, 5000);
    return () => clearInterval(polling);
  }, [espIp]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.header}>IoT Smart Socket</Text>
      <Text style={styles.subtitle}>Broadcast WiFi Mode</Text>

      <WifiScanner onConnected={(ip) => setEspIp(ip)} />

      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>Device Settings</Text>
        <Text style={styles.instructionText}>
          The ESP IP is auto-detected above. Edit only if your device uses a custom IP.
        </Text>
        <Text style={styles.label}>ESP IP Address</Text>
        <TextInput
          style={styles.input}
          value={espIp}
          onChangeText={setEspIp}
          placeholder="192.168.4.1"
          placeholderTextColor="#666"
        />
      </View>

      <View style={styles.toggleSection}>
        <FancyToggle 
          isOn={isOn} 
          onToggle={togglePower}
          disabled={isToggling}
        />
      </View>

      <View style={styles.statusSection}>
        <Text style={styles.statusText}>Status: <Text style={[styles.statusValue, isOn && styles.statusOn, !isOn && styles.statusOff]}>{isOn ? 'ON' : 'OFF'}</Text></Text>
      </View>

      <View style={styles.scheduleSection}>
        <Text style={styles.sectionTitle}>📅 Schedule On/Off</Text>
        <ScheduleList espIp={espIp} onComplete={getCurrentState} />
      </View>

      <View style={styles.timerSection}>
        <TimerControl espIp={espIp} onComplete={getCurrentState} />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>powered by WeMakIT Smart-socket</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00ff99',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#00ff99',
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.8,
  },
  settingsSection: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#333',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00ff99',
    marginBottom: 12,
  },
  instructionText: {
    fontSize: 12,
    color: '#aaa',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  label: {
    fontSize: 13,
    color: '#fff',
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#333',
    color: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#00ff99',
  },
  toggleSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  statusSection: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  statusValue: {
    fontWeight: 'bold',
  },
  statusOn: {
    color: '#00ff99',
  },
  statusOff: {
    color: '#ff3333',
  },
  scheduleSection: {
    marginBottom: 24,
  },
  timerSection: {
    marginBottom: 24,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    color: '#666',
    fontSize: 12,
  },
});
