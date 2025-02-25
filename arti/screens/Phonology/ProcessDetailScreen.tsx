import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ActivityIndicator, Alert } from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';

const ProcessDetailScreen = ({ route, navigation }: any) => {
  const { process } = route.params; // Receive the process details (e.g., Backing, Fronting)

  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [audioURI, setAudioURI] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(0); // To track the current word
  const [wordList, setWordList] = useState<any[]>([]); // List of therapy words and images

  // UseEffect to update wordList based on the passed process data
  useEffect(() => {
    if (process && process.words && Array.isArray(process.words)) {
      console.log("Words available for this process:", process.words);
      setWordList(process.words); // Set the words from the process
    } else {
      console.log("No words available for this process:", process);
      Alert.alert("Error", "No words available for this process.");
    }
  }, [process]);

  // Start recording function
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

  // Stop recording and save the URI
  const stopRecording = async () => {
    if (!recording) return;
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      console.log("Recording stopped and stored at", uri);
      setAudioURI(uri);
      setRecording(null);
    } catch (err) {
      console.error("Failed to stop recording", err);
    }
  };

  // Analyze the pronunciation and send both transcription and feedback to ChatGPT API
  const handleAnalysis = async () => {
    if (!audioURI) return;
    setLoading(true);
    try {
      // Get the expected word from the wordList
      const expectedWord = wordList[currentWordIndex]?.word;
      if (!expectedWord) {
        setFeedback("No word available to analyze.");
        setLoading(false);
        return;
      }

      // Step 1: Transcribe the audio using Whisper API
      const transcription = await transcribeAudioWithWhisper(audioURI); // Send audio for transcription

      // Step 2: Get feedback from the model's backend API
      const feedbackFromModel = await getModelFeedback(audioURI, expectedWord);

      // Step 3: Send both transcription and feedback to the ChatGPT API for suggestions
      const responseFromChatGPT = await getChatGPTSuggestions(transcription, expectedWord, feedbackFromModel);

      setFeedback(responseFromChatGPT.analysis); // Display feedback from ChatGPT

    } catch (error) {
      console.error("Error analyzing pronunciation:", error);
      setFeedback("An error occurred while analyzing the pronunciation.");
    }
    setLoading(false);
  };

  // Send audio to Whisper API for transcription (Step 1)
  const transcribeAudioWithWhisper = async (audioURI: string): Promise<string> => {
    try {
      let formData = new FormData();
      formData.append('file', {
        uri: audioURI,
        name: 'audio.m4a',
        type: 'audio/m4a',
      });
      formData.append('model', 'whisper-1');

      const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer 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`, // Replace this with your actual API key
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      return data.text || "";
    } catch (error) {
      console.error("Error transcribing audio:", error);
      return "";
    }
  };

  // Send data to the backend to get model feedback (Step 2)
  const getModelFeedback = async (audioURI: string, word: string) => {
    try {
      let formData = new FormData();
      formData.append('audio', {
        uri: audioURI,
        name: 'audio.m4a',
        type: 'audio/m4a',
      });
      formData.append('word', word);

      const response = await fetch("http://172.20.10.4:5000/upload", {
        method: 'POST',
        body: formData,
      });
      console.log("response:",response);
      const data = await response.json();
      console.log("model:",data);
      if (data.error) {
        throw new Error(data.error);
      }
      return data.feedback || "";
    } catch (error) {
      console.error("Error getting feedback from model:", error);
      return "Error in feedback";
    }
  };

  // Get suggestions from ChatGPT API (Step 3)
  const getChatGPTSuggestions = async (transcription: string, expectedWord: string, modelFeedback: string) => {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer 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`, // Replace this with your actual API key
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: "You are a helpful speech therapy assistant."
            },
            {
              role: "user",
              content: `Analyze the following transcription for the word "${expectedWord}". Transcription: "${transcription}". Feedback from the model: "${modelFeedback}". Provide suggestions or confirm if the pronunciation is correct.`
            }
          ],
          temperature: 0.5,
          max_tokens: 200,
        }),
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      const analysis = data.choices[0].message.content.trim();
      return { analysis };

    } catch (error) {
      console.error("Error analyzing with ChatGPT:", error);
      return { analysis: "Error during analysis." };
    }
  };

  // Move to next word in the list
  const nextWord = () => {
    if (currentWordIndex < wordList.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
      setFeedback(null); // Reset feedback for next word
      setAudioURI(null); // Reset audio URI for next recording
    } else {
      // All words analyzed, navigate to the next screen or complete the task
      navigation.navigate("NextScreen");
    }
  };

  // Safety check to ensure data is present before rendering
  const currentWord = wordList[currentWordIndex];

  return (
    <View style={styles.container}>
      {/* Process Name and Word Details */}
      {currentWord && (
        <>
          <Text style={styles.title}>{process.name} - {process.code}</Text>
          <Image source={{ uri: currentWord.image }} style={styles.image} />
          <Text style={styles.word}>{currentWord.word}</Text>
        </>
      )}

      {/* Record/Stop Buttons */}
      <View style={styles.buttonRow}>
        {!recording ? (
          <TouchableOpacity style={styles.recordButton} onPress={startRecording}>
            <Ionicons name="mic" size={40} color="white" />
            <Text style={styles.buttonText}>Start</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.stopButton} onPress={stopRecording}>
            <Ionicons name="stop-circle" size={40} color="white" />
            <Text style={styles.buttonText}>Stop</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Analyze Button */}
      {audioURI && !loading && (
        <TouchableOpacity style={styles.analyzeButton} onPress={handleAnalysis}>
          <Text style={styles.buttonText}>Analyze</Text>
        </TouchableOpacity>
      )}

      {/* Loading State */}
      {loading && <ActivityIndicator size="large" color="#4A90E2" style={styles.loadingIndicator} />}

      {/* Feedback */}
      {feedback && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultText}>{feedback}</Text>
        </View>
      )}

      {/* Next Button */}
      {feedback && (
        <TouchableOpacity style={styles.nextButton} onPress={nextWord}>
          <Text style={styles.buttonText}>{currentWordIndex < wordList.length - 1 ? "Next" : "Finish"}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF7E6",
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#5D4037",
    marginBottom: 20,
  },
  image: {
    width: 150,
    height: 150,
    marginBottom: 20,
    borderRadius: 10,
  },
  word: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#5D4037",
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  recordButton: {
    backgroundColor: "#FF7043",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginRight: 10,
    alignItems: "center",
  },
  stopButton: {
    backgroundColor: "#F44336",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginLeft: 10,
    alignItems: "center",
  },
  analyzeButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 20,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  loadingIndicator: {
    marginTop: 20,
  },
  resultContainer: {
    marginTop: 30,
    padding: 20,
    backgroundColor: "#FFEB3B",
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  resultText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#5D4037",
  },
  nextButton: {
    backgroundColor: "#81C784",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 20,
    alignItems: "center",
  },
});

export default ProcessDetailScreen;
