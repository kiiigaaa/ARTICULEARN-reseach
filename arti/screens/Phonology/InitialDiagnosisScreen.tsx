// screens/InitialDiagnosisScreen.tsx
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Animated } from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TEST_SENTENCES = [
  "Patty baked a big pie.",
  "Sally saw seven silly snakes.",
  "Green frogs play in the grass.",
  "The quick brown fox jumps over the lazy dog.",
  "Please call Stella."
];

// Replace with your secure API key. For production, never expose your API key on the client.
const YOUR_OPENAI_API_KEY = "api-key";

const InitialDiagnosisScreen = ({ navigation }: any) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [audioURIs, setAudioURIs] = useState<(string | null)[]>([null, null, null, null, null]);
  const [loading, setLoading] = useState(false);

  const micAnimation = useRef(new Animated.Value(1)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  const [storedTier, setStoredTier] = useState<string | null>(null);

  useEffect(() => {
    const checkStoredTier = async () => {
      const savedTier = await AsyncStorage.getItem('severityTier');
      if (savedTier) {
        setStoredTier(savedTier);
      }
    };

    checkStoredTier();
  }, []);

  useEffect(() => {
    if (storedTier) {
      // Automatically navigate to the appropriate tier based on stored data
      navigation.navigate("phono", { tier: `tier_${storedTier}` });
    }
  }, [storedTier]);

  const phonologicalAnalysis = (expectedWord: string, userTranscription: string) => {
    let analysis = { omissions: [], substitutions: [], vowelChanges: [] };

    for (let i = 0; i < expectedWord.length; i++) {
      const expectedPhoneme = expectedWord[i];
      const userPhoneme = userTranscription[i];

      if (!userPhoneme) {
        analysis.omissions.push(expectedPhoneme); // Missing phoneme
      } else if (userPhoneme !== expectedPhoneme) {
        analysis.substitutions.push({ expected: expectedPhoneme, user: userPhoneme }); // Substitution
      }
    }

    const vowels = ['a', 'e', 'i', 'o', 'u'];
    for (let i = 0; i < expectedWord.length; i++) {
      const expectedChar = expectedWord[i];
      const userChar = userTranscription[i];
      if (vowels.includes(expectedChar) && userChar !== expectedChar) {
        analysis.vowelChanges.push({ expected: expectedChar, user: userChar });
      }
    }

    return analysis;
  };


  // Start recording using expo-av
  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert("Permission not granted", "Please allow audio recording permission");
        return;
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(recording);
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  };

  // Stop recording and save the URI for the current sentence
  const stopRecording = async () => {
    if (!recording) return;
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      console.log("Recording stopped and stored at", uri);
      const updatedURIs = [...audioURIs];
      updatedURIs[currentIndex] = uri;
      setAudioURIs(updatedURIs);
      setRecording(null);
    } catch (err) {
      console.error("Failed to stop recording", err);
    }
  };

  // When all sentences are recorded, transcribe each and send to GPT for analysis
  const handleAnalysis = async () => {
    setLoading(true);
    try {
      const transcriptions: string[] = [];
      for (let i = 0; i < audioURIs.length; i++) {
        const uri = audioURIs[i];
        if (!uri) {
          transcriptions.push("No recording available");
          continue;
        }
        const transcription = await transcribeAudio(uri);
        transcriptions.push(transcription);
      }

      const analysisResults = [];
      for (let i = 0; i < TEST_SENTENCES.length; i++) {
        const expectedWord = TEST_SENTENCES[i];
        const transcription = transcriptions[i] || "";

        const analysis = phonologicalAnalysis(expectedWord, transcription);
        const errorCount = analysis.omissions.length + analysis.substitutions.length + analysis.vowelChanges.length;
        let severity = "Mild";
        if (errorCount > 3) severity = "Moderate";
        if (errorCount > 5) severity = "Severe";

        analysisResults.push({ analysis, severity });
      }

      console.log("Analysis results:", analysisResults);

      const result = await analyzePhonologicalDisorder(transcriptions);
      await AsyncStorage.setItem('severityTier', result.severityTier.toString());

      console.log("Analysis result:", result);
      navigation.navigate("AnalysisResult", { result });
      // Navigate based on severity tier returned from analysis
    //   if (result.severityTier === 1) {
    //     navigation.navigate("phono");
    //   } else if (result.severityTier === 2) {
    //     navigation.navigate("phono");
    //   } else if (result.severityTier === 3) {
    //     navigation.navigate("phono");
    //   } else {
    //     Alert.alert("Analysis Error", "Could not determine severity tier.");
    //   }
    } catch (error) {
      console.error("Analysis error:", error);
      Alert.alert("Analysis Error", "An error occurred during analysis.");
    }
    setLoading(false);
  };

  // Calls OpenAI Whisper API to transcribe a given audio file
  // Update transcribeAudio function:
const transcribeAudio = async (audioURI: string): Promise<string> => {
    try {
      let formData = new FormData();
      // Use the correct file name and MIME type for m4a recordings
      // @ts-ignore
      formData.append('file', {
        uri: audioURI,
        name: 'audio.m4a',
        type: 'audio/m4a'
      });
      formData.append('model', 'whisper-1');
  
      const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${YOUR_OPENAI_API_KEY}`,
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });
  
      const data = await response.json();
      console.log("Transcription data:", data);
      if (data.error) {
        console.error("Transcription error:", data.error);
        Alert.alert("Transcription Error", data.error.message);
        return "";
      }
      return data.text || "";
    } catch (error) {
      console.error("Error transcribing audio:", error);
      return "";
    }
  };
  

  // Uses GPT to analyze the transcriptions against expected sentences and return a severity tier
  const analyzePhonologicalDisorder = async (transcriptions: string[]) => {
    try {
      let prompt = "You are a speech therapy assistant. Analyze the following sentences for phonological errors. The expected sentences and the user's recordings are as follows:";
      for (let i = 0; i < TEST_SENTENCES.length; i++) {
        prompt += `\n\nSentence ${i + 1}:\nExpected: ${TEST_SENTENCES[i]}\nUser: ${transcriptions[i] || "No transcription available"}`;
      }
      prompt += "\n\nBased on the differences, determine if the user has a phonological speech disorder and classify the severity into tiers:\n" +
                "Tier 1: Mild\nTier 2: Moderate\nTier 3: Severe\n\n" +
                "Return the result in JSON format like: {\"severityTier\": 1, \"analysis\": \"...\"}";

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${YOUR_OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: "You are a helpful speech therapy assistant." },
            { role: "user", content: prompt }
          ],
          temperature: 0,
        })
      });
      const data = await response.json();
      const gptMessage = data.choices[0].message.content;
      let result;
      try {
        result = JSON.parse(gptMessage);
      } catch (e) {
        // Fallback in case GPT does not return valid JSON
        result = { severityTier: 1, analysis: gptMessage };
      }
      return result;
    } catch (error) {
      console.error("Error analyzing phonological disorder:", error);
      return { severityTier: 1, analysis: "Analysis error." };
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.instruction}>Speak the sentence:</Text>
      <Text style={styles.sentence}>{TEST_SENTENCES[currentIndex]}</Text>
  
      <View style={styles.buttonRow}>
        <TouchableOpacity onPress={recording ? stopRecording : startRecording}>
          <Animated.View style={[styles.micButton, { transform: [{ scale: micAnimation }] }]}>
          <Ionicons name={recording ? "mic" : "mic-off"} size={50} color="#fff" />
          </Animated.View>
        </TouchableOpacity>
      </View>
  
      <TouchableOpacity
        style={styles.nextButton}
        onPress={() => {
          if (currentIndex < TEST_SENTENCES.length - 1) {
            setCurrentIndex(currentIndex + 1);
          } else {
            handleAnalysis();
          }
        }}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {currentIndex < TEST_SENTENCES.length - 1 ? "Next" : "Finish"}
        </Text>
      </TouchableOpacity>
  
      {loading && <Text style={styles.loadingText}>Analyzing...</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#FDF6F0", // soft, warm background
      paddingHorizontal: 25,
      paddingVertical: 30,
      justifyContent: "center",
      alignItems: "center",
    },
    instruction: {
      fontSize: 24,
      color: "#5A3E36",
      fontWeight: "600",
      textAlign: "center",
      marginBottom: 20,
    },
    sentence: {
      fontSize: 26,
      color: "#3A6351",
      fontWeight: "bold",
      textAlign: "center",
      marginBottom: 40,
      lineHeight: 32,
    },
    buttonRow: {
      flexDirection: "row",
      justifyContent: "center",
      marginBottom: 30,
    },
    micButton: {
      backgroundColor: "#FF8A80", // playful red
      padding: 20,
      borderRadius: 50,
      elevation: 3,
    },
    nextButton: {
      backgroundColor: "#81C784", // gentle green
      paddingVertical: 15,
      paddingHorizontal: 30,
      borderRadius: 30,
      alignSelf: "center",
      marginTop: 20,
      elevation: 2,
    },
    buttonText: {
      color: "#fff",
      fontSize: 18,
      fontWeight: "700",
      textAlign: "center",
    },
    loadingText: {
      marginTop: 20,
      fontSize: 20,
      color: "#3A6351",
    },
  });

export default InitialDiagnosisScreen;
