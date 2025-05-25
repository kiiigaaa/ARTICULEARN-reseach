// src/screens/PerformanceDetailScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity
} from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../database/firebaseConfig';
import type { PerformanceRecord } from '../../types/practice';

export default function PerformanceDetailScreen({ route, navigation }: any) {
  const { perfId } = route.params;
  const [record, setRecord] = useState<PerformanceRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        // Fetch single record from unified activity_performance collection
        const ref = doc(db, 'activity_performance', perfId);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setRecord({ id: snap.id, ...(snap.data() as any) });
        } else {
          Alert.alert('Not found', 'Performance record not found.');
          navigation.goBack();
        }
      } catch (err) {
        console.error(err);
        Alert.alert('Error', 'Failed to load performance.');
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    })();
  }, [perfId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!record) return null;

  const { summary, details, activity, timestamp } = record;

  // Header for FlatList
  const ListHeader = () => (
    <View>
      <Text style={styles.title}>{activity} Session</Text>
      <Text style={styles.dateText}>{new Date(timestamp.seconds * 1000).toLocaleString()}</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Summary</Text>
        <Text>Total Phonemes: {summary.total_phonemes}</Text>
        <Text>Substitutions: {summary.substitutions}</Text>
        <Text>Deletions: {summary.deletions}</Text>
        <Text>Error Rate: {(summary.error_rate * 100).toFixed(1)}%</Text>
        <Text>Disorder Detected: {summary.has_disorder ? 'Yes' : 'No'}</Text>
      </View>
      <Text style={styles.title}>Details</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={details}
        keyExtractor={(_, idx) => idx.toString()}
        ListHeaderComponent={ListHeader}
        renderItem={({ item }) => (
          <View style={[styles.detailRow, styles[`op_${item.op}`]]}>
            <Text style={styles.opText}>[{item.op}]</Text>
            <Text>Ref: {item.ref || '-'} | Hyp: {item.hyp || '-'}</Text>
            {item.start != null && (
              <Text style={styles.time}>{item.start.toFixed(2)}s - {item.end.toFixed(2)}s</Text>
            )}
          </View>
        )}
      />
      <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.closeText}>Close</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#5D4037',
    marginVertical: 12,
  },
  dateText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFE4B5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#BF360C',
    marginBottom: 8,
  },
  detailRow: {
    padding: 12,
    backgroundColor: '#FFF',
    marginBottom: 8,
    borderLeftWidth: 4,
    borderRadius: 8,
  },
  opText: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  op_correct: {
    borderLeftColor: '#28A745',
  },
  op_substitution: {
    borderLeftColor: '#D9534F',
  },
  op_deletion: {
    borderLeftColor: '#F0AD4E',
  },
  time: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  closeBtn: {
    backgroundColor: '#81C784',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 24,
    alignSelf: 'center',
    marginTop: 16,
  },
  closeText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
