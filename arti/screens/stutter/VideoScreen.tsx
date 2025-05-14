import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Video, ResizeMode } from 'expo-av';

const VideoPlayerScreen = ({ navigation }: any) => {
  const [videoEnded, setVideoEnded] = useState(false);
  const videoRef = React.useRef<Video>(null);

  const handlePlaybackStatusUpdate = async (status: any) => {
    if (status.didJustFinish && !videoEnded) {
      // Set videoEnded to true after the first play
      setVideoEnded(true);
      // Automatically reset video to start and play again
      await videoRef.current?.setPositionAsync(0);
      videoRef.current?.playAsync();
    }
  };

  return (
    <View style={styles.container}>
      <Video
        ref={videoRef}
        source={{ uri: 'https://www.w3schools.com/html/mov_bbb.mp4' }}
        style={styles.video}
        useNativeControls
        resizeMode={ResizeMode.CONTAIN}
        onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
        shouldPlay={true}
      />

      {videoEnded && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.videoButton}
            onPress={() => navigation.navigate('Questionnaire')}
          >
            <Text style={styles.videoButtonText}>Next</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: '90%',
    height: 250,
  },
  buttonContainer: {
    marginTop: 20,
  },
  videoButton: {
    backgroundColor: '#4A90E2',
    padding: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 7,
  },
  videoButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default VideoPlayerScreen;
