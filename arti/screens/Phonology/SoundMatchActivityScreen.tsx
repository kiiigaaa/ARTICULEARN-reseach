import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, Animated, ImageBackground } from 'react-native';
import { Audio } from 'expo-av';
import * as Animatable from 'react-native-animatable';

const challengesByTier: Record<string, Challenge[]> = {
  tier_1: [
    {
      soundClip: require('../../assets/target_sound.mp3'),
      images: [
        { id: 1, source: require('../../assets/correct.png'), isCorrect: true },
        { id: 2, source: require('../../assets/option1.png'), isCorrect: false },
        { id: 3, source: require('../../assets/option2.png'), isCorrect: false },
        { id: 4, source: require('../../assets/option3.png'), isCorrect: false },
      ],
    },
    {
      soundClip: require('../../assets/target_sound.mp3'),
      images: [
        { id: 1, source: require('../../assets/correct.png'), isCorrect: true },
        { id: 2, source: require('../../assets/option1.png'), isCorrect: false },
        { id: 3, source: require('../../assets/option2.png'), isCorrect: false },
        { id: 4, source: require('../../assets/option3.png'), isCorrect: false },
      ],
    },
  ],
  tier_2: [
    {
      soundClip: require('../../assets/target_sound.mp3'),
      images: [
        { id: 1, source: require('../../assets/correct.png'), isCorrect: true },
        { id: 2, source: require('../../assets/option1.png'), isCorrect: false },
        { id: 3, source: require('../../assets/option2.png'), isCorrect: false },
        { id: 4, source: require('../../assets/option3.png'), isCorrect: false },
      ],
    },
    {
      soundClip: require('../../assets/target_sound.mp3'),
      images: [
        { id: 1, source: require('../../assets/correct.png'), isCorrect: true },
        { id: 2, source: require('../../assets/option1.png'), isCorrect: false },
        { id: 3, source: require('../../assets/option2.png'), isCorrect: false },
        { id: 4, source: require('../../assets/option3.png'), isCorrect: false },
      ],
    },
  ],
  tier_3: [
    {
      soundClip: require('../../assets/target_sound.mp3'),
      images: [
        { id: 1, source: require('../../assets/correct.png'), isCorrect: true },
        { id: 2, source: require('../../assets/option1.png'), isCorrect: false },
        { id: 3, source: require('../../assets/option2.png'), isCorrect: false },
        { id: 4, source: require('../../assets/option3.png'), isCorrect: false },
      ],
    },
    {
      soundClip: require('../../assets/target_sound.mp3'),
      images: [
        { id: 1, source: require('../../assets/correct.png'), isCorrect: true },
        { id: 2, source: require('../../assets/option1.png'), isCorrect: false },
        { id: 3, source: require('../../assets/option2.png'), isCorrect: false },
        { id: 4, source: require('../../assets/option3.png'), isCorrect: false },
      ],
    },
  ],
};

const SoundMatchActivityScreen = ({ navigation, route }: any) => {
  const { tier } = route.params;
  const challenges: Challenge[] =
    challengesByTier[tier] || challengesByTier['tier_1'];

  const [currentIdx, setCurrentIdx] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | ''>('');
  const soundRef = useRef<Audio.Sound | null>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Configure audio mode once
  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_MIX_WITH_OTHERS,
      shouldDuckAndroid: true,
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DUCK_OTHERS,
      playThroughEarpieceAndroid: false,
    });
  }, []);

  // Auto-play current sound
  useEffect(() => {
    playSound();
  }, [currentIdx]);

  const playSound = async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }
      const { sound } = await Audio.Sound.createAsync(
        challenges[currentIdx].soundClip,
        { shouldPlay: true }
      );
      soundRef.current = sound;
    } catch (e) {
      console.error('Error playing sound', e);
    }
  };

  const handleSelect = (isCorrect: boolean) => {
    if (isCorrect) {
      setFeedback('correct');
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.3,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        goNext();
      });
    } else {
      setFeedback('wrong');
      // shake animation via Animated
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 0.9, duration: 100, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
      ]).start();
    }
  };

  const goNext = () => {
    setFeedback('');
    if (currentIdx < challenges.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      Alert.alert('Awesome!', 'You completed all challenges!', [
        { text: 'Back to Catalogue', onPress: () => navigation.goBack() },
      ]);
    }
  };

  const { images } = challenges[currentIdx];

  return (
    <ImageBackground
      source={require('../../assets/bg_playful.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <Text style={styles.title}>Sound Match - Tier {tier.split('_')[1]}</Text>

        <TouchableOpacity style={styles.replayBtn} onPress={playSound}>
          <Text style={styles.replayText}>🔊 Replay Sound</Text>
        </TouchableOpacity>

        <View style={styles.grid}>
          {images.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => handleSelect(item.isCorrect)}
              activeOpacity={0.8}
            >
              <Animated.View
                style={[
                  styles.imageWrapper,
                  { transform: [{ scale: scaleAnim }] },
                ]}
              >
                <Image source={item.source} style={styles.image} />
              </Animated.View>
            </TouchableOpacity>
          ))}
        </View>

        {feedback === 'correct' && (
          <Animatable.Text
            animation="bounceIn"
            style={styles.correctText}
          >
            🎉 Correct! 🎉
          </Animatable.Text>
        )}

        {feedback === 'wrong' && (
          <Animatable.Text
            animation="shake"
            style={styles.wrongText}
          >
            😕 Try Again!
          </Animatable.Text>
        )}
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1 },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#4A90E2',
    marginBottom: 15,
    textShadowColor: '#FFF',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  replayBtn: {
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    marginBottom: 20,
    elevation: 2,
  },
  replayText: {
    fontSize: 16,
    color: '#333',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  imageWrapper: {
    margin: 10,
    borderRadius: 15,
    backgroundColor: '#FFF',
    padding: 10,
    elevation: 3,
  },
  image: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
  correctText: {
    fontSize: 22,
    color: '#28A745',
    marginTop: 30,
    fontWeight: 'bold',
  },
  wrongText: {
    fontSize: 22,
    color: '#D0021B',
    marginTop: 30,
    fontWeight: 'bold',
  },
});

export default SoundMatchActivityScreen;
