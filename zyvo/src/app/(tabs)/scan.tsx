import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  Animated,
  Dimensions,
  Easing,
  Vibration,
  Platform,
  Linking,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useBookingStore } from '../../store/bookingStore';
import { FONTS } from '../../constants/fonts';

const { width: W } = Dimensions.get('window');
const FRAME = W - 80;

export default function ScanScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { bookings, checkInBooking } = useBookingStore();

  const [scanning, setScanning] = useState(true);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const scanLineY = useRef(new Animated.Value(0)).current;
  const successScale = useRef(new Animated.Value(0.3)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;
  const pulseScale = useRef(new Animated.Value(1)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;

  const activeBooking = bookings.find((b) => b.status === 'active' && b.checkInStatus === 'not_checked_in');

  useEffect(() => {
    Animated.timing(fadeIn, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    startScanLine();
  }, []);

  const startScanLine = () => {
    scanLineY.setValue(0);
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineY, { toValue: 1, duration: 2200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(scanLineY, { toValue: 0, duration: 2200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  };

  const handleScan = () => {
    if (loading || success) return;
    setLoading(true);
    setTimeout(() => {
      if (activeBooking) {
        checkInBooking(activeBooking.id, new Date().toISOString());
      }
      setSuccess(true);
      setScanning(false);
      setLoading(false);

      // Trigger welcome screen animations
      Animated.parallel([
        Animated.spring(successScale, { toValue: 1, useNativeDriver: true, tension: 100, friction: 6 }),
        Animated.timing(successOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]).start(() => {
        if (Platform.OS !== 'web') {
          Vibration.vibrate(20);
        }
        // Pulse loop animation
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseScale, { toValue: 1.08, duration: 600, useNativeDriver: true }),
            Animated.timing(pulseScale, { toValue: 1, duration: 600, useNativeDriver: true }),
          ])
        ).start();
      });
    }, 1200);
  };

  const scanTranslate = scanLineY.interpolate({
    inputRange: [0, 1],
    outputRange: [0, FRAME - 4],
  });

  // ─── CHECK-IN SUCCESSFUL VIEW ──────────────────────────────────────
  if (success) {
    const spaceName = activeBooking?.spaceName || 'Focus Library';
    const seatId = activeBooking?.seatId || 'B12';
    const slot = activeBooking?.timeSlot || '2:00 PM – 5:00 PM';
    const bookingId = activeBooking?.id || 'ZYV-248193';

    return (
      <View style={styles.root}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.successScroll}>
          {/* SUCCESS ANIMATION CHECK */}
          <View style={styles.animationContainer}>
            <Animated.View style={[styles.pulseOuterCircle, { transform: [{ scale: pulseScale }], opacity: successOpacity }]} />
            <Animated.View style={[styles.checkCircle, { transform: [{ scale: successScale }], opacity: successOpacity }]}>
              <Ionicons name="checkmark" size={36} color="#FFFFFF" />
            </Animated.View>
          </View>

          {/* WELCOME MESSAGES */}
          <Text style={styles.successTitle}>Check-In Successful! ✅</Text>
          <Text style={styles.successSub}>
            Welcome to <Text style={{ fontFamily: FONTS.bold, color: '#111827' }}>{spaceName}</Text>.{'\n'}
            Your study session has started successfully. Enjoy your focused study time.
          </Text>

          {/* ACTIVE SESSION CARD */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardIndicator}>🟢 Session Active</Text>
              <View style={styles.statusBadge}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Active</Text>
              </View>
            </View>
            <Text style={styles.cardTitle}>{spaceName}</Text>
            <Text style={styles.cardSeat}>Seat {seatId}</Text>
            <Text style={styles.cardTime}>Time: {slot}</Text>

            <View style={styles.divider} />

            <View style={styles.cardDetailsRow}>
              <View>
                <Text style={styles.label}>Remaining Time</Text>
                <Text style={styles.val}>2h 59m</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.label}>Booking ID</Text>
                <Text style={styles.val}>{bookingId}</Text>
              </View>
            </View>
          </View>

          {/* STUDY SPACE INFORMATION */}
          <Text style={styles.sectionTitle}>Study Space Information</Text>
          <View style={styles.card}>
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Feather name="wifi" size={14} color="#6B7280" style={{ marginRight: 8 }} />
                <Text style={styles.infoText}>High-Speed Wi-Fi</Text>
              </View>
              <View style={styles.infoItem}>
                <Feather name="zap" size={14} color="#6B7280" style={{ marginRight: 8 }} />
                <Text style={styles.infoText}>Charging Point Available</Text>
              </View>
              <View style={styles.infoItem}>
                <Feather name="wind" size={14} color="#6B7280" style={{ marginRight: 8 }} />
                <Text style={styles.infoText}>Air Conditioned</Text>
              </View>
              <View style={styles.infoItem}>
                <Feather name="volume-x" size={14} color="#6B7280" style={{ marginRight: 8 }} />
                <Text style={styles.infoText}>Silent Zone</Text>
              </View>
              <View style={styles.infoItem}>
                <Feather name="user" size={14} color="#6B7280" style={{ marginRight: 8 }} />
                <Text style={styles.infoText}>Washroom Nearby</Text>
              </View>
              <View style={styles.infoItem}>
                <Feather name="coffee" size={14} color="#6B7280" style={{ marginRight: 8 }} />
                <Text style={styles.infoText}>Café Available</Text>
              </View>
            </View>
          </View>

          {/* QUICK ACTIONS */}
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionBtn} activeOpacity={0.8} onPress={() => Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(spaceName)}`)}>
              <Feather name="navigation" size={14} color="#4F7EFF" style={{ marginRight: 6 }} />
              <Text style={styles.actionBtnTxt}>Get Directions</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} activeOpacity={0.8} onPress={() => router.push('/session/active' as any)}>
              <Feather name="clock" size={14} color="#4F7EFF" style={{ marginRight: 6 }} />
              <Text style={styles.actionBtnTxt}>Extend Session</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} activeOpacity={0.8}>
              <Feather name="phone" size={14} color="#4F7EFF" style={{ marginRight: 6 }} />
              <Text style={styles.actionBtnTxt}>Contact Reception</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} activeOpacity={0.8}>
              <Feather name="help-circle" size={14} color="#4F7EFF" style={{ marginRight: 6 }} />
              <Text style={styles.actionBtnTxt}>Need Help</Text>
            </TouchableOpacity>
          </View>

          {/* STUDY TIPS CARD */}
          <View style={[styles.card, styles.tipsCard]}>
            <Feather name="info" size={16} color="#4F7EFF" style={{ marginRight: 10, marginTop: 2 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.tipsTitle}>Have a productive session</Text>
              <Text style={styles.tipsText}>
                • Keep your phone on silent.{'\n'}
                • Maintain a quiet environment.{'\n'}
                • Please check out before your booking ends.
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* STICKY BOTTOM ACTIONS */}
        <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <TouchableOpacity
            style={styles.primaryBtn}
            activeOpacity={0.85}
            onPress={() => router.push({ pathname: '/session/active', params: { bookingId } } as any)}
          >
            <Text style={styles.primaryBtnText}>Go to Active Session</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.push('/(tabs)/home')} activeOpacity={0.8}>
            <Text style={styles.secondaryBtnTxt}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ─── SCANNER STATE ──────────────────────────────────────────────────
  return (
    <Animated.View style={[styles.root, { opacity: fadeIn, paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <Feather name="arrow-left" size={20} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Check In</Text>
        <View style={{ width: 40 }} />
      </View>

      <Text style={styles.instruction}>
        Scan the QR code at your study space entrance
      </Text>

      {/* SCANNER FRAME */}
      <View style={styles.scannerArea}>
        {/* Dark overlay sides */}
        <View style={styles.overlayTop} />
        <View style={styles.overlayRow}>
          <View style={styles.overlaySide} />
          {/* The frame */}
          <View style={styles.frame}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />

            {/* Animated scan line */}
            <Animated.View style={[styles.scanLine, { transform: [{ translateY: scanTranslate }] }]}>
              <LinearGradient
                colors={['transparent', '#4F7EFF', '#4F7EFF', 'transparent']}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={{ flex: 1, height: 2, borderRadius: 1 }}
              />
            </Animated.View>
          </View>
          <View style={styles.overlaySide} />
        </View>
        <View style={styles.overlayBottom} />
      </View>

      {/* READY BOOKING CARD */}
      {activeBooking ? (
        <View style={styles.bookingCard}>
          <View style={styles.bookingCardHeader}>
            <Text style={styles.bookingSpace}>{activeBooking.spaceName || 'StudyHub Library'}</Text>
            <View style={styles.readyBadge}>
              <View style={styles.readyDot} />
              <Text style={styles.readyText}>Ready to Check In</Text>
            </View>
          </View>
          <View style={styles.bookingRow}>
            <View style={styles.bookingDetail}>
              <Feather name="map-pin" size={13} color="#6B7280" />
              <Text style={styles.bookingDetailText}>Seat {activeBooking.seatId || 'A-12'}</Text>
            </View>
            <View style={styles.bookingDetail}>
              <Feather name="clock" size={13} color="#6B7280" />
              <Text style={styles.bookingDetailText}>{activeBooking.timeSlot || '10:00 AM – 12:00 PM'}</Text>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.noBookingCard}>
          <Feather name="calendar" size={28} color="#9CA3AF" style={{ marginBottom: 8 }} />
          <Text style={styles.noBookingText}>No active booking found</Text>
          <Text style={styles.noBookingSub}>Book a space first to check in</Text>
        </View>
      )}

      {/* SIMULATE SCAN */}
      <TouchableOpacity style={styles.scanSimulateBtn} onPress={handleScan} activeOpacity={0.85} disabled={loading}>
        <LinearGradient
          colors={loading ? ['#9CA3AF', '#9CA3AF'] : ['#6B7CFF', '#4F7EFF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.scanSimulateGrad}
        >
          <Ionicons name="qr-code-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.scanSimulateTxt}>{loading ? 'Verifying...' : 'Simulate QR Scan'}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8FAFC' },

  // Header styles
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 14, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E8EEF8' },
  backBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: FONTS.bold, fontSize: 18, color: '#111827' },

  instruction: { fontFamily: FONTS.medium, fontSize: 13, color: '#6B7280', textAlign: 'center', marginTop: 20, marginBottom: 14 },

  // Scan layout overlays
  scannerArea: { flex: 1, position: 'relative' },
  overlayTop: { position: 'absolute', top: 0, left: 0, right: 0, height: 40, backgroundColor: 'rgba(15,23,42,0.4)' },
  overlayRow: { position: 'absolute', top: 40, left: 0, right: 0, height: FRAME, flexDirection: 'row' },
  overlaySide: { flex: 1, backgroundColor: 'rgba(15,23,42,0.4)' },
  overlayBottom: { position: 'absolute', top: 40 + FRAME, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15,23,42,0.4)' },
  frame: { width: FRAME, height: FRAME, borderRadius: 24, backgroundColor: 'rgba(248,250,252,0.05)', borderWidth: 1, borderColor: 'rgba(79,126,255,0.15)', overflow: 'hidden', position: 'relative' },
  corner: { position: 'absolute', width: 28, height: 28, borderColor: '#4F7EFF', borderWidth: 3 },
  cornerTL: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 12 },
  cornerTR: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 12 },
  cornerBL: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 12 },
  cornerBR: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 12 },
  scanLine: { position: 'absolute', left: 12, right: 12, height: 2 },

  // Ready booking cards
  bookingCard: { marginHorizontal: 20, backgroundColor: '#FFFFFF', borderRadius: 20, padding: 18, marginBottom: 20, borderWidth: 1, borderColor: '#E8EEF8' },
  bookingCardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  bookingSpace: { fontFamily: FONTS.bold, fontSize: 16, color: '#111827', flex: 1 },
  bookingRow: { flexDirection: 'row', gap: 16 },
  bookingDetail: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  bookingDetailText: { fontFamily: FONTS.medium, fontSize: 13, color: '#6B7280' },
  readyBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#ECFDF5', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  readyDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981' },
  readyText: { fontFamily: FONTS.bold, fontSize: 11, color: '#10B981' },
  noBookingCard: { marginHorizontal: 20, backgroundColor: '#FFFFFF', borderRadius: 20, padding: 28, marginBottom: 20, alignItems: 'center', borderWidth: 1, borderColor: '#E8EEF8' },
  noBookingText: { fontFamily: FONTS.bold, fontSize: 15, color: '#374151', marginBottom: 4 },
  noBookingSub: { fontFamily: FONTS.regular, fontSize: 13, color: '#9CA3AF' },

  // Simulate CTA
  scanSimulateBtn: { marginHorizontal: 20, marginBottom: 24, borderRadius: 16, overflow: 'hidden' },
  scanSimulateGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16 },
  scanSimulateTxt: { fontFamily: FONTS.bold, fontSize: 15, color: '#FFFFFF' },

  // ─── CHECK-IN SUCCESSFUL STYLING ──────────────────────────────────
  successScroll: { paddingHorizontal: 20, paddingBottom: 160 },
  animationContainer: { alignSelf: 'center', marginTop: 32, marginBottom: 20, width: 80, height: 80, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  pulseOuterCircle: { position: 'absolute', width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(34,220,94,0.12)', borderWidth: 1, borderColor: 'rgba(34,220,94,0.2)' },
  checkCircle: { width: 68, height: 68, borderRadius: 34, backgroundColor: '#22C55E', justifyContent: 'center', alignItems: 'center', shadowColor: '#22C55E', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 6 },
  successTitle: { fontFamily: FONTS.bold, fontSize: 22, color: '#111827', textAlign: 'center', marginBottom: 8 },
  successSub: { fontFamily: FONTS.medium, fontSize: 13, color: '#6B7280', textAlign: 'center', lineHeight: 20, marginBottom: 24 },

  card: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#E8EEF8', shadowColor: '#111827', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  cardIndicator: { fontFamily: FONTS.bold, fontSize: 11, color: '#22C55E' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0FDF4', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#22C55E', marginRight: 5 },
  statusText: { fontFamily: FONTS.bold, fontSize: 10.5, color: '#15803D' },
  cardTitle: { fontFamily: FONTS.bold, fontSize: 18, color: '#111827', marginBottom: 2 },
  cardSeat: { fontFamily: FONTS.medium, fontSize: 13, color: '#6B7280', marginBottom: 2 },
  cardTime: { fontFamily: FONTS.medium, fontSize: 13, color: '#6B7280' },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 14 },
  cardDetailsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { fontFamily: FONTS.medium, fontSize: 11, color: '#9CA3AF', marginBottom: 2 },
  val: { fontFamily: FONTS.bold, fontSize: 13, color: '#111827' },

  sectionTitle: { fontFamily: FONTS.bold, fontSize: 15, color: '#111827', marginTop: 18, marginBottom: 10 },

  // Info details grid
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  infoItem: { width: (W - 56) / 2, flexDirection: 'row', alignItems: 'center', paddingVertical: 2 },
  infoText: { fontFamily: FONTS.medium, fontSize: 12.5, color: '#4B5563' },

  // Actions row
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  actionBtn: { width: (W - 50) / 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 16, height: 44 },
  actionBtnTxt: { fontFamily: FONTS.bold, fontSize: 12, color: '#4F7EFF' },

  // Tips styling
  tipsCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#EEF2FF', borderColor: '#C7D8FF' },
  tipsTitle: { fontFamily: FONTS.bold, fontSize: 13, color: '#374151', marginBottom: 4 },
  tipsText: { fontFamily: FONTS.medium, fontSize: 11.5, color: '#6B7280', lineHeight: 18 },

  // Sticky bottom actions bar
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E8EEF8', paddingHorizontal: 20, paddingTop: 12, shadowColor: '#111827', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.04, shadowRadius: 10, elevation: 10 },
  primaryBtn: { width: '100%', height: 48, borderRadius: 20, backgroundColor: '#4F7EFF', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  primaryBtnText: { fontFamily: FONTS.bold, fontSize: 14, color: '#FFFFFF' },
  secondaryBtn: { width: '100%', height: 38, justifyContent: 'center', alignItems: 'center' },
  secondaryBtnTxt: { fontFamily: FONTS.bold, fontSize: 13, color: '#6B7280' },
});
