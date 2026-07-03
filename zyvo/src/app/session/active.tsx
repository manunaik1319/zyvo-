import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Animated,
  Vibration,
  Platform,
  Alert,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { useBookingStore } from '../../store/bookingStore';
import { FONTS } from '../../constants/fonts';

const { width: W } = Dimensions.get('window');
const TIMER_SIZE = 170;
const RADIUS = 75;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function ActiveSessionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const { bookings, activeSessionId, checkOutBooking } = useBookingStore();

  // Find active booking
  const activeBooking = useMemo(() => {
    return bookings.find((b) => b.id === activeSessionId || (b.checkInStatus === 'checked_in' && b.status === 'active'));
  }, [bookings, activeSessionId]);

  // Timer states
  const [secondsLeft, setSecondsLeft] = useState(6138); // 1h 42m 18s default simulation
  const timerFade = useRef(new Animated.Value(0)).current;

  // Real-time ticking countdown timer
  useEffect(() => {
    if (!activeBooking) return;
    
    // Fade in timer circle
    Animated.timing(timerFade, { toValue: 1, duration: 600, useNativeDriver: true }).start();

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          Alert.alert('Session Ended', 'Your scheduled focus session has completed.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeBooking]);

  const formattedTimeLeft = useMemo(() => {
    const hrs = Math.floor(secondsLeft / 3600);
    const mins = Math.floor((secondsLeft % 3600) / 60);
    const secs = secondsLeft % 60;
    
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  }, [secondsLeft]);

  // Stroke offset calculation for circle progress
  const strokeOffset = useMemo(() => {
    const totalDuration = 3 * 3600; // 3 hours total limit
    const progress = Math.max(0, Math.min(1, secondsLeft / totalDuration));
    return CIRCUMFERENCE * (1 - progress);
  }, [secondsLeft]);

  const handleEndSession = () => {
    if (!activeBooking) return;
    Alert.alert(
      'End Study Session',
      'Are you sure you want to checkout and end your study session now?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Session',
          style: 'destructive',
          onPress: () => {
            if (Platform.OS !== 'web') {
              Vibration.vibrate(15);
            }
            checkOutBooking(activeBooking.id, new Date().toISOString(), 5, '', 94);
            router.push('/(tabs)/bookings');
          },
        },
      ]
    );
  };

  const handleExtend = () => {
    Alert.alert('Extend Session', 'Add 1 additional hour for ₹60?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm',
        onPress: () => {
          setSecondsLeft((prev) => prev + 3600);
          Alert.alert('Extended', 'Your session has been extended by 1 hour.');
        },
      },
    ]);
  };

  // ─── EMPTY STATE ───────────────────────────────────────────────────
  if (!activeBooking) {
    return (
      <View style={[styles.root, { paddingTop: insets.top || 14 }]}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.75}>
            <Feather name="arrow-left" size={20} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Active Session</Text>
          <TouchableOpacity style={styles.helpBtn}>
            <Feather name="help-circle" size={20} color="#111827" />
          </TouchableOpacity>
        </View>

        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconBox}>
            <Feather name="activity" size={44} color="#9CA3AF" />
          </View>
          <Text style={styles.emptyTitle}>No Active Session</Text>
          <Text style={styles.emptyDesc}>
            You don't have an active study session right now.{'\n'}Discover study spaces and reserve your seat.
          </Text>
          <TouchableOpacity
            style={styles.emptyBtn}
            activeOpacity={0.85}
            onPress={() => router.push('/(tabs)/discover')}
          >
            <Text style={styles.emptyBtnTxt}>Explore Spaces</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ─── ACTIVE DASHBOARD STATE ─────────────────────────────────────────
  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* HEADER */}
      <View style={[styles.header, { paddingTop: insets.top || 14, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E8EEF8' }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.75}>
          <Feather name="arrow-left" size={20} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Active Session</Text>
        <TouchableOpacity style={styles.helpBtn}>
          <Feather name="help-circle" size={20} color="#111827" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
        {/* LIVE SESSION CARD */}
        <View style={[styles.card, { marginTop: 16 }]}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardIndicator}>🟢 Currently Studying</Text>
              <Text style={styles.spaceName}>{activeBooking.spaceName}</Text>
              <Text style={styles.seatNum}>Seat {activeBooking.seatId}</Text>
            </View>
            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Checked In</Text>
            </View>
          </View>
          <View style={styles.badgeRow}>
            <View style={styles.featureBadge}>
              <Feather name="sunset" size={11} color="#4F7EFF" style={{ marginRight: 4 }} />
              <Text style={styles.featureBadgeTxt}>Window Seat</Text>
            </View>
            <View style={styles.featureBadge}>
              <Feather name="zap" size={11} color="#4F7EFF" style={{ marginRight: 4 }} />
              <Text style={styles.featureBadgeTxt}>Charging Port</Text>
            </View>
          </View>
        </View>

        {/* COUNTDOWN TIMER */}
        <Animated.View style={[styles.timerContainer, { opacity: timerFade }]}>
          <Svg width={TIMER_SIZE} height={TIMER_SIZE}>
            {/* Background track */}
            <Circle cx={TIMER_SIZE / 2} cy={TIMER_SIZE / 2} r={RADIUS} fill="transparent" stroke="#E2E8F0" strokeWidth={6} />
            {/* Animated progress ring */}
            <Circle
              cx={TIMER_SIZE / 2}
              cy={TIMER_SIZE / 2}
              r={RADIUS}
              fill="transparent"
              stroke="#4F7EFF"
              strokeWidth={6}
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={strokeOffset}
              strokeLinecap="round"
              transform={`rotate(-90 ${TIMER_SIZE / 2} ${TIMER_SIZE / 2})`}
            />
          </Svg>
          <View style={styles.timerContent}>
            <Text style={styles.timerVal}>{formattedTimeLeft}</Text>
            <Text style={styles.timerLabel}>Remaining</Text>
          </View>
        </Animated.View>
        <Text style={styles.endsAtText}>Session Ends at 5:00 PM</Text>

        {/* QUICK ACTIONS */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionBtn} activeOpacity={0.8} onPress={handleExtend}>
            <Feather name="clock" size={16} color="#4F7EFF" style={{ marginBottom: 6 }} />
            <Text style={styles.actionText}>Extend Session</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            activeOpacity={0.8}
            onPress={() => Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(activeBooking.spaceName)}`)}
          >
            <Feather name="navigation" size={16} color="#4F7EFF" style={{ marginBottom: 6 }} />
            <Text style={styles.actionText}>Navigate</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} activeOpacity={0.8}>
            <Feather name="phone" size={16} color="#4F7EFF" style={{ marginBottom: 6 }} />
            <Text style={styles.actionText}>Call Reception</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} activeOpacity={0.8}>
            <Feather name="alert-triangle" size={16} color="#4F7EFF" style={{ marginBottom: 6 }} />
            <Text style={styles.actionText}>Report Issue</Text>
          </TouchableOpacity>
        </View>

        {/* ENVIRONMENT STATUS */}
        <Text style={styles.sectionTitle}>Environment Status</Text>
        <View style={styles.card}>
          <View style={styles.envRow}>
            <View style={styles.envCell}>
              <Feather name="volume-x" size={15} color="#6B7280" style={{ marginRight: 8 }} />
              <View>
                <Text style={styles.envLabel}>Noise Level</Text>
                <Text style={styles.envVal}>Very Quiet</Text>
              </View>
            </View>
            <View style={styles.envCell}>
              <Feather name="wifi" size={15} color="#6B7280" style={{ marginRight: 8 }} />
              <View>
                <Text style={styles.envLabel}>Wi-Fi</Text>
                <Text style={styles.envVal}>Excellent</Text>
              </View>
            </View>
          </View>
          <View style={[styles.envRow, { marginTop: 14 }]}>
            <View style={styles.envCell}>
              <Feather name="wind" size={15} color="#6B7280" style={{ marginRight: 8 }} />
              <View>
                <Text style={styles.envLabel}>Air Conditioning</Text>
                <Text style={styles.envVal}>Available</Text>
              </View>
            </View>
            <View style={styles.envCell}>
              <Feather name="zap" size={15} color="#6B7280" style={{ marginRight: 8 }} />
              <View>
                <Text style={styles.envLabel}>Power Outlet</Text>
                <Text style={styles.envVal}>Available</Text>
              </View>
            </View>
          </View>
        </View>

        {/* STUDY SPACE INFORMATION */}
        <Text style={styles.sectionTitle}>Study Space Information</Text>
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Feather name="map-pin" size={14} color="#6B7280" style={{ marginRight: 10 }} />
            <Text style={styles.infoLabel}>Location</Text>
            <Text style={styles.infoVal}>{activeBooking.spaceName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Feather name="layers" size={14} color="#6B7280" style={{ marginRight: 10 }} />
            <Text style={styles.infoLabel}>Floor / Seat</Text>
            <Text style={styles.infoVal}>Floor 2, Seat {activeBooking.seatId}</Text>
          </View>
          <View style={styles.infoRow}>
            <Feather name="thermometer" size={14} color="#6B7280" style={{ marginRight: 10 }} />
            <Text style={styles.infoLabel}>Temperature</Text>
            <Text style={styles.infoVal}>22°C</Text>
          </View>
          <View style={[styles.infoRow, { borderBottomWidth: 0, paddingBottom: 0 }]}>
            <Feather name="users" size={14} color="#6B7280" style={{ marginRight: 10 }} />
            <Text style={styles.infoLabel}>Current Occupancy</Text>
            <Text style={styles.infoVal}>38 / 60 Seats</Text>
          </View>
        </View>

        {/* SESSION INFORMATION */}
        <Text style={styles.sectionTitle}>Session Information</Text>
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Feather name="log-in" size={14} color="#6B7280" style={{ marginRight: 10 }} />
            <Text style={styles.infoLabel}>Check-in Time</Text>
            <Text style={styles.infoVal}>2:00 PM</Text>
          </View>
          <View style={styles.infoRow}>
            <Feather name="log-out" size={14} color="#6B7280" style={{ marginRight: 10 }} />
            <Text style={styles.infoLabel}>Expected Check-out</Text>
            <Text style={styles.infoVal}>5:00 PM</Text>
          </View>
          <View style={styles.infoRow}>
            <Feather name="clock" size={14} color="#6B7280" style={{ marginRight: 10 }} />
            <Text style={styles.infoLabel}>Duration</Text>
            <Text style={styles.infoVal}>{activeBooking.hours} Hours</Text>
          </View>
          <View style={[styles.infoRow, { borderBottomWidth: 0, paddingBottom: 0 }]}>
            <Feather name="tag" size={14} color="#6B7280" style={{ marginRight: 10 }} />
            <Text style={styles.infoLabel}>Booking ID</Text>
            <Text style={styles.infoVal}>{activeBooking.id}</Text>
          </View>
        </View>
      </ScrollView>

      {/* STICKY BOTTOM ACTIONS */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <TouchableOpacity style={styles.secondaryBtn} activeOpacity={0.8} onPress={handleExtend}>
          <Text style={styles.secondaryBtnTxt}>Extend Session</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.85} onPress={handleEndSession}>
          <Text style={styles.primaryBtnTxt}>End Session</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8FAFC' },

  // Header
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 14 },
  backBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E8EEF8' },
  headerTitle: { fontFamily: FONTS.bold, fontSize: 18, color: '#111827' },
  helpBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E8EEF8' },

  scrollBody: { paddingHorizontal: 20, paddingBottom: 120 },

  // Cards layout
  card: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#E8EEF8', shadowColor: '#111827', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', borderBottomWidth: 1, borderBottomColor: '#F3F4F6', paddingBottom: 12, marginBottom: 12 },
  cardIndicator: { fontFamily: FONTS.bold, fontSize: 11, color: '#22C55E', marginBottom: 6 },
  spaceName: { fontFamily: FONTS.bold, fontSize: 18, color: '#111827', marginBottom: 2 },
  seatNum: { fontFamily: FONTS.medium, fontSize: 13, color: '#6B7280' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0FDF4', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#22C55E', marginRight: 5 },
  statusText: { fontFamily: FONTS.bold, fontSize: 10.5, color: '#15803D' },
  badgeRow: { flexDirection: 'row', gap: 8 },
  featureBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EEF2FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  featureBadgeTxt: { fontFamily: FONTS.bold, fontSize: 10, color: '#4F7EFF' },

  // Countdown timer circle
  timerContainer: { alignSelf: 'center', marginTop: 24, width: TIMER_SIZE, height: TIMER_SIZE, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  timerContent: { position: 'absolute', alignItems: 'center' },
  timerVal: { fontFamily: FONTS.bold, fontSize: 24, color: '#111827', letterSpacing: -0.5 },
  timerLabel: { fontFamily: FONTS.medium, fontSize: 11, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 },
  endsAtText: { fontFamily: FONTS.bold, fontSize: 13, color: '#6B7280', textAlign: 'center', marginTop: 12, marginBottom: 20 },

  sectionTitle: { fontFamily: FONTS.bold, fontSize: 15, color: '#111827', marginTop: 18, marginBottom: 10 },

  // Quick actions
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
  actionBtn: { width: (W - 50) / 2, backgroundColor: '#FFFFFF', borderRadius: 18, padding: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E8EEF8' },
  actionText: { fontFamily: FONTS.bold, fontSize: 12, color: '#374151' },

  // Env rows
  envRow: { flexDirection: 'row', gap: 12 },
  envCell: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  envLabel: { fontFamily: FONTS.medium, fontSize: 11, color: '#9CA3AF' },
  envVal: { fontFamily: FONTS.bold, fontSize: 13, color: '#111827', marginTop: 1 },

  // Info rows
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  infoLabel: { fontFamily: FONTS.medium, fontSize: 13, color: '#6B7280', flex: 1 },
  infoVal: { fontFamily: FONTS.bold, fontSize: 13, color: '#111827' },

  // Sticky bottom bar
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E8EEF8', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 12, shadowColor: '#111827', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.04, shadowRadius: 10, elevation: 10 },
  primaryBtn: { flex: 1.2, backgroundColor: '#EF4444', borderRadius: 20, height: 48, justifyContent: 'center', alignItems: 'center' },
  primaryBtnTxt: { fontFamily: FONTS.bold, fontSize: 14, color: '#FFFFFF' },
  secondaryBtn: { flex: 0.8, backgroundColor: '#FFFFFF', borderRadius: 20, height: 48, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB', marginRight: 10 },
  secondaryBtnTxt: { fontFamily: FONTS.bold, fontSize: 14, color: '#4B5563' },

  // Empty state container
  emptyContainer: { flex: 1, paddingHorizontal: 32, alignItems: 'center', justifyContent: 'center', paddingTop: 100 },
  emptyIconBox: { width: 80, height: 80, borderRadius: 24, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  emptyTitle: { fontFamily: FONTS.bold, fontSize: 20, color: '#111827', marginBottom: 8, textAlign: 'center' },
  emptyDesc: { fontFamily: FONTS.regular, fontSize: 13.5, color: '#6B7280', textAlign: 'center', lineHeight: 20, marginBottom: 28 },
  emptyBtn: { width: '100%', height: 48, borderRadius: 16, backgroundColor: '#4F7EFF', justifyContent: 'center', alignItems: 'center' },
  emptyBtnTxt: { fontFamily: FONTS.bold, fontSize: 14, color: '#FFFFFF' },
});
