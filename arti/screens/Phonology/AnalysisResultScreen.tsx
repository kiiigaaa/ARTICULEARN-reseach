// screens/AnalysisResultScreen.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const AnalysisResultScreen = ({ route, navigation }: any) => {
  const { result } = route.params;

  // Define a function that navigates to the appropriate therapy tier based on result.severityTier
  const proceedToTherapy = () => {
    if (result.severityTier === 1) {
      navigation.navigate("phono", { tier: 'tier_1' });
    } else if (result.severityTier === 2) {
      navigation.navigate("phono", { tier: 'tier_2' });
    } else if (result.severityTier === 3) {
      navigation.navigate("phono", { tier: 'tier_3' });
    } else {
      navigation.goBack();
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Ionicons name="checkmark-circle-outline" size={80} color="#F9A825" />
        <Text style={styles.headerTitle}>Great Job!</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons name="account-voice" size={40} color="#FFFFFF" />
          <Text style={styles.cardTitle}>Your Speech Analysis</Text>
        </View>

        <Text style={styles.cardText}>
          We have analyzed your recordings and have some recommendations for you.
        </Text>
        <View style={styles.recommendationSection}>
          <Text style={styles.recommendationLabel}>Recommended Therapy Tier:</Text>
          <Text style={styles.recommendationValue}>Tier {result.severityTier}</Text>
        </View>
        <Text style={styles.analysisTitle}>Our Findings:</Text>
        <Text style={styles.analysisText}>{result.analysis}</Text>
      </View>

      <TouchableOpacity style={styles.proceedButton} onPress={proceedToTherapy}>
        <Text style={styles.proceedButtonText}>Let's Begin Your Therapy!</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flexGrow: 1,
    backgroundColor: "#FFF7E6", // soft pastel background
    padding: 20, 
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#5D4037",
    marginTop: 10,
  },
  card: {
    backgroundColor: "#FFCC80", // playful warm color
    borderRadius: 20,
    padding: 20,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    marginBottom: 30,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 10,
  },
  cardText: {
    fontSize: 18,
    color: "#5D4037",
    marginBottom: 15,
  },
  recommendationSection: {
    backgroundColor: "#FFF3E0",
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
    marginBottom: 15,
  },
  recommendationLabel: {
    fontSize: 18,
    color: "#BF360C",
    fontWeight: "600",
  },
  recommendationValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#D84315",
    marginTop: 5,
  },
  analysisTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#5D4037",
    marginBottom: 5,
  },
  analysisText: {
    fontSize: 18,
    color: "#4E342E",
    textAlign: "center",
    lineHeight: 26,
  },
  proceedButton: {
    backgroundColor: "#81C784", // gentle green
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    elevation: 3,
  },
  proceedButtonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default AnalysisResultScreen;
