import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard } from 'react-native';

interface TimerControlProps {
  espIp: string;
  onComplete?: () => void;
}

export default function TimerControl({ espIp, onComplete }: TimerControlProps) {
  const [minutes, setMinutes] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [action, setAction] = useState<'on' | 'off'>('on');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, timeLeft]);

  const startTimer = async () => {
    const mins = parseInt(minutes);
    if (!mins || mins <= 0) return;
    setTimeLeft(mins * 60);
    setIsRunning(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(async () => {
      try {
        await fetch(`http://${espIp}/${action}`);
        if (onComplete) onComplete();
      } catch (e) {
        console.log('Timer action failed', e);
      }
    }, mins * 60 * 1000);
  };

  const cancelTimer = () => {
    setIsRunning(false);
    setTimeLeft(0);
    setMinutes('');
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView behavior="padding" style={styles.container}>
        <Text style={styles.title}>Timer</Text>
        {!isRunning ? (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Minutes"
              keyboardType="numeric"
              value={minutes}
              onChangeText={setMinutes}
              editable={!isRunning}
              placeholderTextColor="#666"
            />
            <View style={styles.actionButtons}>
              <TouchableOpacity
                onPress={() => setAction('on')}
                style={[styles.actionBtn, action === 'on' && styles.actionBtnSelected]}
              >
                <Text style={[styles.actionBtnText, action === 'on' && styles.actionBtnTextSelected]}>ON</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setAction('off')}
                style={[styles.actionBtn, action === 'off' && styles.actionBtnSelected]}
              >
                <Text style={[styles.actionBtnText, action === 'off' && styles.actionBtnTextSelected]}>OFF</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.startBtn} onPress={startTimer}>
              <Text style={styles.startBtnText}>Start Timer</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.runningContainer}>
            <Text style={styles.countdownText}>{formatTime(timeLeft)}</Text>
            <Text style={styles.actionText}>{action.toUpperCase()}</Text>
            <TouchableOpacity style={styles.cancelBtn} onPress={cancelTimer}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginVertical: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00ff99',
    marginBottom: 12,
  },
  inputContainer: {
    gap: 12,
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
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: '#333',
    borderRadius: 8,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#666',
  },
  actionBtnSelected: {
    backgroundColor: '#00ff99',
    borderColor: '#00ff99',
  },
  actionBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  actionBtnTextSelected: {
    color: '#222',
  },
  startBtn: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  startBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  runningContainer: {
    alignItems: 'center',
    gap: 16,
  },
  countdownText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#00ff99',
  },
  actionText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  cancelBtn: {
    backgroundColor: '#ff3333',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  cancelBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
