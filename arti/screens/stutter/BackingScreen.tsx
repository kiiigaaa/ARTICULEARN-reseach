import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Image, Animated } from 'react-native';
import { Audio } from 'expo-av';
import Icon from 'react-native-vector-icons/FontAwesome'; // Importing FontAwesome icons

const VoiceAnalysisScreen = ({ navigation }: any) => {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState<boolean>(false); // For pause functionality
  const [animation] = useState(new Animated.Value(0)); // To control animation
  const [sound, setSound] = useState<Audio.Sound | null>(null); // To play the recorded sound
  const [showConfirmDiscard, setShowConfirmDiscard] = useState<boolean>(false); // Show confirm/discard buttons
  const [showReplay, setShowReplay] = useState<boolean>(false); // Show replay button after stopping recording

  // Start recording
  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
      setIsPaused(false); // Reset paused state
      setAnalysisResult(null); // Reset previous results
      setError(null); // Reset previous errors
      setShowConfirmDiscard(false); // Hide confirm/discard buttons while recording
      setShowReplay(false); // Hide replay button while recording
    } catch (err) {
      console.error('Failed to start recording', err);
      setError('Failed to start recording');
    }
  };

  // Stop recording and show confirm/discard buttons
  const stopRecording = async () => {
    if (!recording) return;

    setIsRecording(false);
    await recording.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });

    // Get the recorded audio URI
    const uri = recording.getURI();
    if (!uri) {
      setError('Failed to save recording');
      return;
    }

    // Set the flag to show confirm/discard buttons and replay button
    setShowConfirmDiscard(true);
    setShowReplay(true); // Show replay button after stopping recording
  };

  // Confirm and send audio to Flask backend
  const confirmRecording = async () => {
    if (!recording) return;

    const uri = recording.getURI();
    if (!uri) {
      setError('Failed to confirm recording');
      return;
    }

    // Convert the file at `uri` to a Blob
    const response = await fetch(uri);
    const blob = await response.blob();

    // Prepare the audio file for upload
    const formData = new FormData();
    formData.append('file', blob, 'recording.m4a'); // Append the Blob with a filename

    // Send audio to Flask backend for analysis
    setIsAnalyzing(true);
    try {
      const serverResponse = await fetch('http://your-flask-server-url/analyze', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const result = await serverResponse.json();

      // Handle the response from Flask
      if (result && result.result) {
        setAnalysisResult(result.result);
      } else {
        setError('No result returned from the server');
      }
    } catch (err) {
      console.error('Failed to analyze recording', err);
      setError('Failed to analyze recording');
    } finally {
      setIsAnalyzing(false);
    }

    // Hide replay button after confirming
    setShowReplay(false);
  };

  // Discard recording and reset state
  const discardRecording = () => {
    setRecording(null);
    setIsRecording(false);
    setIsPaused(false);
    setShowConfirmDiscard(false);
    setAnalysisResult(null);
    setError(null);
    setShowReplay(false); // Hide replay button after discarding
  };

  // Pause recording
  const pauseRecording = async () => {
    if (recording && !isPaused) {
      await recording.pauseAsync();
      setIsPaused(true);
    }
  };

  // Resume recording
  const resumeRecording = async () => {
    if (recording && isPaused) {
      await recording.startAsync();
      setIsPaused(false);
    }
  };

  // Replay recorded audio
  const replayRecording = async () => {
    if (recording) {
      const { sound } = await recording.createNewLoadedSoundAsync();
      setSound(sound);
      sound.playAsync();
    }
  };

  // Trigger the animation when analysis starts
  useEffect(() => {
    if (isAnalyzing) {
      Animated.spring(animation, {
        toValue: 1,
        friction: 4,
        tension: 50,
        useNativeDriver: true,
      }).start();
    }
  }, [isAnalyzing]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image source={require('../../assets/logo.png')} style={styles.logo} />
        <Text style={styles.title}>Stutter Therapy</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Image source={require('../../assets/icon.png')} style={styles.profileImage} />
        </TouchableOpacity>
      </View>

      {/* Content Section */}
      <View style={styles.contentContainer}>
        <Image source={require('../../assets/icon.png')} style={styles.imageStyle} />
        <Text style={styles.word}>Say what you see..</Text>

        {/* Record Button */}
        <TouchableOpacity
          style={styles.recordButton}
          onPress={isRecording ? stopRecording : startRecording}
        >
          <Text style={styles.recordButtonText}>
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </Text>
        </TouchableOpacity>

        {/* Pause and Resume Buttons */}
        {isRecording && !isPaused && (
          <TouchableOpacity style={styles.pauseButton} onPress={pauseRecording}>
            <Icon name="pause" size={20} color="#fff" />
            <Text style={styles.pauseButtonText}>Pause</Text>
          </TouchableOpacity>
        )}

        {isRecording && isPaused && (
          <TouchableOpacity style={styles.pauseButton} onPress={resumeRecording}>
            <Icon name="play" size={20} color="#fff" />
            <Text style={styles.pauseButtonText}>Resume</Text>
          </TouchableOpacity>
        )}

        {/* Replay Button */}
        {showReplay && (
          <TouchableOpacity style={styles.replayButton} onPress={replayRecording}>
            <Icon name="replay" size={20} color="#fff" />
            <Text style={styles.replayButtonText}>Replay</Text>
          </TouchableOpacity>
        )}

        {/* Confirm and Discard Buttons */}
        {showConfirmDiscard && (
          <View style={styles.confirmDiscardContainer}>
            <TouchableOpacity style={styles.confirmButton} onPress={confirmRecording}>
              <Icon name="check" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.discardButton} onPress={discardRecording}>
              <Icon name="times" size={20} color="#fff" /> 
            </TouchableOpacity>
          </View>
        )}

        {/* Analyzing Popup with Animation */}
        {isAnalyzing && (
          <Animated.View
            style={[styles.analyzingContainer, { transform: [{ translateY: animation.interpolate({ inputRange: [0, 1], outputRange: [200, 0] }) }] }]}>
            <ActivityIndicator size="large" color="#4A90E2" />
            <Text style={styles.analyzingText}>Analyzing...</Text>
          </Animated.View>
        )}

        {/* Results Section */}
        {analysisResult && (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsText}>{analysisResult}</Text>
          </View>
        )}

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: 50 },
  logo: { width: 50, height: 50, resizeMode: 'contain' },
  title: { fontSize: 20, fontWeight: 'bold', flex: 1, textAlign: 'center' },
  profileImage: { width: 40, height: 40, borderRadius: 20 },
  contentContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  word: { fontSize: 28, fontWeight: 'bold', marginTop: 30, color: '#4A90E2' },
  recordButton: { backgroundColor: '#4A90E2', padding: 15, borderRadius: 25, alignItems: 'center', width: 200, marginTop: 20 },
  recordButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  pauseButton: { backgroundColor: '#FF6600', padding: 15, borderRadius: 25, alignItems: 'center', width: 200, marginTop: 10 },
  pauseButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  replayButton: { backgroundColor: '#4A90E2', padding: 15, borderRadius: 25, alignItems: 'center', width: 200, marginTop: 10 },
  replayButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  confirmDiscardContainer: { flexDirection: 'row', marginTop: 20, justifyContent: 'space-between', width: 200 },
  confirmButton: { backgroundColor: '#4A90E2', padding: 15, borderRadius: 25, alignItems: 'center', width: '45%' },
  confirmButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  discardButton: { backgroundColor: '#FF6600', padding: 15, borderRadius: 25, alignItems: 'center', width: '45%' },
  discardButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  analyzingContainer: { marginTop: 40, alignItems: 'center' },
  analyzingText: { fontSize: 18, marginTop: 10, color: '#4A4A4A' },
  imageStyle: { width: 200, height: 200, resizeMode: 'contain', marginTop: -200 },
  resultsContainer: { marginTop: 40, alignItems: 'center' },
  resultsText: { fontSize: 24, fontWeight: 'bold', color: '#4A4A4A' },
  errorContainer: { marginTop: 20, alignItems: 'center' },
  errorText: { fontSize: 16, color: '#FF0000' },
});

export default VoiceAnalysisScreen;
