import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const FeatureScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Feature Details</Text>
      <Text>This is where you implement the phonological process, speech analysis, etc.</Text>
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

export default FeatureScreen;
