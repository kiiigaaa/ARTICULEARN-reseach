import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../database/firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
// TypeScript type
type Game = {
  word: string;
  correct_pronunciation: string;
  incorrect_pronunciations: string[];
  timestamp?: any;
};

const AOSGaming = ({ navigation }: any) => {
  const [games, setGames] = useState<Game[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState('');
  const [options, setOptions] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [loading, setLoading] = useState(true);

  const shuffleArray = <T,>(arr: T[]): T[] => arr.sort(() => Math.random() - 0.5);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'gameAOS'));
        const fetchedGames = snapshot.docs
          .map(doc => doc.data())
          .filter((game): game is Game =>
            !!game.word && !!game.correct_pronunciation && Array.isArray(game.incorrect_pronunciations)
          );

        const shuffled = shuffleArray(fetchedGames).slice(0, 15);
        setGames(shuffled);
        setOptions(
          shuffleArray([
            ...shuffled[0].incorrect_pronunciations,
            shuffled[0].correct_pronunciation
          ])
        );
        setLoading(false);
      } catch (error) {
        console.error('❌ Error fetching games:', error);
      }
    };

    fetchGames();
  }, []);

  const currentGame = games[currentIndex];

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
    setFeedback(option === currentGame.correct_pronunciation ? 'correct' : 'wrong');
  };

  const handleNext = () => {
    if (currentIndex + 1 < games.length) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setOptions(
        shuffleArray([
          ...games[nextIndex].incorrect_pronunciations,
          games[nextIndex].correct_pronunciation
        ])
      );
      setSelectedOption('');
      setFeedback(null);
    } else {
      Alert.alert("🎉 Finished", "You've completed all games!");
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4da6ff" />
        <Text style={styles.loadingText}>Loading Games...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
          <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.navigate('ApraxiaHomeScreen')}
      >
        <Ionicons name="arrow-back" size={28} color="#333" />
      </TouchableOpacity>
      <Text style={styles.title}>🔊 Sound Matching Game</Text>
      <Text style={styles.subtitle}>
        🟡 Pick the Correct Pronunciation for: <Text style={{ fontWeight: 'bold' }}>{currentGame.word}</Text>
      </Text>

      {options.map((option, idx) => {
        const isSelected = selectedOption === option;
        const isCorrect = option === currentGame.correct_pronunciation;
        let backgroundColor = '#f0f0f0';

        if (isSelected) {
          backgroundColor = isCorrect ? '#c8f7c5' : '#f7c5c5';
        }

        return (
          <TouchableOpacity
            key={idx}
            onPress={() => handleOptionSelect(option)}
            style={[styles.optionButton, { backgroundColor }]}
            disabled={!!selectedOption}
          >
            <Text style={styles.optionText}>{option}</Text>
          </TouchableOpacity>
        );
      })}

      {feedback && (
        <Text
          style={feedback === 'correct' ? styles.correctFeedback : styles.wrongFeedback}
        >
          {feedback === 'correct' ? '✅ Answer is correct!' : '❌ Answer is wrong!'}
        </Text>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={() => {
          setSelectedOption('');
          setFeedback(null);
        }} style={styles.controlButton}>
          <Text style={styles.controlButtonText}>🔁 Retry</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleNext} style={styles.controlButton}>
          <Text style={styles.controlButtonText}>➡️ Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AOSGaming;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
    backgroundColor: '#fff',
    justifyContent: 'center'
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 22,
    color: '#555'
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#4da6ff',
    marginBottom: 20,
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 26,
    marginBottom: 30,
    color: '#333',
    textAlign: 'center'
  },
  optionButton: {
    padding: 22,
    borderRadius: 18,
    marginBottom: 16,
    borderColor: '#ccc',
    borderWidth: 2,
    alignItems: 'center'
  },
  optionText: {
    fontSize: 22,
    color: '#222'
  },
  correctFeedback: {
    fontSize: 22,
    color: 'green',
    marginTop: 15,
    borderBottomColor: 'green',
    borderBottomWidth: 3,
    textAlign: 'center'
  },
  wrongFeedback: {
    fontSize: 22,
    color: 'red',
    marginTop: 15,
    borderBottomColor: 'red',
    borderBottomWidth: 3,
    textAlign: 'center'
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 40
  },
  controlButton: {
    paddingVertical: 14,
    paddingHorizontal: 30,
    backgroundColor: '#4da6ff',
    borderRadius: 14
  },
  controlButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold'
  },
    backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
  },
});