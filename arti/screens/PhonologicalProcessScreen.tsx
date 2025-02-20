import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../database/firebaseConfig';
import { Ionicons } from '@expo/vector-icons';

const PhonologicalProcessScreen = ({ navigation }: any) => {
  const [processes, setProcesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProcesses = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'phonological_processes'));
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name,
          code: doc.data().code,
          category: doc.data().category
        }));
        setProcesses(data);
      } catch (error) {
        console.error("Error fetching data:", error);
        alert("Failed to fetch data. Check Firestore rules.");
      }
      setLoading(false);
    };

    fetchProcesses();
  }, []);

  const renderCard = ({ item }: any) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('ProcessDetail', { process: item })}
    >
      <View style={styles.icon}>
        <Text style={styles.iconText}>{item.code}</Text>
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardSubtitle}>{item.category}</Text>
      </View>
      <Ionicons name="chevron-forward" size={22} color="#888" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={28} color="black" />
      </TouchableOpacity>

      {/* Header */}
      <Text style={styles.title}>Phonological Processes</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#4A90E2" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={processes}
          keyExtractor={(item) => item.id}
          renderItem={renderCard}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
    paddingHorizontal: 20,
    paddingTop: 80,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 25,
    elevation: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 25,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 18,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  icon: {
    backgroundColor: '#4A90E2',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  iconText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  textContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#777',
    marginTop: 2,
  },
});

export default PhonologicalProcessScreen;
