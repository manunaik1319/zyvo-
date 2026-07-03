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
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { FONTS } from '../../constants/fonts';
import LogoWordmark from '../../components/common/LogoWordmark';

const PRIMARY_COLOR = '#4F46E5';

export default function ForgotPassword() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('');
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(16)).current;
  const btnScale = useRef(new Animated.Value(1)).current;

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
  }, []);

  const validateEmail = (val: string) => {
    if (!val) {
      return 'Email address is required.';
    }
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(val)) {
      return 'Please enter a valid email address.';
    }
    return '';
  };

  const handleEmailChange = (val: string) => {
    setEmail(val);
    if (hasSubmitted) setEmailError(validateEmail(val));
  };

  const handleSubmit = () => {
    setHasSubmitted(true);
    const err = validateEmail(email);
    setEmailError(err);

    if (err) {
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
      router.push({
        pathname: '/(auth)/otp',
        params: { email: email.toLowerCase() },
      });
    }, 1500);
  };

  const handlePressIn = () => {
    Animated.spring(btnScale, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(btnScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

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
          colors={['transparent', 'rgba(6, 182, 212, 0.02)', 'rgba(6, 182, 212, 0.08)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.5, y: 0.5 }}
          style={{ flex: 1, borderRadius: 200 }}
        />
      </View>

      <SafeAreaView style={{ flex: 1 }}>
        {/* Back navigation header */}
        <View style={[styles.header, { paddingTop: headerPaddingTop }]}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Feather name="arrow-left" size={20} color="#0F172A" />
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
          >
            <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
              {/* Logo section */}
              <View style={styles.logoContainer}>
                <LogoWordmark />
              </View>

              {/* Form title */}
              <Text style={styles.title}>Forgot Password?</Text>
              <Text style={styles.subtitle}>
                Enter your registered email address below, and we'll send you a 6-digit OTP verification code to reset your password.
              </Text>

              {/* Form field */}
              <View style={styles.formContainer}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email Address</Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      isEmailFocused && styles.inputWrapperFocused,
                      !!emailError && styles.inputWrapperError,
                    ]}
                  >
                    <Feather
                      name="mail"
                      size={18}
                      color={emailError ? '#EF4444' : isEmailFocused ? PRIMARY_COLOR : '#94A3B8'}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. yourname@university.edu"
                      placeholderTextColor="#94A3B8"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      value={email}
                      onChangeText={handleEmailChange}
                      onFocus={() => setIsEmailFocused(true)}
                      onBlur={() => setIsEmailFocused(false)}
                      onSubmitEditing={handleSubmit}
                      returnKeyType="send"
                    />
                  </View>
                  {!!emailError && (
                    <Text style={styles.errorText} accessibilityRole="alert">{emailError}</Text>
                  )}
                </View>

                {/* Submit button */}
                <Animated.View style={{ transform: [{ scale: btnScale }], marginTop: 8 }}>
                  <TouchableOpacity
                    style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
                    activeOpacity={1}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    onPress={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.submitBtnText}>Send Reset Code</Text>
                    )}
                  </TouchableOpacity>
                </Animated.View>
              </View>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFFFF' },
  indigoSplash: { position: 'absolute', top: -120, left: -120, width: 280, height: 280 },
  cyanSplash: { position: 'absolute', bottom: -120, right: -120, width: 320, height: 320 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 8, zIndex: 10 },
  backBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#0F172A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 6, elevation: 1 },
  scrollContent: { paddingHorizontal: 28, paddingBottom: 40, paddingTop: 10 },
  logoContainer: { alignItems: 'center', marginBottom: 26, marginTop: 12 },
  title: { fontFamily: FONTS.bold, fontSize: 24, color: '#0F172A', marginBottom: 8, textAlign: 'center', fontWeight: 'bold' },
  subtitle: { fontFamily: FONTS.regular, fontSize: 13.5, color: '#64748B', lineHeight: 20, textAlign: 'center', marginBottom: 28, paddingHorizontal: 6 },
  formContainer: { gap: 18 },
  inputGroup: { gap: 6 },
  label: { fontFamily: FONTS.bold, fontSize: 12.5, color: '#0F172A', fontWeight: 'bold' },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 12, height: 50, paddingHorizontal: 14 },
  inputWrapperFocused: { borderColor: PRIMARY_COLOR },
  inputWrapperError: { borderColor: '#EF4444' },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontFamily: FONTS.regular, fontSize: 14, color: '#0F172A' },
  errorText: { fontFamily: FONTS.medium, fontSize: 11.5, color: '#EF4444', marginTop: 2 },
  submitBtn: { height: 50, borderRadius: 12, backgroundColor: PRIMARY_COLOR, alignItems: 'center', justifyContent: 'center', shadowColor: PRIMARY_COLOR, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 2 },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { fontFamily: FONTS.bold, fontSize: 15, color: '#FFFFFF', fontWeight: 'bold' },
});
