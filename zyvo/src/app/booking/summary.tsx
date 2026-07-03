import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Animated,
  TextInput,
  Image,
  Alert,
  Switch,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSpaceStore } from '../../store/spaceStore';
import { useBookingStore } from '../../store/bookingStore';
import { FONTS } from '../../constants/fonts';

const SPACE_IMAGES = [
  'https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800&auto=format&fit=crop',
];

export default function BookingSummaryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  
  const spaces = useSpaceStore((state) => state.spaces);
  const addBooking = useBookingStore((state) => state.addBooking);

  // Extraction of checkout params
  const spaceId = (params.spaceId as string) || '1';
  const seatId = (params.seatId as string) || 'B12';
  const slot = (params.slot as string) || '2:00 PM – 5:00 PM';
  const hoursCount = Number(params.hoursCount) || 3;
  const zone = (params.zone as string) || 'Silent Zone';
  const isWindow = (params.isWindow as string) || 'Yes';
  const hasPower = (params.hasPower as string) || 'Yes';
  const hourlyRate = Number(params.price) || 60;

  const baseSpace = spaces.find((s) => s.id === spaceId);
  const space = baseSpace || {
    id: spaceId,
    name: "The Scholar's Haven",
    rating: 4.9,
    reviewsCount: 520,
    distance: '1.8 km away',
    location: '412 Library Lane, University District',
  };

  const [promoCode, setPromoCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [selectedPayMethod, setSelectedPayMethod] = useState<'Google Pay' | 'UPI' | 'Card'>('Google Pay');

  // Animation values
  const pageFade = useRef(new Animated.Value(0)).current;
  const promoScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(pageFade, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  const handleApplyPromo = () => {
    if (!promoCode.trim()) {
      Alert.alert('Promo Code', 'Please enter a valid promo code.');
      return;
    }
    setDiscountApplied(true);
    Animated.sequence([
      Animated.timing(promoScale, { toValue: 1.15, duration: 100, useNativeDriver: true }),
      Animated.spring(promoScale, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();
  };

  // Pricing calculations
  const subtotal = hourlyRate * hoursCount;
  const platformFee = 10;
  const discountVal = discountApplied ? 20 : 0;
  const gstVal = Math.round((subtotal + platformFee - discountVal) * 0.05);
  const finalTotal = subtotal + platformFee - discountVal + gstVal;

  const handleProceedPayment = () => {
    if (!agreeTerms) {
      Alert.alert('Terms Agreement', 'Please agree to the booking terms and cancellation policy to proceed.');
      return;
    }

    router.push({
      pathname: '/booking/payment',
      params: {
        spaceId: space.id,
        seatId: seatId,
        slot: slot,
        hoursCount: hoursCount,
        price: hourlyRate,
        total: finalTotal,
      },
    } as any);
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* HEADER */}
      <View style={[styles.header, { paddingTop: insets.top || 14 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.75}>
          <Feather name="arrow-left" size={20} color="#111827" />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 14 }}>
          <Text style={styles.headerTitle}>Booking Summary</Text>
          <Text style={styles.headerSubtitle}>Review your reservation before checkout</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
        {/* BOOKING OVERVIEW CARD */}
        <Animated.View style={[styles.card, { opacity: pageFade, marginTop: 16 }]}>
          <Image source={{ uri: SPACE_IMAGES[0] }} style={styles.coverImage} resizeMode="cover" />
          <View style={styles.cardHeaderInfo}>
            <Text style={styles.spaceName}>{space.name}</Text>
            <View style={styles.metaRow}>
              <Ionicons name="star" size={12} color="#F59E0B" />
              <Text style={styles.metaText}> {space.rating} ({space.reviewsCount} Reviews)  •  📍 {space.distance}</Text>
            </View>
          </View>
        </Animated.View>

        {/* BOOKING DETAILS CARD */}
        <Text style={styles.sectionTitle}>Booking Details</Text>
        <View style={styles.card}>
          <View style={styles.detailItem}>
            <Feather name="calendar" size={15} color="#6B7280" style={styles.detailIcon} />
            <Text style={styles.detailLabel}>Date</Text>
            <Text style={styles.detailValue}>30 June 2026</Text>
          </View>
          <View style={styles.detailItem}>
            <Feather name="clock" size={15} color="#6B7280" style={styles.detailIcon} />
            <Text style={styles.detailLabel}>Time</Text>
            <Text style={styles.detailValue}>{slot}</Text>
          </View>
          <View style={styles.detailItem}>
            <Feather name="activity" size={15} color="#6B7280" style={styles.detailIcon} />
            <Text style={styles.detailLabel}>Duration</Text>
            <Text style={styles.detailValue}>{hoursCount} Hours</Text>
          </View>
          <View style={styles.detailItem}>
            <Feather name="layers" size={15} color="#6B7280" style={styles.detailIcon} />
            <Text style={styles.detailLabel}>Seat</Text>
            <Text style={styles.detailValue}>{seatId}</Text>
          </View>
          <View style={styles.detailItem}>
            <Feather name="info" size={15} color="#6B7280" style={styles.detailIcon} />
            <Text style={styles.detailLabel}>Seat Type</Text>
            <Text style={styles.detailValue}>
              {isWindow === 'Yes' ? 'Window ' : ''}
              {hasPower === 'Yes' ? '+ Charging Port' : ''}
            </Text>
          </View>
          <View style={[styles.detailItem, { borderBottomWidth: 0 }]}>
            <Feather name="users" size={15} color="#6B7280" style={styles.detailIcon} />
            <Text style={styles.detailLabel}>Guests</Text>
            <Text style={styles.detailValue}>1 Student</Text>
          </View>
        </View>

        {/* PROMO CODE */}
        <Text style={styles.sectionTitle}>Promo Code</Text>
        <Animated.View style={[styles.card, styles.promoRow, { transform: [{ scale: promoScale }] }]}>
          <TextInput
            style={styles.promoInput}
            placeholder="Have a promo code?"
            placeholderTextColor="#9CA3AF"
            value={promoCode}
            onChangeText={setPromoCode}
          />
          <TouchableOpacity style={styles.promoBtn} activeOpacity={0.8} onPress={handleApplyPromo}>
            <Text style={styles.promoBtnText}>{discountApplied ? 'Applied' : 'Apply'}</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* PRICE BREAKDOWN */}
        <Text style={styles.sectionTitle}>Price Details</Text>
        <View style={styles.card}>
          <View style={styles.priceItem}>
            <Text style={styles.priceLabel}>Hourly Rate (₹{hourlyRate} × {hoursCount} hrs)</Text>
            <Text style={styles.priceVal}>₹{subtotal}</Text>
          </View>
          <View style={styles.priceItem}>
            <Text style={styles.priceLabel}>Platform Fee</Text>
            <Text style={styles.priceVal}>₹{platformFee}</Text>
          </View>
          {discountApplied && (
            <View style={styles.priceItem}>
              <Text style={[styles.priceLabel, { color: '#22C55E' }]}>Discount Code</Text>
              <Text style={[styles.priceVal, { color: '#22C55E' }]}>-₹{discountVal}</Text>
            </View>
          )}
          <View style={styles.priceItem}>
            <Text style={styles.priceLabel}>GST (5%)</Text>
            <Text style={styles.priceVal}>₹{gstVal}</Text>
          </View>
          <View style={styles.priceDivider} />
          <View style={[styles.priceItem, { marginBottom: 0 }]}>
            <Text style={styles.priceTotalLabel}>Total Amount</Text>
            <Text style={styles.priceTotalVal}>₹{finalTotal}</Text>
          </View>
        </View>

        {/* CANCELLATION POLICY */}
        <View style={[styles.card, styles.policyCard]}>
          <Feather name="check-circle" size={18} color="#22C55E" style={{ marginRight: 10, marginTop: 1 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.policyText}>
              Free cancellation up to 30 minutes before your booking starts.
            </Text>
            <TouchableOpacity style={{ marginTop: 5 }}>
              <Text style={styles.policyLink}>View Full Policy</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* PAYMENT METHOD PREVIEW */}
        <Text style={styles.sectionTitle}>Payment Method</Text>
        <View style={[styles.card, styles.payPreviewRow]}>
          <View style={styles.payLeft}>
            <Feather name="credit-card" size={18} color="#4F7EFF" style={{ marginRight: 10 }} />
            <Text style={styles.payMethodText}>UPI / Google Pay</Text>
          </View>
          <TouchableOpacity style={styles.changeBtn}>
            <Text style={styles.changeBtnText}>Change</Text>
          </TouchableOpacity>
        </View>

        {/* TERMS AGREEMENT */}
        <View style={styles.termsRow}>
          <Switch value={agreeTerms} onValueChange={setAgreeTerms} trackColor={{ false: '#CBD5E1', true: '#4F7EFF' }} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.termsText}>
              I agree to the booking terms and cancellation policy.{' '}
              <Text style={styles.termsLink}>Terms of Service</Text> & <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* STICKY BOTTOM BAR */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <View style={styles.bottomBarLeft}>
          <Text style={styles.bottomLabel}>Total</Text>
          <Text style={styles.bottomPrice}>₹{finalTotal}</Text>
        </View>

        <TouchableOpacity style={styles.paymentBtn} activeOpacity={0.85} onPress={handleProceedPayment}>
          <Text style={styles.paymentBtnText}>Proceed to Payment</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8FAFC' },

  // Header styles
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 14, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E8EEF8' },
  backBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: FONTS.bold, fontSize: 18, color: '#111827' },
  headerSubtitle: { fontFamily: FONTS.medium, fontSize: 12, color: '#6B7280', marginTop: 1 },

  scrollBody: { paddingHorizontal: 20, paddingBottom: 120 },

  // Overview card
  card: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: '#E8EEF8', shadowColor: '#111827', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 1 },
  coverImage: { width: '100%', height: 130, borderRadius: 14, marginBottom: 12 },
  cardHeaderInfo: { paddingHorizontal: 4 },
  spaceName: { fontFamily: FONTS.bold, fontSize: 16, color: '#111827', marginBottom: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center' },
  metaText: { fontFamily: FONTS.medium, fontSize: 11.5, color: '#6B7280' },

  sectionTitle: { fontFamily: FONTS.bold, fontSize: 15, color: '#111827', marginTop: 18, marginBottom: 10 },

  // Details items
  detailItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  detailIcon: { marginRight: 10 },
  detailLabel: { fontFamily: FONTS.medium, fontSize: 13, color: '#6B7280', flex: 1 },
  detailValue: { fontFamily: FONTS.bold, fontSize: 13, color: '#111827' },

  // Promo card
  promoRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8 },
  promoInput: { flex: 1, fontFamily: FONTS.regular, fontSize: 13.5, color: '#111827', paddingVertical: 6 },
  promoBtn: { backgroundColor: '#EEF2FF', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  promoBtnText: { fontFamily: FONTS.bold, fontSize: 12, color: '#4F7EFF' },

  // Price details
  priceItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  priceLabel: { fontFamily: FONTS.medium, fontSize: 13, color: '#6B7280' },
  priceVal: { fontFamily: FONTS.bold, fontSize: 13, color: '#111827' },
  priceDivider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 12 },
  priceTotalLabel: { fontFamily: FONTS.bold, fontSize: 14, color: '#111827' },
  priceTotalVal: { fontFamily: FONTS.bold, fontSize: 18, color: '#4F7EFF' },

  // Cancellation Policy
  policyCard: { flexDirection: 'row', alignItems: 'flex-start', padding: 14, borderColor: '#D1FAE5', backgroundColor: '#F0FDF4' },
  policyText: { fontFamily: FONTS.medium, fontSize: 12.5, color: '#15803D', lineHeight: 18 },
  policyLink: { fontFamily: FONTS.bold, fontSize: 12, color: '#15803D', textDecorationLine: 'underline' },

  // Pay preview row
  payPreviewRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14 },
  payLeft: { flexDirection: 'row', alignItems: 'center' },
  payMethodText: { fontFamily: FONTS.bold, fontSize: 13.5, color: '#374151' },
  changeBtn: { paddingHorizontal: 4 },
  changeBtnText: { fontFamily: FONTS.bold, fontSize: 13, color: '#4F7EFF' },

  // Terms Row
  termsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, marginBottom: 20 },
  termsText: { fontFamily: FONTS.medium, fontSize: 12, color: '#6B7280', lineHeight: 18 },
  termsLink: { fontFamily: FONTS.bold, color: '#4F7EFF' },

  // Sticky bottom bar
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E8EEF8', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 12, shadowColor: '#111827', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.04, shadowRadius: 10, elevation: 10 },
  bottomBarLeft: { justifyContent: 'center' },
  bottomLabel: { fontFamily: FONTS.medium, fontSize: 11, color: '#6B7280', marginBottom: 1 },
  bottomPrice: { fontFamily: FONTS.bold, fontSize: 20, color: '#111827' },
  paymentBtn: { backgroundColor: '#4F7EFF', borderRadius: 20, paddingHorizontal: 28, height: 48, justifyContent: 'center', alignItems: 'center' },
  paymentBtnText: { fontFamily: FONTS.bold, fontSize: 14, color: '#FFFFFF' },
});
