// screens/ProcessDetailScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import * as Animatable from 'react-native-animatable';
import { Ionicons } from '@expo/vector-icons';
import { savePerformanceRecord } from '../../services/practiceService';
import { Timestamp } from 'firebase/firestore';
import type { PerformanceRecord } from '../../types/practice';

const SERVER_URL = 'https://phonerrapp.azurewebsites.net/analyze';

interface ProcessWord { word: string; image: string; }
interface Process { name: string; code: string; words: ProcessWord[]; }

export default function ProcessDetailScreen({ route, navigation }: any) {
  const { process } = route.params as { process: Process };

  const [recording, setRecording]       = useState<Audio.Recording|null>(null);
  const [audioURI, setAudioURI]         = useState<string|null>(null);
  const [loading, setLoading]           = useState(false);
  const [feedback, setFeedback]         = useState<string|null>(null);
  const [currentIdx, setCurrentIdx]     = useState(0);
  const [sessionDetails, setDetails]    = useState<any[]>([]);
  const [sessionWrong, setSessionWrong] = useState(0);

  const wordList = process.words;
  const current  = wordList[currentIdx];

  useEffect(() => {
    if (current) Speech.speak(current.word, { rate: 1.0 });
  }, [current]);

  const startRecording = async () => {
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') {
      return Alert.alert('Microphone access denied', 'Please enable it in settings.');
    }
    await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
    const { recording } = await Audio.Recording.createAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
    setRecording(recording);
  };

  const stopRecording = async () => {
    if (!recording) return;
    await recording.stopAndUnloadAsync();
    setAudioURI(recording.getURI());
    setRecording(null);
  };

  const analyzeWord = async () => {
    if (!audioURI) return;
    setLoading(true);
    try {
      const form = new FormData();
      form.append('file', { uri: audioURI, name: 'utt.wav', type: 'audio/wav' } as any);
      form.append('transcript', current.word);

      const res  = await fetch(SERVER_URL, { method: 'POST', body: form });
      const json = await res.json() as {
        details: any[];
        summary: {
          total_phonemes: number;
          substitutions: number;
          deletions: number;
          insertions: number;
          error_rate: number;
          has_disorder: boolean;
        };
      };

      const s = json.summary;
      if (!s.has_disorder) {
        setFeedback('Perfect pronunciation!');
      } else {
        setFeedback(
          `Substitutions: ${s.substitutions}\n` +
          `Deletions: ${s.deletions}\n` +
          `Error rate: ${(s.error_rate * 100).toFixed(0)}%`
        );
        setSessionWrong(w => w + 1);
      }

      setDetails(d => [...d, { word: current.word, summary: s, details: json.details }]);
    } catch {
      Alert.alert('Analysis failed', 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onNext = async () => {
    setFeedback(null);
    setAudioURI(null);

    if (currentIdx < wordList.length - 1) {
      setCurrentIdx(i => i + 1);
    } else {
      const summary = {
        total_phonemes: wordList.length,
        substitutions: sessionWrong,
        deletions: 0,
        insertions: 0,
        error_rate: sessionWrong / wordList.length,
        has_disorder: sessionWrong / wordList.length >= 0.5,
      };
      const rec: Omit<PerformanceRecord,'id'> = {
        userId: 'child123',
        activity: 'PhonologicalProcess',
        timestamp: Timestamp.now(),
        summary,
        details: sessionDetails,
      };
      await savePerformanceRecord(rec);
      Alert.alert('Session complete', 'Your progress has been recorded.', [
        { text: 'Back', onPress: () => navigation.goBack() }
      ]);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <View style={styles.card}>
        <Text style={styles.header}>{process.name} ({process.code})</Text>
        <Image source={{ uri: current.image }} style={styles.image}/>
        <Text style={styles.word}>{current.word}</Text>

        <View style={styles.controls}>
          {!recording ? (
            <TouchableOpacity style={[styles.button, styles.recordBtn]} onPress={startRecording}>
              <Ionicons name="mic-outline" size={28} color="#fff" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[styles.button, styles.stopBtn]} onPress={stopRecording}>
              <Ionicons name="stop-circle-outline" size={28} color="#fff" />
            </TouchableOpacity>
          )}

          {audioURI && !loading && (
            <TouchableOpacity style={[styles.button, styles.analyzeBtn]} onPress={analyzeWord}>
              <Ionicons name="analytics-outline" size={28} color="#fff" />
            </TouchableOpacity>
          )}
          {loading && <ActivityIndicator style={styles.loader} size="large" color="#3386F2" />}
        </View>

        {feedback && (
          <Animatable.View animation="fadeInUp" style={styles.feedbackBox}>
            <Text style={styles.feedback}>{feedback}</Text>
          </Animatable.View>
        )}

        {feedback && (
          <TouchableOpacity style={[styles.button, styles.nextBtn]} onPress={onNext}>
            <Ionicons name="arrow-forward-circle-outline" size={28} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll:    { flexGrow:1, backgroundColor:'#FDFDFD', justifyContent:'center', padding:16 },
  card:      { backgroundColor:'#fff', borderRadius:16, padding:20, alignItems:'center', elevation:3 },
  header:    { fontSize:18, fontWeight:'600', color:'#333', marginBottom:12 },
  image:     { width:120, height:120, borderRadius:12, marginBottom:12 },
  word:      { fontSize:22, fontWeight:'bold', color:'#222', marginBottom:20 },
  controls:  { flexDirection:'row', alignItems:'center', marginBottom:20 },
  button:    { padding:14, borderRadius:30, marginHorizontal:8, elevation:2 },
  recordBtn: { backgroundColor:'#4CAF50' },
  stopBtn:   { backgroundColor:'#E53935' },
  analyzeBtn:{ backgroundColor:'#FFA000' },
  nextBtn:   { backgroundColor:'#3386F2' },
  loader:    { marginHorizontal:16 },
  feedbackBox:{
    width:'100%',
    backgroundColor:'#E3F2FD',
    padding:16,
    borderRadius:12,
    marginBottom:12,
  },
  feedback: { color:'#0D47A1', fontSize:16, textAlign:'center' },
});
