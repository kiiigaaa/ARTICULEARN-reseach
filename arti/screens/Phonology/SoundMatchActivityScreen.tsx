import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Animated,
  ImageBackground,
  ActivityIndicator
} from 'react-native';
import * as Speech from 'expo-speech';
import * as Animatable from 'react-native-animatable';
import { Ionicons } from '@expo/vector-icons';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../database/firebaseConfig';
import { savePerformanceRecord } from '../../services/practiceService';
import type { PerformanceRecord } from '../../types/practice';
import { Timestamp } from 'firebase/firestore';

interface Img { id: number; uri: string; isCorrect: boolean; }
interface Challenge { text: string; images: Img[]; }

export default function SoundMatchActivityScreen({ navigation, route }: any) {
  const { tier } = route.params;
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [idx, setIdx] = useState(0);
  const [feedback, setFeedback] = useState<'correct'|'wrong'|'idle'>('idle');
  const [wrongCount, setWrongCount] = useState(0);
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    (async() => {
      try{
        const snap = await getDoc(doc(db,'sound_match_challenges',tier));
        if(snap.exists()) setChallenges((snap.data() as any).challenges);
        else throw new Error();
      }catch{
        Alert.alert('Error','Could not load challenges',[{text:'OK',onPress:()=>navigation.goBack()}]);
      }
    })();
  },[]);

  useEffect(() => {
    if(!challenges.length) return;
    setFeedback('idle');
    Speech.stop();
    Speech.speak(challenges[idx].text, { rate: 1 });
  },[idx,challenges]);

  const animate = () =>
    Animated.sequence([
      Animated.timing(scale, { toValue: 1.2, duration: 200, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();

  const handleSelect = (correct: boolean) => {
    if(feedback !== 'idle') return;
    if(correct){
      setFeedback('correct');
      animate();
      setTimeout(() => goNext(), 600);
    } else {
      setFeedback('wrong');
      animate();
      setWrongCount(wc => wc + 1);
    }
  };

  const goNext = () => {
    if(idx < challenges.length - 1) {
      setIdx(i => i + 1);
    } else {
      const total = challenges.length;
      const subs = wrongCount;
      const err = total ? subs / total : 0;
      const summary = {
        total_phonemes: total,
        substitutions: subs,
        deletions: 0,
        insertions: 0,
        error_rate: err,
        has_disorder: err >= 0.5
      };
      const rec: Omit<PerformanceRecord,'id'> = {
        userId: 'child123',
        activity: 'SoundMatch',
        timestamp: Timestamp.now(),
        summary,
        details: [],
      };
      savePerformanceRecord(rec).then(() =>
        Alert.alert('Session Complete','Your performance is saved',[{text:'OK',onPress:()=>navigation.goBack()}])
      );
    }
  };

  if(!challenges.length) {
    return <View style={styles.center}><ActivityIndicator size='large'/></View>;
  }

  const { images } = challenges[idx];

  return (
    <ImageBackground source={require('../../assets/bg_playful.png')} style={styles.bg}>
      <View style={styles.content}>
        <View style={styles.grid}>
          {images.map(img => (
            <TouchableOpacity key={img.id} onPress={() => handleSelect(img.isCorrect)} activeOpacity={0.7}>
              <Animated.View style={[styles.card, { transform: [{ scale }] }]}>  
                <Image source={{ uri: img.uri }} style={styles.pic} />
              </Animated.View>
            </TouchableOpacity>
          ))}
        </View>
        {feedback === 'correct' && <Animatable.Text animation='bounceIn' style={styles.feedbackCorrect}>✅</Animatable.Text>}
        {feedback === 'wrong' && <Animatable.Text animation='shake' style={styles.feedbackWrong}>❌</Animatable.Text>}
        <View style={styles.controls}>
          <TouchableOpacity onPress={() => Speech.speak(challenges[idx].text)} style={styles.btnAudio}>
            <Ionicons name='volume-high' size={28} color='#fff' />
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex:1 },
  content: { flex:1, justifyContent:'center', alignItems:'center' },
  grid: { flexDirection:'row', justifyContent:'center', flexWrap:'wrap' },
  card: { backgroundColor:'#fff', borderRadius:12, padding:10, margin:12, elevation:4, shadowColor:'#000', shadowOpacity:0.2, shadowOffset:{width:0,height:2}, shadowRadius:4 },
  pic: { width:100, height:100, borderRadius:8 },
  feedbackCorrect: { position:'absolute', top:'45%', fontSize:48, color:'#2ECC71' },
  feedbackWrong: { position:'absolute', top:'45%', fontSize:48, color:'#E74C3C' },
  controls: { position:'absolute', bottom:40, flexDirection:'row' },
  btnAudio: { backgroundColor:'#F39C12', padding:16, borderRadius:30, elevation:4 }
});
