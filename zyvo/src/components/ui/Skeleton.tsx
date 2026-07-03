/**
 * Skeleton.tsx
 * Reusable shimmer skeleton component for loading states.
 * Usage:
 *   <Skeleton width={200} height={16} radius={8} />
 *   <SkeletonCard />
 *   <SkeletonBookingCard />
 *   <SkeletonHomeScreen />
 *   <SkeletonBookingsScreen />
 */
import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet, Dimensions } from 'react-native';

const { width: W } = Dimensions.get('window');

// ─── Shimmer pulse ─────────────────────────────────────────────────
function useShimmer(delay = 0) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 900, delay, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return anim;
}

// ─── Base bone ─────────────────────────────────────────────────────
interface SkeletonProps {
  width?: number | string;
  height?: number;
  radius?: number;
  delay?: number;
  style?: object;
}

export function Skeleton({ width = '100%', height = 16, radius = 8, delay = 0, style }: SkeletonProps) {
  const anim = useShimmer(delay);
  const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.75] });
  return (
    <Animated.View
      style={[
        { width: width as any, height, borderRadius: radius, backgroundColor: '#E2E8F0', opacity },
        style,
      ]}
    />
  );
}

// ─── Booking card skeleton ──────────────────────────────────────────
export function SkeletonBookingCard({ delay = 0 }: { delay?: number }) {
  return (
    <View style={S.card}>
      <Skeleton width="100%" height={3} radius={0} delay={delay} />
      <View style={S.cardHeader}>
        <Skeleton width={72} height={72} radius={12} delay={delay} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Skeleton width={80} height={10} radius={6} delay={delay} style={{ marginBottom: 8 }} />
          <Skeleton width="70%" height={14} radius={6} delay={delay} style={{ marginBottom: 8 }} />
          <Skeleton width="50%" height={11} radius={5} delay={delay} />
        </View>
        <Skeleton width={40} height={24} radius={8} delay={delay} />
      </View>
      <View style={S.metaRow}>
        <Skeleton width="28%" height={10} radius={5} delay={delay} />
        <Skeleton width="28%" height={10} radius={5} delay={delay} />
        <Skeleton width="28%" height={10} radius={5} delay={delay} />
      </View>
      <View style={S.actionRow}>
        <Skeleton width="47%" height={36} radius={11} delay={delay} />
        <Skeleton width="47%" height={36} radius={11} delay={delay} />
      </View>
    </View>
  );
}

// ─── Space card skeleton (home) ─────────────────────────────────────
export function SkeletonSpaceCard({ delay = 0 }: { delay?: number }) {
  return (
    <View style={S.spaceCard}>
      <Skeleton width="100%" height={140} radius={16} delay={delay} style={{ marginBottom: 10 }} />
      <Skeleton width="80%" height={14} radius={6} delay={delay} style={{ marginBottom: 6 }} />
      <Skeleton width="50%" height={11} radius={5} delay={delay} style={{ marginBottom: 6 }} />
      <Skeleton width="40%" height={10} radius={5} delay={delay} />
    </View>
  );
}

// ─── Home screen skeleton ───────────────────────────────────────────
export function SkeletonHomeScreen() {
  return (
    <View style={S.page}>
      {/* Header */}
      <View style={S.row}>
        <View>
          <Skeleton width={120} height={14} radius={7} style={{ marginBottom: 6 }} />
          <Skeleton width={180} height={22} radius={8} />
        </View>
        <Skeleton width={44} height={44} radius={22} />
      </View>

      {/* Search bar */}
      <Skeleton width="100%" height={50} radius={16} style={{ marginBottom: 16 }} />

      {/* Chips row */}
      <View style={[S.row, { marginBottom: 20 }]}>
        {[80, 90, 100, 80, 100].map((w, i) => (
          <Skeleton key={i} width={w} height={32} radius={20} delay={i * 60} style={{ marginRight: 8 }} />
        ))}
      </View>

      {/* Section title */}
      <Skeleton width={140} height={16} radius={7} style={{ marginBottom: 12 }} />

      {/* Space cards row */}
      <View style={S.row}>
        {[0, 1].map((i) => (
          <View key={i} style={{ width: (W - 56) / 2 }}>
            <SkeletonSpaceCard delay={i * 80} />
          </View>
        ))}
      </View>

      {/* Section title 2 */}
      <Skeleton width={160} height={16} radius={7} style={{ marginBottom: 12, marginTop: 8 }} />

      {/* Horizontal scroll cards */}
      <View style={S.row}>
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} width={160} height={110} radius={14} delay={i * 80} style={{ marginRight: 12 }} />
        ))}
      </View>
    </View>
  );
}

// ─── Bookings screen skeleton ───────────────────────────────────────
export function SkeletonBookingsScreen() {
  return (
    <View style={S.page}>
      {/* Header */}
      <View style={[S.row, { marginBottom: 16 }]}>
        <Skeleton width={160} height={26} radius={8} />
        <Skeleton width={38} height={38} radius={12} />
      </View>

      {/* Search */}
      <Skeleton width="100%" height={46} radius={14} style={{ marginBottom: 14 }} />

      {/* Tabs */}
      <View style={[S.row, { marginBottom: 16 }]}>
        {['Upcoming', 'Active', 'Completed', 'Cancelled'].map((_, i) => (
          <Skeleton key={i} width={70} height={14} radius={6} delay={i * 50} style={{ marginRight: 24 }} />
        ))}
      </View>

      {/* Cards */}
      {[0, 1, 2].map((i) => (
        <SkeletonBookingCard key={i} delay={i * 100} />
      ))}
    </View>
  );
}

// ─── Notifications skeleton ─────────────────────────────────────────
export function SkeletonNotificationsScreen() {
  return (
    <View style={S.page}>
      {/* Header */}
      <View style={[S.row, { marginBottom: 16 }]}>
        <Skeleton width={38} height={38} radius={12} />
        <Skeleton width={130} height={20} radius={7} />
        <Skeleton width={60} height={14} radius={6} />
      </View>

      {/* Notification cards */}
      {[0, 1, 2, 3].map((i) => (
        <View key={i} style={S.notifCard}>
          <Skeleton width={44} height={44} radius={13} delay={i * 60} style={{ marginRight: 12, flexShrink: 0 }} />
          <View style={{ flex: 1 }}>
            <Skeleton width="60%" height={13} radius={6} delay={i * 60} style={{ marginBottom: 7 }} />
            <Skeleton width="90%" height={11} radius={5} delay={i * 60} style={{ marginBottom: 4 }} />
            <Skeleton width="75%" height={11} radius={5} delay={i * 60} style={{ marginBottom: 8 }} />
            <Skeleton width={60} height={10} radius={5} delay={i * 60} />
          </View>
        </View>
      ))}
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────
const S = StyleSheet.create({
  page:      { flex: 1, backgroundColor: '#F8FAFC', paddingHorizontal: 20, paddingTop: 8 },
  row:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    marginBottom: 14,
    overflow: 'hidden',
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', padding: 14 },
  metaRow:   { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 14, paddingBottom: 10 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 14, paddingBottom: 14 },
  spaceCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 10, marginRight: 12 },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8EEF8',
  },
});
