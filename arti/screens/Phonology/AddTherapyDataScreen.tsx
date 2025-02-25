// screens/AddTherapyDataScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { db } from '../../database/firebaseConfig';
import { collection, doc, setDoc } from 'firebase/firestore';

const AddTherapyDataScreen = () => {
  const [tier, setTier] = useState<string>('tier_1');
  const [processName, setProcessName] = useState<string>('');
  const [processCode, setProcessCode] = useState<string>('');
  const [word, setWord] = useState<string>('');
  const [imageURL, setImageURL] = useState<string>('');
  const [wordsList, setWordsList] = useState<{ word: string, image: string }[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const handleAddWord = () => {
    if (!word || !imageURL) {
      Alert.alert('Missing Fields', 'Please enter both the word and image URL.');
      return;
    }

    // Add the new word and image to the words list
    setWordsList([...wordsList, { word, image: imageURL }]);

    // Clear the word and image URL inputs
    setWord('');
    setImageURL('');
  };

  const handleSubmit = async () => {
    if (!processName || !processCode || wordsList.length === 0) {
      Alert.alert('Missing Fields', 'Please fill in all fields and add at least one word.');
      return;
    }

    setLoading(true);

    try {
      // Reference to the Firestore collection for the selected tier
      const tierRef = collection(db, 'therapy_plans', 'masterDoc', tier);

      // Add data to the selected tier (processName as document ID)
      await setDoc(doc(tierRef, processName), {
        name: processName,
        code: processCode,
        words: wordsList
      });

      // Success alert and reset the form
      Alert.alert('Success', `${processName} added successfully!`);
      setProcessName('');
      setProcessCode('');
      setWordsList([]);
    } catch (error) {
      console.error('Error adding therapy data:', error);
      Alert.alert('Error', 'An error occurred while adding the data.');
    }

    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Add Therapy Data</Text>

      {/* Tier selection */}
      <Text style={styles.label}>Select Tier:</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, tier === 'tier_1' && styles.selectedButton]}
          onPress={() => setTier('tier_1')}
        >
          <Text style={styles.buttonText}>Tier 1</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, tier === 'tier_2' && styles.selectedButton]}
          onPress={() => setTier('tier_2')}
        >
          <Text style={styles.buttonText}>Tier 2</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, tier === 'tier_3' && styles.selectedButton]}
          onPress={() => setTier('tier_3')}
        >
          <Text style={styles.buttonText}>Tier 3</Text>
        </TouchableOpacity>
      </View>

      {/* Process name input */}
      <TextInput
        style={styles.input}
        placeholder="Process Name"
        value={processName}
        onChangeText={setProcessName}
      />

      {/* Process code input */}
      <TextInput
        style={styles.input}
        placeholder="Process Code"
        value={processCode}
        onChangeText={setProcessCode}
      />

      {/* Word input */}
      <TextInput
        style={styles.input}
        placeholder="Therapy Word"
        value={word}
        onChangeText={setWord}
      />

      {/* Image URL input */}
      <TextInput
        style={styles.input}
        placeholder="Image URL"
        value={imageURL}
        onChangeText={setImageURL}
      />

      {/* Add word button */}
      <TouchableOpacity style={styles.button} onPress={handleAddWord}>
        <Text style={styles.buttonText}>Add Word</Text>
      </TouchableOpacity>

      {/* List of added words */}
      <View style={styles.wordsList}>
        <Text style={styles.label}>Words List:</Text>
        {wordsList.map((item, index) => (
          <View key={index} style={styles.wordItem}>
            <Text>{item.word} - {item.image}</Text>
          </View>
        ))}
      </View>

      {/* Submit Button */}
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>Add Therapy Data</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

export default AddTherapyDataScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#FFF7E6",
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#5D4037',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: '#5D4037',
    marginVertical: 10,
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
  },
  button: {
    width: '30%',
    backgroundColor: '#81C784',
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
  },
  selectedButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  wordsList: {
    marginVertical: 20,
    width: '100%',
  },
  wordItem: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
