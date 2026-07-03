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
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSpaceStore } from '../../store/spaceStore';
import { FONTS } from '../../constants/fonts';

const PRIMARY_COLOR = '#4F46E5';

export default function BookingFailedScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const spaces = useSpaceStore((state) => state.spaces);

  const spaceId = (params.spaceId as string) || '1';
  const seatId = (params.seatId as string) || 'B12';
  const reason = (params.reason as string) || 'Payment transaction was declined by your bank.';

  const baseSpace = spaces.find((s) => s.id === spaceId);
  const space = baseSpace || {
    id: spaceId,
    name: "The Scholar's Haven",
    rating: 4.9,
    location: 'Sector 15, Sonipat',
  };

  // Animation values
  const errorScale = useRef(new Animated.Value(0.3)).current;
  const errorOpacity = useRef(new Animated.Value(0)).current;
  const pulseScale = useRef(new Animated.Value(1)).current;
  const cardsTranslateY = useRef(new Animated.Value(40)).current;
  const cardsOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Success checkmark entrance animation
    Animated.parallel([
      Animated.spring(errorScale, { toValue: 1, friction: 5, tension: 80, useNativeDriver: true }),
      Animated.timing(errorOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start(() => {
      if (Platform.OS !== 'web') {
        Vibration.vibrate([0, 80, 80, 80]); // Error double vibrate
      }
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseScale, { toValue: 1.05, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseScale, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    });

    // 2. Cards slide-up animation
    Animated.parallel([
      Animated.timing(cardsTranslateY, { toValue: 0, duration: 600, delay: 200, useNativeDriver: true }),
      Animated.timing(cardsOpacity, { toValue: 1, duration: 500, delay: 200, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleRetry = () => {
    router.replace({
      pathname: '/booking/seats',
      params: { spaceId },
    } as any);
  };

  const handleBrowse = () => {
    router.replace('/(tabs)/discover');
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scrollBody, { paddingTop: insets.top || 20 }]}>
        {/* ANIMATED ERROR CROSS ICON */}
        <View style={styles.iconContainer}>
          <Animated.View
            style={[
              styles.pulseCircle,
              {
                transform: [{ scale: pulseScale }],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.iconCircle,
              {
                opacity: errorOpacity,
                transform: [{ scale: errorScale }],
              },
            ]}
          >
            <Feather name="x" size={40} color="#EF4444" />
          </Animated.View>
        </View>

        {/* STATUS TITLE */}
        <Text style={styles.title}>Booking Failed</Text>
        <Text style={styles.subtitle}>
          We couldn't process your transaction. Your seat was not reserved, and no payment was deducted.
        </Text>

        {/* DETAILS CARDS */}
        <Animated.View style={{ opacity: cardsOpacity, transform: [{ translateY: cardsTranslateY }], width: '100%' }}>
          <View style={styles.detailCard}>
            <Text style={styles.cardHeader}>Transaction Details</Text>
            
            <View style={styles.row}>
              <Text style={styles.label}>Study Space</Text>
              <Text style={styles.value} numberOfLines={1}>{space.name}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Seat Selected</Text>
              <Text style={styles.value}>Seat {seatId}</Text>
            </View>

            <View style={[styles.row, { borderBottomWidth: 0, paddingBottom: 0 }]}>
              <Text style={styles.label}>Reason for Failure</Text>
              <Text style={[styles.value, { color: '#EF4444' }]}>{reason}</Text>
            </View>
          </View>

          {/* HELP INFO PANEL */}
          <View style={styles.helpPanel}>
            <Feather name="info" size={14} color="#64748B" style={{ marginRight: 8, marginTop: 1 }} />
            <Text style={styles.helpText}>
              Need assistance? Drop us a message in the Help Center or retry using another payment option.
            </Text>
          </View>
        </Animated.View>
      </ScrollView>

      {/* FOOTER ACTIONS */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity style={styles.retryBtn} onPress={handleRetry} activeOpacity={0.8}>
          <Text style={styles.retryBtnText}>Try Again</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.browseBtn} onPress={handleBrowse} activeOpacity={0.8}>
          <Text style={styles.browseBtnText}>Browse Other Spaces</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollBody: { alignItems: 'center', paddingHorizontal: 24, paddingBottom: 120 },

  // Error icon styles
  iconContainer: { width: 120, height: 120, alignItems: 'center', justifyContent: 'center', marginTop: 40, marginBottom: 24, position: 'relative' },
  pulseCircle: { position: 'absolute', width: 96, height: 96, borderRadius: 48, backgroundColor: '#FEE2E2', opacity: 0.5 },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#FEE2E2', alignItems: 'center', justifyContent: 'center', zIndex: 2 },

  // Titles
  title: { fontFamily: FONTS.bold, fontSize: 24, color: '#0F172A', fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontFamily: FONTS.regular, fontSize: 13.5, color: '#64748B', lineHeight: 20, textAlign: 'center', paddingHorizontal: 12, marginBottom: 30 },

  // Card layouts
  detailCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 18, borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#0F172A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 8, elevation: 1, width: '100%' },
  cardHeader: { fontFamily: FONTS.bold, fontSize: 14, color: '#0F172A', fontWeight: 'bold', borderBottomWidth: 1, borderBottomColor: '#F8FAFC', paddingBottom: 10, marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#F8FAFC', paddingBottom: 10, marginBottom: 10 },
  label: { fontFamily: FONTS.medium, fontSize: 12.5, color: '#64748B' },
  value: { fontFamily: FONTS.bold, fontSize: 13, color: '#0F172A', fontWeight: 'bold', flex: 1, textAlign: 'right', marginLeft: 16 },

  // Help Panel
  helpPanel: { flexDirection: 'row', backgroundColor: '#F8FAFC', borderRadius: 14, padding: 14, marginTop: 14, borderWidth: 1, borderColor: '#F1F5F9', width: '100%', alignItems: 'flex-start' },
  helpText: { fontFamily: FONTS.medium, fontSize: 12, color: '#64748B', flex: 1, lineHeight: 17 },

  // Sticky bottom footer
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 24, paddingTop: 12, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#F1F5F9', gap: 8 },
  retryBtn: { backgroundColor: PRIMARY_COLOR, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', shadowColor: PRIMARY_COLOR, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 2 },
  retryBtnText: { fontFamily: FONTS.bold, fontSize: 14.5, color: '#FFFFFF', fontWeight: 'bold' },
  browseBtn: { backgroundColor: '#FFFFFF', height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#E2E8F0' },
  browseBtnText: { fontFamily: FONTS.bold, fontSize: 14, color: '#475569', fontWeight: 'bold' },
});
