import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";
import * as Animatable from "react-native-animatable";
import { Audio } from "expo-av";
import * as Speech from "expo-speech";
import RescueScene, {
  RescueTrigger,
} from "./SentenceSafariComponents/RescueScene";
import { savePerformanceRecord } from "../../services/practiceService";
import { PerformanceRecord } from "../../types/practice";
import { Timestamp } from "firebase/firestore";

interface AnalysisSummary {
  total_phonemes: number;
  substitutions: number;
  deletions: number;
  insertions: number;
  error_rate: number;
  has_disorder: boolean;
}
interface AnalysisResult {
  details: any[];
  summary: AnalysisSummary;
}

const sentences = [
  "The monkey swings from the tall tree.",
  "I see three colorful parrots.",
  "The elephant sprays water with its trunk.",
  "The tiger prowls quietly through the grass.",
  "A zebra runs swiftly across the plain.",
];
const guideImages = {
  neutral: require("../../assets/guide_neutral.png"),
  happy: require("../../assets/guide_happy.png"),
  encourage: require("../../assets/guide_try.png"),
};
const animalImages = [
  require("../../assets/monkey.png"),
  require("../../assets/monkey.png"),
  require("../../assets/monkey.png"),
  require("../../assets/monkey.png"),
  require("../../assets/monkey.png"),
];
const SERVER_URL = "https://phonerrapp.azurewebsites.net/analyze"; // <-- Update to your server URL
const TOTAL = sentences.length;

export default function SentenceSafariScreen({ navigation }: any) {
  const [index, setIndex] = useState(0);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [processing, setProcessing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [rescueTrigger, setRescueTrigger] = useState<RescueTrigger>("none");
  const [perfId, setPerfId] = useState<string | null>(null);

  const current = sentences[index];

  const goNext = () => {
    setAnalysis(null);
    if (index < TOTAL - 1) setIndex(index + 1);
    else navigation.navigate("TherapyCatalogue");
  };

  if (analysis && rescueTrigger === "correct") {
    return (
      <RescueScene
        trigger="correct"
        animalSource={animalImages[index]}
        onAnimationEnd={() => {
          setRescueTrigger("none");
          goNext();
        }}
      />
    );
  }

  const speakSentence = () => {
    Speech.stop();
    Speech.speak(current, { rate: 0.9, pitch: 1.1 });
  };

  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission not granted", "Allow audio recording");
        return;
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const { recording } = await Audio.Recording.createAsync(
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
      );
      setRecording(recording);
    } catch (e) {
      Alert.alert("Recording Error", "Failed to start recording.");
    }
  };

  const stopAndAnalyze = async () => {
    if (!recording) return;
    setProcessing(true);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI()!;
    setRecording(null);
    try {
      const form = new FormData();
      form.append("file", { uri, name: `utt.wav`, type: "audio/wav" } as any);
      form.append("transcript", current);
      const res = await fetch(SERVER_URL, { method: "POST", body: form });
      const json: AnalysisResult = await res.json();
      setAnalysis(json);
      setRescueTrigger(json.summary.has_disorder ? "incorrect" : "correct");

      const perf: Omit<PerformanceRecord, "id"> = {
        userId: "child123",
        activity: "SentenceSafari",
        timestamp: Timestamp.now(),
        summary: json.summary,
        details: json.details,
      };

      const newId = await savePerformanceRecord(perf);
      setPerfId(newId);
    } catch (e) {
      Alert.alert("Analysis Error", "Something went wrong. Try again.");
    } finally {
      setProcessing(false);
    }
  };

  const renderBubble = () => {
    if (!analysis || !analysis.summary.has_disorder) return null;
    return (
      <Animatable.View animation="bounceIn" style={styles.bubble}>
        <Text style={styles.bubbleText}>Oops! Let’s try that again.</Text>
      </Animatable.View>
    );
  };

  const progress = ((index + 1) / TOTAL) * 100;

  return (
    <ImageBackground
      source={require("../../assets/safari_bg.png")}
      style={styles.background}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Sentence Safari</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {index + 1} / {TOTAL}
        </Text>
      </View>
      <View style={styles.scene}>
        <Image
          source={
            analysis
              ? analysis.summary.has_disorder
                ? guideImages.encourage
                : guideImages.happy
              : guideImages.neutral
          }
          style={styles.guide}
        />
        {renderBubble()}
      </View>
      <View style={styles.card}>
        <Text style={styles.sentence}>{current}</Text>
      </View>
      <View style={styles.controls}>
        <TouchableOpacity
          onPress={speakSentence}
          style={styles.iconButton}
          disabled={processing || !!analysis}
        >
          <Image
            source={require("../../assets/listen_icon.png")}
            style={styles.icon}
          />
        </TouchableOpacity>
        {processing && (
          <ActivityIndicator color="#333" style={{ marginHorizontal: 12 }} />
        )}
        {!recording ? (
          <TouchableOpacity
            onPress={startRecording}
            style={styles.iconButton}
            disabled={processing || !!analysis}
          >
            <Image
              source={require("../../assets/record_icon.png")}
              style={styles.icon}
            />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={stopAndAnalyze} style={styles.iconButton}>
            <Image
              source={require("../../assets/stop_icon.png")}
              style={styles.icon}
            />
          </TouchableOpacity>
        )}
        {analysis && perfId && (
          <TouchableOpacity
            style={styles.detailBtn}
            onPress={() => navigation.navigate("PerformanceDetail", { perfId })}
          >
            <Text style={styles.detailBtnText}>View Details</Text>
          </TouchableOpacity>
        )}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, padding: 20, backgroundColor: "#E8F5E9" },
  header: { marginTop: 40, marginBottom: 16, alignItems: "center" },
  title: { fontSize: 26, fontWeight: "bold", color: "#2E7D32" },
  progressBar: {
    height: 8,
    width: "100%",
    backgroundColor: "#C8E6C9",
    borderRadius: 4,
    overflow: "hidden",
    marginTop: 8,
  },
  progressFill: { height: "100%", backgroundColor: "#66BB6A" },
  progressText: { marginTop: 4, fontSize: 14, color: "#555" },
  scene: { flex: 1, justifyContent: "center", alignItems: "center" },
  guide: { width: 180, height: 240, resizeMode: "contain" },
  bubble: {
    position: "absolute",
    top: 60,
    backgroundColor: "#FFF",
    padding: 14,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#4CAF50",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    maxWidth: "80%",
  },
  bubbleText: { color: "#333", fontSize: 16, textAlign: "center" },
  card: {
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  sentence: { fontSize: 22, color: "#2E7D32", textAlign: "center" },
  controls: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
    marginBottom: 40,
  },
  iconButton: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 50,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    marginHorizontal: 12,
  },
  icon: { width: 32, height: 32, tintColor: "#2E7D32" },
  detailBtn: {
    backgroundColor: "#FFA500",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    alignSelf: "center",
    marginTop: 16,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 4,
  },
  detailBtnText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
