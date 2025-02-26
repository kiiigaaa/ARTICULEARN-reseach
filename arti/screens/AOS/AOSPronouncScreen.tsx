import React, { useEffect, useState } from 'react';
import {
  View, Text, Image, TouchableOpacity, StyleSheet, Modal,
  ActivityIndicator, Alert
} from 'react-native';
import { db } from '../../database/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { Audio } from 'expo-av';

type Word = {
  id: string;
  word: string;
  ipa: string;
  pronunciation: string;
  image: string;
};

const LOCAL_SERVER_URL = 'http://192.168.1.12:5000/predict';

const PronouncScreen = ({ navigation }: any) => {
  const [aosWords, setAosWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(true);
  const [loading, setLoading] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [canProceed, setCanProceed] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    const fetchWords = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'aosWords'));
        const fetchedWords = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Word, 'id'>),
        }));
        const shuffledWords = fetchedWords.sort(() => Math.random() - 0.5);
        setAosWords(shuffledWords);
        setLoading(false);
      } catch (err) {
        console.error('❌ Error fetching data:', err);
        setLoading(false);
      }
    };

    fetchWords();
  }, []);

  const sendAudioToServer = async (audioUri: string, word: string) => {
    try {
      const filename = audioUri.split('/').pop() || 'audio.m4a';
      const fileType = filename.endsWith('.mp3') ? 'audio/mpeg' : 'audio/m4a';

      const formData = new FormData();
      formData.append('word', word);
      formData.append('audio', {
        uri: audioUri,
        name: filename,
        type: fileType,
      } as any);

      const response = await fetch(LOCAL_SERVER_URL, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const result = await response.json();

      if (result.predicted === 'Apraxia') {
        setFeedback('Try again, you can do it!');
        setCanProceed(false);
      } else {
        setFeedback(null);
        setCanProceed(true);
      }

      Alert.alert('🧠 Result', `Prediction: ${result.predicted}\nConfidence: ${result.confidence}`);
    } catch (error) {
      console.error('❌ Error uploading audio:', error);
      Alert.alert('Upload Failed', 'Could not send audio to the server.');
    }
  };

  const handleUpload = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'audio/*',
      copyToCacheDirectory: true,
    });

    if (result.assets && result.assets.length > 0) {
      const file = result.assets[0];
      Alert.alert("✅ Audio Uploaded", `You selected: ${file.name}`);
      if (currentWord?.word) {
        await sendAudioToServer(file.uri, currentWord.word);
      }
    }
  };

  const handleRecord = async () => {
    Alert.alert("⚠️ Under Development", "Recording feature is under development.");
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      const { sound } = await recording.createNewLoadedSoundAsync();
      setSound(sound);
      await sound.playAsync();
      setRecording(null);
      Alert.alert("✅ Recording Complete", `Saved at: ${uri}`);
      if (uri && currentWord?.word) {
        await sendAudioToServer(uri, currentWord.word);
      }
    } catch (error) {
      console.error("❌ Failed to stop recording:", error);
    }
  };

  const handleSpeakOptions = () => {
    Alert.alert(
      "Choose an Option",
      "How would you like to provide speech?",
      [
        { text: "Upload from Device", onPress: handleUpload },
        { text: "Record", onPress: handleRecord },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  const handleNext = () => {
    if (currentIndex < aosWords.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowInfo(false);
      setCanProceed(false);
      setFeedback(null);
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
    }
  };

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('ApraxiaHomeScreen');
    }
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
      <Text style={styles.subtitle}>Learn words the fun way!</Text>

      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalView}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={28} color="#000" />
          </TouchableOpacity>

          {currentWord && (
            <>
              <View style={styles.imageFrame}>
                <Image source={{ uri: currentWord.image }} style={styles.image} />
              </View>
              <Text style={styles.word}>{currentWord.word.toUpperCase()}</Text>

              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.actionButton} onPress={handleSpeakOptions}>
                  <Ionicons name="mic" size={28} color="#fff" />
                  <Text style={styles.buttonText}>{recording ? "Stop" : "Speak"}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.infoButton} onPress={() => setShowInfo(!showInfo)}>
                  <Ionicons name="information-circle" size={28} color="#fff" />
                  <Text style={styles.buttonText}>Info</Text>
                </TouchableOpacity>
              </View>

              {showInfo && (
                <View style={styles.infoBox}>
                  <Text style={styles.sheetTitle}>IPA:</Text>
                  <Text style={styles.sheetText}>/{currentWord.ipa}/</Text>
                  <Text style={styles.sheetTitle}>Pronunciation:</Text>
                  <Text style={styles.sheetText}>{currentWord.pronunciation}</Text>
                </View>
              )}

              {feedback && (
                <Text style={{ color: 'red', marginTop: 10, fontWeight: 'bold' }}>{feedback}</Text>
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
});

export default PronouncScreen;
