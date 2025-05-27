// screens/SafariIntroScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity } from 'react-native';

const SafariIntroScreen = ({ route, navigation }: any) => (
  <ImageBackground
    source={require('../../../assets/jungle_story_bg.png')}
    style={styles.background}
  >
    <View style={styles.overlay}>
      <Text style={styles.title}>Welcome to Safari Rescue!</Text>
      <Text style={styles.story}>
        Meet Zoe the Explorer! Today, he’s deep in the jungle looking for animal friends who need his help.
        But every creature will only come out if you say the magic sentence correctly!
      </Text>
      <TouchableOpacity
        style={styles.startButton}
        onPress={() => navigation.replace('SentenceSafari', { route })}
      >
        <Text style={styles.startText}>Let’s Go!</Text>
      </TouchableOpacity>
    </View>
  </ImageBackground>
);

const styles = StyleSheet.create({
  background: { flex: 1, resizeMode: 'cover' },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 30,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFD54F',
    textAlign: 'center',
    marginBottom: 20,
  },
  story: {
    fontSize: 18,
    color: '#FFF',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 40,
  },
  startButton: {
    backgroundColor: '#FFB74D',
    paddingVertical: 16,
    borderRadius: 30,
    alignSelf: 'center',
    paddingHorizontal: 40,
    elevation: 4,
  },
  startText: {
    fontSize: 18,
    color: '#5D4037',
    fontWeight: 'bold',
  },
});

export default SafariIntroScreen;
