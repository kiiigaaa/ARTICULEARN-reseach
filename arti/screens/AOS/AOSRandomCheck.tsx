import React, { useState } from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Audio } from 'expo-av';

export default function AOSRandomCheck() {
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [result, setResult] = useState<{ predicted: string; confidence: number } | null>(null);
  const [loading, setLoading] = useState(false);

  const LOCAL_SERVER_URL = 'http://172.20.10.4:5000/predict-apra';

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
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick a file.');
    }
  };

  const handleRecord = () => {
    Alert.alert('🎤 Coming Soon', 'Recording feature is under development.');
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      Alert.alert('Missing File', 'Please upload an audio file first.');
      return;
    }

    const formData = new FormData();
    const filename = selectedFile.name || 'audio.m4a';
    const baseWord = filename.split('.')[0].split('_')[0];
    const fileType = filename.endsWith('.mp3') ? 'audio/mpeg' : 'audio/m4a';

    formData.append('word', baseWord);
    formData.append('audio', {
      uri: selectedFile.uri,
      name: filename,
      type: fileType,
    } as any);

    try {
      setLoading(true);
      const response = await fetch(LOCAL_SERVER_URL, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('❌ Upload failed:', error);
      Alert.alert('Upload Failed', 'Could not connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎧 Check a Random Audio</Text>
      <Text style={styles.subtitle}>Test an audio file for Apraxia</Text>

      <View style={styles.buttonGroup}>
        <TouchableOpacity onPress={handleUpload} style={styles.actionButton}>
          <Text style={styles.buttonText}>📂 Upload from your device</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleRecord} style={styles.actionButton}>
          <Text style={styles.buttonText}>🎙️ Record (Coming Soon)</Text>
        </TouchableOpacity>
      </View>

      {audioURL && (
        <View style={styles.audioInfo}>
          <Text style={styles.audioText}>Selected: {selectedFile?.name}</Text>
        </View>
      )}

      <TouchableOpacity
        onPress={handleSubmit}
        disabled={!selectedFile || loading}
        style={[styles.submitButton, (!selectedFile || loading) && styles.disabledButton]}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitText}>🔎 Submit to Check</Text>
        )}
      </TouchableOpacity>

      {result && (
        <View style={styles.resultBox}>
          <Text style={styles.resultTitle}>🧠 Result</Text>
          <Text style={styles.resultText}>Prediction: {result.predicted}</Text>
          <Text style={styles.resultText}>Confidence: {(result.confidence * 100).toFixed(2)}%</Text>
        </View>
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
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  audioInfo: {
    backgroundColor: '#d0e7ff',
    padding: 12,
    borderRadius: 10,
    marginVertical: 15,
    width: '100%',
  },
  audioText: {
    fontSize: 14,
    color: '#003366',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 12,
    marginTop: 10,
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
  },
});
