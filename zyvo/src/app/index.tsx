import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  Animated,
  Easing,
  Vibration,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle } from 'react-native-svg';
import { FONTS } from '../constants/fonts';

// Create animated wrappers for scale & opacity transformations
const AnimatedView = Animated.View;
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const COLORS = {
  background: '#FFFFFF', // Solid Pure White
  indigo: '#4F46E5',     // Zyvo Brand Indigo
  textPrimary: '#0F172A', // Premium Slate-900 for wordmark
  textSecondary: '#64748B', // Slate-500 for tagline
};

export default function Splash() {
  const router = useRouter();

  // Root screen fade out transition
  const rootOpacity = useRef(new Animated.Value(1)).current;

  // Monogram Logo Animations (Scale + Opacity)
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const dotScale = useRef(new Animated.Value(0)).current;

  // Typography animations
  const wordmarkOpacity = useRef(new Animated.Value(0)).current;
  const wordmarkTranslateY = useRef(new Animated.Value(8)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const taglineTranslateY = useRef(new Animated.Value(6)).current;

  useEffect(() => {
    // Phase 1 (0-500ms): Scale & Spring-in the Z Monogram
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 180,
        friction: 12,
        useNativeDriver: true,
      }),
    ]).start();

    // Phase 2 (300-600ms): Pop in the bottom-right accent dot
    Animated.spring(dotScale, {
      toValue: 1,
      tension: 200,
      friction: 8,
      delay: 250,
      useNativeDriver: true,
    }).start(() => {
      if (Platform.OS !== 'web') {
        Vibration.vibrate(6);
      }
    });

    // Phase 3 (500-900ms): Fade in & slide up "Zyvo" wordmark
    Animated.parallel([
      Animated.timing(wordmarkOpacity, {
        toValue: 1,
        duration: 350,
        delay: 450,
        useNativeDriver: true,
      }),
      Animated.timing(wordmarkTranslateY, {
        toValue: 0,
        duration: 350,
        delay: 450,
        useNativeDriver: true,
      }),
    ]).start();

    // Phase 4 (800-1200ms): Fade in & slide up tagline
    Animated.parallel([
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: 350,
        delay: 750,
        useNativeDriver: true,
      }),
      Animated.timing(taglineTranslateY, {
        toValue: 0,
        duration: 350,
        delay: 750,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Phase 5 (1300-1700ms): Hold completed lockup and fade out screen
      setTimeout(() => {
        Animated.timing(rootOpacity, {
          toValue: 0,
          duration: 400,
          easing: Easing.bezier(0.25, 1, 0.5, 1),
          useNativeDriver: true,
        }).start(() => {
          router.replace('/(auth)/onboarding');
        });
      }, 500);
    });
  }, []);

  return (
    <View style={styles.rootWrapper}>
      <Animated.View style={[styles.root, { opacity: rootOpacity }]}>
        <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

        {/* Minimal Center Lockup */}
        <View style={styles.centerBox}>
          
          {/* Custom Z monogram container */}
          <AnimatedView style={[
            styles.monogramContainer, 
            { opacity: logoOpacity, transform: [{ scale: logoScale }] }
          ]} accessibilityLabel="Zyvo Monogram Logo">
            <Svg width={96} height={96} viewBox="0 0 96 96">
              {/* Main "Z" path: M 26 30 L 70 30 L 30 70 */}
              <Path
                d="M 26 30 L 70 30 L 30 70"
                stroke={COLORS.indigo}
                strokeWidth={13.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />

              {/* Bottom-right accent dot */}
              <AnimatedCircle
                cx={71}
                cy={70}
                r={6.5}
                fill={COLORS.indigo}
                transform={[{ scale: dotScale }]}
              />
            </Svg>
          </AnimatedView>

          {/* Zyvo wordmark */}
          <Animated.View style={{
            opacity: wordmarkOpacity,
            transform: [{ translateY: wordmarkTranslateY }],
            marginTop: 28,
            alignItems: 'center'
          }}>
            <Text style={styles.wordmark}>Zyvo</Text>
          </Animated.View>

          {/* Tagline below wordmark */}
          <Animated.View style={{
            opacity: taglineOpacity,
            transform: [{ translateY: taglineTranslateY }],
            marginTop: 8,
            alignItems: 'center'
          }}>
            <Text style={styles.tagline}>Find Your Focus</Text>
          </Animated.View>

        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  rootWrapper: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  monogramContainer: {
    width: 104,
    height: 104,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
  },
  wordmark: {
    fontFamily: FONTS.bold,
    fontSize: 34,
    color: COLORS.textPrimary, // Premium dark text
    letterSpacing: -0.8,
    fontWeight: 'bold',
  },
  tagline: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.textSecondary, // Slate-500
    letterSpacing: 0.2,
  },
});
