import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { getAuth } from 'firebase/auth';

const categories = [
  { id: 1, title: 'Phonological Process', image: require('../assets/phonological.png'), route: 'InitialDiagnosis' },
  { id: 2, title: 'Stuttering Therapy', image: require('../assets/stuttering.png'), route: 'StutteringTherapy' },
  { id: 3, title: 'Apraxia Of Speech', image: require('../assets/apraxia.png'), route: 'ApraxiaSpeech' },
  { id: 4, title: 'Articulation', image: require('../assets/articulation.png'), route: 'Articulation' },
  { id: 5, title: 'Add Therapy', image: require('../assets/articulation.png'), route: 'addTherapy' }, // Add Therapy Card
];

const HomeScreen = ({ navigation }: any) => {
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (currentUser) {
      const email = currentUser.email || '';
      const nameFromEmail = email.split('@')[0]; // Get name before @
      setUserName(nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1)); // Capitalize
    }
  }, []);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image source={require('../assets/logo.png')} style={styles.logo} />
        <Text style={styles.title}>
          Welcome, <Text style={styles.highlight}>{userName || 'Guest'}</Text>
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Image source={require('../assets/icon.png')} style={styles.profileImage} />
        </TouchableOpacity>
      </View>

      {/* Category Grid */}
      <View style={styles.grid}>
        {categories.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.card}
            onPress={() => navigation.navigate(item.route)} // Navigate to respective route
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
    marginLeft: 10,
  },
  highlight: {
    color: '#4A90E2',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  grid: {
    marginTop: 30,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
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
  },
});

export default HomeScreen;
