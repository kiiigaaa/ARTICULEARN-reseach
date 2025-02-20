import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../database/firebaseConfig';
import { Ionicons } from '@expo/vector-icons';

const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigation.replace('Home'); // Navigate to Home after successful login
    } catch (error: any) {
      alert("Login failed. Check your credentials.");
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      {/* Close Button */}
      <TouchableOpacity style={styles.closeButton} onPress={() => navigation.navigate('Welcome')}>
        <Ionicons name="close" size={28} color="black" />
      </TouchableOpacity>

      {/* Login Card */}
      <View style={styles.loginCard}>
        <Text style={styles.title}>ArticLearn</Text>

        {/* Input Fields */}
        <TextInput 
          placeholder="Email"
          style={styles.input}
          onChangeText={setEmail}
          value={email}
        />
        <TextInput 
          placeholder="Password"
          style={styles.input}
          secureTextEntry
          onChangeText={setPassword}
          value={password}
        />

        {/* Forgot Password */}
        <TouchableOpacity>
          <Text style={styles.forgotPassword}>Forgot Password?</Text>
        </TouchableOpacity>

        {/* Sign In Button */}
        <TouchableOpacity style={styles.signInButton} onPress={handleLogin} disabled={loading}>
          <Text style={styles.signInText}>{loading ? "Signing In..." : "Sign In"}</Text>
        </TouchableOpacity>

        {/* Sign Up Redirect */}
        <TouchableOpacity style={styles.signupRedirect} onPress={() => navigation.navigate('Signup')}>
          <Text style={styles.signupRedirectText}>Don't have an account? Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    left: 20,
  },
  loginCard: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 15,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    color: '#4A90E2',
    fontSize: 14,
    marginBottom: 20,
  },
  signInButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 15,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
  },
  signInText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signupRedirect: {
    marginTop: 15,
  },
  signupRedirectText: {
    color: '#4A90E2',
    fontSize: 16,
  },
});

export default LoginScreen;
