import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { db } from '../../database/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';

type GameItem = {
  story: string;
  story_audio: string;
  q1: string;
  q1_audio: string;
  a1: {
    correct: string;
    incorrect: string[];
  };
  a1_audio: string;
  q2: string;
  q2_audio: string;
  a2: {
    correct: string;
    incorrect: string[];
  };
  a2_audio: string;
};

type Props = {
  navigation: {
    navigate: (screen: string) => void;
  };
};

const AOSGameScreen: React.FC<Props> = ({ navigation }) => {
  const [gameData, setGameData] = useState<GameItem[]>([]);
  const [questionIndex, setQuestionIndex] = useState(1);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showNextQuestionBtn, setShowNextQuestionBtn] = useState(false);
  const [showNextStoryBtn, setShowNextStoryBtn] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [options, setOptions] = useState<string[]>([]);
  const [completedGames, setCompletedGames] = useState(0);

  const fetchRandomGame = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'paraGameAOS'));
      const allGames = snapshot.docs.map((doc) => doc.data() as GameItem);
      
      if (allGames.length === 0) {
        console.warn('No games found in Firestore!');
        setLoading(false);
        return;
      }

      const randomGame = allGames[Math.floor(Math.random() * allGames.length)];
      setGameData([randomGame]);
      resetGameState();
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Oops!', 'Could not load the game. Please try again! 🎮');
    } finally {
      setLoading(false);
    }
  };

  const resetGameState = () => {
    setQuestionIndex(1);
    setCorrectCount(0);
    setShowNextQuestionBtn(false);
    setShowNextStoryBtn(false);
    setFeedback(null);
    setSelectedAnswer(null);
    setHasAnswered(false);
  };

  const playSound = async (uri: string) => {
    try {
      setIsPlayingAudio(true);
      const { sound } = await Audio.Sound.createAsync({ uri });
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded) return;
        if (status.isLoaded && status.didJustFinish) {
          setIsPlayingAudio(false);
        }
      });
    } catch (error) {
      console.error('Error playing sound:', error);
      setIsPlayingAudio(false);
      Alert.alert('Oops!', 'Could not play the audio. Let\'s try again! 🎵');
    }
  };

  const handleAnswer = (answer: string, correct: string) => {
    if (hasAnswered && selectedAnswer === answer) return;
    
    setSelectedAnswer(answer);
    const isCorrect = answer === correct;
    
    if (isCorrect) {
      setHasAnswered(true);
      setFeedback('🎉 Amazing! You got it right!');
      setCorrectCount(prev => prev + 1);
      if (questionIndex === 1) setShowNextQuestionBtn(true);
      if (questionIndex === 2 && correctCount + 1 === 2) setShowNextStoryBtn(true);
    } else {
      setFeedback('🙈 Not quite right, try again!');
      // Don't set hasAnswered to true for wrong answers
    }
  };

  const goToNextQuestion = () => {
    setQuestionIndex(2);
    setShowNextQuestionBtn(false);
    setFeedback(null);
    setSelectedAnswer(null);
    setHasAnswered(false);
    // Reset options for the second question
    if (gameData.length > 0) {
      const currentGame = gameData[0];
      if (currentGame.a2?.correct && currentGame.a2?.incorrect) {
        setOptions(shuffleArray([currentGame.a2.correct, ...currentGame.a2.incorrect]));
      }
    }
  };

  const goToNextStory = () => {
    setLoading(true);
    setCompletedGames(prev => prev + 1);
    fetchRandomGame();
  };

  useEffect(() => {
    fetchRandomGame();
  }, []);

  useEffect(() => {
    if (gameData.length > 0) {
      const currentGame = gameData[0];
      const currentAnswers = questionIndex === 1 
        ? currentGame.a1 
        : currentGame.a2;

      if (currentAnswers?.correct && currentAnswers?.incorrect) {
        setOptions(shuffleArray([currentAnswers.correct, ...currentAnswers.incorrect]));
      }
    }
  }, [gameData, questionIndex]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#fca311" />
        <Text style={styles.subtitle}>Getting your game ready... 🎮</Text>
      </View>
    );
  }

  if (!loading && (!gameData || gameData.length === 0)) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>⚠️ No game data found</Text>
        <Text style={styles.subtitle}>Please check your connection.</Text>
        <TouchableOpacity 
          style={[styles.nextBtn, { marginTop: 20 }]} 
          onPress={fetchRandomGame}
        >
          <Text style={styles.btnText}>🔄 Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentGame = gameData[0];
  if (!currentGame) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>⚠️ Something went wrong</Text>
        <Text style={styles.subtitle}>Let's try loading the game again!</Text>
        <TouchableOpacity 
          style={[styles.nextBtn, { marginTop: 20 }]} 
          onPress={fetchRandomGame}
        >
          <Text style={styles.btnText}>🔄 Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const question = questionIndex === 1 ? currentGame.q1 : currentGame.q2;
  const questionAudio = questionIndex === 1 ? currentGame.q1_audio : currentGame.q2_audio;
  const answers = questionIndex === 1
    ? { 
        correct: currentGame.a1?.correct || '', 
        incorrect: currentGame.a1?.incorrect || [], 
        audio: currentGame.a1_audio || '' 
      }
    : { 
        correct: currentGame.a2?.correct || '', 
        incorrect: currentGame.a2?.incorrect || [], 
        audio: currentGame.a2_audio || '' 
      };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.navigate('ApraxiaHomeScreen')}
      >
        <Ionicons name="arrow-back" size={28} color="#333" />
      </TouchableOpacity>

      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          🏆 Completed Games: {completedGames}/10
        </Text>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${(completedGames / 10) * 100}%` }
            ]} 
          />
        </View>
      </View>

      <Text style={styles.title}>📖 Story Time!</Text>
      <Text style={styles.text}>{currentGame.story}</Text>
      <TouchableOpacity 
        style={[styles.audioBtn, isPlayingAudio && styles.disabledButton]} 
        onPress={() => playSound(currentGame.story_audio)}
        disabled={isPlayingAudio}
      >
        <Text style={styles.btnText}>
          {isPlayingAudio ? '🔊 Playing...' : '▶️ Hear the Story'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.title}>❓ Let's Answer a Question</Text>
      <Text style={styles.question}>{question}</Text>
      <TouchableOpacity 
        style={[styles.audioBtn, isPlayingAudio && styles.disabledButton]} 
        onPress={() => playSound(questionAudio)}
        disabled={isPlayingAudio}
      >
        <Text style={styles.btnText}>
          {isPlayingAudio ? '🔊 Playing...' : '🔊 Play Question'}
        </Text>
      </TouchableOpacity>

      <View style={styles.answerHeader}>
        <Text style={styles.title}>📝 Choose Your Answer:</Text>
        <TouchableOpacity
          style={[styles.audioPlaySmall, (!hasAnswered || isPlayingAudio) && styles.disabledButton]}
          onPress={() => hasAnswered && playSound(answers.audio)}
          disabled={!hasAnswered || isPlayingAudio}
        >
          <Text style={styles.audioIcon}>🔊</Text>
        </TouchableOpacity>
      </View>

      {options.map((option, idx) => (
        <View key={idx} style={styles.answerRow}>
          <TouchableOpacity
            style={[
              styles.option,
              selectedAnswer === option && styles.selectedOption,
              hasAnswered && selectedAnswer !== option && styles.disabledOption
            ]}
            onPress={() => handleAnswer(option, answers.correct)}
            disabled={hasAnswered && selectedAnswer !== option}
          >
            <Text style={[
              styles.optionText,
              selectedAnswer === option && styles.selectedOptionText
            ]}>
              {option}
            </Text>
          </TouchableOpacity>
        </View>
      ))}

      {feedback && <Text style={styles.feedback}>{feedback}</Text>}

      {showNextQuestionBtn && (
        <TouchableOpacity style={styles.nextBtn} onPress={goToNextQuestion}>
          <Text style={styles.btnText}>➡️ Next Question</Text>
        </TouchableOpacity>
      )}

      {showNextStoryBtn && (
        <TouchableOpacity style={styles.nextBtn} onPress={goToNextStory}>
          <Text style={styles.btnText}>📘 Next Story</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const shuffleArray = (array: string[]): string[] => {
  return array
    .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fef9f4',
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    color: '#ff6f61',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  text: {
    color: '#444',
    fontSize: 18,
    marginBottom: 10,
  },
  question: {
    fontSize: 20,
    color: '#333',
    marginBottom: 10,
    fontWeight: '600',
  },
  audioBtn: {
    backgroundColor: '#ffcc70',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  btnText: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 16,
  },
  answerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  answerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  option: {
    backgroundColor: '#8ed1fc',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 15,
    flex: 1,
    justifyContent: 'center',
  },
  optionText: {
    color: '#004c99',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  audioPlaySmall: {
    marginLeft: 10,
    backgroundColor: '#ffd54f',
    padding: 10,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 40,
  },
  audioIcon: {
    fontSize: 20,
    color: '#333',
  },
  feedback: {
    marginTop: 25,
    fontSize: 22,
    color: '#009688',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#666',
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
  nextBtn: {
    backgroundColor: '#90ee90',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 15,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledOption: {
    opacity: 0.5,
  },
  selectedOption: {
    backgroundColor: '#4CAF50',
  },
  selectedOptionText: {
    color: '#fff',
  },
  progressContainer: {
    marginTop: 60,
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressText: {
    fontSize: 18,
    color: '#ff6f61',
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  progressBar: {
    height: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 5,
  },
});

export default AOSGameScreen;
