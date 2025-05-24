import React, { useEffect, useState } from 'react';
import {
  View, Text, Image, TouchableOpacity, StyleSheet, Modal,
  ActivityIndicator, Alert, Animated
} from 'react-native';
import { db } from '../../database/firebaseConfig';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';

interface Word {
  id: string;
  word: string;
  ipa: string;
  pronunciation: string;
  image: string;
}

const LOCAL_SERVER_URL = 'http://192.168.1.12:5000/predict';

const PronouncScreen = ({ navigation }: any) => {
  const [aosWords, setAosWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(true);
  const [loading, setLoading] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [canProceed, setCanProceed] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [transcription, setTranscription] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingTimer, setRecordingTimer] = useState<NodeJS.Timeout | null>(null);
  const bounceAnim = new Animated.Value(1);

  useEffect(() => {
    const fetchWords = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'aosWords'));
        const fetchedWords = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        })) as Word[];
        setAosWords(fetchedWords.sort(() => Math.random() - 0.5));
        setLoading(false);
      } catch (err) {
        console.error('❌ Error fetching data:', err);
        setLoading(false);
      }
    };
    fetchWords();
  }, []);

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

  const sendAudioToServer = async (audioUri: string, word: string) => {
    setIsProcessing(true);
    try {
      const filename = audioUri.split('/').pop() || 'recording.m4a';

      const formData = new FormData();
      formData.append('word', word);
      formData.append('audio', {
        uri: audioUri,
        name: filename,
        type: 'audio/m4a',
      } as any);

      const response = await fetch(LOCAL_SERVER_URL, {
        method: 'POST',
        body: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const result = await response.json();
      const safeTranscription = result.transcription ?? "Unknown";
      setTranscription(safeTranscription);

      let feedbackMessage = null;
      const isApraxia = result.predicted === 'Apraxia';

      if (isApraxia) {
        feedbackMessage = result.word_match === false
          ? `Oops! That's not quite right. Try saying "${word}" again! 🎯`
          : 'Keep practicing! You can do it! 🌟';
        setCanProceed(false);
      } else {
        feedbackMessage = 'Great job! You said it perfectly! 🎉';
        setCanProceed(true);
      }

      setFeedback(feedbackMessage);
      startBounceAnimation();

      await addDoc(collection(db, "attempts"), {
        word,
        transcription: safeTranscription,
        predicted: result.predicted ?? "Unknown",
        confidence: result.confidence ?? 0,
        status: result.predicted ?? "Unknown",
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      console.error('❌ Error uploading audio:', error);
      Alert.alert('Oops!', 'Something went wrong. Let\'s try again! 🎮');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpload = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: 'audio/*' });
    if (result.assets && result.assets.length > 0) {
      const file = result.assets[0];
      Alert.alert("✅ Audio Uploaded", `You selected: ${file.name}`);
      if (currentWord?.word) {
        await sendAudioToServer(file.uri, currentWord.word);
      }
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
        if (uri && currentWord?.word) {
          await sendAudioToServer(uri, currentWord.word);
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

  const speakWord = () => {
    if (currentWord?.word) {
      Speech.speak(currentWord.word, { language: 'en-US', rate: 0.8 });
    }
  };

  const handleSpeakOptions = () => {
    Alert.alert("Choose an Option", "How would you like to provide speech?", [
      { text: "Upload from Device", onPress: handleUpload },
      { text: recording ? "Stop Recording" : "Record", onPress: handleRecord },
      { text: "Cancel", style: "cancel" }
    ]);
  };

  const handleNext = () => {
    if (currentIndex < aosWords.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowInfo(false);
      setCanProceed(false);
      setFeedback(null);
      setTranscription("");
    } else {
      setModalVisible(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowInfo(false);
      setCanProceed(false);
      setFeedback(null);
      setTranscription("");
    }
  };

  const handleBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate('ApraxiaHomeScreen');
  };

  const currentWord = aosWords[currentIndex];

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#61dafb" />
        <Text style={styles.loadingText}>Loading AOS Words...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AOS Kids Game</Text>
      <Text style={styles.subtitle}>Learn words the fun way! 🎮</Text>

      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalView}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={28} color="#000" />
          </TouchableOpacity>

          {currentWord && (
            <>
              <Animated.View style={[styles.imageFrame, { transform: [{ scale: bounceAnim }] }]}>
                <Image source={{ uri: currentWord.image }} style={styles.image} />
              </Animated.View>
              <Text style={styles.word}>{currentWord.word.toUpperCase()}</Text>

              <View style={styles.buttonRow}>
                <TouchableOpacity 
                  style={[styles.actionButton, recording && styles.recordingButton]} 
                  onPress={handleSpeakOptions}
                >
                  <Ionicons name="mic" size={28} color="#fff" />
                  <Text style={styles.buttonText}>
                    {recording ? `Recording... ${recordingTime}s` : "Speak"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.infoButton} onPress={() => setShowInfo(!showInfo)}>
                  <Ionicons name={showInfo ? "information-circle" : "information-circle-outline"} size={28} color="#fff" />
                  <Text style={styles.buttonText}>Info</Text>
                </TouchableOpacity>
              </View>

              {isProcessing && (
                <View style={styles.processingContainer}>
                  <ActivityIndicator size="large" color="#61dafb" />
                  <Text style={styles.processingText}>Listening carefully... 🎧</Text>
                </View>
              )}

              {showInfo && (
                <View style={styles.infoBox}>
                  <Text style={styles.sheetTitle}>How to say it:</Text>
                  <Text style={styles.sheetText}>/{currentWord.ipa}/</Text>
                  <Text style={styles.sheetTitle}>Pronunciation:</Text>
                  <Text style={styles.sheetText}>{currentWord.pronunciation}</Text>
                </View>
              )}

              {transcription && (
                <Text style={styles.transcriptionText}>
                  🗣️ You said: {transcription}
                </Text>
              )}

              {feedback && (
                <Text style={styles.feedbackText}>{feedback}</Text>
              )}

              <View style={styles.navButtons}>
                <TouchableOpacity
                  style={[styles.navButton, currentIndex === 0 && styles.disabledButton]}
                  onPress={handlePrevious}
                  disabled={currentIndex === 0}
                >
                  <Text style={styles.navButtonText}>Previous</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.navButton, !canProceed && styles.disabledButton]}
                  onPress={handleNext}
                  disabled={!canProceed}
                >
                  <Text style={styles.navButtonText}>
                    {currentIndex === aosWords.length - 1 ? "Finish" : "Next"}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#282c34',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#61dafb',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 20,
  },
  modalView: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingTop: 100,
    paddingHorizontal: 30,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
  },
  imageFrame: {
    width: 270,
    height: 270,
    padding: 10,
    backgroundColor: '#ffe9c7',
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#fba83c',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  word: {
    fontSize: 34,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 10,
  },
  actionButton: {
    flexDirection: 'row',
    backgroundColor: '#61dafb',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    alignItems: 'center',
    gap: 8,
  },
  infoButton: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 6,
  },
  infoBox: {
    marginTop: 12,
    padding: 14,
    backgroundColor: '#f0f4f7',
    borderRadius: 12,
    alignItems: 'center',
    width: '90%',
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  sheetText: {
    fontSize: 18,
    color: '#555',
    marginBottom: 8,
  },
  navButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    marginTop: 30,
  },
  navButton: {
    backgroundColor: '#f78e69',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 14,
  },
  navButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.5,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#282c34',
  },
  loadingText: {
    marginTop: 10,
    color: '#fff',
  },
  recordingButton: {
    backgroundColor: '#ff6b6b',
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
  transcriptionText: {
    color: '#444',
    fontStyle: 'italic',
    marginTop: 10,
    fontSize: 16,
    textAlign: 'center',
  },
  feedbackText: {
    marginTop: 10,
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
    color: '#4CAF50',
  },
});

export default PronouncScreen;
