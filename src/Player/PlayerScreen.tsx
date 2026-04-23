import React, { useEffect } from 'react';
import { StyleSheet, View, BackHandler, Text } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import VideoPlayer from './VideoPlayerComponent';

const PlayerScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation();

  // Get the URL passed via navigation.navigate
  const { videoUrl } = route.params || {};

  useEffect(() => {
    const backAction = () => {
      navigation.goBack();
      return true;
    };
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );
    return () => backHandler.remove();
  }, [navigation]);

  if (!videoUrl) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: 'center', alignItems: 'center' },
        ]}
      >
        <Text style={{ color: 'white' }}>No Video URL Provided</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <VideoPlayer
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
        }}
        sourceUrl={videoUrl}
        autoPlay={true}
        paused={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  debugBadge: {
    position: 'absolute',
    top: 40,
    left: 40,
    backgroundColor: 'rgba(255,0,0,0.7)',
    padding: 10,
    borderRadius: 5,
  },
});

export default PlayerScreen;
