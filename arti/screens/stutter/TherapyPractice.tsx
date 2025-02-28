import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

const therapySteps = [
  { id: 1, title: 'Introduction', icon: 'video' },
  { id: 2, title: 'Flexible Rate Introduction', icon: 'play-circle' },
  { id: 3, title: 'Syllable Counting Practice', icon: 'comments' },
  { id: 4, title: 'Flexible Rate Technique', icon: 'video' },
  { id: 5, title: 'Flexible Rate Practice', icon: 'comments' },
];

const TherapyPracticeScreen = ({ navigation }: any) => {
  const [selectedId, setSelectedId] = useState<number | null>(null); // Track only one selected item

  const handleSelection = (id: number) => {
    setSelectedId(id);
     // Set the selected id, replacing the previous selection
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image source={require('../../assets/logo.png')} style={styles.logo} />
        <Text style={styles.title}>Stutter Therapy</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Image source={require('../../assets/icon.png')} style={styles.profileImage} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.listContainer}>
        {therapySteps.map((step) => (
          <TouchableOpacity
            key={step.id}
            style={[styles.listItem, selectedId === step.id && styles.selectedItem]}
            onPress={() => handleSelection(step.id)} // Select a single item
          >
            <FontAwesome5 name={step.icon} size={18} color="#4A90E2" />
            <Text style={styles.listText}>{step.title}</Text>
            {selectedId === step.id && (
              <View style={styles.checkCircle}>
                <FontAwesome5 name={step.icon} size={18} color="#fff" />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      <TouchableOpacity style={styles.startButton} onPress={() => navigation.navigate('VoiceAnalysisScreen')}>
        <Text style={styles.startButtonText}>Start Practice</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 50,
  },
  logo: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  listContainer: {
    flexGrow: 1,
    marginTop: 40,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    padding: 15,
    borderRadius: 20,
    margin: 5,
    marginBottom: 15,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  listText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '600',
    color: '#4A4A4A',
  },
  selectedItem: {
    backgroundColor: '#E8E8E8',
  },
  checkCircle: {
    backgroundColor: '#4A90E2', // Circle color
    borderRadius: 50,
    padding: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#4A90E2',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    margin: 50,
    marginBottom: 70,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 7,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default TherapyPracticeScreen;
