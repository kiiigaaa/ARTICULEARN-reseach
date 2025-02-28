import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

const therapyOptions = [
  { id: 1, title: 'Training Plan', image: require('../../assets/articulation.png'), route: 'FluencyTechniques' },
  { id: 2, title: 'Useful Therapy', image: require('../../assets/articulation.png'), route: 'BreathingExercises' },
  { id: 3, title: 'Therapy Practice', image: require('../../assets/articulation.png'), route: 'TherapyPractice' },
  { id: 4, title: 'Statics and Progress', image: require('../../assets/articulation.png'), route: 'SupportGroups' },
];

const StutteringTherapy = ({ navigation }: any) => {
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

      {/* Therapy Options Grid */}
      <View style={styles.grid}>
        {therapyOptions.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.card}
            onPress={() => navigation.navigate(item.route)}
          >
            <Image source={item.image} style={styles.cardImage} />
            <Text style={styles.cardText}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#4A90E2', // Blue background color
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  logo: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff', // White text color
    flex: 1,
    textAlign: 'center',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fff', // White border for the profile image
  },
  grid: {
    marginTop: 30,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  card: {
    width: '45%',
    height: 120,
    backgroundColor: '#fff',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  cardImage: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  cardText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A4A4A',
  },
});

export default StutteringTherapy;