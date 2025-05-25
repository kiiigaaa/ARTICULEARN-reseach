// src/screens/SpinPracticeScreen.tsx
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Easing,
  Alert
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { fetchPracticePairs, savePerformanceRecord } from "../../services/practiceService";
import type { PracticePair, PerformanceRecord } from "../../types/practice";
import * as Speech from "expo-speech";
import { Audio } from "expo-av";
import { useNavigation } from '@react-navigation/native';
import { Timestamp } from "firebase/firestore";

export default function SpinPracticeScreen() {
  const [pairs, setPairs] = useState<PracticePair[]>([]);
  const [current, setCurrent] = useState<PracticePair | null>(null);
  const [loading, setLoading] = useState(true);
  const [playingSentence, setPlayingSentence] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const [playingRecording, setPlayingRecording] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const spinAnim = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation();

  // Configure audio for iOS
  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_MIX_WITH_OTHERS,
      shouldDuckAndroid: false,
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
      playThroughEarpieceAndroid: false,
    });
  }, []);

  // Load pairs
  useEffect(() => {
    (async () => {
      try {
        const all = await fetchPracticePairs();
        setPairs(all);
        if (all.length) setCurrent(all[Math.floor(Math.random() * all.length)]);
      } catch (error) {
        Alert.alert("Oops!", "Could not load practice cards. Please try again.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Spin cards
  const handleSpin = () => {
    if (!pairs.length) return;
    setPlayingSentence(false);
    setAnalysisResult(null);
    setRecordedUri(null);
    Animated.sequence([
      Animated.timing(spinAnim, {
        toValue: 0.2,
        duration: 200,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      })
    ]).start(() => {
      spinAnim.setValue(0);
      setCurrent(pairs[Math.floor(Math.random() * pairs.length)]);
    });
  };

  // Play sentence
  const handlePlaySentence = () => {
    if (!current) return;
    setPlayingSentence(true);
    Speech.speak(current.sentence, {}, () => setPlayingSentence(false));
  };

  // Start recording
  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') throw new Error('Permission denied');
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const rec = new Audio.Recording();
      await rec.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
      await rec.startAsync();
      setRecording(rec);
    } catch (e) {
      Alert.alert("Recording Error", "Cannot start recording.");
    }
  };

  // Stop recording
  const stopRecording = async () => {
    if (!recording) return;
    await recording.stopAndUnloadAsync();
    setRecordedUri(recording.getURI());
    setRecording(null);
  };

  // Playback recording
  const playRecording = async () => {
    if (!recordedUri) return;
    setPlayingRecording(true);
    const { sound } = await Audio.Sound.createAsync({ uri: recordedUri });
    await sound.playAsync();
    sound.setOnPlaybackStatusUpdate(status => {
      if (status.didJustFinish) {
        setPlayingRecording(false);
        sound.unloadAsync();
      }
    });
  };

  // Analyze pronunciation
  const handleAnalyze = async () => {
    if (!recordedUri || !current) {
      Alert.alert("Hold on!", "Please record your answer first.");
      return;
    }
    setIsAnalyzing(true);
    try {
      const form = new FormData();
      form.append('file', { uri: recordedUri, name: 'utt.wav', type: 'audio/wav' } as any);
      form.append('transcript', current.sentence);
      console.log("Sending analysis request with form data:", form);
      const res = await fetch('https://phonerrapp.azurewebsites.net/analyze', { method:'POST', body: form });
      console.log("Analysis response:", res);
      const json = await res.json();
      console.log("Analysis result:", json);
      setAnalysisResult(json.summary);
      // Save performance
      const rec: Omit<PerformanceRecord,'id'> = {
        userId: 'child123',
        cardIds: [current.id!, current.id!],
        activity: 'Spin Practice',
        timestamp: Timestamp.now(),
        summary: json.summary,
        details: json.details
      };
      const id = await savePerformanceRecord(rec);
      setAnalysisResult(prev => ({ ...prev, id }));
    } catch (e) {
      Alert.alert("Analysis Error", "Something went wrong. Try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large"/></View>;
  if (!current) return <View style={styles.center}><Text style={styles.infoText}>No cards left! Please add more.</Text></View>;

  const rotate = spinAnim.interpolate({ inputRange:[0,1], outputRange:['0deg','360deg'] });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.cardsRow, { transform:[{ rotate }] }]}>  
        <View style={styles.card}>
          <Image source={{ uri: current.image1 }} style={styles.image}/>
          <Text style={styles.word}>{current.word1}</Text>
        </View>
        <View style={styles.card}>
          <Image source={{ uri: current.image2 }} style={styles.image}/>
          <Text style={styles.word}>{current.word2}</Text>
        </View>
      </Animated.View>

      {/* Action Buttons */}
      <View style={styles.row}>
        <TouchableOpacity style={styles.actionBtn} onPress={handlePlaySentence} disabled={playingSentence}>
          <Ionicons name="volume-high-outline" size={28} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={handleSpin}>
          <Ionicons name="refresh-circle-outline" size={28} color="#FFF" />
        </TouchableOpacity>
        {!recording ? (
          <TouchableOpacity style={styles.actionBtn} onPress={startRecording}>
            <Ionicons name="mic-outline" size={28} color="#FFF" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.actionBtn} onPress={stopRecording}>
            <Ionicons name="stop-circle-outline" size={28} color="#FFF" />
          </TouchableOpacity>
        )}
        {recordedUri && !analysisResult && (
          <TouchableOpacity style={styles.actionBtn} onPress={playRecording} disabled={playingRecording}>
            <Ionicons name={playingRecording?"musical-notes-outline":"play-circle-outline"} size={28} color="#FFF" />
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.actionBtn} onPress={handleAnalyze} disabled={isAnalyzing || !recordedUri}>
          <Ionicons name="analytics-outline" size={28} color="#FFF" />
        </TouchableOpacity>
        {analysisResult?.id && (
          <TouchableOpacity style={styles.actionBtn} onPress={()=>navigation.navigate('Performance',{perfId:analysisResult.id})}>
            <Ionicons name="document-text-outline" size={28} color="#FFF" />
          </TouchableOpacity>
        )}
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFAF0',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 18,
    color: '#555',
    textAlign: 'center',
  },
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 24,
  },
  card: {
    alignItems: 'center',
    width: '40%',
    backgroundColor: '#FFF8DC',
    padding: 12,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FFD700',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 5,
  },
  image: {
    width: 140,
    height: 140,
    resizeMode: 'contain',
    marginBottom: 12,
  },
  word: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    marginVertical: 16,
  },
  actionBtn: {
    marginHorizontal: 8,
    backgroundColor: '#FFA500',
    padding: 14,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 6,
  },
});
