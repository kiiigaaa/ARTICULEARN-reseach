import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';

const ProcessDetailScreen = ({ route, navigation }: any) => {
  const { process } = route.params;

  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [audioURI, setAudioURI] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [chatGPTSuggestions, setChatGPTSuggestions] = useState<string | null>(null);
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(0);
  const [wordList, setWordList] = useState<any[]>([]);
  const [nextButtonEnabled, setNextButtonEnabled] = useState<boolean>(false);

  useEffect(() => {
    if (process && process.words && Array.isArray(process.words)) {
      setWordList(process.words);
    } else {
      Alert.alert("Error", "No words available for this process.");
    }
  }, [process]);

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

  const stopRecording = async () => {
    if (!recording) return;
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setAudioURI(uri);
      setRecording(null);
    } catch (err) {
      console.error("Failed to stop recording", err);
    }
  };

  const handleAnalysis = async () => {
    if (!audioURI) return;
    setLoading(true);
    try {
      const expectedWord = wordList[currentWordIndex]?.word;
      if (!expectedWord) {
        setFeedback("No word available to analyze.");
        setLoading(false);
        return;
      }

      const transcription = await transcribeAudioWithWhisper(audioURI);
      const feedbackFromModel = await getModelFeedback(audioURI, expectedWord);

      // Combine both transcription and model feedback
      const transcriptionIsCorrect = transcription.toLowerCase().includes(expectedWord.toLowerCase());
      const modelFeedbackIsCorrect = feedbackFromModel?.["Overall Classification"]?.includes("Correct pronunciation");

      if (transcriptionIsCorrect && modelFeedbackIsCorrect) {
        setFeedback("Well done! Your pronunciation is perfect.");
        setNextButtonEnabled(true);
      } else {
        let formattedFeedback = "";
        if (!transcriptionIsCorrect) {
          formattedFeedback += `The transcription didn’t match the expected word.\n`;
        }
        if (feedbackFromModel?.Omission) {
          formattedFeedback += `Omission: The word might be missing some sounds.\n`;
        }
        if (feedbackFromModel?.Substitution) {
          formattedFeedback += `Substitution: You might have used the wrong sound for part of the word.\n`;
        }
        if (feedbackFromModel?.VowelChange) {
          formattedFeedback += `Vowel Change: Make sure the vowels are correct.\n`;
        }

        setFeedback(formattedFeedback);

        const chatGPTResponse = await getChatGPTSuggestions(transcription, expectedWord, formattedFeedback);
        setChatGPTSuggestions(chatGPTResponse.analysis);
        setNextButtonEnabled(false);
      }
    } catch (error) {
      console.error("Error analyzing pronunciation:", error);
      setFeedback("Something went wrong while analyzing your pronunciation.");
    }
    setLoading(false);
  };

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
          "Authorization": `Bearer YOUR_OPENAI_API_KEY`,
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

      const data = await response.json();

      if (data.feedback) {
        const feedback = data.feedback;

        let formattedFeedback = {};
        if (feedback.Omission) {
          formattedFeedback.Omission = feedback.Omission;
        }
        if (feedback.Substitution) {
          formattedFeedback.Substitution = feedback.Substitution;
        }
        if (feedback.VowelChange) {
          formattedFeedback.VowelChange = feedback.VowelChange;
        }
        if (feedback['Overall Classification']) {
          formattedFeedback['Overall Classification'] = feedback['Overall Classification'];
        }

        return formattedFeedback;
      }

      throw new Error("No feedback received from model.");
    } catch (error) {
      console.error("Error getting feedback from model:", error);
      return "Error in feedback";
    }
  };

  const getChatGPTSuggestions = async (transcription: string, expectedWord: string, modelFeedback: string) => {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `API_KEY`,
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: "You are a friendly and supportive speech therapist."
            },
            {
              role: "user",
              content: `Here's a transcription: "${transcription}". The expected word is "${expectedWord}". Model feedback: "${modelFeedback}". Can you help me with improving the pronunciation or confirm if it’s correct? Please provide a simple tip for how to say the word better. also it only should be a simple analysiz result and a simple one prase tip.`
            }
          ],
          temperature: 0.7,
          max_tokens: 150,
        }),
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      const analysis = data.choices[0].message.content.trim();
      const [finalAnalysis, tip] = analysis.split("\n"); // Split into analysis and tip (assuming they're separated by a newline)
      return { finalAnalysis, tip };

    } catch (error) {
      console.error("Error analyzing with ChatGPT:", error);
      return { analysis: "Something went wrong while analyzing the pronunciation." };
    }
  };

  const nextWord = () => {
    if (currentWordIndex < wordList.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
      setFeedback(null);
      setAudioURI(null);
    } else {
      navigation.navigate("NextScreen");
    }
  };

  const currentWord = wordList[currentWordIndex];

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        {currentWord && (
          <>
            <Text style={styles.title}>{process.name} - {process.code}</Text>
            <Image source={{ uri: currentWord.image }} style={styles.image} />
            <Text style={styles.word}>{currentWord.word}</Text>
          </>
        )}

        <View style={styles.buttonRow}>
          {!recording ? (
            <TouchableOpacity style={styles.recordButton} onPress={startRecording}>
              <Ionicons name="mic" size={40} color="white" />
              <Text style={styles.buttonText}>Start Recording</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.stopButton} onPress={stopRecording}>
              <Ionicons name="stop-circle" size={40} color="white" />
              <Text style={styles.buttonText}>Stop Recording</Text>
            </TouchableOpacity>
          )}
        </View>

        {audioURI && !loading && (
          <TouchableOpacity style={styles.analyzeButton} onPress={handleAnalysis}>
            <Text style={styles.buttonText}>Analyze</Text>
          </TouchableOpacity>
        )}

        {loading && <ActivityIndicator size="large" color="#FF7043" style={styles.loadingIndicator} />}

        {feedback && (
          <Animatable.View animation="fadeInUp" style={styles.resultContainer}>
            <Text style={styles.resultText}>{feedback}</Text>
          </Animatable.View>
        )}

        {chatGPTSuggestions && (
          <Animatable.View animation="fadeInUp" style={styles.chatGPTContainer}>
            <Text style={styles.chatGPTAnalysis}>{chatGPTSuggestions.finalAnalysis}</Text>
            <Text style={styles.chatGPTTip}>{chatGPTSuggestions.tip}</Text>
          </Animatable.View>
        )}

        {feedback && (
          <TouchableOpacity
            style={[styles.nextButton, { opacity: nextButtonEnabled ? 1 : 0.5 }]}
            onPress={nextWord}
            disabled={!nextButtonEnabled}>
            <Text style={styles.buttonText}>
              {currentWordIndex < wordList.length - 1 ? "Next Word" : "Finish"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF8F0",  // Off-white background
    padding: 20,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#3386F2",  // Blue
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
    color: "#3386F2",  // Blue
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  recordButton: {
    backgroundColor: "#3386F2",  // Blue
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginRight: 10,
    alignItems: "center",
  },
  stopButton: {
    backgroundColor: "#F44336",  // Red
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginLeft: 10,
    alignItems: "center",
  },
  analyzeButton: {
    backgroundColor: "#4CAF50",  // Green
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
    backgroundColor: "#FFF3E0",  // Light yellow
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  resultText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FF5722",  // Orange
  },
  nextButton: {
    backgroundColor: "#81C784",  // Light Green
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 20,
    alignItems: "center",
  },
  chatGPTContainer: {
    marginTop: 30,
    padding: 20,
    backgroundColor: "#D1E8E2",  // Light teal
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  chatGPTAnalysis: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#3386F2",  // Blue
  },
  chatGPTTip: {
    fontSize: 16,
    fontWeight: "normal",
    color: "#FF5722",  // Orange
    marginTop: 10,
  },
});

export default ProcessDetailScreen;
