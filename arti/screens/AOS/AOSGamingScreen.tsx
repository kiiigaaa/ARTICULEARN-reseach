import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { db } from '../../database/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { Audio } from 'expo-av';

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

export default function AOSGameScreen() {
  const [gameData, setGameData] = useState<GameItem[]>([]);
  const [questionIndex, setQuestionIndex] = useState(1);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showNextQuestionBtn, setShowNextQuestionBtn] = useState(false);
  const [showNextStoryBtn, setShowNextStoryBtn] = useState(false);

  const fetchRandomGame = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'paraGameAOS'));
      const allGames = snapshot.docs.map((doc) => doc.data() as GameItem);

      if (allGames.length === 0) {
        console.warn('❌ No games found in Firestore!');
        setLoading(false);
        return;
      }

      const randomIndex = Math.floor(Math.random() * allGames.length);
      const selectedGame = allGames[randomIndex];
      setGameData([selectedGame]);
      setQuestionIndex(1);
      setCorrectCount(0);
      setShowNextQuestionBtn(false);
      setShowNextStoryBtn(false);
    } catch (error) {
      console.error('❌ Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const playSound = async (uri: string) => {
    const { sound } = await Audio.Sound.createAsync({ uri });
    await sound.playAsync();
  };

  const handleAnswer = (answer: string, correctAnswer: string) => {
    const isCorrect = answer === correctAnswer;
    setFeedback(isCorrect ? '🎉 Yay! That’s right!' : '🙈 Oops! Try again!');

    if (isCorrect) {
      setCorrectCount((prev) => prev + 1);
      setShowNextQuestionBtn(questionIndex === 1);
      setShowNextStoryBtn(questionIndex === 2 && correctCount + 1 === 2);
    }

    setTimeout(() => setFeedback(null), 1500);
  };

  const goToNextQuestion = () => {
    setQuestionIndex(2);
    setShowNextQuestionBtn(false);
  };

  const goToNextStory = () => {
    setLoading(true);
    fetchRandomGame();
  };

  useEffect(() => {
    fetchRandomGame();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#fca311" />
        <Text style={styles.subtitle}>Getting your game ready...</Text>
      </View>
    );
  }

  if (!loading && gameData.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>⚠️ No game data found</Text>
        <Text style={styles.subtitle}>Please check your connection.</Text>
      </View>
    );
  }

  const currentGame = gameData[0];
  const question = questionIndex === 1 ? currentGame.q1 : currentGame.q2;
  const questionAudio = questionIndex === 1 ? currentGame.q1_audio : currentGame.q2_audio;
  const answers =
    questionIndex === 1
      ? {
        correct: currentGame.a1.correct,
        incorrect: currentGame.a1.incorrect,
        audio: currentGame.a1_audio,
      }
      : {
        correct: currentGame.a2.correct,
        incorrect: currentGame.a2.incorrect,
        audio: currentGame.a2_audio,
      };
  const options = shuffleArray([answers.correct, ...answers.incorrect]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📖 Story Time!</Text>
      <Text style={styles.text}>{currentGame.story}</Text>
      <TouchableOpacity style={styles.audioBtn} onPress={() => playSound(currentGame.story_audio)}>
        <Text style={styles.btnText}>▶️ Hear the Story</Text>
      </TouchableOpacity>

      <Text style={styles.title}>❓ Let's Answer a Question</Text>
      <Text style={styles.question}>{question}</Text>
      <TouchableOpacity style={styles.audioBtn} onPress={() => playSound(questionAudio)}>
        <Text style={styles.btnText}>🔊 Play Question</Text>
      </TouchableOpacity>

      <View style={styles.answerHeader}>
        <Text style={styles.title}>📝 Choose Your Answer:</Text>
        <TouchableOpacity style={styles.audioPlaySmall} onPress={() => playSound(answers.audio)}>
          <Text style={styles.audioIcon}>🔊</Text>
        </TouchableOpacity>
      </View>

      {options.map((option, idx) => (
        <View key={idx} style={styles.answerRow}>
          <TouchableOpacity style={styles.option} onPress={() => handleAnswer(option, answers.correct)}>
            <Text style={styles.optionText}>{option}</Text>
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
}

const shuffleArray = (array: string[]) => {
  return array
    .map((value) => ({ value, sort: Math.random() }))
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
});
