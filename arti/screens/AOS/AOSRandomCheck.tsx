import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  Animated,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';

export default function AOSRandomCheck({ navigation }: any) {
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [result, setResult] = useState<{ predicted: string; confidence: number; transcription: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingTimer, setRecordingTimer] = useState<NodeJS.Timeout | null>(null);
  const [word, setWord] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const bounceAnim = new Animated.Value(1);

  const LOCAL_SERVER_URL = 'http://192.168.1.12:5000/predict';

  const startBounceAnimation = () => {
    Animated.sequence([
      Animated.timing(bounceAnim, {
        toValue: 1.1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(bounceAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets.length > 0) {
        const file = result.assets[0];
        setSelectedFile(file);
        setAudioURL(file.uri);
        setResult(null);
        setWord('');
      }
    } catch (error) {
      Alert.alert('Oops!', 'Could not pick the file. Let\'s try again! 🎮');
    }
  };

  const handleRecord = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Hey there!", "We need your permission to use the microphone. Can you help us with that? 🎤");
        return;
      }

      if (recording) {
        if (recordingTime < 1) {
          Alert.alert("Too Short!", "Please speak a bit longer! 🗣️");
          return;
        }
        if (recordingTimer) clearInterval(recordingTimer);
        setRecordingTimer(null);
        setRecordingTime(0);
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        setRecording(null);
        if (uri) {
          setSelectedFile({ uri, name: 'recording.m4a' });
          setAudioURL(uri);
          setResult(null);
          setWord('');
        }
      } else {
        await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
        const newRecording = new Audio.Recording();
        await newRecording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
        await newRecording.startAsync();
        setRecording(newRecording);
        
        const timer = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
        setRecordingTimer(timer);
        
        Alert.alert("Ready, Set, Go!", "Speak now! Tap again when you're done. 🎯");
      }
    } catch (error) {
      console.error("🎤 Recording error:", error);
      Alert.alert("Oops!", "Something went wrong with the recording. Let's try again! 🎮");
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      Alert.alert('Missing Audio', 'Please record or upload an audio file first! 🎤');
      return;
    }

    if (!word.trim()) {
      Alert.alert('Missing Word', 'Please type the word you said! 📝');
      return;
    }

    const formData = new FormData();
    const filename = selectedFile.name || 'recording.m4a';
    const fileType = filename.endsWith('.mp3') ? 'audio/mpeg' : 'audio/m4a';

    formData.append('word', word.trim());
    formData.append('audio', {
      uri: selectedFile.uri,
      name: filename,
      type: fileType,
    } as any);

    try {
      setIsProcessing(true);
      const response = await fetch(LOCAL_SERVER_URL, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = await response.json();
      setResult(data);
      startBounceAnimation();
    } catch (error) {
      console.error('❌ Upload failed:', error);
      Alert.alert('Oops!', 'Could not connect to the server. Let\'s try again! 🎮');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.navigate('ApraxiaHomeScreen')}
      >
        <Ionicons name="arrow-back" size={28} color="#333" />
      </TouchableOpacity>

      <Text style={styles.title}>🎧 Check Your Speech</Text>
      <Text style={styles.subtitle}>Record or upload your voice to check! 🎤</Text>

      <View style={styles.buttonGroup}>
        <TouchableOpacity 
          onPress={handleUpload} 
          style={[styles.actionButton, recording && styles.disabledButton]}
          disabled={!!recording}
        >
          <Ionicons name="cloud-upload" size={24} color="#fff" />
          <Text style={styles.buttonText}>Upload Audio</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={handleRecord} 
          style={[styles.actionButton, recording ? styles.recordingButton : null]}
        >
          <Ionicons name="mic" size={24} color="#fff" />
          <Text style={styles.buttonText}>
            {recording ? `Recording... ${recordingTime}s` : "Record Audio"}
          </Text>
        </TouchableOpacity>
      </View>

      {audioURL && (
        <View style={styles.audioInfo}>
          <Text style={styles.audioText}>🎵 Audio Ready!</Text>
          <TextInput
            style={styles.input}
            placeholder="Type the word you said..."
            value={word}
            onChangeText={setWord}
            placeholderTextColor="#999"
          />
        </View>
      )}

      {isProcessing && (
        <View style={styles.processingContainer}>
          <ActivityIndicator size="large" color="#61dafb" />
          <Text style={styles.processingText}>Listening carefully... 🎧</Text>
        </View>
      )}

      <TouchableOpacity
        onPress={handleSubmit}
        disabled={!selectedFile || !word.trim() || loading || isProcessing}
        style={[styles.submitButton, (!selectedFile || !word.trim() || loading || isProcessing) && styles.disabledButton]}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitText}>🔎 Check Speech</Text>
        )}
      </TouchableOpacity>

      {result && (
        <Animated.View style={[styles.resultBox, { transform: [{ scale: bounceAnim }] }]}>
          <Text style={styles.resultTitle}>🧠 Results</Text>
          <Text style={styles.resultText}>You said: {result.transcription}</Text>
          <Text style={styles.resultText}>Prediction: {result.predicted}</Text>
          <Text style={styles.resultText}>Confidence: {(result.confidence * 100).toFixed(2)}%</Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
    backgroundColor: '#f2f2f2',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 30,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  buttonGroup: {
    width: '100%',
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: '#61dafb',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  recordingButton: {
    backgroundColor: '#ff6b6b',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  audioInfo: {
    backgroundColor: '#d0e7ff',
    padding: 16,
    borderRadius: 10,
    marginVertical: 15,
    width: '100%',
    alignItems: 'center',
  },
  audioText: {
    fontSize: 16,
    color: '#003366',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#fff',
    width: '100%',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#61dafb',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 12,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  submitText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  resultBox: {
    marginTop: 30,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    elevation: 4,
    width: '100%',
    alignItems: 'center',
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  resultText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
  },
  processingContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  processingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
  },
});
