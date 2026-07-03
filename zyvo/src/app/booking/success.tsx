import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Animated,
  Vibration,
  Platform,
  Share,
  Linking,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Rect, Path } from 'react-native-svg';
import { useSpaceStore } from '../../store/spaceStore';
import { FONTS } from '../../constants/fonts';

// Simple mocked QR Code representation using SVG
const QRCodeSvg = () => (
  <Svg width={140} height={140} viewBox="0 0 29 29">
    <Rect width={29} height={29} fill="#FFFFFF" />
    {/* Top-left locator */}
    <Path d="M 0 0 h 7 v 7 h -7 z M 1 1 v 5 h 5 v -5 z M 2 2 h 3 v 3 h -3 z" fill="#111827" />
    {/* Top-right locator */}
    <Path d="M 22 0 h 7 v 7 h -7 z M 23 1 v 5 h 5 v -5 z M 24 2 h 3 v 3 h -3 z" fill="#111827" />
    {/* Bottom-left locator */}
    <Path d="M 0 22 h 7 v 7 h -7 z M 1 23 v 5 h 5 v -5 z M 2 24 h 3 v 3 h -3 z" fill="#111827" />
    {/* Random bits */}
    <Path d="M 9 0 h 2 v 2 h -2 z M 13 0 h 1 v 1 h -1 z M 16 0 h 3 v 1 h -3 z M 13 2 h 2 v 1 h -2 z M 19 2 h 1 v 2 h -1 z" fill="#111827" />
    <Path d="M 9 5 h 4 v 1 h -4 z M 15 5 h 2 v 2 h -2 z M 18 6 h 3 v 1 h -3 z" fill="#111827" />
    <Path d="M 8 9 h 2 v 2 h -2 z M 12 9 h 3 v 1 h -3 z M 20 9 h 1 v 3 h -1 z" fill="#111827" />
    <Path d="M 9 12 h 2 v 1 h -2 z M 13 13 h 4 v 1 h -4 z M 19 12 h 2 v 2 h -2 z" fill="#111827" />
    <Path d="M 8 16 h 3 v 2 h -3 z M 14 16 h 2 v 1 h -2 z M 18 16 h 1 v 3 h -1 z" fill="#111827" />
    <Path d="M 9 19 h 4 v 1 h -4 z M 15 20 h 3 v 1 h -3 z" fill="#111827" />
    <Path d="M 9 23 h 1 v 3 h -1 z M 12 24 h 2 v 1 h -2 z M 17 24 h 3 v 1 h -3 z" fill="#111827" />
    <Path d="M 9 27 h 3 v 1 h -3 z M 14 26 h 4 v 2 h -4 z" fill="#111827" />
  </Svg>
);

export default function BookingSuccessScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const spaces = useSpaceStore((state) => state.spaces);

  const spaceId = (params.spaceId as string) || '1';
  const seatId = (params.seatId as string) || 'B12';
  const slot = (params.slot as string) || '2:00 PM – 5:00 PM';
  const total = (params.total as string) || '179';

  const baseSpace = spaces.find((s) => s.id === spaceId);
  const space = baseSpace || {
    id: spaceId,
    name: "The Scholar's Haven",
    rating: 4.9,
    location: 'Sector 15, Sonipat',
  };

  const bookingId = `ZYV-${Math.floor(100000 + Math.random() * 900000)}`;

  // Animation values
  const checkScale = useRef(new Animated.Value(0.3)).current;
  const checkOpacity = useRef(new Animated.Value(0)).current;
  const pulseScale = useRef(new Animated.Value(1)).current;
  const cardsTranslateY = useRef(new Animated.Value(40)).current;
  const cardsOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Success checkmark entrance animation
    Animated.parallel([
      Animated.spring(checkScale, { toValue: 1, friction: 5, tension: 80, useNativeDriver: true }),
      Animated.timing(checkOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start(() => {
      // Trigger subtle haptic on completion
      if (Platform.OS !== 'web') {
        Vibration.vibrate(20);
      }
      // 2. Loop pulse animation on the check circle
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseScale, { toValue: 1.08, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseScale, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    });

    // 3. Cards slide-up animation
    Animated.parallel([
      Animated.timing(cardsTranslateY, { toValue: 0, duration: 600, delay: 300, useNativeDriver: true }),
      Animated.timing(cardsOpacity, { toValue: 1, duration: 500, delay: 300, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `I just booked seat ${seatId} at ${space.name} via ZYVO study spaces app!`,
      });
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
        {/* SUCCESS CHECKMARK ANIMATION */}
        <View style={styles.animationContainer}>
          <Animated.View style={[styles.pulseOuterCircle, { transform: [{ scale: pulseScale }], opacity: checkOpacity }]} />
          <Animated.View style={[styles.checkCircle, { transform: [{ scale: checkScale }], opacity: checkOpacity }]}>
            <Ionicons name="checkmark" size={36} color="#FFFFFF" />
          </Animated.View>
        </View>

        {/* CONFIRMATION MESSAGE */}
        <Text style={styles.confirmTitle}>Booking Confirmed! 🎉</Text>
        <Text style={styles.confirmSubtitle}>
          Your study space has been reserved successfully.{'\n'}We're excited to help you stay productive.
        </Text>

        <Animated.View style={{ transform: [{ translateY: cardsTranslateY }], opacity: cardsOpacity }}>
          {/* QR CHECK-IN CARD */}
          <View style={styles.card}>
            <View style={styles.qrWrapper}>
              <QRCodeSvg />
            </View>
            <Text style={styles.qrInstruction}>
              Scan this code at the entrance to start your session.
            </Text>
            <View style={styles.qrBtnRow}>
              <TouchableOpacity style={styles.qrSecondaryBtn} activeOpacity={0.8}>
                <Feather name="download" size={14} color="#4F7EFF" style={{ marginRight: 6 }} />
                <Text style={styles.qrSecondaryBtnTxt}>Download QR</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.qrSecondaryBtn} activeOpacity={0.8} onPress={handleShare}>
                <Feather name="share-2" size={14} color="#4F7EFF" style={{ marginRight: 6 }} />
                <Text style={styles.qrSecondaryBtnTxt}>Share Booking</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* BOOKING DETAILS CARD */}
          <Text style={styles.sectionTitle}>Reservation Overview</Text>
          <View style={styles.card}>
            <View style={styles.detailsHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.spaceName}>{space.name}</Text>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={11} color="#F59E0B" />
                  <Text style={styles.ratingText}> {space.rating}</Text>
                </View>
              </View>
              <View style={styles.statusBadge}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Confirmed</Text>
              </View>
            </View>

            <View style={styles.detailsGrid}>
              <View style={styles.detailCol}>
                <Text style={styles.detailLabel}>Date</Text>
                <Text style={styles.detailVal}>30 June 2026</Text>
              </View>
              <View style={styles.detailCol}>
                <Text style={styles.detailLabel}>Time</Text>
                <Text style={styles.detailVal}>{slot}</Text>
              </View>
              <View style={styles.detailCol}>
                <Text style={styles.detailLabel}>Seat</Text>
                <Text style={styles.detailVal}>{seatId}</Text>
              </View>
            </View>

            <View style={[styles.detailItem, { marginTop: 14 }]}>
              <Feather name="map-pin" size={13} color="#6B7280" style={{ marginRight: 8, marginTop: 1 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.detailLabel}>Address</Text>
                <Text style={styles.detailVal}>{space.location || 'Sector 15, Sonipat'}</Text>
              </View>
            </View>

            <View style={[styles.detailItem, { marginTop: 12 }]}>
              <Feather name="tag" size={13} color="#6B7280" style={{ marginRight: 8 }} />
              <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between' }}>
                <View>
                  <Text style={styles.detailLabel}>Booking ID</Text>
                  <Text style={styles.detailVal}>{bookingId}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.detailLabel}>Total Paid</Text>
                  <Text style={styles.detailVal}>₹{total}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* QUICK ACTIONS */}
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionBtnPrimary}
              activeOpacity={0.8}
              onPress={() => Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(space.name + ', ' + space.location)}`)}
            >
              <Feather name="navigation" size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.actionBtnPrimaryTxt}>Start Navigation</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtnSecondary} activeOpacity={0.8} onPress={() => router.push('/(tabs)/bookings')}>
              <Feather name="calendar" size={14} color="#4F7EFF" style={{ marginRight: 6 }} />
              <Text style={styles.actionBtnSecondaryTxt}>View My Booking</Text>
            </TouchableOpacity>
          </View>

          {/* STUDY TIPS CARD */}
          <View style={[styles.card, styles.tipsCard]}>
            <View style={styles.tipsIconBox}>
              <Feather name="info" size={16} color="#4F7EFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.tipsTitle}>Tips for your study session</Text>
              <Text style={styles.tipsText}>
                • Arrive 10 minutes early to enjoy a smooth check-in experience.{'\n'}
                • Remember to bring your charger and student ID if required.
              </Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* BOTTOM STICKY BUTTON */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <TouchableOpacity
          style={styles.bottomBtn}
          activeOpacity={0.85}
          onPress={() => router.push('/(tabs)/bookings')}
        >
          <Text style={styles.bottomBtnTxt}>Go to My Bookings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8FAFC' },

  scrollBody: { paddingHorizontal: 20, paddingBottom: 120 },

  // Success animations
  animationContainer: { alignSelf: 'center', marginTop: 32, marginBottom: 20, width: 80, height: 80, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  pulseOuterCircle: { position: 'absolute', width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(34,220,94,0.12)', borderWidth: 1, borderColor: 'rgba(34,220,94,0.2)' },
  checkCircle: { width: 68, height: 68, borderRadius: 34, backgroundColor: '#22C55E', justifyContent: 'center', alignItems: 'center', shadowColor: '#22C55E', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 6 },

  // Confirmation headers
  confirmTitle: { fontFamily: FONTS.bold, fontSize: 22, color: '#111827', textAlign: 'center', marginBottom: 8 },
  confirmSubtitle: { fontFamily: FONTS.medium, fontSize: 13, color: '#6B7280', textAlign: 'center', lineHeight: 20, marginBottom: 24 },

  sectionTitle: { fontFamily: FONTS.bold, fontSize: 15, color: '#111827', marginTop: 22, marginBottom: 10 },

  // General cards
  card: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#E8EEF8', shadowColor: '#111827', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 1 },

  // QR card
  qrWrapper: { alignSelf: 'center', padding: 12, borderRadius: 16, borderWidth: 1, borderColor: '#F3F4F6', backgroundColor: '#FFFFFF', marginBottom: 14 },
  qrInstruction: { fontFamily: FONTS.medium, fontSize: 12.5, color: '#6B7280', textAlign: 'center', marginBottom: 14 },
  qrBtnRow: { flexDirection: 'row', gap: 10 },
  qrSecondaryBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#F8FAFC' },
  qrSecondaryBtnTxt: { fontFamily: FONTS.bold, fontSize: 12, color: '#4F7EFF' },

  // Detail card layouts
  detailsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', borderBottomWidth: 1, borderBottomColor: '#F3F4F6', paddingBottom: 12, marginBottom: 12 },
  spaceName: { fontFamily: FONTS.bold, fontSize: 15, color: '#111827' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
  ratingText: { fontFamily: FONTS.bold, fontSize: 11, color: '#111827' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0FDF4', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#22C55E', marginRight: 5 },
  statusText: { fontFamily: FONTS.bold, fontSize: 10.5, color: '#15803D' },
  detailsGrid: { flexDirection: 'row', gap: 8, borderBottomWidth: 1, borderBottomColor: '#F3F4F6', paddingBottom: 12 },
  detailCol: { flex: 1 },
  detailLabel: { fontFamily: FONTS.medium, fontSize: 10.5, color: '#9CA3AF', marginBottom: 2 },
  detailVal: { fontFamily: FONTS.bold, fontSize: 12.5, color: '#111827' },
  detailItem: { flexDirection: 'row', alignItems: 'flex-start' },

  // Quick actions
  actionsGrid: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  actionBtnPrimary: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#4F7EFF', borderRadius: 16, height: 48 },
  actionBtnPrimaryTxt: { fontFamily: FONTS.bold, fontSize: 13, color: '#FFFFFF' },
  actionBtnSecondary: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#FFFFFF', borderRadius: 16, height: 48 },
  actionBtnSecondaryTxt: { fontFamily: FONTS.bold, fontSize: 13, color: '#4F7EFF' },

  // Study tips card
  tipsCard: { flexDirection: 'row', alignItems: 'flex-start', padding: 14, backgroundColor: '#EEF2FF', borderColor: '#C7D8FF' },
  tipsIconBox: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', marginRight: 10, flexShrink: 0 },
  tipsTitle: { fontFamily: FONTS.bold, fontSize: 13, color: '#374151', marginBottom: 4 },
  tipsText: { fontFamily: FONTS.medium, fontSize: 11.5, color: '#6B7280', lineHeight: 17 },

  // Sticky bottom bar
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E8EEF8', paddingHorizontal: 20, paddingTop: 12, shadowColor: '#111827', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.04, shadowRadius: 10, elevation: 10 },
  bottomBtn: { width: '100%', height: 48, borderRadius: 20, backgroundColor: '#4F7EFF', justifyContent: 'center', alignItems: 'center' },
  bottomBtnTxt: { fontFamily: FONTS.bold, fontSize: 14, color: '#FFFFFF' },
});
