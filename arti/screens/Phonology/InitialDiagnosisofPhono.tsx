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

// Fake API Key (just for demonstration purposes)
const YOUR_OPENAI_API_KEY = "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";

const InitialDiagnosisScreen = ({ navigation }: any) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [audioURIs, setAudioURIs] = useState<(string | null)[]>([null, null, null, null, null]);
  const [loading, setLoading] = useState(false);
  const [storedTier, setStoredTier] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [tip, setTip] = useState<string | null>(null);

  const micAnimation = useRef(new Animated.Value(1)).current;

  // Check for stored severity tier
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

  // Handle sending the analysis data to "ChatGPT" (fake simulation)
  const handleAnalysis = async () => {
    setLoading(true);
    try {
      const transcriptions = [];
      for (let i = 0; i < audioURIs.length; i++) {
        const uri = audioURIs[i];
        if (!uri) {
          transcriptions.push("No recording available");
          continue;
        }
        const transcription = await transcribeAudio(uri);
        transcriptions.push(transcription);
      }

      // Simulate phonological analysis
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

      // Fake ChatGPT response (send analyzed data and receive an analysis + tip)
      const chatGptResponse = {
        analysis: "Your phonological errors are being analyzed. Here is your detailed feedback.",
        tip: "Try focusing on clear articulation for the vowels."
      };

      // Set the results
      setAnalysisResult(chatGptResponse.analysis);
      setTip(chatGptResponse.tip);

      await AsyncStorage.setItem('severityTier', analysisResults[0].severity); // Save severity tier
      console.log("Analysis result:", analysisResults);
      navigation.navigate("AnalysisResult", { result: analysisResults });
    } catch (error) {
      console.error("Analysis error:", error);
      Alert.alert("Analysis Error", "An error occurred during analysis.");
    }
    setLoading(false);
  };

  // Calls OpenAI Whisper API to transcribe a given audio file
  const transcribeAudio = async (audioURI: string): Promise<string> => {
    try {
      let formData = new FormData();
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

      {analysisResult && (
        <View style={styles.analysisContainer}>
          <Text style={styles.analysisText}>{analysisResult}</Text>
          <Text style={styles.tipText}>{tip}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDF6F0",
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
    backgroundColor: "#FF8A80",
    padding: 20,
    borderRadius: 50,
    elevation: 3,
  },
  nextButton: {
    backgroundColor: "#81C784",
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
  analysisContainer: {
    marginTop: 30,
    padding: 20,
    backgroundColor: "#FFF3E0",
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  analysisText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FF5722",
  },
  tipText: {
    fontSize: 16,
    color: "#4CAF50",
    marginTop: 10,
  },
});

export default InitialDiagnosisScreen;
