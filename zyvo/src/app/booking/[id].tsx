import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
  Alert,
  Animated,
  Easing,
  Vibration,
  RefreshControl,
  Modal,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { FONTS } from '../../constants/fonts';
import { LinearGradient } from 'expo-linear-gradient';
import { useBookingStore } from '../../store/bookingStore';

export default function MyBookingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const lookupId = (params.id as string) || (params.bookingId as string) || 'ZYV-2026-003184';
  const storeBooking = useBookingStore(s => s.getBookingById(lookupId) || s.bookings[0]);

  // Dynamic booking data
  const bookingId = storeBooking?.qrCode || storeBooking?.id || lookupId;
  const spaceName = storeBooking?.spaceName || "The Scholar's Haven";
  const seatId = (params.seatId as string) || storeBooking?.seatId || 'A12';
  const floor = (params.floor as string) || storeBooking?.floor || '1';
  const slot = (params.slot as string) || storeBooking?.timeSlot || '2:00 PM – 6:00 PM';
  const totalPaid = storeBooking?.totalPrice ? storeBooking.totalPrice.toString() : ((params.total as string) || '315');
  const payMethod = storeBooking?.paymentMethod || (params.payMethod as string) || 'UPI';
  const isCompleted = storeBooking?.status === 'completed' || storeBooking?.sessionState === 'completed';
  const isCancelled = storeBooking?.status === 'cancelled' || storeBooking?.sessionState === 'cancelled';

  // States
  const [refreshing, setRefreshing] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showQRExpanded, setShowQRExpanded] = useState(false);
  const [isExpired] = useState(false);

  // Live countdown — "Starts in 1h 42m" simulated
  const [countdown, setCountdown] = useState({ hours: 1, minutes: 42, seconds: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        let { hours, minutes, seconds } = prev;
        if (seconds > 0) return { hours, minutes, seconds: seconds - 1 };
        if (minutes > 0) return { hours, minutes: minutes - 1, seconds: 59 };
        if (hours > 0) return { hours: hours - 1, minutes: 59, seconds: 59 };
        clearInterval(timer);
        return { hours: 0, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Animations
  const cardAnim = useRef(new Animated.Value(0)).current;
  const qrScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(cardAnim, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, []);

  const handleExpandQR = () => {
    Animated.sequence([
      Animated.timing(qrScale, { toValue: 0.95, duration: 80, useNativeDriver: true }),
      Animated.spring(qrScale, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();
    setShowQRExpanded(true);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  const handleStartCheckin = () => {
    if (Platform.OS !== 'web') Vibration.vibrate([0, 20, 10, 40]);
    router.push({
      pathname: '/booking/checkin',
      params: { bookingId, seatId, slot },
    } as any);
  };

  const handleCancelBooking = () => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking? A refund will be processed within 3–5 business days.',
      [
        { text: 'Keep Booking', style: 'cancel' },
        {
          text: 'Cancel Booking',
          style: 'destructive',
          onPress: () => router.replace('/(tabs)/home'),
        },
      ]
    );
  };

  const moreMenuOptions = [
    { icon: 'share-2', label: 'Share Booking', action: () => Alert.alert('Share', 'Share booking link via WhatsApp, Mail, or AirDrop.') },
    { icon: 'download', label: 'Download Invoice', action: () => Alert.alert('Invoice', 'Invoice PDF has been saved to your downloads.') },
    { icon: 'x-circle', label: 'Cancel Booking', action: handleCancelBooking },
    { icon: 'headphones', label: 'Contact Support', action: () => Alert.alert('Support', 'Connecting you to Zyvo support...') },
  ];

  const amenities = [
    { icon: 'wifi', label: 'WiFi' },
    { icon: 'battery-charging', label: 'Charging' },
    { icon: 'wind', label: 'AC' },
    { icon: 'coffee', label: 'Coffee' },
    { icon: 'lock', label: 'Locker' },
    { icon: 'droplet', label: 'Washroom' },
  ];

  const bookingRules = [
    'Arrive 10 minutes early',
    'Bring your student ID',
    'Maintain silence in study zones',
    'Scan QR at entrance',
  ];

  const pad = (n: number) => String(n).padStart(2, '0');

  if (isExpired) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📚</Text>
          <Text style={styles.emptyHeading}>Booking Completed</Text>
          <Text style={styles.emptySub}>Your study session has ended. Ready for another one?</Text>
          <TouchableOpacity
            onPress={() => router.replace('/(tabs)/home')}
            style={styles.emptyBtn}
            activeOpacity={0.8}
          >
            <LinearGradient colors={['#6366F1', '#4F46E5']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.emptyBtnGrad}>
              <Text style={styles.emptyBtnText}>Book Another Study Space</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      {/* Background blobs */}
      <View style={styles.bgBlobTop} pointerEvents="none" />
      <View style={styles.bgBlobBottom} pointerEvents="none" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBackBtn} activeOpacity={0.7}>
          <Feather name="arrow-left" size={20} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Booking</Text>
        <TouchableOpacity onPress={() => setShowMoreMenu(true)} style={styles.headerMoreBtn} activeOpacity={0.7}>
          <Feather name="more-vertical" size={20} color="#111827" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#6366F1" />}
      >
        {/* Booking Status Pill */}
        <Animated.View style={[styles.statusPillWrapper, { opacity: cardAnim }]}>
          <View style={styles.statusPill}>
            <View style={[styles.statusDot, isCompleted && { backgroundColor: '#10B981' }, isCancelled && { backgroundColor: '#EF4444' }]} />
            <Text style={styles.statusText}>{isCompleted ? 'Completed' : isCancelled ? 'Cancelled' : 'Confirmed'}</Text>
          </View>
          <Text style={styles.statusSub}>{isCompleted ? 'Session completed successfully. Thank you for studying with Zyvo!' : isCancelled ? 'This booking has been cancelled.' : 'Booking confirmed and ready for check-in.'}</Text>
        </Animated.View>

        {/* Booking Card */}
        <Animated.View style={[styles.bookingCard, { opacity: cardAnim, transform: [{ translateY: cardAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }] }]}>
          <LinearGradient colors={isCompleted ? ['#059669', '#047857'] : isCancelled ? ['#DC2626', '#B91C1C'] : ['#6366F1', '#4F46E5']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.bookingCardGrad}>
            <Text style={styles.bookingCardVenue}>📍 {spaceName}</Text>
            <View style={styles.bookingCardRow}>
              <View style={styles.bookingRatingBadge}>
                <Ionicons name="star" size={10} color="#F59E0B" />
                <Text style={styles.bookingRatingText}> {storeBooking?.rating || '4.9'}</Text>
              </View>
              <Text style={styles.bookingDistance}>650m Away</Text>
            </View>
            <View style={styles.bookingIdRow}>
              <Text style={styles.bookingIdLabel}>Booking ID</Text>
              <Text style={styles.bookingIdVal}>{bookingId}</Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Time Card */}
        <View style={styles.card}>
          <View style={styles.timeRow}>
            <View style={styles.timeCol}>
              <Text style={styles.timeEmoji}>📅</Text>
              <Text style={styles.timeLabel}>Monday, 29 June</Text>
            </View>
            <View style={styles.timeDivider} />
            <View style={styles.timeCol}>
              <Text style={styles.timeEmoji}>⏰</Text>
              <Text style={styles.timeLabel}>{slot.replace('Monday, 29 June • ', '')}</Text>
            </View>
          </View>
          <View style={styles.timeMeta}>
            <View style={styles.durationBadge}>
              <Feather name="clock" size={12} color="#6366F1" style={{ marginRight: 4 }} />
              <Text style={styles.durationText}>{storeBooking?.hours || 4} Hours</Text>
            </View>
            <View style={[styles.countdownBadge, isCompleted && { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}>
              <View style={[styles.countdownDot, isCompleted && { backgroundColor: '#10B981' }]} />
              <Text style={[styles.countdownText, isCompleted && { color: '#065F46' }]}>
                {isCompleted ? 'Verified Visit • Completed' : isCancelled ? 'Booking Cancelled' : `Starts in ${pad(countdown.hours)}h ${pad(countdown.minutes)}m ${pad(countdown.seconds)}s`}
              </Text>
            </View>
          </View>
        </View>

        {/* Seat Information */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>Seat Information</Text>
          <View style={styles.seatInfoRow}>
            <View style={styles.seatIconBg}>
              <Text style={styles.seatEmoji}>🪑</Text>
            </View>
            <View style={styles.seatDetails}>
              <Text style={styles.seatIdText}>Seat {seatId}  •  Floor {floor}</Text>
              <View style={styles.seatTagsRow}>
                <View style={styles.seatTag}><Text style={styles.seatTagText}>Window Seat</Text></View>
                <View style={styles.seatTag}><Text style={styles.seatTagText}>Silent Zone</Text></View>
                <View style={[styles.seatTag, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}>
                  <Text style={[styles.seatTagText, { color: '#065F46' }]}>Power Outlet</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* QR Code Card */}
        <Animated.View style={[styles.card, { transform: [{ scale: qrScale }] }]}>
          <Text style={styles.cardSectionTitle}>Check-in QR Code</Text>
          <View style={styles.qrWrapper}>
            {/* QR code visual */}
            <View style={styles.qrBox}>
              <View style={[styles.qrFinder, { top: 0, left: 0 }]} />
              <View style={[styles.qrFinder, { top: 0, right: 0 }]} />
              <View style={[styles.qrFinder, { bottom: 0, left: 0 }]} />
              <View style={styles.qrMatrix}>
                {Array.from({ length: 8 }).map((_, r) => (
                  <View key={r} style={styles.qrRow}>
                    {Array.from({ length: 8 }).map((_, c) => {
                      const isAlignment = (r < 3 && c < 3) || (r < 3 && c >= 5) || (r >= 5 && c < 3);
                      const filled = !isAlignment && (r * c + r + c) % 2 === 0;
                      return <View key={c} style={[styles.qrDot, filled && { backgroundColor: '#111827' }]} />;
                    })}
                  </View>
                ))}
              </View>
            </View>
          </View>
          <Text style={styles.qrCaption}>Scan this QR code at the entrance.</Text>
          <View style={styles.qrActionsRow}>
            <TouchableOpacity
              onPress={() => Alert.alert('Downloaded', 'QR code saved to your photo library.')}
              style={styles.qrBtn}
              activeOpacity={0.7}
            >
              <Feather name="download" size={14} color="#6366F1" style={{ marginRight: 4 }} />
              <Text style={styles.qrBtnText}>Download QR</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleExpandQR} style={styles.qrBtn} activeOpacity={0.7}>
              <Feather name="maximize-2" size={14} color="#6366F1" style={{ marginRight: 4 }} />
              <Text style={styles.qrBtnText}>Expand QR</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Directions Card */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>Directions</Text>
          {/* Mini map placeholder */}
          <View style={styles.miniMap}>
            <LinearGradient colors={['#E0E7FF', '#CFFAFE']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.miniMapGrad}>
              <Ionicons name="map" size={32} color="#6366F1" />
              <Text style={styles.miniMapLabel}>The Scholar's Haven</Text>
              <Text style={styles.miniMapSub}>Koramangala, Bengaluru</Text>
            </LinearGradient>
          </View>
          <View style={styles.dirRow}>
            <View style={styles.dirInfo}>
              <Text style={styles.dirDistVal}>650m</Text>
              <Text style={styles.dirDistLabel}>Distance</Text>
            </View>
            <View style={styles.dirDivider} />
            <View style={styles.dirInfo}>
              <Text style={styles.dirDistVal}>8 min</Text>
              <Text style={styles.dirDistLabel}>Est. Walk</Text>
            </View>
            <TouchableOpacity
              onPress={() => Alert.alert('Navigation', 'Opening in Google Maps...')}
              style={styles.dirBtn}
              activeOpacity={0.8}
            >
              <LinearGradient colors={['#6366F1', '#06B6D4']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.dirBtnGrad}>
                <Feather name="navigation" size={14} color="#FFF" style={{ marginRight: 6 }} />
                <Text style={styles.dirBtnText}>Get Directions</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Amenities */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>Study Space Amenities</Text>
          <View style={styles.amenitiesGrid}>
            {amenities.map((a) => (
              <View key={a.label} style={styles.amenityItem}>
                <View style={styles.amenityIconBg}>
                  <Feather name={a.icon as any} size={16} color="#6366F1" />
                </View>
                <Text style={styles.amenityLabel}>{a.label}</Text>
              </View>
            ))}
          </View>
          <View style={styles.contactRow}>
            <TouchableOpacity
              onPress={() => Alert.alert('Calling', 'Connecting to The Scholar\'s Haven...')}
              style={styles.contactBtn}
              activeOpacity={0.7}
            >
              <Feather name="phone" size={14} color="#6366F1" style={{ marginRight: 6 }} />
              <Text style={styles.contactBtnText}>Call Study Space</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => Alert.alert('Message', 'Opening chat with the study space...')}
              style={[styles.contactBtn, { marginLeft: 8 }]}
              activeOpacity={0.7}
            >
              <Feather name="message-circle" size={14} color="#6366F1" style={{ marginRight: 6 }} />
              <Text style={styles.contactBtnText}>Message</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Booking Rules */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>Booking Rules</Text>
          {bookingRules.map((rule) => (
            <View key={rule} style={styles.ruleItem}>
              <View style={styles.ruleCheck}>
                <Feather name="check" size={12} color="#22C55E" />
              </View>
              <Text style={styles.ruleText}>{rule}</Text>
            </View>
          ))}
        </View>

        {/* Support Card */}
        <View style={styles.card}>
          <View style={styles.supportHeader}>
            <Text style={styles.cardSectionTitle}>Need Help?</Text>
            <Text style={styles.supportSub}>Contact the study space or Zyvo support.</Text>
          </View>
          <View style={styles.supportActionsRow}>
            <TouchableOpacity
              onPress={() => Alert.alert('Call Support', 'Connecting to Zyvo support line...')}
              style={styles.supportBtn}
              activeOpacity={0.8}
            >
              <Feather name="phone" size={15} color="#6366F1" style={{ marginRight: 6 }} />
              <Text style={styles.supportBtnText}>Call</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => Alert.alert('Chat Support', 'Opening Zyvo live chat...')}
              style={[styles.supportBtn, { marginLeft: 10 }]}
              activeOpacity={0.8}
            >
              <Feather name="message-square" size={15} color="#6366F1" style={{ marginRight: 6 }} />
              <Text style={styles.supportBtnText}>Chat Support</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 160 }} />
      </ScrollView>

      {/* Sticky Bottom Bar */}
      <View style={styles.bottomBar}>
        {isCompleted ? (
          <TouchableOpacity
            onPress={() => router.push(`/space/${storeBooking?.spaceId || '1'}`)}
            style={styles.bottomCTA}
            activeOpacity={0.9}
          >
            <LinearGradient colors={['#6366F1', '#4F46E5']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.bottomCTAGrad}>
              <Feather name="refresh-cw" size={18} color="#FFF" style={{ marginRight: 8 }} />
              <Text style={styles.bottomCTAText}>Book Again</Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity onPress={handleStartCheckin} style={styles.bottomCTA} activeOpacity={0.9}>
              <LinearGradient colors={['#6366F1', '#4F46E5']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.bottomCTAGrad}>
                <Feather name="check-circle" size={18} color="#FFF" style={{ marginRight: 8 }} />
                <Text style={styles.bottomCTAText}>Start Check-in</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleCancelBooking} style={styles.bottomCancelLink} activeOpacity={0.7}>
              <Text style={styles.bottomCancelText}>Cancel Booking</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* More Options Menu Modal */}
      <Modal visible={showMoreMenu} transparent animationType="fade" onRequestClose={() => setShowMoreMenu(false)}>
        <TouchableOpacity style={styles.modalBackdrop} onPress={() => setShowMoreMenu(false)} activeOpacity={1}>
          <View style={styles.moreMenuCard}>
            {moreMenuOptions.map((opt, i) => (
              <TouchableOpacity
                key={opt.label}
                onPress={() => { setShowMoreMenu(false); setTimeout(opt.action, 200); }}
                style={[styles.moreMenuItem, i < moreMenuOptions.length - 1 && styles.moreMenuItemBorder]}
                activeOpacity={0.7}
              >
                <Feather name={opt.icon as any} size={16} color={opt.label === 'Cancel Booking' ? '#EF4444' : '#4B5563'} style={{ marginRight: 12 }} />
                <Text style={[styles.moreMenuItemText, opt.label === 'Cancel Booking' && { color: '#EF4444' }]}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Expanded QR Modal */}
      <Modal visible={showQRExpanded} transparent animationType="fade" onRequestClose={() => setShowQRExpanded(false)}>
        <TouchableOpacity style={styles.qrModalBackdrop} onPress={() => setShowQRExpanded(false)} activeOpacity={1}>
          <View style={styles.qrModalCard}>
            <Text style={styles.qrModalTitle}>Check-in QR Code</Text>
            <View style={[styles.qrBox, { width: 200, height: 200 }]}>
              <View style={[styles.qrFinder, { top: 0, left: 0, width: 40, height: 40 }]} />
              <View style={[styles.qrFinder, { top: 0, right: 0, width: 40, height: 40 }]} />
              <View style={[styles.qrFinder, { bottom: 0, left: 0, width: 40, height: 40 }]} />
              <View style={[styles.qrMatrix, { width: 130, height: 130 }]}>
                {Array.from({ length: 10 }).map((_, r) => (
                  <View key={r} style={styles.qrRow}>
                    {Array.from({ length: 10 }).map((_, c) => {
                      const isAlignment = (r < 3 && c < 3) || (r < 3 && c >= 7) || (r >= 7 && c < 3);
                      const filled = !isAlignment && (r * c + r + c) % 2 === 0;
                      return <View key={c} style={[styles.qrDot, { width: 10, height: 10 }, filled && { backgroundColor: '#111827' }]} />;
                    })}
                  </View>
                ))}
              </View>
            </View>
            <Text style={styles.qrModalSub}>Show this at the entrance to check in</Text>
            <TouchableOpacity onPress={() => setShowQRExpanded(false)} style={styles.qrModalClose}>
              <Text style={styles.qrModalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  bgBlobTop: {
    position: 'absolute',
    top: -100,
    left: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(99,102,241,0.08)',
    zIndex: 0,
  },
  bgBlobBottom: {
    position: 'absolute',
    bottom: -120,
    right: -120,
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: 'rgba(6,182,212,0.07)',
    zIndex: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
    minHeight: Platform.OS === 'ios' ? 120 : 96,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FAFAFA',
    zIndex: 10,
    marginBottom: 24,
  },
  headerBackBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: FONTS.bold,
    fontSize: 17,
    color: '#111827',
  },
  headerMoreBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 24,
    zIndex: 1,
  },
  statusPillWrapper: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 4,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22C55E',
    marginRight: 6,
  },
  statusText: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: '#15803D',
  },
  statusSub: {
    fontFamily: FONTS.medium,
    fontSize: 11,
    color: '#6B7280',
    marginTop: 6,
    textAlign: 'center',
  },
  bookingCard: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 5,
  },
  bookingCardGrad: {
    padding: 20,
  },
  bookingCardVenue: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: '#FFFFFF',
  },
  bookingCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  bookingRatingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 10,
  },
  bookingRatingText: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    color: '#FFFFFF',
  },
  bookingDistance: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  bookingIdRow: {
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    paddingTop: 12,
  },
  bookingIdLabel: {
    fontFamily: FONTS.medium,
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bookingIdVal: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: '#FFFFFF',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  cardSectionTitle: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: '#4B5563',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeCol: {
    flex: 1,
    alignItems: 'center',
  },
  timeDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E7EB',
  },
  timeEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  timeLabel: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: '#111827',
    textAlign: 'center',
  },
  timeMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  durationText: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    color: '#6366F1',
  },
  countdownBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  countdownDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F59E0B',
    marginRight: 6,
  },
  countdownText: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    color: '#D97706',
  },
  seatInfoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  seatIconBg: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  seatEmoji: {
    fontSize: 22,
  },
  seatDetails: {
    flex: 1,
  },
  seatIdText: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: '#111827',
    marginBottom: 8,
  },
  seatTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  seatTag: {
    backgroundColor: '#EEF2FF',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  seatTagText: {
    fontFamily: FONTS.medium,
    fontSize: 10,
    color: '#4338CA',
  },
  qrWrapper: {
    alignItems: 'center',
    marginBottom: 12,
  },
  qrBox: {
    width: 140,
    height: 140,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 10,
  },
  qrFinder: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderWidth: 5,
    borderColor: '#111827',
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  qrMatrix: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrRow: {
    flexDirection: 'row',
    marginVertical: 0.5,
  },
  qrDot: {
    width: 7,
    height: 7,
    borderRadius: 1,
    backgroundColor: 'transparent',
    marginHorizontal: 0.5,
  },
  qrCaption: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 14,
  },
  qrActionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  qrBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  qrBtnText: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: '#6366F1',
  },
  miniMap: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 14,
  },
  miniMapGrad: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniMapLabel: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: '#4338CA',
    marginTop: 6,
  },
  miniMapSub: {
    fontFamily: FONTS.medium,
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  dirRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dirInfo: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  dirDistVal: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: '#111827',
  },
  dirDistLabel: {
    fontFamily: FONTS.medium,
    fontSize: 10,
    color: '#6B7280',
    marginTop: 2,
  },
  dirDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E5E7EB',
  },
  dirBtn: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    overflow: 'hidden',
    marginLeft: 12,
  },
  dirBtnGrad: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dirBtnText: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: '#FFFFFF',
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 14,
  },
  amenityItem: {
    width: '33.3%',
    alignItems: 'center',
    marginVertical: 8,
  },
  amenityIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  amenityLabel: {
    fontFamily: FONTS.medium,
    fontSize: 11,
    color: '#4B5563',
  },
  contactRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  contactBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  contactBtnText: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: '#6366F1',
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  ruleCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  ruleText: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: '#374151',
  },
  supportHeader: {
    marginBottom: 12,
  },
  supportSub: {
    fontFamily: FONTS.medium,
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  supportActionsRow: {
    flexDirection: 'row',
  },
  supportBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  supportBtnText: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: '#6366F1',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FAFAFA',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    alignItems: 'center',
  },
  bottomCTA: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  bottomCTAGrad: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomCTAText: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: '#FFFFFF',
  },
  bottomCancelLink: {
    marginTop: 10,
    paddingVertical: 4,
  },
  bottomCancelText: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: '#EF4444',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: Platform.OS === 'ios' ? 80 : 72,
    paddingRight: 16,
  },
  moreMenuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 6,
    width: 220,
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 10,
  },
  moreMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  moreMenuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  moreMenuItemText: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: '#1F2937',
  },
  qrModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrModalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 28,
    alignItems: 'center',
    width: 300,
  },
  qrModalTitle: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: '#111827',
    marginBottom: 20,
  },
  qrModalSub: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 16,
  },
  qrModalClose: {
    marginTop: 20,
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  qrModalCloseText: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: '#6366F1',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyHeading: {
    fontFamily: FONTS.bold,
    fontSize: 22,
    color: '#111827',
    textAlign: 'center',
  },
  emptySub: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  emptyBtn: {
    width: '100%',
    height: 54,
    borderRadius: 27,
    overflow: 'hidden',
  },
  emptyBtnGrad: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyBtnText: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: '#FFFFFF',
  },
});
