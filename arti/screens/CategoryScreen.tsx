import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const CategoryScreen = ({ navigation }: any) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select a Category</Text>
      <Button title="Phonological Process" onPress={() => navigation.navigate('Feature')} />
      <Button title="Stuttering Therapy" onPress={() => navigation.navigate('Feature')} />
      <Button title="Apraxia of Speech" onPress={() => navigation.navigate('Feature')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

export default CategoryScreen;
