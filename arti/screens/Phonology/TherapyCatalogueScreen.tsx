// screens/TherapyCatalogueScreen.tsx
import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ImageBackground,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TherapyItem {
  id: string;
  title: string;
  description: string;
  image: any;         // replace with proper ImageSourcePropType
  route: string;
  tiers?: string[];
}

const therapies: TherapyItem[] = [
  {
    id: 'sound_match',
    title: 'Sound Match Game',
    description: 'Match sounds with the correct image',
    image: require('../../assets/sound_match_icon.png'),
    route: 'SoundMatchActivity',
    tiers: ['tier_1', 'tier_2', 'tier_3'],
  },
  {
    id: 'process_practice',
    title: 'Phonological Processes',
    description: 'Practice processes with picture-based exercises',
    image: require('../../assets/process_practice_icon.png'),
    route: 'phono',
    tiers: ['tier_1', 'tier_2', 'tier_3'],
  },
  {
    id: 'sentence_safari',
    title: 'Sentence Safari',
    description: 'Explore sentences in a fun way',
    image: require('../../assets/sentence_safari_icon.png'),
    route: 'SafariIntro',
    tiers: ['tier_1', 'tier_2', 'tier_3'],
  },
  {
    id: 'spin_practice',
    title: 'Spin Practice',
    description: 'Spin cards and record your sentence',
    image: require('../../assets/spinning.png'),
    route: 'SpinPractice',
    tiers: ['tier_1', 'tier_2', 'tier_3'],
  },
];

const { width, height } = Dimensions.get('window');

export default function TherapyCatalogueScreen({ navigation, route }: any) {
  const { tier } = route.params;
  const available = therapies.filter(t => !t.tiers || t.tiers.includes(tier));

  const renderItem = ({ item }: { item: TherapyItem }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate(item.route, { tier })}
      activeOpacity={0.8}
    >
      <View style={styles.cardContent}>
        <Image source={item.image} style={styles.icon} />
        <View style={styles.textContainer}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardDesc}>{item.description}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={22} color="#555" />
    </TouchableOpacity>
  );

  return (
    <ImageBackground
      source={require('../../assets/catalog_bg.jpg')}
      style={styles.bg}
      resizeMode="cover"
    >
      {/* semi‐opaque overlay for contrast */}
      <View style={styles.overlay} />

      <View style={styles.container}>

        <FlatList
          data={available}
          renderItem={renderItem}
          keyExtractor={i => i.id}
          contentContainerStyle={styles.list}
        />

        <TouchableOpacity
          style={styles.floatingButton}
          onPress={() => navigation.navigate('PerformanceAnalytics')}
        >
          <Ionicons name="analytics-outline" size={28} color="#FFF" />
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const CARD_WIDTH = width - 40;
const CARD_PADDING = 16;

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    width,
    height,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  header: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#3386F2',
    textAlign: 'center',
    marginBottom: 24,
  },
  list: {
    paddingBottom: 100,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 14,
    marginBottom: 16,
    padding: CARD_PADDING,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    alignSelf: 'center',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    width: 58,
    height: 58,
    resizeMode: 'contain',
    marginRight: 14,
  },
  textContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 14,
    color: '#666',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3386F2',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
});
