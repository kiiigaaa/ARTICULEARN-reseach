import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

const wordQuestion = "What is the symbolic break-up for the following word:";
const wordOptions = [
  { id: 1, answer: 'b-i-k', isCorrect: false },
  { id: 2, answer: 'blik', isCorrect: true },
  { id: 3, answer: 'bi-k', isCorrect: false },
  { id: 4, answer: 'bi-k', isCorrect: false },
];

const WordBreakupScreen = ({ navigation }: any) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');
  const [isCorrectAnswerSelected, setIsCorrectAnswerSelected] = useState<boolean>(false);

  const handleAnswerSelect = (answer: string) => {
    if (!isCorrectAnswerSelected) {
      setSelectedAnswer(answer);
    }
  };

  const checkAnswer = () => {
    const selected = wordOptions.find(option => option.answer === selectedAnswer);
    if (selected && selected.isCorrect) {
      setFeedback('Great job!');
      setIsCorrectAnswerSelected(true);
    } else {
      setFeedback('Oops! Try again.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image source={require('../../assets/logo.png')} style={styles.logo} />
        <Text style={styles.title}>Stutter Therapy</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Image source={require('../../assets/icon.png')} style={styles.profileImage} />
        </TouchableOpacity>
      </View>

      {/* Word Breakup Section */}
      <View style={styles.mcqContainer}>
        <Text style={styles.question}>{wordQuestion}</Text>
        <Text style={styles.word}>blik</Text>
        <ScrollView style={styles.listContainer}>
          {wordOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.listItem,
                selectedAnswer === option.answer && styles.selectedItem,
                isCorrectAnswerSelected && styles.lockedItem, // Apply locked style
              ]}
              onPress={() => handleAnswerSelect(option.answer)}
              disabled={isCorrectAnswerSelected} // Disable interaction
            >
              <FontAwesome5
                name="circle"
                size={18}
                color={isCorrectAnswerSelected ? '#999' : '#4A90E2'} // Gray out if locked
              />
              <Text
                style={[
                  styles.listText,
                  isCorrectAnswerSelected && styles.lockedText, // Gray out text if locked
                ]}
              >
                {option.answer}
              </Text>
              {selectedAnswer === option.answer && (
                <FontAwesome5 name="check-circle" size={18} color="#4A90E2" />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Feedback Section - Above Submit Button */}
        {feedback && (
          <View style={styles.feedbackContainer}>
            <Text style={styles.feedback}>{feedback}</Text>
          </View>
        )}

        {/* Submit or Next Button */}
        <TouchableOpacity
          style={styles.submitButton}
          onPress={isCorrectAnswerSelected ? () => navigation.navigate('VoiceAnalysisScreen') : checkAnswer}
        >
          <Text style={styles.submitButtonText}>
            {isCorrectAnswerSelected ? 'Next' : 'Submit Answer'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    textAlign: 'center',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  mcqContainer: {
    marginTop: 40,
    flexGrow: 1,
  },
  question: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  word: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#4A90E2',
  },
  listContainer: {
    flexGrow: 1,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    padding: 15,
    borderRadius: 20,
    marginVertical: 10,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  selectedItem: {
    backgroundColor: '#E8E8E8',
  },
  lockedItem: {
    backgroundColor: '#F0F0F0', // Gray background for locked items
  },
  listText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '600',
    color: '#4A4A4A',
  },
  lockedText: {
    color: '#999', // Gray text for locked items
  },
  submitButton: {
    backgroundColor: '#4A90E2',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 50,
    margin: 50,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 7,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  feedbackContainer: {
    marginTop: 20,
    padding: 10,
    alignItems: 'center',
  },
  feedback: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A4A4A',
  },
});

export default WordBreakupScreen;