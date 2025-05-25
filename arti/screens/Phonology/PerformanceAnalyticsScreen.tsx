// src/screens/PerformanceDetailScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../database/firebaseConfig';
import type { PerformanceRecord } from '../../types/practice';
import { useNavigation } from '@react-navigation/native';

interface ActivityStats {
  activity: string;
  count: number;
  avgErrorRate: number;
}

export default function PerformanceAnalyticsScreen() {
  const navigation = useNavigation();
  const [stats, setStats] = useState<ActivityStats[]>([]);
  const [groups, setGroups] = useState<Record<string, PerformanceRecord[]>>({});
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDocs(collection(db, 'activity_performance'));
        const recs = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as PerformanceRecord[];
        const grp: Record<string, PerformanceRecord[]> = {};
        recs.forEach(r => {
          const act = r.activity || 'Unknown';
          if (!grp[act]) grp[act] = [];
          grp[act].push(r);
        });
        setGroups(grp);
        const arr: ActivityStats[] = Object.entries(grp).map(([activity, records]) => {
          const count = records.length;
          const totalError = records.reduce((sum, r) => sum + r.summary.error_rate, 0);
          return { activity, count, avgErrorRate: totalError / count };
        });
        setStats(arr);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const toggleExpand = (activity: string) => {
    setExpanded(expanded === activity ? null : activity);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Performance Analytics</Text>
      <FlatList
        data={stats}
        keyExtractor={item => item.activity}
        ListHeaderComponent={() => (
          <View style={styles.rowHeader}>
            <Text style={styles.headerText}>Activity</Text>
            <Text style={styles.headerText}>Sessions</Text>
            <Text style={styles.headerText}>Avg Err</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <View>
            <TouchableOpacity onPress={() => toggleExpand(item.activity)}>
              <View style={styles.row}>
                <Text style={styles.rowText}>{item.activity}</Text>
                <Text style={styles.rowText}>{item.count}</Text>
                <Text style={styles.rowText}>{(item.avgErrorRate * 100).toFixed(1)}%</Text>
              </View>
            </TouchableOpacity>
            {expanded === item.activity && (
              <View style={styles.detailContainer}>
                {groups[item.activity].map(rec => (
                  <View key={rec.id} style={styles.detailRow}>
                    <Text style={styles.detailText}>{new Date(rec.timestamp.seconds * 1000).toLocaleDateString()}</Text>
                    <Text style={styles.detailText}>{(rec.summary.error_rate * 100).toFixed(1)}%</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Performance', { perfId: rec.id })}>
                      <Text style={styles.detailLink}>View</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
        ListEmptyComponent={() => <Text style={styles.infoText}>No data yet.</Text>}
      />
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
    marginBottom: 12,
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 8,
    backgroundColor: '#FFE4B5',
    borderRadius: 8,
    marginBottom: 8,
  },
  headerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#BF360C',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#FFF',
    marginBottom: 4,
    borderRadius: 8,
  },
  rowText: {
    fontSize: 16,
    color: '#333',
  },
  detailContainer: {
    paddingLeft: 16,
    paddingBottom: 8,
    marginBottom: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#555',
  },
  detailLink: {
    fontSize: 14,
    color: '#3386F2',
    textDecorationLine: 'underline',
  },
  infoText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
  },
});({
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
