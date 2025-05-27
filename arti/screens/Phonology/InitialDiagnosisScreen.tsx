// screens/InitialDiagnosisScreen.tsx
import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
  ImageBackground,
  Dimensions
} from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { savePerformanceRecord } from '../../services/practiceService';
import { Timestamp, doc as docRef, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../database/firebaseConfig';

const { width } = Dimensions.get('window');
const TEST_SENTENCES = [
  "Patty baked a big pie.",
  "Sally saw seven silly snakes.",
  "Green frogs play in the grass.",
  "The quick brown fox jumps over the lazy dog.",
  "Please call Stella."
];
const ANALYZE_URL = 'https://phonerrapp.azurewebsites.net/analyze';

export default function InitialDiagnosisScreen({ navigation }: any) {
  const [index, setIndex] = useState(0);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const micAnim = useRef(new Animated.Value(1)).current;

  // Rotate animation for our custom spinner
  const spinAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      spinAnim.stopAnimation();
      spinAnim.setValue(0);
    }
  }, [loading]);

  // Skip if already diagnosed
  useEffect(() => {
    (async () => {
      const user = auth.currentUser;
      if (!user) return;
      const snap = await getDoc(docRef(db, 'users', user.uid));
      if (snap.exists()) {
        const tier = (snap.data() as any).severityTier;
        if (tier) {
          navigation.replace('TherapyCatalogue', { tier });
        }
      }
    })();
  }, []);

  const animateMic = () =>
    Animated.sequence([
      Animated.timing(micAnim, { toValue: 1.2, duration: 200, useNativeDriver: true }),
      Animated.timing(micAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();

  const startRecording = async () => {
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') {
      return Alert.alert('Microphone permission is required');
    }
    await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
    const { recording } = await Audio.Recording.createAsync(
      Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
    );
    setRecording(recording);
  };

  const stopRecording = async () => {
    if (!recording) return;
    animateMic();
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI()!;
    setRecording(null);
    analyzeUtterance(uri);
  };

  const analyzeUtterance = async (uri: string) => {
    setLoading(true);
    try {
      const form = new FormData();
      form.append('file', { uri, name: 'utt.wav', type: 'audio/wav' } as any);
      form.append('transcript', TEST_SENTENCES[index]);
      const res = await fetch(ANALYZE_URL, { method: 'POST', body: form });
      const json = await res.json();
      setResults(r => [...r, { sentence: TEST_SENTENCES[index], summary: json.summary }]);

      if (index < TEST_SENTENCES.length - 1) {
        setIndex(i => i + 1);
      } else {
        // finalize
        const all = [...results, { summary: json.summary }];
        const totalErr = all.reduce((s, r) => s + r.summary.substitutions + r.summary.deletions, 0);
        const totalPh = all.reduce((s, r) => s + r.summary.total_phonemes, 0);
        const errRate = totalPh ? totalErr / totalPh : 0;
        const tier = errRate >= 0.6 ? 'tier_3' : errRate >= 0.3 ? 'tier_2' : 'tier_1';

        await AsyncStorage.setItem('severityTier', tier);
        const user = auth.currentUser;
        if (user) {
          await setDoc(docRef(db, 'users', user.uid), { severityTier: tier }, { merge: true });
        }

        const perf = {
          userId: user?.uid || 'anon',
          activity: 'InitialDiagnosis',
          timestamp: Timestamp.now(),
          severityTier: tier,
          summary: { error_rate: errRate, total_sessions: TEST_SENTENCES.length },
          details: all,
        };
        await savePerformanceRecord(perf);

        navigation.replace('AnalysisResult', { results: all, severityTier: tier });
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Analysis failed', 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });
  const progress = ((index) / TEST_SENTENCES.length) * width;

  return (
    <ImageBackground
      source={require('../../assets/bg_diagnosis.jpg')}
      style={styles.bg}
      imageStyle={{ opacity: 0.3 }}
    >
      <View style={styles.container}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: progress }]} />
        </View>
        <Text style={styles.step}>Step {index + 1} of {TEST_SENTENCES.length}</Text>
        <Text style={styles.instruction}>“Repeat this sentence”</Text>
        <View style={styles.sentenceBox}>
          <Text style={styles.sentence}>{TEST_SENTENCES[index]}</Text>
        </View>

        <TouchableOpacity
          onPress={recording ? stopRecording : startRecording}
          style={styles.micBtn}
          activeOpacity={0.8}
        >
          <Animated.View style={{ transform: [{ scale: micAnim }] }}>
            <Ionicons
              name={recording ? 'mic' : 'mic-outline'}
              size={48}
              color='#FFF'
            />
          </Animated.View>
        </TouchableOpacity>

        {loading && (
          <Animated.View style={{ transform: [{ rotate: spin }], marginTop: 20 }}>
            <Ionicons name="sync-circle" size={40} color="#5D4037" />
          </Animated.View>
        )}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressBar: {
    height: 6,
    width: '100%',
    backgroundColor: '#ECEFF1',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4A90E2',
  },
  step: { fontSize: 14, color: '#555', marginBottom: 20 },
  instruction: { fontSize: 20, fontWeight: '600', color: '#333', marginBottom: 12 },
  sentenceBox: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sentence: { fontSize: 18, fontWeight: '500', color: '#222', textAlign: 'center', lineHeight: 24 },
  micBtn: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#FF8A80',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  loader: { marginTop: 16 },
});
