import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  Animated,
  Easing,
  Platform,
  useWindowDimensions,
  Image,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { FONTS } from '../../constants/fonts';
import { useAuthStore } from '../../store/authStore';

const SLIDES = [
  {
    id: 1,
    title: 'Find Your Perfect\nStudy Space',
    subtitle: 'Discover verified libraries, study halls, and quiet cafés near you. Study where you\'re most productive.',
    image: require('../../../assets/images/onboarding_hero1.png'),
  },
  {
    id: 2,
    title: 'Seamless Real-Time\nSeat Bookings',
    subtitle: 'Explore verified learning zones, check live occupancy rates, compare premium amenities, and reserve your spot in seconds.',
    image: require('../../../assets/images/image-2.png'),
  },
  {
    id: 3,
    title: 'Optimize Your Daily\nStudy Streaks',
    subtitle: 'Build consistent learning habits, track focus session durations, and hit your academic milestones with advanced analytics.',
    image: require('../../../assets/images/image-3.png'),
  },
];

export default function Onboarding() {
  const router = useRouter();
  const [activeSlide, setActiveSlide] = useState(0);
  const { width, height } = useWindowDimensions();
  const isLarge = width > 768;
  const [containerWidth, setContainerWidth] = useState(width - 56);

  const scrollRef = useRef<ScrollView>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleLayout = (event: any) => {
    setContainerWidth(event.nativeEvent.layout.width);
  };

  const handleMomentumScrollEnd = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / containerWidth);
    setActiveSlide(index);
  };

  const handleNext = () => {
    if (activeSlide < SLIDES.length - 1) {
      const nextSlide = activeSlide + 1;
      scrollRef.current?.scrollTo({ x: nextSlide * containerWidth, animated: true });
      setActiveSlide(nextSlide);
    } else {
      const { locationPermissionPrompted, notificationPermissionPrompted } = useAuthStore.getState();
      if (!locationPermissionPrompted) {
        router.push('/(auth)/location-permission');
      } else if (!notificationPermissionPrompted) {
        router.push('/(auth)/notification-permission');
      } else {
        router.push('/(auth)/login');
      }
    }
  };

  const handleBack = () => {
    if (activeSlide > 0) {
      const prevSlide = activeSlide - 1;
      scrollRef.current?.scrollTo({ x: prevSlide * containerWidth, animated: true });
      setActiveSlide(prevSlide);
    }
  };

  const handleSkip = () => {
    const { locationPermissionPrompted, notificationPermissionPrompted } = useAuthStore.getState();
    if (!locationPermissionPrompted) {
      router.push('/(auth)/location-permission');
    } else if (!notificationPermissionPrompted) {
      router.push('/(auth)/notification-permission');
    } else {
      router.push('/(auth)/login');
    }
  };

  // (Helpers removed)

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      <SafeAreaView style={[styles.safeArea, isLarge && styles.largeContainer]}>
        {/* Center Info Content & Action buttons */}
        <View style={styles.contentContainer} onLayout={handleLayout}>
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: false }
            )}
            onMomentumScrollEnd={handleMomentumScrollEnd}
            scrollEventThrottle={16}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContentContainer}
          >
            {SLIDES.map((slideItem) => (
              <View key={slideItem.id} style={[styles.slideContainer, { width: containerWidth }]}>
                {/* Slide Image */}
                <Image
                  source={slideItem.image}
                  style={[
                    styles.image,
                    {
                      height: height * 0.38,
                    }
                  ]}
                  resizeMode="contain"
                />

                {/* Headline */}
                <Text style={styles.headline}>{slideItem.title}</Text>

                {/* Description */}
                <Text style={styles.description}>{slideItem.subtitle}</Text>
              </View>
            ))}
          </ScrollView>

          {/* Three onboarding dots */}
          <View style={styles.progressContainer}>
            {SLIDES.map((_, i) => {
              const inputRange = [(i - 1) * containerWidth, i * containerWidth, (i + 1) * containerWidth];

              const dotWidth = scrollX.interpolate({
                inputRange,
                outputRange: [6, 18, 6],
                extrapolate: 'clamp',
              });

              const opacity = scrollX.interpolate({
                inputRange,
                outputRange: [0.4, 1, 0.4],
                extrapolate: 'clamp',
              });

              const backgroundColor = scrollX.interpolate({
                inputRange,
                outputRange: ['#E5E7EB', '#6366F1', '#E5E7EB'],
                extrapolate: 'clamp',
              });

              return (
                <Animated.View
                  key={i}
                  style={[
                    styles.progressDot,
                    {
                      width: dotWidth,
                      opacity,
                      backgroundColor,
                    },
                  ]}
                />
              );
            })}
          </View>

          {/* Action buttons Block */}
          <View style={styles.actionBlock}>
            {/* Primary Gradient Next / Get Started Button */}
            <TouchableOpacity
              style={styles.primaryCta}
              onPress={handleNext}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#6366F1', '#4F46E5']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.ctaGradient}
              >
                <Text style={styles.primaryCtaText}>
                  {activeSlide === SLIDES.length - 1 ? 'Get Started' : 'Next'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Secondary Button */}
            <View style={styles.secondaryRow}>
              {activeSlide === SLIDES.length - 1 ? (
                <TouchableOpacity onPress={handleBack} activeOpacity={0.7} style={styles.skipBtn}>
                  <Text style={styles.skipText}>Back</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={handleSkip} activeOpacity={0.7} style={styles.skipBtn}>
                  <Text style={styles.skipText}>Skip</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    position: 'relative',
  },
  safeArea: {
    flex: 1,
    zIndex: 10,
  },
  largeContainer: {
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContentContainer: {
    alignItems: 'center',
  },
  slideContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingHorizontal: 28,
  },
  image: {
    width: '100%',
    marginBottom: 28,
  },
  headline: {
    fontFamily: FONTS.bold,
    fontSize: 30,
    color: '#111827',
    textAlign: 'center',
    fontWeight: 'bold',
    lineHeight: 36,
    letterSpacing: -0.8,
    marginBottom: 10,
  },
  description: {
    fontFamily: FONTS.regular,
    fontSize: 15,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: '92%',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 14,
  },
  progressDot: {
    height: 6,
    borderRadius: 3,
    marginHorizontal: 4,
  },
  progressDotActive: {
    width: 18,
    backgroundColor: '#6366F1',
  },
  progressDotInactive: {
    width: 6,
    backgroundColor: '#E5E7EB',
  },
  actionBlock: {
    width: '100%',
    alignItems: 'center',
  },
  primaryCta: {
    width: '85%',
    maxWidth: 340,
    height: 50,
    borderRadius: 25,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
    overflow: 'hidden',
  },
  ctaGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryCtaText: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: '#FFFFFF',
  },
  secondaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  skipBtn: {
    paddingVertical: 6,
    paddingHorizontal: 20,
  },
  skipText: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: '#9CA3AF',
  },
});
