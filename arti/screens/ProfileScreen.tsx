import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Image, TouchableOpacity, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { getAuth } from 'firebase/auth';

const ProfileScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [image, setImage] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      setEmail(user.email || '');
      const nameFromEmail = user.email?.split('@')[0] || '';
      setName(nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1));
    }
  }, []);
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // ✅ Use this if MediaType causes an error
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
  
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedAsset = result.assets[0];
      setImage(selectedAsset.uri);
    }
  };
  
  
  


  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.header}>Edit Profile</Text>

      {/* Profile Image */}
      <TouchableOpacity onPress={pickImage}>
        <Image
          source={image ? { uri: image } : require('../assets/icon.png')}
          style={styles.avatar}
        />
        <Text style={styles.changeText}>Tap to change</Text>
      </TouchableOpacity>

      {/* Editable Name */}
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Name"
      />

      {/* Display Email (read-only) */}
      <Text style={styles.emailText}>{email}</Text>

      {/* Save Button (optional) */}
      <TouchableOpacity style={styles.saveButton} onPress={() => alert('Saved (Not yet linked to DB)')}>
        <Text style={styles.saveText}>Save Changes</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 30, alignItems: 'center', backgroundColor: '#F9F9F9' },
  backButton: { alignSelf: 'flex-start' },
  backText: { fontSize: 16, color: '#4A90E2' },
  header: { fontSize: 24, fontWeight: 'bold', marginVertical: 20 },
  avatar: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#ccc' },
  changeText: { color: '#4A90E2', marginTop: 8, fontSize: 14 },
  input: {
    width: '100%', marginTop: 20, backgroundColor: '#fff',
    borderRadius: 10, padding: 15, fontSize: 16,
    borderColor: '#ddd', borderWidth: 1
  },
  emailText: { marginTop: 10, color: '#666', fontSize: 14 },
  saveButton: {
    backgroundColor: '#4A90E2', marginTop: 30, borderRadius: 30,
    paddingVertical: 15, paddingHorizontal: 40,
  },
  saveText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default ProfileScreen;
