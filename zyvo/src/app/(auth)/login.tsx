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
import { Feather, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { FONTS } from '../../constants/fonts';
import { useAuthStore } from '../../store/authStore';
import LogoWordmark from '../../components/common/LogoWordmark';

const PRIMARY_COLOR = '#4F46E5';

export default function Login() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const setUser = useAuthStore((state) => state.setUser);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Focus states
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  // Validation / interaction states
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Refs for fields
  const passwordRef = useRef<TextInput>(null);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(16)).current;
  const btnScale = useRef(new Animated.Value(1)).current;
  const googleScale = useRef(new Animated.Value(1)).current;

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

  // Validation functions
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

  const validatePassword = (val: string) => {
    if (!val) {
      return 'Password is required.';
    }
    return '';
  };

  const handleEmailChange = (val: string) => {
    setEmail(val);
    if (hasSubmitted) {
      setEmailError(validateEmail(val));
    }
  };

  const handlePasswordChange = (val: string) => {
    setPassword(val);
    if (hasSubmitted) {
      setPasswordError(validatePassword(val));
    }
  };

  const handleSignIn = () => {
    setHasSubmitted(true);
    const eErr = validateEmail(email);
    const pErr = validatePassword(password);
    
    setEmailError(eErr);
    setPasswordError(pErr);

    if (eErr || pErr) {
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
      router.replace('/(tabs)/home');
    }, 1200);
  };

  const handleGoogleSignIn = () => {
    setLoading(true);
    if (Platform.OS !== 'web') {
      Vibration.vibrate(10);
    }
    setTimeout(() => {
      setLoading(false);
      setUser({
        id: 'u1',
        name: 'Sarah Jenkins',
        email: 's.jenkins@stanford.edu',
        university: 'Stanford University',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
        stats: {
          focusHours: 0,
          bookingsCount: 0,
          savedSpaces: 0,
        },
      });
      router.replace('/(tabs)/home');
    }, 1200);
  };

  const animateButton = (val: Animated.Value, toValue: number) => {
    Animated.spring(val, {
      toValue,
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
          colors={['rgba(6, 182, 212, 0.10)', 'rgba(6, 182, 212, 0.02)', 'transparent']}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1, borderRadius: 180 }}
        />
      </View>

      <SafeAreaView style={styles.safeArea}>
        {/* Header Navigation */}
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

              {/* Title Header */}
              <View style={styles.titleWrapper}>
                <Text style={styles.headline}>Welcome Back</Text>
                <Text style={styles.subtitle}>
                  Sign in to continue your study journey.
                </Text>
              </View>

              {/* Form group fields */}
              <View style={styles.form}>
                
                {/* Email Field */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Email Address</Text>
                  <View style={[
                    styles.inputContainer,
                    isEmailFocused && styles.inputContainerFocused,
                    !!emailError && styles.inputContainerError,
                  ]}>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Enter your email"
                      placeholderTextColor="#94A3B8"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoFocus={true}
                      value={email}
                      onChangeText={handleEmailChange}
                      onFocus={() => setIsEmailFocused(true)}
                      onBlur={() => setIsEmailFocused(false)}
                      onSubmitEditing={() => passwordRef.current?.focus()}
                      returnKeyType="next"
                    />
                  </View>
                  {!!emailError && (
                    <Text style={styles.errorText} accessibilityRole="alert">{emailError}</Text>
                  )}
                </View>

                {/* Password Field */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Password</Text>
                  <View style={[
                    styles.inputContainer,
                    isPasswordFocused && styles.inputContainerFocused,
                    !!passwordError && styles.inputContainerError,
                  ]}>
                    <TextInput
                      ref={passwordRef}
                      style={styles.textInput}
                      placeholder="Enter your password"
                      placeholderTextColor="#94A3B8"
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      value={password}
                      onChangeText={handlePasswordChange}
                      onFocus={() => setIsPasswordFocused(true)}
                      onBlur={() => setIsPasswordFocused(false)}
                      onSubmitEditing={handleSignIn}
                      returnKeyType="done"
                    />
                    <TouchableOpacity
                      style={styles.eyeBtn}
                      onPress={() => setShowPassword(!showPassword)}
                      activeOpacity={0.7}
                      accessibilityLabel={showPassword ? "Hide password" : "Show password"}
                    >
                      <Feather
                        name={showPassword ? 'eye-off' : 'eye'}
                        size={20}
                        color="#6B7280"
                      />
                    </TouchableOpacity>
                  </View>
                  {!!passwordError && (
                    <Text style={styles.errorText} accessibilityRole="alert">{passwordError}</Text>
                  )}
                </View>

                {/* Forgot Password */}
                <TouchableOpacity
                  style={styles.forgotBtn}
                  onPress={() => router.push('/(auth)/forgot-password' as any)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.forgotBtnText}>Forgot Password?</Text>
                </TouchableOpacity>

              </View>

              {/* Primary CTA Sign In button */}
              <Animated.View style={{ transform: [{ scale: btnScale }], width: '100%', marginTop: 24 }}>
                <TouchableOpacity
                  style={styles.primaryBtn}
                  disabled={loading}
                  activeOpacity={0.9}
                  onPress={handleSignIn}
                  onPressIn={() => animateButton(btnScale, 0.96)}
                  onPressOut={() => animateButton(btnScale, 1)}
                  accessibilityRole="button"
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.btnText}>Sign In</Text>
                  )}
                </TouchableOpacity>
              </Animated.View>

              {/* Divider */}
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerTxt}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Google CTA */}
              <Animated.View style={{ transform: [{ scale: googleScale }], width: '100%' }}>
                <TouchableOpacity
                  style={styles.googleBtn}
                  activeOpacity={0.95}
                  disabled={loading}
                  onPress={handleGoogleSignIn}
                  onPressIn={() => animateButton(googleScale, 0.96)}
                  onPressOut={() => animateButton(googleScale, 1)}
                  accessibilityRole="button"
                  accessibilityLabel="Continue with Google"
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#111827" />
                  ) : (
                    <View style={styles.googleBtnContent}>
                      <Svg width={18} height={18} viewBox="0 0 24 24" style={{ marginRight: 12 }}>
                        <Path
                          fill="#EA4335"
                          d="M23.49 12.275c0-.825-.075-1.62-.21-2.385H12v4.515h6.45a5.52 5.52 0 0 1-2.385 3.63v3.015h3.84c2.25-2.07 3.585-5.115 3.585-8.775z"
                        />
                        <Path
                          fill="#FBBC05"
                          d="M12 24c3.24 0 5.955-1.08 7.935-2.91l-3.84-3.015c-1.065.72-2.43 1.155-4.095 1.155-3.15 0-5.82-2.13-6.78-4.995H1.23v3.12A12.003 12.003 0 0 0 12 24z"
                        />
                        <Path
                          fill="#34A853"
                          d="M5.22 14.235a7.173 7.173 0 0 1 0-2.475v-3.12H1.23a11.97 11.97 0 0 0 0 8.715l3.99-3.12z"
                        />
                        <Path
                          fill="#4285F4"
                          d="M12 4.75c1.77 0 3.36.61 4.605 1.8l3.45-3.45C17.94 1.19 15.22.5 12 .5A12.003 12.003 0 0 0 1.23 9.3l3.99 3.12c.96-2.865 3.63-4.995 6.78-4.995z"
                        />
                      </Svg>
                      <Text style={styles.googleBtnTxt}>Continue with Google</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </Animated.View>

              {/* Bottom register redirect */}
              <TouchableOpacity
                style={styles.signupRedirect}
                onPress={() => router.push('/(auth)/register')}
                activeOpacity={0.7}
              >
                <Text style={styles.redirectText}>
                  Don't have an account? <Text style={styles.redirectLinkText}>Sign Up</Text>
                </Text>
              </TouchableOpacity>

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
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
    width: '100%',
  },
  inputLabel: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    marginBottom: 8,
    fontWeight: '500',
    color: '#6B7280',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 16,
    height: 56,
    paddingHorizontal: 16,
    backgroundColor: '#F8FAFC', // filled style subtle gray background
    borderColor: '#F1F5F9',
  },
  inputContainerFocused: {
    borderColor: PRIMARY_COLOR,
    backgroundColor: '#F8FAFC',
  },
  inputContainerError: {
    borderColor: '#EF4444',
  },
  textInput: {
    flex: 1,
    fontFamily: FONTS.regular,
    fontSize: 14.5,
    height: '100%',
    color: '#111827',
  },
  eyeBtn: {
    padding: 8,
    marginRight: -8,
  },
  errorText: {
    fontFamily: FONTS.medium,
    fontSize: 11.5,
    color: '#EF4444',
    marginTop: 6,
    paddingHorizontal: 4,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginTop: -8,
    paddingVertical: 8,
  },
  forgotBtnText: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: PRIMARY_COLOR,
    fontWeight: 'bold',
  },
  primaryBtn: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    backgroundColor: PRIMARY_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    fontFamily: FONTS.bold,
    fontSize: 15.5,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
    width: '100%',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerTxt: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    marginHorizontal: 16,
    fontWeight: 'bold',
    color: '#9CA3AF',
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderRadius: 16,
    height: 56,
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  googleBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleBtnTxt: {
    fontFamily: FONTS.bold,
    fontSize: 14.5,
    fontWeight: 'bold',
    color: '#111827',
  },
  signupRedirect: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 28,
    paddingVertical: 12,
  },
  redirectText: {
    fontFamily: FONTS.medium,
    fontSize: 13.5,
    color: '#6B7280',
  },
  redirectLinkText: {
    fontFamily: FONTS.bold,
    color: PRIMARY_COLOR,
    fontWeight: 'bold',
  },
});
