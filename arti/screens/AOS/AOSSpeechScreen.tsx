import { View, Text, SafeAreaView, TouchableOpacity, Image, StyleSheet } from 'react-native';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
export default function SpeechScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.container}>

          <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.navigate('Home')}
      >
        <Ionicons name="arrow-back" size={28} color="#333" />
      </TouchableOpacity>
      <Text style={styles.title}>Apraxia of Speech</Text>

      <View style={styles.cardRow}>
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('PronounScreen')}>
          <View style={styles.imageContainer}>
            <Image style={styles.image} source={require('../../assets/AOS-Pronounce.png')} />
          </View>
          <Text style={styles.cardText}>Pronounce</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('GamingScreen')}>
          <View style={styles.imageContainer}>
            <Image style={styles.image} source={require('../../assets/AOS-SoundMatchGame.png')} />
          </View>
          <Text style={styles.cardText}>Sound Matching Game</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.cardRow}>
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('CheckRandom')}>
          <View style={styles.imageContainer}>
            <Image style={styles.image} source={require('../../assets/AOS-Analysis.png')} />
          </View>
          <Text style={styles.cardText}>Check a random voice</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('AOSGaming')}>
          <View style={styles.imageContainer}>
            <Image style={styles.image} source={require('../../assets/AOS-Game.png')} />
          </View>
          <Text style={styles.cardText}>Game</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ebedef',
    height: '100%',
    width: '100%',
  },
  title: {
    textAlign: 'center',
    color: '#7fb3d5',
    fontWeight: '700',
    marginVertical: 10,
    fontSize: 20,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'center',
    width: '90%',
  },
  card: {
    backgroundColor: '#FFFFFF',
    width: '45%',
    padding: 10,
    marginVertical: 10,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
  },
  imageContainer: {
    width: 100,
    height: 100,
    alignSelf: 'center',
  },
  image: {
    width: 100,
    height: 100,
  },
  cardText: {
    textAlign: 'center',
    color: '#7fb3d5',
    marginTop: 10,
    fontSize: 14,
    fontWeight: '700',
  },
    backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
  },
});
