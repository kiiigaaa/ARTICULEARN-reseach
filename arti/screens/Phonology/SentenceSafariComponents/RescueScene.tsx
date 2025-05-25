// RescueScene.tsx
import React, { useRef, useEffect } from 'react';
import { View, Animated, ImageBackground, Text, StyleSheet, Dimensions } from 'react-native';

export type RescueTrigger = 'none' | 'correct' | 'incorrect';
interface RescueSceneProps { trigger: RescueTrigger; animalSource?: any; onAnimationEnd: () => void; }

const { width, height } = Dimensions.get('window');
const guideSize = width * 0.4;
const animalSize = width * 0.25;

const guideImages = {
  neutral: require('../../../assets/guide_neutral.png'),
  happy: require('../../../assets/guide_happy.png'),
  encourage: require('../../../assets/guide_try.png'),
};

const RescueScene: React.FC<RescueSceneProps> = ({ trigger, animalSource, onAnimationEnd }) => {
  const animalY = useRef(new Animated.Value(100)).current;
  const animalScale = useRef(new Animated.Value(0)).current;
  const guideScale = useRef(new Animated.Value(1)).current;
  const guideState = useRef<'neutral'|'happy'|'encourage'>('neutral');

  useEffect(() => {
    animalY.setValue(100);
    animalScale.setValue(0);
    guideScale.setValue(1);
    guideState.current = 'neutral';

    if (trigger === 'correct' && animalSource) {
      guideState.current = 'happy';
      Animated.parallel([
        // Slide animal up slowly behind guide
        Animated.timing(animalY, { toValue: 0, duration: 1000, useNativeDriver: true }),
        // Grow animal slowly
        Animated.timing(animalScale, { toValue: 1, duration: 1000, useNativeDriver: true }),
        // Guide bounce
        Animated.sequence([
          Animated.timing(guideScale, { toValue: 1.2, duration: 200, useNativeDriver: true }),
          Animated.timing(guideScale, { toValue: 1, duration: 200, useNativeDriver: true }),
        ]),
      ]).start(() => setTimeout(onAnimationEnd, 3000));
    }

    if (trigger === 'incorrect') {
      guideState.current = 'encourage';
      Animated.sequence([
        Animated.timing(guideScale, { toValue: 0.9, duration: 100, useNativeDriver: true }),
        Animated.timing(guideScale, { toValue: 1, duration: 100, useNativeDriver: true }),
      ]).start(() => setTimeout(onAnimationEnd, 2000));
    }
  }, [trigger]);

  return (
    <ImageBackground source={require('../../../assets/safari_bg.png')} style={styles.background}>
      <View style={styles.container}>
        {animalSource && (
          <Animated.Image
            source={animalSource}
            style={[
              styles.animal,
              {
                width: animalSize,
                height: animalSize,
                transform: [{ translateY: animalY }, { scale: animalScale }],
              },
            ]}
          />
        )}
        <Animated.Image
          source={guideImages[guideState.current]}
          style={[
            styles.guide,
            {
              width: guideSize,
              height: guideSize,
              transform: [{ scale: guideScale }],
            },
          ]}
        />
        {trigger === 'correct' && (
          <View style={styles.dialog}>
            <Text style={styles.dialogText}>Correct!</Text>
          </View>
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
    justifyContent: 'center', // center guide vertically
  },
  guide: {
    resizeMode: 'contain',
  },
  animal: {
    position: 'absolute',
    bottom: height * 0.25, // behind guide: a bit lower
    resizeMode: 'contain',
  },
  dialog: {
    position: 'absolute',
    top: height * 0.1,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  dialogText: { color: '#2E7D32', fontSize: 18, fontWeight: 'bold' },
});

export default RescueScene;
