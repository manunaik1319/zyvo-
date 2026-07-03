import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  TextInput,
  ActivityIndicator,
  Animated,
  Vibration,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { FONTS } from '../../constants/fonts';
import { useAuthStore } from '../../store/authStore';
import LogoWordmark from '../../components/common/LogoWordmark';

const PRIMARY_COLOR = '#4F46E5';

export default function OtpVerification() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const email = (params?.email as string) || 'your email';

  const setUser = useAuthStore((state) => state.setUser);

  // OTP inputs
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(0);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  // States
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(45);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(16)).current;
  const btnScale = useRef(new Animated.Value(1)).current;

  // Mounting animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 200,
        friction: 14,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto focus first input on mount
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 200);
  }, []);

  // Timer countdown hook
  useEffect(() => {
    if (timer === 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  // Input change handler
  const handleChangeText = (text: string, index: number) => {
    const cleanDigit = text.replace(/[^0-9]/g, '');
    const newOtp = [...otp];
    newOtp[index] = cleanDigit;
    setOtp(newOtp);
    setError('');

    // Shift focus forward
    if (cleanDigit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Backspace key handler
  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    const enteredCode = otp.join('');
    if (enteredCode.length !== 6) {
      setError('Please enter the complete 6-digit verification code.');
      if (Platform.OS !== 'web') {
        Vibration.vibrate(10);
      }
      return;
    }

    setLoading(true);
    if (Platform.OS !== 'web') {
      Vibration.vibrate(12);
    }

    setTimeout(() => {
      setLoading(false);
      // Simulate verification check (standard code is 123456 or any code for demo)
      setUser({
        id: 'u1',
        name: email.split('@')[0],
        email: email.toLowerCase(),
        university: email.includes('stanford') ? 'Stanford University' : 'State University',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop',
        stats: {
          focusHours: 0,
          bookingsCount: 0,
          savedSpaces: 0,
        },
      });
      
      Alert.alert(
        'Verification Successful',
        'Your email address has been verified.',
        [
          {
            text: 'Continue',
            onPress: () => router.replace('/(tabs)/home'),
          }
        ]
      );
    }, 1500);
  };

  const handleResend = () => {
    if (timer > 0) return;
    
    // Clear inputs and error
    setOtp(['', '', '', '', '', '']);
    setError('');
    setTimer(45);

    if (Platform.OS !== 'web') {
      Vibration.vibrate(10);
    }

    // Refocus first field
    inputRefs.current[0]?.focus();

    Alert.alert('Code Resent', 'A new verification code has been sent to your email.');
  };

  const animateButton = (val: Animated.Value, toValue: number) => {
    Animated.spring(val, {
      toValue,
      useNativeDriver: true,
    }).start();
  };

  const isCodeComplete = otp.join('').length === 6;

  const headerPaddingTop = Platform.OS === 'android'
    ? (StatusBar.currentHeight ? StatusBar.currentHeight + 12 : 36)
    : (insets.top || 12);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      {/* Top Left Indigo Splash */}
      <View style={styles.indigoSplash} pointerEvents="none">
        <LinearGradient
          colors={['rgba(99, 102, 241, 0.12)', 'rgba(99, 102, 241, 0.03)', 'transparent']}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1, borderRadius: 200 }}
        />
      </View>

      {/* Bottom Right Cyan Splash */}
      <View style={styles.cyanSplash} pointerEvents="none">
        <LinearGradient
          colors={['rgba(6, 182, 212, 0.10)', 'rgba(6, 182, 212, 0.02)', 'transparent']}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1, borderRadius: 180 }}
        />
      </View>

      <SafeAreaView style={styles.safeArea}>
        {/* Header navigation bar */}
        <View style={[styles.headerBar, { paddingTop: headerPaddingTop }]}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            activeOpacity={0.7}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <Feather name="arrow-left" size={20} color="#111827" />
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollBody}
            keyboardShouldPersistTaps="handled"
          >
            <Animated.View style={[
              styles.contentContainer,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}>
              {/* Brand Logo */}
              <View style={styles.logoWrapper}>
                <LogoWordmark size={36} isLight={false} />
              </View>

              {/* Title descriptions */}
              <View style={styles.titleWrapper}>
                <Text style={styles.headline}>Verify Email</Text>
                <Text style={styles.subtitle}>
                  Enter the 6-digit verification code sent to{'\n'}
                  <Text style={styles.emailHighlight}>{email}</Text>
                </Text>
              </View>

              {/* 6-Digit Grid Input */}
              <View style={styles.otpWrapper}>
                {otp.map((digit, index) => {
                  const isFocused = focusedIndex === index;
                  return (
                    <View
                      key={index}
                      style={[
                        styles.otpBox,
                        isFocused && styles.otpBoxFocused,
                        !!error && styles.otpBoxError,
                      ]}
                    >
                      <TextInput
                        ref={(ref) => { inputRefs.current[index] = ref; }}
                        style={styles.otpInput}
                        keyboardType="number-pad"
                        maxLength={1}
                        value={digit}
                        onChangeText={(text) => handleChangeText(text, index)}
                        onKeyPress={(e) => handleKeyPress(e, index)}
                        onFocus={() => setFocusedIndex(index)}
                        onBlur={() => setFocusedIndex(null)}
                        selectTextOnFocus={true}
                        textAlign="center"
                      />
                    </View>
                  );
                })}
              </View>

              {/* Validation Warning */}
              {!!error && (
                <Text style={styles.errorText} accessibilityRole="alert">
                  {error}
                </Text>
              )}

              {/* Countdown resend block */}
              <View style={styles.resendContainer}>
                {timer > 0 ? (
                  <Text style={styles.resendText}>
                    Resend code in <Text style={styles.timerText}>{timer}s</Text>
                  </Text>
                ) : (
                  <TouchableOpacity
                    onPress={handleResend}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                  >
                    <Text style={styles.resendLink}>Resend Verification Code</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Verify button */}
              <Animated.View style={{ transform: [{ scale: btnScale }], width: '100%', marginTop: 24 }}>
                <TouchableOpacity
                  style={[
                    styles.primaryBtn,
                    (!isCodeComplete || loading) && styles.primaryBtnDisabled,
                  ]}
                  disabled={!isCodeComplete || loading}
                  activeOpacity={0.9}
                  onPress={handleVerify}
                  onPressIn={() => isCodeComplete && animateButton(btnScale, 0.96)}
                  onPressOut={() => isCodeComplete && animateButton(btnScale, 1)}
                  accessibilityRole="button"
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.btnText}>Verify Code</Text>
                  )}
                </TouchableOpacity>
              </Animated.View>

            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Solid pure white background
  },
  safeArea: {
    flex: 1,
  },
  indigoSplash: {
    position: 'absolute',
    top: -60,
    left: -60,
    width: 320,
    height: 320,
    zIndex: -1,
  },
  cyanSplash: {
    position: 'absolute',
    bottom: -60,
    right: -60,
    width: 280,
    height: 280,
    zIndex: -1,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 8,
    zIndex: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  scrollBody: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
  },
  contentContainer: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
  },
  logoWrapper: {
    alignItems: 'center',
    marginBottom: 20,
  },
  titleWrapper: {
    alignItems: 'center',
    marginBottom: 32,
    paddingHorizontal: 12,
  },
  headline: {
    fontFamily: FONTS.bold,
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: -0.6,
    color: '#111827',
  },
  subtitle: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 18.5,
    color: '#6B7280',
  },
  emailHighlight: {
    fontFamily: FONTS.bold,
    color: '#111827',
    fontWeight: 'bold',
  },
  otpWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  otpBox: {
    width: 48,
    height: 56,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    backgroundColor: '#F8FAFC', // filled style subtle gray
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpBoxFocused: {
    borderColor: PRIMARY_COLOR,
  },
  otpBoxError: {
    borderColor: '#EF4444',
  },
  otpInput: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: '#111827',
    width: '100%',
    height: '100%',
  },
  errorText: {
    fontFamily: FONTS.medium,
    fontSize: 11.5,
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 8,
  },
  resendContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    height: 36,
  },
  resendText: {
    fontFamily: FONTS.medium,
    fontSize: 13.5,
    color: '#6B7280',
  },
  timerText: {
    fontFamily: FONTS.bold,
    color: PRIMARY_COLOR,
    fontWeight: 'bold',
  },
  resendLink: {
    fontFamily: FONTS.bold,
    fontSize: 13.5,
    color: PRIMARY_COLOR,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  primaryBtn: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    backgroundColor: PRIMARY_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryBtnDisabled: {
    backgroundColor: '#E2E8F0',
  },
  btnText: {
    fontFamily: FONTS.bold,
    fontSize: 15.5,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
