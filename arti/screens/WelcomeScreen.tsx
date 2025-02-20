import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

const WelcomeScreen = ({ navigation }: any) => {
  return (
    <View style={styles.container}>
      {/* Sign In Button on Top Right */}
      <TouchableOpacity style={styles.signInButton} onPress={() => navigation.navigate('SignUp')}>
        <Text style={styles.signInText}>Sign Up</Text>
      </TouchableOpacity>

      {/* Welcome Illustration */}
      <Image source={require('../assets/welcome.png')} style={styles.image} />

      {/* Welcome Text */}
      <Text style={styles.title}>Welcome to <Text style={styles.highlight}>ArticLearn</Text></Text>
      <Text style={styles.subtitle}>
        ArticLearn is an AI-powered speech therapy assistant designed to help children improve their communication skills.
      </Text>

      {/* Buttons */}
      <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('Home')}>
        <Text style={styles.primaryButtonText}>I’d like to try it free</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.secondaryButtonText}>I'm already a member</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  signInButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#4A90E2',
  },
  signInText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  image: {
    width: 250,
    height: 200,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  highlight: {
    color: '#4A90E2',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 10,
    color: '#555',
    paddingHorizontal: 20,
  },
  primaryButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginTop: 20,
    width: '90%',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    marginTop: 10,
    borderWidth: 2,
    borderColor: '#000',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    width: '90%',
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default WelcomeScreen;
