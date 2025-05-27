// screens/HomeScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Dimensions,
} from 'react-native';
import { getAuth } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const categories = [
  { id: 1, title: 'Phonological Process', image: require('../assets/phonological.png'), route: 'InitialDiagnosis' },
  { id: 2, title: 'Stuttering Therapy',   image: require('../assets/stuttering.png'),   route: 'StutteringTherapy' },
  { id: 3, title: 'Apraxia Of Speech',    image: require('../assets/apraxia.png'),      route: 'ApraxiaHomeScreen' },
  { id: 4, title: 'Articulation',         image: require('../assets/articulation.png'), route: 'Articulation' },
];

export default function HomeScreen({ navigation }: any) {
  const [userName, setUserName] = useState('Guest');

  useEffect(() => {
    const auth = getAuth();
    const u = auth.currentUser;
    if (u?.email) {
      const name = u.email.split('@')[0];
      setUserName(name.charAt(0).toUpperCase() + name.slice(1));
    }
  }, []);

  return (
    <ImageBackground
      source={require('../assets/homebg.jpg')}
      style={styles.background}
      imageStyle={styles.backgroundImage}
    >
      <View style={styles.overlay}>
        {/* Header */}
        <View style={styles.header}>
          <Image source={require('../assets/logo.png')} style={styles.logo} />
          <Text style={styles.title}>
            Welcome, <Text style={styles.highlight}>{userName}</Text>
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <Image source={require('../assets/icon.png')} style={styles.profileImage} />
          </TouchableOpacity>
        </View>

        {/* Category Grid */}
        <View style={styles.grid}>
          {categories.map(item => (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              onPress={() => navigation.navigate(item.route)}
              activeOpacity={0.8}
            >
              <Image source={item.image} style={styles.cardImage} />
              <Text style={styles.cardText}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Floating Add Button */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('addTherapy')}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={28} color="#FFF" />
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width,
    height,
  },
  backgroundImage: {
    resizeMode: 'cover',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.85)', // slight white overlay for readability
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  title: {
    flex: 1,
    marginLeft: 12,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
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
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  card: {
    width: '45%',
    aspectRatio: 1,      // make cards square
    backgroundColor: '#fff',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  cardImage: {
    width: 60,
    height: 60,
    marginBottom: 12,
    resizeMode: 'contain',
  },
  cardText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    color: '#333',
    paddingHorizontal: 4,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#4A90E2',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
});
