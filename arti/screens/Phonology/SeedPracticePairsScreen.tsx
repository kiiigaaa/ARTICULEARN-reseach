import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';
import { db } from '../../database/firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import type { Challenge } from '../../types/practice';

// Define your seed data for each tier
const seed: Record<string, Omit<Challenge, 'id'>[]> = {
  tier_1: [
    {
      text: 'refrigerator',
      images: [
        { id: 1, uri: 'https://img.freepik.com/free-psd/majestic-elephant-isolated_23-2151857816.jpg?uid=R96287073&ga=GA1.1.343489480.1745576551&semt=ais_hybrid&w=740', isCorrect: false },
        { id: 2, uri: 'https://img.freepik.com/free-vector/refrigerator-closed-opened-door-with-lots-food_1308-103210.jpg?uid=R96287073&ga=GA1.1.343489480.1745576551&semt=ais_hybrid&w=740', isCorrect: true },
        { id: 3, uri: 'https://img.freepik.com/free-vector/passenger-airplane-isolated_1284-41822.jpg?uid=R96287073&ga=GA1.1.343489480.1745576551&semt=ais_hybrid&w=740', isCorrect: false },
        { id: 4, uri: 'https://img.freepik.com/premium-photo/most-tasty-chocolate-isolated-white_404043-667.jpg?uid=R96287073&ga=GA1.1.343489480.1745576551&semt=ais_hybrid&w=740', isCorrect: false }
      ]
    },
    {
      text: 'microscope',
      images: [
        { id: 1, uri: 'https://img.freepik.com/free-photo/alligator-closeup-sand_649448-4938.jpg?uid=R96287073&ga=GA1.1.343489480.1745576551&semt=ais_hybrid&w=740', isCorrect: false },
        { id: 2, uri: 'https://img.freepik.com/free-vector/microscope-realistic-illustration_1284-9503.jpg?uid=R96287073&ga=GA1.1.343489480.1745576551&semt=ais_hybrid&w=740', isCorrect: true },
        { id: 3, uri: 'https://img.freepik.com/premium-photo/astronaut-outer-space-with-ice-cream-cone-earth_273003-4334.jpg?uid=R96287073&ga=GA1.1.343489480.1745576551&semt=ais_hybrid&w=740', isCorrect: false },
        { id: 4, uri: 'https://img.freepik.com/free-photo/pineapple-fruit_1203-7746.jpg?uid=R96287073&ga=GA1.1.343489480.1745576551&semt=ais_hybrid&w=740', isCorrect: false }
      ]
    },
    {
      text: 'hippopotamus',
      images: [
        { id: 1, uri: 'https://img.freepik.com/free-vector/hippopotamus-isolated-white-background_1308-85030.jpg?uid=R96287073&ga=GA1.1.343489480.1745576551&semt=ais_hybrid&w=740', isCorrect: true },
        { id: 2, uri: 'https://img.freepik.com/free-photo/low-angle-isolated-shot-military-hawk-maneuvering_181624-22479.jpg?uid=R96287073&ga=GA1.1.343489480.1745576551&semt=ais_hybrid&w=740', isCorrect: false },
        { id: 3, uri: 'https://img.freepik.com/free-vector/basketball-ball-isolated_1284-42545.jpg?uid=R96287073&ga=GA1.1.343489480.1745576551&semt=ais_hybrid&w=740', isCorrect: false },
        { id: 4, uri: 'https://img.freepik.com/free-vector/stationery-realistic-composition-with-isolated-image-calculator-blank-background-vector-illustration_1284-65975.jpg?uid=R96287073&ga=GA1.1.343489480.1745576551&semt=ais_hybrid&w=740', isCorrect: false }
      ]
    },
    {
      text: 'xylophone',
      images: [
        { id: 1, uri: 'https://img.freepik.com/free-photo/mosquito_1150-7964.jpg?uid=R96287073&ga=GA1.1.343489480.1745576551&semt=ais_hybrid&w=740', isCorrect: false },
        { id: 2, uri: 'https://img.freepik.com/free-vector/microwave-oven-isolated-white-background_1308-64506.jpg?uid=R96287073&ga=GA1.1.343489480.1745576551&semt=ais_hybrid&w=740', isCorrect: false },
        { id: 3, uri: 'https://img.freepik.com/free-photo/pineapple-fruit_1203-7746.jpg?uid=R96287073&ga=GA1.1.343489480.1745576551&semt=ais_hybrid&w=740', isCorrect: false },
        { id: 4, uri: 'https://img.freepik.com/free-vector/isolated-xylophone-background_395-2147490981.jpg?uid=R96287073&ga=GA1.1.343489480.1745576551&semt=ais_hybrid&w=740', isCorrect: true }
      ]
    },
    {
      text: 'kangaroo',
      images: [
        { id: 1, uri: 'https://img.freepik.com/free-photo/rhino-savannah-national-park-africa_167946-54.jpg?uid=R96287073&ga=GA1.1.343489480.1745576551&semt=ais_hybrid&w=740', isCorrect: false },
        { id: 2, uri: 'https://img.freepik.com/free-vector/telescope-with-tripod-stand_1308-102800.jpg?uid=R96287073&ga=GA1.1.343489480.1745576551&semt=ais_hybrid&w=740', isCorrect: false },
        { id: 3, uri: 'https://img.freepik.com/free-vector/vector-green-fresh-whole-half-cut-avocado-with-leaf-side-view-isolated-white-background_1284-45445.jpg?uid=R96287073&ga=GA1.1.343489480.1745576551&semt=ais_hybrid&w=740', isCorrect: false },
        { id: 4, uri: 'https://img.freepik.com/free-vector/hand-painted-kangaroo-design_1152-91.jpg?uid=R96287073&ga=GA1.1.343489480.1745576551&semt=ais_hybrid&w=740', isCorrect: true }
      ]
    },
    {
      text: 'porcupine',
      images: [
        { id: 1, uri: 'https://img.freepik.com/free-vector/realistic-blue-umbrella_1284-11412.jpg?uid=R96287073&ga=GA1.1.343489480.1745576551&semt=ais_hybrid&w=740', isCorrect: false },
        { id: 2, uri: 'https://img.freepik.com/free-photo/pineapple-fruit_74190-7549.jpg?uid=R96287073&ga=GA1.1.343489480.1745576551&semt=ais_hybrid&w=740', isCorrect: false },
        { id: 3, uri: 'https://img.freepik.com/free-photo/cute-baby-hedgehog-closeup-grass-with-black-background_488145-2951.jpg?uid=R96287073&ga=GA1.1.343489480.1745576551&semt=ais_hybrid&w=740', isCorrect: true },
        { id: 4, uri: 'https://img.freepik.com/free-photo/beautiful-chameleon-panther-chameleon-panther-branch_488145-2673.jpg?uid=R96287073&ga=GA1.1.343489480.1745576551&semt=ais_hybrid&w=740', isCorrect: false }
      ]
    },
  ],
  tier_2: [
    {
      text: 'giraffe',
      images: [
        { id: 1, uri: 'https://img.freepik.com/free-photo/giraffe-national-park-kenya_167946-75.jpg?uid=R96287073&ga=GA1.1.343489480.1745576551&semt=ais_hybrid&w=740', isCorrect: true },
        { id: 2, uri: 'https://img.freepik.com/free-vector/erupting-volcano-with-smoke_1308-171597.jpg?uid=R96287073&ga=GA1.1.343489480.1745576551&semt=ais_hybrid&w=740', isCorrect: false },
        { id: 3, uri: 'https://img.freepik.com/free-vector/hand-painted-kangaroo-design_1152-91.jpg?uid=R96287073&ga=GA1.1.343489480.1745576551&semt=ais_hybrid&w=740', isCorrect: false },
        { id: 4, uri: 'https://img.freepik.com/free-psd/close-up-appetizing-sandwich_23-2151837121.jpg?uid=R96287073&ga=GA1.1.343489480.1745576551&semt=ais_hybrid&w=740', isCorrect: false }
      ]
    },
    {
      text: 'helicopter',
      images: [
        { id: 1, uri: 'https://img.freepik.com/free-psd/majestic-elephant-isolated_23-2151857816.jpg?uid=R96287073&ga=GA1.1.343489480.1745576551&semt=ais_hybrid&w=740', isCorrect: false },
        { id: 2, uri: 'https://img.freepik.com/free-photo/low-angle-isolated-shot-military-hawk-maneuvering_181624-22479.jpg?uid=R96287073&ga=GA1.1.343489480.1745576551&semt=ais_hybrid&w=740', isCorrect: true },
        { id: 3, uri: 'https://img.freepik.com/free-vector/realistic-tornado-illustration_1284-6158.jpg?uid=R96287073&ga=GA1.1.343489480.1745576551&semt=ais_hybrid&w=740', isCorrect: false },
        { id: 4, uri: 'https://img.freepik.com/free-photo/shot-tiger-laying-ground-while-watching-his-territory_181624-44049.jpg?uid=R96287073&ga=GA1.1.343489480.1745576551&semt=ais_hybrid&w=740', isCorrect: false }
      ]
    },
     {
      text: 'dolphin',
      images: [
        { id: 1, uri: 'https://img.freepik.com/free-psd/dolphin-isolated-figure_23-2151390303.jpg?uid=R96287073&ga=GA1.1.343489480.1745576551&semt=ais_hybrid&w=740', isCorrect: true },
        { id: 2, uri: 'https://img.freepik.com/free-vector/cute-cartoon-crocodile-character_1308-132849.jpg?uid=R96287073&ga=GA1.1.343489480.1745576551&semt=ais_hybrid&w=740', isCorrect: false },
        { id: 3, uri: 'https://img.freepik.com/free-vector/passenger-airplane-isolated_1284-41822.jpg?uid=R96287073&ga=GA1.1.343489480.1745576551&semt=ais_hybrid&w=740', isCorrect: false },
        { id: 4, uri: 'https://img.freepik.com/free-photo/pineapple-fruit_74190-7549.jpg?uid=R96287073&ga=GA1.1.343489480.1745576551&semt=ais_hybrid&w=740', isCorrect: false }
      ]
    },
     {
      text: 'cucumber',
      images: [
        { id: 1, uri: 'https://img.freepik.com/free-vector/cute-zebra-cartoon-animal-character_1308-146433.jpg?uid=R96287073&ga=GA1.1.343489480.1745576551&semt=ais_hybrid&w=740', isCorrect: false },
        { id: 2, uri: 'https://img.freepik.com/free-vector/cute-octopus-cartoon_96037-463.jpg?uid=R96287073&ga=GA1.1.343489480.1745576551&semt=ais_hybrid&w=740', isCorrect: false },
        { id: 3, uri: 'https://img.freepik.com/free-photo/close-up-wild-animal-nature_23-2151853131.jpg?uid=R96287073&ga=GA1.1.343489480.1745576551&semt=ais_hybrid&w=740', isCorrect: false },
        { id: 4, uri: 'https://img.freepik.com/free-vector/cucumber-isolated-white_98292-5103.jpg?uid=R96287073&ga=GA1.1.343489480.1745576551&semt=ais_hybrid&w=740', isCorrect: true }
      ]
    },
     {
      text: 'hamburger',
      images: [
        { id: 1, uri: 'https://img.freepik.com/free-vector/vector-ripe-yellow-banana-bunch-isolated-white-background_1284-45456.jpg?uid=R96287073&ga=GA1.1.343489480.1745576551&semt=ais_hybrid&w=740', isCorrect: false },
        { id: 2, uri: 'https://img.freepik.com/free-psd/majestic-elephant-isolated_23-2151857816.jpg?uid=R96287073&ga=GA1.1.343489480.1745576551&semt=ais_hybrid&w=740', isCorrect: false },
        { id: 3, uri: 'https://img.freepik.com/free-psd/close-up-hamburger-isolated_23-2151604186.jpg?uid=R96287073&ga=GA1.1.343489480.1745576551&semt=ais_hybrid&w=740', isCorrect: true },
        { id: 4, uri: 'https://img.freepik.com/free-vector/graident-ai-robot-vectorart_78370-4114.jpg?uid=R96287073&ga=GA1.1.343489480.1745576551&semt=ais_hybrid&w=740', isCorrect: false }
      ]
    },
  ],
  tier_3: [
    {
      text: 'cat',
      images: [
        { id: 1, uri: 'https://img.freepik.com/free-vector/sweet-eyed-kitten-cartoon-character_1308-135596.jpg?uid=R96287073&ga=GA1.1.343489480.1745576551&semt=ais_hybrid&w=740', isCorrect: true },
        { id: 2, uri: 'https://img.freepik.com/free-vector/cheerful-cute-dog-white-background_1308-132745.jpg?uid=R96287073&ga=GA1.1.343489480.1745576551&semt=ais_hybrid&w=740', isCorrect: false },
        { id: 3, uri: 'https://img.freepik.com/free-vector/basketball-ball-isolated_1284-42545.jpg?uid=R96287073&ga=GA1.1.343489480.1745576551&semt=ais_hybrid&w=740', isCorrect: false },
        { id: 4, uri: 'https://img.freepik.com/premium-vector/happy-sun-white-background_1639-4709.jpg?uid=R96287073&ga=GA1.1.343489480.1745576551&semt=ais_hybrid&w=740', isCorrect: false }
      ]
    },
    {
      text: 'cup',
      images: [
        { id: 1, uri: 'https://img.freepik.com/free-psd/black-isolated-car_23-2151852894.jpg?uid=R96287073&ga=GA1.1.343489480.1745576551&semt=ais_hybrid&w=740', isCorrect: false },
        { id: 2, uri: 'https://img.freepik.com/free-photo/straw-hat-man_1203-7257.jpg?uid=R96287073&ga=GA1.1.343489480.1745576551&semt=ais_hybrid&w=740', isCorrect: false },
        { id: 3, uri: 'https://img.freepik.com/free-psd/close-up-coffee-mug-isolated_23-2151833557.jpg?uid=R96287073&ga=GA1.1.343489480.1745576551&semt=ais_hybrid&w=740', isCorrect: true },
        { id: 4, uri: 'https://img.freepik.com/free-vector/cozy-wooden-single-bed-illustration_1308-169624.jpg?uid=R96287073&ga=GA1.1.343489480.1745576551&semt=ais_hybrid&w=740', isCorrect: false }
      ]
    },
     {
      text: 'bird',
      images: [
        { id: 1, uri: 'https://img.freepik.com/free-photo/fresh-bass-with-white-background_1203-1781.jpg?uid=R96287073&ga=GA1.1.343489480.1745576551&semt=ais_hybrid&w=740', isCorrect: false },
        { id: 2, uri: 'https://img.freepik.com/free-psd/hummingbird-bird-isolated_23-2151845448.jpg?uid=R96287073&ga=GA1.1.343489480.1745576551&semt=ais_hybrid&w=740', isCorrect: true },
        { id: 3, uri: 'https://img.freepik.com/free-vector/3d-metal-star-isolated_1308-117760.jpg?uid=R96287073&ga=GA1.1.343489480.1745576551&semt=ais_hybrid&w=740', isCorrect: false },
        { id: 4, uri: 'https://img.freepik.com/free-vector/grey-full-moon-illustration-white-background_53876-117406.jpg?uid=R96287073&ga=GA1.1.343489480.1745576551&semt=ais_hybrid&w=740', isCorrect: false }
      ]
    },
     {
      text: 'book',
      images: [
        { id: 1, uri: 'https://img.freepik.com/free-vector/isolated-tree-white-background_1308-26130.jpg?uid=R96287073&ga=GA1.1.343489480.1745576551&semt=ais_hybrid&w=740', isCorrect: false },
        { id: 2, uri: 'https://img.freepik.com/free-photo/growth-close-up-environmental-lush-natural_1172-349.jpg?uid=R96287073&ga=GA1.1.343489480.1745576551&semt=ais_hybrid&w=740', isCorrect: false },
        { id: 3, uri: 'https://img.freepik.com/free-vector/vector-fountain-writing-pen-contract-signing_1284-41915.jpg?uid=R96287073&ga=GA1.1.343489480.1745576551&semt=ais_hybrid&w=740', isCorrect: true },
        { id: 4, uri: 'https://img.freepik.com/premium-photo/open-book-isolated-background_488220-4623.jpg?uid=R96287073&ga=GA1.1.343489480.1745576551&semt=ais_hybrid&w=740', isCorrect: false }
      ]
    },
     {
      text: 'hat',
      images: [
        { id: 1, uri: 'https://img.freepik.com/free-photo/shoes_1203-8153.jpg?uid=R96287073&ga=GA1.1.343489480.1745576551&semt=ais_hybrid&w=740', isCorrect: false },
        { id: 2, uri: 'https://img.freepik.com/premium-vector/christmas-stockings-vector-illustration-white-background_272204-19947.jpg?uid=R96287073&ga=GA1.1.343489480.1745576551&semt=ais_hybrid&w=740', isCorrect: false },
        { id: 3, uri: 'https://img.freepik.com/free-photo/beautiful-elegance-luxury-fashion-green-handbag_1203-7655.jpg?uid=R96287073&ga=GA1.1.343489480.1745576551&semt=ais_hybrid&w=740', isCorrect: false },
        { id: 4, uri: 'https://img.freepik.com/free-photo/straw-hat-man_1203-7257.jpg?uid=R96287073&ga=GA1.1.343489480.1745576551&semt=ais_hybrid&w=740', isCorrect: true }
      ]
    },
  ]
};

export default function SeedSoundMatchChallengesScreen() {
  const [status, setStatus] = useState<'idle'|'seeding'|'done'|'error'>('idle');

  const seedChallenges = async () => {
    setStatus('seeding');
    try {
      for (const [tierKey, challenges] of Object.entries(seed)) {
        // Write each tier as a document under sound_match_challenges
        await setDoc(doc(db, 'sound_match_challenges', tierKey), { challenges });
      }
      setStatus('done');
    } catch (e) {
      console.error(e);
      setStatus('error');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Seed Sound Match Challenges</Text>

      {status === 'idle' && (
        <Button title="Push challenges to Firestore" onPress={seedChallenges} />
      )}
      {status === 'seeding' && <Text style={styles.info}>Seeding… please wait.</Text>}
      {status === 'done' && <Text style={styles.success}>✅ Done! Remove this screen now.</Text>}
      {status === 'error' && <Text style={styles.error}>❌ Error. Check console.</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFF8F0'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#5D4037'
  },
  info: {
    fontSize: 16,
    marginTop: 10,
    color: '#555'
  },
  success: {
    fontSize: 18,
    marginTop: 10,
    color: '#28A745'
  },
  error: {
    fontSize: 18,
    marginTop: 10,
    color: '#D0021B'
  }
});
