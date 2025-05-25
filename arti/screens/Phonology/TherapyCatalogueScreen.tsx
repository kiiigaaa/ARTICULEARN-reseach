import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TherapyItem {
  id: string;
  title: string;
  description: string;
  image: any;         // replace with proper ImageSourcePropType
  route: string;
  tiers?: string[];   // optional filter by tier
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
    route: 'PhonologicalProcess',
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
    image: require('../../assets/process_practice_icon.png'),
    route: 'SpinPractice',
    tiers: ['tier_1', 'tier_2', 'tier_3'],
  },
];

const TherapyCatalogueScreen = ({ navigation, route }: any) => {
  const { tier } = route.params;

  // Filter therapies by tier (if specified)
  const availableTherapies = therapies.filter((item) => {
    if (!item.tiers) return true;
    return item.tiers.includes(tier);
  });

  const renderItem = ({ item }: { item: TherapyItem }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate(item.route, { tier })}
    >
      <Image source={item.image} style={styles.icon} />
      <View style={styles.textContainer}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardDesc}>{item.description}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Therapy Catalogue</Text>
      <FlatList
        data={availableTherapies}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />

      {/* Floating Analytics Button */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => navigation.navigate('PerformanceAnalytics')}
      >
        <Ionicons name="analytics-outline" size={32} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDF6F0',
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3386F2',
    marginBottom: 20,
    textAlign: 'center',
  },
  list: {
    paddingBottom: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  icon: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 14,
    color: '#666666',
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
  }
});

export default TherapyCatalogueScreen;
