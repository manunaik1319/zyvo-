import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Animated,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useBookingStore } from '../../store/bookingStore';
import { FONTS } from '../../constants/fonts';

export default function CheckinScreen() {
  const router = useRouter();
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const { getBookingById, checkInBooking } = useBookingStore();
  const { width } = Dimensions.get('window');
  const isLarge = width > 768;

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Scan line animation
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  // Retrieve current booking details
  const booking = bookingId ? getBookingById(bookingId) : null;

  useEffect(() => {
    // Loop scanning line up and down
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/bookings');
    }
  };

  const handleSimulateScan = () => {
    if (!bookingId) {
      Alert.alert('Error', 'Invalid booking reference.');
      return;
    }

    setLoading(true);
    // Simulate check-in QR scan reading latency
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);

      // Save check-in timestamp in store
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      checkInBooking(bookingId, timeStr);

      // Hold success screen for 1 second, then navigate to active focus session
      setTimeout(() => {
        router.replace({
          pathname: '/session/active',
          params: { bookingId },
        } as any);
      }, 1000);
    }, 1500);
  };

  const scanLineTranslateY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 180],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <SafeAreaView style={styles.safeArea}>
        {/* Header Bar */}
        <View style={styles.headerBar}>
          <TouchableOpacity style={styles.backBtn} onPress={handleBack} activeOpacity={0.7}>
            <Feather name="arrow-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>QR Code Check-In</Text>
          <View style={{ width: 44 }} />
        </View>

        <View style={[styles.mainContent, isLarge && styles.largeContainer]}>
          {booking ? (
            <>
              {/* Scan Window Simulator */}
              <View style={styles.scannerWrapper}>
                <View style={styles.scanTarget}>
                  {/* Corner brackets */}
                  <View style={[styles.corner, styles.topLeft]} />
                  <View style={[styles.corner, styles.topRight]} />
                  <View style={[styles.corner, styles.bottomLeft]} />
                  <View style={[styles.corner, styles.bottomRight]} />

                  {/* Simulated Camera Feed & Scan animation */}
                  <View style={styles.cameraPlaceholder}>
                    {success ? (
                      <Ionicons name="checkmark-circle" size={64} color="#22C7A9" />
                    ) : loading ? (
                      <ActivityIndicator size="large" color="#4F7EFF" />
                    ) : (
                      <>
                        <Ionicons name="qr-code-outline" size={80} color="rgba(255,255,255,0.4)" />
                        <Animated.View 
                          style={[
                            styles.scanLine, 
                            { transform: [{ translateY: scanLineTranslateY }] }
                          ]} 
                        />
                      </>
                    )}
                  </View>
                </View>
                <Text style={styles.scanHelpText}>
                  {success 
                    ? 'Check-In Successful! Redirecting...' 
                    : loading 
                      ? 'Reading QR code...' 
                      : 'Align QR Code on the study table with the camera frame'}
                </Text>
              </View>

              {/* Booking Info Card */}
              <View style={styles.infoCard}>
                <Text style={styles.infoSubtitle}>CURRENT SESSION DETAILS</Text>
                <Text style={styles.infoTitle}>{booking.spaceName}</Text>
                
                <View style={styles.detailsGrid}>
                  <View style={styles.detailCol}>
                    <Text style={styles.detailLabel}>Seat</Text>
                    <Text style={styles.detailValue}>{booking.seatId || 'N/A'}</Text>
                  </View>
                  <View style={styles.detailCol}>
                    <Text style={styles.detailLabel}>Floor</Text>
                    <Text style={styles.detailValue}>{booking.floor || '1'}</Text>
                  </View>
                  <View style={styles.detailCol}>
                    <Text style={styles.detailLabel}>Duration</Text>
                    <Text style={styles.detailValue}>{booking.hours} Hours</Text>
                  </View>
                </View>
                
                <View style={styles.timeRow}>
                  <Feather name="clock" size={13} color="#64748B" />
                  <Text style={styles.timeText}>{booking.timeSlot}</Text>
                </View>
              </View>

              {/* Scan Trigger Button */}
              {!success && (
                <TouchableOpacity
                  style={[styles.scanBtn, loading && styles.scanBtnDisabled]}
                  onPress={handleSimulateScan}
                  disabled={loading}
                  activeOpacity={0.9}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons name="scan-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                      <Text style={styles.scanBtnText}>Simulate QR Scan</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </>
          ) : (
            <View style={styles.errorContainer}>
              <Ionicons name="warning-outline" size={48} color="#EF4444" />
              <Text style={styles.errorTitle}>Booking not found</Text>
              <Text style={styles.errorSubtitle}>
                No check-in reference found. Make sure you book a seat first.
              </Text>
              <TouchableOpacity style={styles.returnBtn} onPress={handleBack} activeOpacity={0.8}>
                <Text style={styles.returnBtnText}>Back to Bookings</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A', // Premium dark scanner UI
  },
  safeArea: {
    flex: 1,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: 56,
  },
  backBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  largeContainer: {
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
  },
  scannerWrapper: {
    alignItems: 'center',
    marginBottom: 40,
  },
  scanTarget: {
    width: 200,
    height: 200,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  cameraPlaceholder: {
    width: 180,
    height: 180,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 3,
    backgroundColor: '#4F7EFF',
    shadowColor: '#4F7EFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: '#4F7EFF',
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderBottomWidth: 0,
    borderRightWidth: 0,
    borderTopLeftRadius: 12,
  },
  topRight: {
    top: 0,
    right: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderTopRightRadius: 12,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderBottomLeftRadius: 12,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderBottomRightRadius: 12,
  },
  scanHelpText: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    maxWidth: 240,
    lineHeight: 18,
  },
  infoCard: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#334155',
  },
  infoSubtitle: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    color: '#94A3B8',
    letterSpacing: 1.5,
    marginBottom: 6,
    fontWeight: 'bold',
  },
  infoTitle: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 16,
  },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: 14,
  },
  detailCol: {
    alignItems: 'center',
    flex: 1,
  },
  detailLabel: {
    fontFamily: FONTS.medium,
    fontSize: 11,
    color: '#64748B',
  },
  detailValue: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginTop: 2,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0F172A',
    padding: 10,
    borderRadius: 10,
    justifyContent: 'center',
  },
  timeText: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: '#94A3B8',
  },
  scanBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4F7EFF',
    height: 56,
    borderRadius: 28,
    width: '100%',
    shadowColor: '#4F7EFF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 3,
  },
  scanBtnDisabled: {
    opacity: 0.8,
  },
  scanBtnText: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorTitle: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 6,
  },
  errorSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
  },
  returnBtn: {
    backgroundColor: '#334155',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  returnBtnText: {
    fontFamily: FONTS.bold,
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
});
