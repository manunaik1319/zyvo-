import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Animated,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSpaceStore } from '../../store/spaceStore';
import { useBookingStore } from '../../store/bookingStore';
import { FONTS } from '../../constants/fonts';

const SPACE_IMAGES = [
  'https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=600&auto=format&fit=crop',
];

interface PaymentMethodItem {
  id: string;
  name: string;
  category: 'UPI' | 'Cards' | 'Wallets' | 'Net Banking';
  icon: string;
}

const PAYMENT_METHODS: PaymentMethodItem[] = [
  // UPI
  { id: 'gpay', name: 'Google Pay', category: 'UPI', icon: 'logo-google' },
  { id: 'phonepe', name: 'PhonePe', category: 'UPI', icon: 'phone-portrait-outline' },
  { id: 'paytm', name: 'Paytm', category: 'UPI', icon: 'wallet-outline' },
  { id: 'bhim', name: 'BHIM UPI', category: 'UPI', icon: 'phone-portrait-outline' },
  // Cards
  { id: 'visa', name: 'Visa Card', category: 'Cards', icon: 'card-outline' },
  { id: 'mastercard', name: 'Mastercard', category: 'Cards', icon: 'card-outline' },
  { id: 'rupay', name: 'RuPay Card', category: 'Cards', icon: 'card-outline' },
  // Wallets
  { id: 'amazonpay', name: 'Amazon Pay', category: 'Wallets', icon: 'wallet-outline' },
  { id: 'mobikwik', name: 'Mobikwik', category: 'Wallets', icon: 'wallet-outline' },
];

export default function BookingPaymentScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();

  const spaces = useSpaceStore((state) => state.spaces);
  const addBooking = useBookingStore((state) => state.addBooking);

  // Params extracted from Summary
  const spaceId = (params.spaceId as string) || '1';
  const seatId = (params.seatId as string) || 'B12';
  const slot = (params.slot as string) || '2:00 PM – 5:00 PM';
  const hoursCount = Number(params.hoursCount) || 3;
  const hourlyRate = Number(params.price) || 60;
  const initialTotal = Number(params.total) || 179;

  const baseSpace = spaces.find((s) => s.id === spaceId);
  const space = baseSpace || {
    id: spaceId,
    name: "The Scholar's Haven",
    rating: 4.9,
    reviewsCount: 520,
    distance: '1.8 km away',
    location: '412 Library Lane, University District',
  };

  const [selectedMethod, setSelectedMethod] = useState<string>('gpay');
  const [netBankingOpen, setNetBankingOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [discountVal, setDiscountVal] = useState(0);

  // Animations
  const pageFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(pageFade, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  // Recalculations
  const subtotal = hourlyRate * hoursCount;
  const platformFee = 10;
  const gstVal = Math.round((subtotal + platformFee - discountVal) * 0.05);
  const finalTotal = subtotal + platformFee - discountVal + gstVal;

  const handleApplyOffer = (amount: number) => {
    setDiscountVal(amount);
    Alert.alert('Offer Applied', `Flat ₹${amount} discount applied to your payment total!`);
  };

  const handlePaySecurely = () => {
    if (processing) return;
    setProcessing(true);

    // Simulate 1.5s gateway loading
    setTimeout(() => {
      // Complete transaction and add to store
      addBooking({
        id: `ZYV-2026-${Math.floor(100000 + Math.random() * 900000)}`,
        spaceId: space.id,
        spaceName: space.name,
        spaceImageUrl: SPACE_IMAGES[0],
        category: spaceId === '1' ? 'Libraries' : 'Silent Rooms',
        date: '30 June 2026',
        timeSlot: slot,
        hours: hoursCount,
        totalPrice: finalTotal,
        status: 'active',
        location: space.location || '412 Library Lane, University District',
        seatId: seatId,
        floor: '1',
        paymentMethod: selectedMethod.toUpperCase(),
      });

      setProcessing(false);
      router.push({
        pathname: '/booking/success',
        params: {
          spaceId: space.id,
          seatId: seatId,
          slot: slot,
          total: finalTotal,
        },
      } as any);
    }, 1600);
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
          <Text style={styles.headerTitle}>Payment</Text>
          <Text style={styles.headerSubtitle}>Complete your booking securely</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
        {/* BOOKING SUMMARY CARD */}
        <Animated.View style={[styles.card, { opacity: pageFade, marginTop: 16 }]}>
          <Text style={styles.cardSpaceName}>{space.name}</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Feather name="calendar" size={13} color="#6B7280" style={{ marginRight: 5 }} />
              <Text style={styles.summaryVal}>30 June 2026</Text>
            </View>
            <View style={styles.summaryItem}>
              <Feather name="clock" size={13} color="#6B7280" style={{ marginRight: 5 }} />
              <Text style={styles.summaryVal}>{slot}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Feather name="layers" size={13} color="#6B7280" style={{ marginRight: 5 }} />
              <Text style={styles.summaryVal}>Seat {seatId}</Text>
            </View>
          </View>
          <View style={styles.cardFooter}>
            <Text style={styles.cardTotalLabel}>Total Amount</Text>
            <Text style={styles.cardTotalVal}>₹{finalTotal}</Text>
          </View>
        </Animated.View>

        {/* OFFERS & COUPONS */}
        <Text style={styles.sectionTitle}>Offers & Coupons</Text>
        <View style={[styles.card, { padding: 14 }]}>
          <View style={styles.offerItem}>
            <View style={{ flex: 1 }}>
              <Text style={styles.offerName}>🎓 Student Discount</Text>
              <Text style={styles.offerDesc}>Flat ₹50 OFF on student card validation</Text>
            </View>
            <TouchableOpacity style={styles.offerApplyBtn} onPress={() => handleApplyOffer(50)}>
              <Text style={styles.offerApplyTxt}>Apply</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.offerItem, { borderBottomWidth: 0, paddingBottom: 0, marginTop: 10 }]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.offerName}>🔥 Flat ₹20 OFF</Text>
              <Text style={styles.offerDesc}>Instant cash discount on UPI bookings</Text>
            </View>
            <TouchableOpacity style={styles.offerApplyBtn} onPress={() => handleApplyOffer(20)}>
              <Text style={styles.offerApplyTxt}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* PAYMENT METHODS */}
        <Text style={styles.sectionTitle}>Choose Payment Method</Text>

        {/* UPI Methods */}
        <Text style={styles.groupLabel}>UPI Payments</Text>
        {PAYMENT_METHODS.filter((p) => p.category === 'UPI').map((item) => {
          const active = selectedMethod === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.methodRow, active && styles.methodRowActive]}
              activeOpacity={0.8}
              onPress={() => setSelectedMethod(item.id)}
            >
              <View style={styles.methodLeft}>
                <View style={[styles.methodIconBox, active && styles.methodIconBoxActive]}>
                  <Ionicons name={item.icon as any} size={18} color={active ? '#4F7EFF' : '#6B7280'} />
                </View>
                <Text style={[styles.methodName, active && styles.methodNameActive]}>{item.name}</Text>
              </View>
              {active ? (
                <View style={styles.checkOutline}>
                  <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                </View>
              ) : (
                <View style={styles.checkEmpty} />
              )}
            </TouchableOpacity>
          );
        })}

        {/* Saved Cards */}
        <Text style={styles.groupLabel}>Saved Cards & Payments</Text>
        <TouchableOpacity
          style={[styles.methodRow, selectedMethod === 'saved_visa' && styles.methodRowActive]}
          activeOpacity={0.8}
          onPress={() => setSelectedMethod('saved_visa')}
        >
          <View style={styles.methodLeft}>
            <View style={[styles.methodIconBox, selectedMethod === 'saved_visa' && styles.methodIconBoxActive]}>
              <Ionicons name="card-outline" size={18} color={selectedMethod === 'saved_visa' ? '#4F7EFF' : '#6B7280'} />
            </View>
            <Text style={[styles.methodName, selectedMethod === 'saved_visa' && styles.methodNameActive]}>Visa **** 4587</Text>
          </View>
          {selectedMethod === 'saved_visa' ? (
            <View style={styles.checkOutline}>
              <Ionicons name="checkmark" size={12} color="#FFFFFF" />
            </View>
          ) : (
            <View style={styles.checkEmpty} />
          )}
        </TouchableOpacity>

        {/* Other Card Options */}
        <Text style={styles.groupLabel}>Credit / Debit Cards</Text>
        {PAYMENT_METHODS.filter((p) => p.category === 'Cards').map((item) => {
          const active = selectedMethod === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.methodRow, active && styles.methodRowActive]}
              activeOpacity={0.8}
              onPress={() => setSelectedMethod(item.id)}
            >
              <View style={styles.methodLeft}>
                <View style={[styles.methodIconBox, active && styles.methodIconBoxActive]}>
                  <Ionicons name={item.icon as any} size={18} color={active ? '#4F7EFF' : '#6B7280'} />
                </View>
                <Text style={[styles.methodName, active && styles.methodNameActive]}>{item.name}</Text>
              </View>
              {active ? (
                <View style={styles.checkOutline}>
                  <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                </View>
              ) : (
                <View style={styles.checkEmpty} />
              )}
            </TouchableOpacity>
          );
        })}

        {/* Net Banking Collapsed */}
        <TouchableOpacity
          style={[styles.methodRow, { marginTop: 14 }]}
          activeOpacity={0.8}
          onPress={() => setNetBankingOpen(!netBankingOpen)}
        >
          <View style={styles.methodLeft}>
            <View style={styles.methodIconBox}>
              <Ionicons name="business-outline" size={18} color="#6B7280" />
            </View>
            <Text style={styles.methodName}>Net Banking Options</Text>
          </View>
          <Feather name={netBankingOpen ? 'chevron-up' : 'chevron-down'} size={16} color="#6B7280" />
        </TouchableOpacity>
        
        {netBankingOpen && (
          <View style={styles.netBankingPanel}>
            {['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank'].map((bank, i) => (
              <TouchableOpacity
                key={i}
                style={styles.bankItem}
                onPress={() => {
                  setSelectedMethod(`bank_${i}`);
                  Alert.alert('Selected', `${bank} chosen for Net Banking payment.`);
                }}
              >
                <Text style={styles.bankText}>{bank}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* SECURE INFO CARD */}
        <View style={[styles.card, styles.secureCard]}>
          <Feather name="lock" size={15} color="#22C55E" style={{ marginRight: 8 }} />
          <Text style={styles.secureText}>
            Your payment information is protected and securely processed via 256-bit encryption.
          </Text>
        </View>

        {/* PRICE SUMMARY */}
        <Text style={styles.sectionTitle}>Price Summary</Text>
        <View style={styles.card}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Hourly Charge (₹{hourlyRate} × {hoursCount} hrs)</Text>
            <Text style={styles.priceVal}>₹{subtotal}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Platform Fee</Text>
            <Text style={styles.priceVal}>₹{platformFee}</Text>
          </View>
          {discountVal > 0 && (
            <View style={styles.priceRow}>
              <Text style={[styles.priceLabel, { color: '#22C55E' }]}>Offers Discount</Text>
              <Text style={[styles.priceVal, { color: '#22C55E' }]}>-₹{discountVal}</Text>
            </View>
          )}
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>GST (5%)</Text>
            <Text style={styles.priceVal}>₹{gstVal}</Text>
          </View>
          <View style={styles.priceDivider} />
          <View style={[styles.priceRow, { marginBottom: 0 }]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalVal}>₹{finalTotal}</Text>
          </View>
        </View>
      </ScrollView>

      {/* STICKY BOTTOM BAR */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <View style={styles.bottomBarLeft}>
          <Text style={styles.bottomLabel}>Total Amount</Text>
          <Text style={styles.bottomPrice}>₹{finalTotal}</Text>
        </View>

        <TouchableOpacity style={styles.payBtn} activeOpacity={0.85} onPress={handlePaySecurely} disabled={processing}>
          {processing ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.payBtnText}>Pay Securely</Text>
          )}
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

  // Cards layout
  card: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#E8EEF8', shadowColor: '#111827', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 1 },
  cardSpaceName: { fontFamily: FONTS.bold, fontSize: 15, color: '#111827', marginBottom: 8 },
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, borderBottomWidth: 1, borderBottomColor: '#F3F4F6', paddingBottom: 12, marginBottom: 12 },
  summaryItem: { flexDirection: 'row', alignItems: 'center' },
  summaryVal: { fontFamily: FONTS.medium, fontSize: 12.5, color: '#374151' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTotalLabel: { fontFamily: FONTS.medium, fontSize: 12, color: '#6B7280' },
  cardTotalVal: { fontFamily: FONTS.bold, fontSize: 16, color: '#4F7EFF' },

  sectionTitle: { fontFamily: FONTS.bold, fontSize: 15, color: '#111827', marginTop: 18, marginBottom: 10 },
  groupLabel: { fontFamily: FONTS.bold, fontSize: 12, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 12, marginBottom: 8 },

  // Offers block
  offerItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  offerName: { fontFamily: FONTS.bold, fontSize: 13.5, color: '#374151' },
  offerDesc: { fontFamily: FONTS.medium, fontSize: 11, color: '#6B7280', marginTop: 1 },
  offerApplyBtn: { backgroundColor: '#EEF2FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  offerApplyTxt: { fontFamily: FONTS.bold, fontSize: 12, color: '#4F7EFF' },

  // Methods list
  methodRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 14, borderRadius: 16, marginBottom: 8, borderWidth: 1, borderColor: '#E5E7EB' },
  methodRowActive: { borderColor: '#4F7EFF', backgroundColor: '#F5F8FF' },
  methodLeft: { flexDirection: 'row', alignItems: 'center' },
  methodIconBox: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  methodIconBoxActive: { backgroundColor: '#EEF2FF' },
  methodName: { fontFamily: FONTS.medium, fontSize: 13.5, color: '#374151' },
  methodNameActive: { fontFamily: FONTS.bold, color: '#111827' },
  checkEmpty: { width: 18, height: 18, borderRadius: 9, borderWidth: 1.5, borderColor: '#CBD5E1' },
  checkOutline: { width: 18, height: 18, borderRadius: 9, backgroundColor: '#4F7EFF', alignItems: 'center', justifyContent: 'center' },

  // Net banking
  netBankingPanel: { backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#E5E7EB', paddingHorizontal: 14, marginBottom: 12 },
  bankItem: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  bankText: { fontFamily: FONTS.medium, fontSize: 13, color: '#4B5563' },

  // Secure warnings
  secureCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0FDF4', borderColor: '#D1FAE5', padding: 12, marginTop: 12 },
  secureText: { fontFamily: FONTS.medium, fontSize: 11.5, color: '#15803D', flex: 1, lineHeight: 16 },

  // Price details table
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  priceLabel: { fontFamily: FONTS.medium, fontSize: 13, color: '#6B7280' },
  priceVal: { fontFamily: FONTS.bold, fontSize: 13, color: '#111827' },
  priceDivider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 12 },
  totalLabel: { fontFamily: FONTS.bold, fontSize: 14, color: '#111827' },
  totalVal: { fontFamily: FONTS.bold, fontSize: 18, color: '#4F7EFF' },

  // Bottom bar
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E8EEF8', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 12, shadowColor: '#111827', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.04, shadowRadius: 10, elevation: 10 },
  bottomBarLeft: { justifyContent: 'center' },
  bottomLabel: { fontFamily: FONTS.medium, fontSize: 11, color: '#6B7280', marginBottom: 1 },
  bottomPrice: { fontFamily: FONTS.bold, fontSize: 20, color: '#111827' },
  payBtn: { backgroundColor: '#4F7EFF', borderRadius: 20, paddingHorizontal: 36, height: 48, justifyContent: 'center', alignItems: 'center' },
  payBtnText: { fontFamily: FONTS.bold, fontSize: 14, color: '#FFFFFF' },
});
