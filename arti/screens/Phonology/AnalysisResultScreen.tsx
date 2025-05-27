// screens/AnalysisResultScreen.tsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ScrollView,
  Dimensions
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const TIER_LABELS: Record<string,string> = {
  tier_1: 'Mild',
  tier_2: 'Moderate',
  tier_3: 'Severe',
};

const TIER_COLORS: Record<string,string> = {
  tier_1: '#81C784',
  tier_2: '#FFB74D',
  tier_3: '#E57373',
};

export default function AnalysisResultScreen({ route, navigation }: any) {
  const { results, severityTier } = route.params as {
    results: { sentence: string; summary: any }[];
    severityTier: string;
  };

  const sessions = results.length;
  const avgError =
    results.reduce((sum, r) => sum + (r.summary.substitutions + r.summary.deletions) / r.summary.total_phonemes, 0) /
    sessions;

  const tierLabel = TIER_LABELS[severityTier] || 'Unknown';
  const tierColor = TIER_COLORS[severityTier] || '#AAA';

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <MaterialIcons name="assignment-turned-in" size={48} color="#5D4037" />
        <Text style={styles.title}>Diagnosis Summary</Text>
      </View>

      {/* Summary Card */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Sessions</Text>
          <Text style={styles.summaryValue}>{sessions}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Avg. Error Rate</Text>
          <Text style={styles.summaryValue}>{(avgError * 100).toFixed(1)}%</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Therapy Tier</Text>
          <View style={[styles.tierBadge, { backgroundColor: tierColor }]}>
            <Text style={styles.tierText}>{tierLabel}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Per-Sentence Errors</Text>

      <FlatList
        data={results}
        keyExtractor={(_, i) => i.toString()}
        scrollEnabled={false}
        renderItem={({ item, index }) => {
          const errs = item.summary.substitutions + item.summary.deletions;
          const total = item.summary.total_phonemes;
          const er = total ? errs / total : 0;
          const passed = er < 0.2;
          return (
            <View style={[styles.row, index % 2 === 0 && styles.rowAlt]}>
              <Text style={styles.sent}>{item.sentence}</Text>
              <View style={styles.statusBox}>
                <Ionicons
                  name={passed ? 'check-circle' : 'warning'}
                  size={20}
                  color={passed ? '#4CAF50' : '#E53935'}
                />
                <Text style={styles.errText}>
                  {errs}/{total}
                </Text>
                <Text style={styles.errSub}> ({(er * 100).toFixed(0)}%)</Text>
              </View>
            </View>
          );
        }}
      />

      <TouchableOpacity
        style={styles.btn}
        onPress={() => navigation.navigate('TherapyCatalogue', { tier: severityTier })}
      >
        <Text style={styles.btnTxt}>Start Therapy</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#FFF8F0',
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#5D4037',
    marginTop: 8,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    width: width - 40,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#555',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  tierBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tierText: {
    color: '#FFF',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#3A6351',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#FFF',
  },
  rowAlt: {
    backgroundColor: '#FEF9E7',
  },
  sent: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginRight: 10,
  },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  errText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D84315',
    marginLeft: 4,
  },
  errSub: {
    fontSize: 14,
    color: '#555',
    marginLeft: 4,
  },
  btn: {
    marginTop: 30,
    backgroundColor: '#81C784',
    padding: 15,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  btnTxt: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
