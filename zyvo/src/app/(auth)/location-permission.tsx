import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Animated,
  Easing,
  Platform,
  useWindowDimensions,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { FONTS } from '../../constants/fonts';
import { useAuthStore } from '../../store/authStore';

export default function LocationPermission() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const isLarge = width > 768;

  // Entrance animations
  const pageOpacity = useRef(new Animated.Value(0)).current;
  const contentSlideY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(pageOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(contentSlideY, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const setLocationPrompted = useAuthStore((state) => state.setLocationPermissionPrompted);

  const handleEnableLocation = () => {
    setLocationPrompted(true);
    Alert.alert(
      'Location Access',
      'ZYVO requires your location to display study spaces and calculate walking distances.',
      [
        {
          text: "Don't Allow",
          style: 'cancel',
          onPress: () => {
            const { notificationPermissionPrompted } = useAuthStore.getState();
            if (notificationPermissionPrompted) {
              router.push('/(auth)/login');
            } else {
              router.push('/(auth)/notification-permission');
            }
          },
        },
        {
          text: 'Allow While Using App',
          onPress: () => {
            const { notificationPermissionPrompted } = useAuthStore.getState();
            if (notificationPermissionPrompted) {
              router.push('/(auth)/login');
            } else {
              router.push('/(auth)/notification-permission');
            }
          },
        },
      ]
    );
  };

  const handleNotNow = () => {
    setLocationPrompted(true);
    const { notificationPermissionPrompted } = useAuthStore.getState();
    if (notificationPermissionPrompted) {
      router.push('/(auth)/login');
    } else {
      router.push('/(auth)/notification-permission');
    }
  };

  return (
    <Animated.View style={[styles.container, { opacity: pageOpacity }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={[styles.scrollContent, isLarge && styles.largeContainer]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top Hero Section (occupies about 45% of the screen) */}
          <View style={[styles.heroContainer, { height: height * 0.42 }]}>
            <View style={styles.circleBg} />
            <Image
              source={require('../../../assets/images/location_hero.png')}
              style={styles.heroImage}
              resizeMode="contain"
            />
          </View>

          {/* Text and Actions Section */}
          <Animated.View style={[styles.bodyContainer, { transform: [{ translateY: contentSlideY }] }]}>
            {/* Headline */}
            <Text style={styles.headline}>Allow Location Access</Text>

            {/* Description */}
            <Text style={styles.description}>
              Find nearby libraries, study halls, and quiet cafés around you. Your location is only used to personalize recommendations and is never shared with anyone.
            </Text>

            {/* Action Buttons */}
            <View style={styles.actionBlock}>
              {/* Primary Button */}
              <TouchableOpacity
                style={styles.primaryCta}
                onPress={handleEnableLocation}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={['#6366F1', '#4F7EFF']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.ctaGradient}
                >
                  <View style={styles.primaryBtnContent}>
                    <Feather name="navigation" size={16} color="#FFFFFF" style={styles.gpsBtnIcon} />
                    <Text style={styles.primaryCtaText}>Allow Location Access</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>

              {/* Secondary Button */}
              <TouchableOpacity onPress={handleNotNow} activeOpacity={0.7} style={styles.skipBtn}>
                <Text style={styles.skipText}>Not Now</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Bottom Note (Privacy reassurance) */}
          <Animated.View style={[styles.privacyContainer, { transform: [{ translateY: contentSlideY }] }]}>
            <View style={styles.privacyHeader}>
              <Feather name="shield" size={14} color="#22C7A9" style={styles.shieldIcon} />
              <Text style={styles.privacyText}>
                Your privacy comes first. You control your location anytime in Settings.
              </Text>
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Clean white background
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingTop: Platform.OS === 'ios' ? 20 : 10,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
  },
  largeContainer: {
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
  },
  heroContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginTop: 10,
  },
  circleBg: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(99, 102, 241, 0.04)', // subtle circular gradient behind
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  bodyContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  headline: {
    fontFamily: FONTS.bold,
    fontSize: 28,
    color: '#111827',
    textAlign: 'center',
    fontWeight: 'bold',
    lineHeight: 34,
    letterSpacing: -0.6,
    marginBottom: 12,
  },
  description: {
    fontFamily: FONTS.regular,
    fontSize: 15,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: '94%',
    marginBottom: 32,
  },
  actionBlock: {
    width: '100%',
    alignItems: 'center',
  },
  primaryCta: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  ctaGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gpsBtnIcon: {
    marginRight: 8,
  },
  primaryCtaText: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  skipBtn: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginTop: 8,
  },
  skipText: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: '#6B7280',
  },
  privacyContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  privacyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  shieldIcon: {
    marginRight: 8,
  },
  privacyText: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
    maxWidth: '90%',
  },
});
