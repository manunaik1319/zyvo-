import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Image, Dimensions, Animated } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function LoginHeroIllustration() {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  // Responsive full-width styling
  const imageWidth = width;
  const imageHeight = height * 0.38; // Taller illustration for focal point

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Image
        source={require('../../assets/images/zyvo_entrance_illustration.png')}
        style={{ width: imageWidth, height: imageHeight }}
        resizeMode="cover"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    overflow: 'hidden',
  },
});
