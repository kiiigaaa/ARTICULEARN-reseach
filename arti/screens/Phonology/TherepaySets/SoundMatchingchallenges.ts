interface ImageOption {
    id: number;
    source: any; // ImageSourcePropType
    isCorrect: boolean;
  }
  
  interface Challenge {
    soundClip: any; // Audio file
    images: ImageOption[];
  }
  
  const challengesByTier: Record<string, Challenge[]> = {
    tier_1: [
      {
        soundClip: require('../../../assets/target_sound.mp3'),
        images: [
          { id: 1, source: require('../../../assets/correct.png'), isCorrect: true },
          { id: 2, source: require('../../../assets/option1.png'), isCorrect: false },
          { id: 3, source: require('../../../assets/option2.png'), isCorrect: false },
          { id: 4, source: require('../../../assets/option3.png'), isCorrect: false },
        ],
      },
      {
        soundClip: require('../../../assets/target_sound.mp3'),
        images: [
          { id: 1, source: require('../../../assets/correct.png'), isCorrect: true },
          { id: 2, source: require('../../../assets/option1.png'), isCorrect: false },
          { id: 3, source: require('../../../assets/option2.png'), isCorrect: false },
          { id: 4, source: require('../../../assets/option3.png'), isCorrect: false },
        ],
      },
    ],
    tier_2: [
      {
        soundClip: require('../../../assets/target_sound.mp3'),
        images: [
          { id: 1, source: require('../../../assets/correct.png'), isCorrect: true },
          { id: 2, source: require('../../../assets/option1.png'), isCorrect: false },
          { id: 3, source: require('../../../assets/option2.png'), isCorrect: false },
          { id: 4, source: require('../../../assets/option3.png'), isCorrect: false },
        ],
      },
      {
        soundClip: require('../../../assets/target_sound.mp3'),
        images: [
          { id: 1, source: require('../../../assets/correct.png'), isCorrect: true },
          { id: 2, source: require('../../../assets/option1.png'), isCorrect: false },
          { id: 3, source: require('../../../assets/option2.png'), isCorrect: false },
          { id: 4, source: require('../../../assets/option3.png'), isCorrect: false },
        ],
      },
    ],
    tier_3: [
      {
        soundClip: require('../../../assets/target_sound.mp3'),
        images: [
          { id: 1, source: require('../../../assets/correct.png'), isCorrect: true },
          { id: 2, source: require('../../../assets/option1.png'), isCorrect: false },
          { id: 3, source: require('../../../assets/option2.png'), isCorrect: false },
          { id: 4, source: require('../../../assets/option3.png'), isCorrect: false },
        ],
      },
      {
        soundClip: require('../../../assets/target_sound.mp3'),
        images: [
          { id: 1, source: require('../../../assets/correct.png'), isCorrect: true },
          { id: 2, source: require('../../../assets/option1.png'), isCorrect: false },
          { id: 3, source: require('../../../assets/option2.png'), isCorrect: false },
          { id: 4, source: require('../../../assets/option3.png'), isCorrect: false },
        ],
      },
    ],
  };