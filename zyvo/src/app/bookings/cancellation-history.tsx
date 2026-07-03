import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Dimensions,
  Animated,
  ActivityIndicator,
  Modal,
  Platform,
  LayoutAnimation,
  UIManager,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../constants/colors';
import { FONTS } from '../../constants/fonts';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ─── TYPES ───────────────────────────────────────────────────────────────────
interface RefundInfo {
  originalAmount: number;
  cancellationCharges: number;
  refundAmount: number;
  status: 'Refunded' | 'Partial Refund' | 'No Refund';
  method: string;
  refundDate: string;
}

interface CancellationDetail {
  cancelledOn: string;
  cancelledBy: 'User' | 'System';
  reason: string;
  policyApplied: string;
}

interface BookingTimelineStep {
  title: string;
  time: string;
  completed: boolean;
}

interface CancelledBooking {
  id: string;
  spaceId: string;
  spaceName: string;
  spaceImageUrl: string;
  city: string;
  date: string;
  dateObj: Date;
  timeSlot: string;
  seatNumber: string;
  duration: string;
  cancellation: CancellationDetail;
  refund: RefundInfo;
  paymentMethod: string;
  transactionId: string;
  notes: string;
  supportRef: string;
  timeline: BookingTimelineStep[];
}

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const MOCK_CANCELLED_BOOKINGS: CancelledBooking[] = [
  {
    id: 'ZYV-2026-004128',
    spaceId: '1',
    spaceName: "The Scholar's Haven",
    spaceImageUrl: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=600&auto=format&fit=crop',
    city: 'Sonepat',
    date: 'July 01, 2026',
    dateObj: new Date('2026-07-01'),
    timeSlot: '2:00 PM – 5:00 PM',
    seatNumber: 'Seat A12',
    duration: '3 hours',
    paymentMethod: 'UPI (GPay)',
    transactionId: 'TXN-9847192842',
    notes: 'Requested cancellation due to heavy rains and transit blockages.',
    supportRef: 'SR-2026-8812',
    cancellation: {
      cancelledOn: 'July 01, 2026, 11:30 AM',
      cancelledBy: 'User',
      reason: 'Change of plans - Weather conditions',
      policyApplied: 'Standard policy: Free cancellation before 2 hours of slot start',
    },
    refund: {
      originalAmount: 180,
      cancellationCharges: 0,
      refundAmount: 180,
      status: 'Refunded',
      method: 'UPI wallet account',
      refundDate: 'July 02, 2026',
    },
    timeline: [
      { title: 'Booking Confirmed', time: 'June 30, 2026, 04:15 PM', completed: true },
      { title: 'Cancellation Requested', time: 'July 01, 2026, 11:30 AM', completed: true },
      { title: 'Refund Initiated', time: 'July 01, 2026, 11:45 AM', completed: true },
      { title: 'Refund Completed', time: 'July 02, 2026, 10:20 AM', completed: true },
    ]
  },
  {
    id: 'ZYV-2026-003891',
    spaceId: '2',
    spaceName: 'Zenith Study Lounge',
    spaceImageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=600&auto=format&fit=crop',
    city: 'New Delhi',
    date: 'June 28, 2026',
    dateObj: new Date('2026-06-28'),
    timeSlot: '10:00 AM – 2:00 PM',
    seatNumber: 'Seat B04',
    duration: '4 hours',
    paymentMethod: 'Credit Card (Visa)',
    transactionId: 'TXN-4192841029',
    notes: 'Late cancellation within the 1-hour window before reservation.',
    supportRef: 'SR-2026-7491',
    cancellation: {
      cancelledOn: 'June 28, 2026, 09:15 AM',
      cancelledBy: 'User',
      reason: 'Class schedule conflict',
      policyApplied: 'Late policy: 50% charge applicable if cancelled within 2 hours',
    },
    refund: {
      originalAmount: 280,
      cancellationCharges: 140,
      refundAmount: 140,
      status: 'Partial Refund',
      method: 'Original card payment source',
      refundDate: 'June 30, 2026',
    },
    timeline: [
      { title: 'Booking Confirmed', time: 'June 25, 2026, 11:00 AM', completed: true },
      { title: 'Cancellation Requested', time: 'June 28, 2026, 09:15 AM', completed: true },
      { title: 'Partial Refund Processed', time: 'June 28, 2026, 09:30 AM', completed: true },
      { title: 'Refund Sent to Bank', time: 'June 30, 2026, 02:40 PM', completed: true },
    ]
  },
  {
    id: 'ZYV-2026-003502',
    spaceId: '3',
    spaceName: 'Quiet Flow Hub',
    spaceImageUrl: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=600&auto=format&fit=crop',
    city: 'Gurugram',
    date: 'June 15, 2026',
    dateObj: new Date('2026-06-15'),
    timeSlot: '4:00 PM – 8:00 PM',
    seatNumber: 'Seat C12',
    duration: '4 hours',
    paymentMethod: 'Debit Card (Rupay)',
    transactionId: 'TXN-1049281203',
    notes: 'Automatic cancellation due to failing checking in within 30 minutes of starting time.',
    supportRef: 'SR-2026-6194',
    cancellation: {
      cancelledOn: 'June 15, 2026, 04:30 PM',
      cancelledBy: 'System',
      reason: 'No-show timeout (Exceeded 30-min checking buffer)',
      policyApplied: 'No-show policy: Non-refundable if checked-in window expires',
    },
    refund: {
      originalAmount: 240,
      cancellationCharges: 240,
      refundAmount: 0,
      status: 'No Refund',
      method: 'N/A',
      refundDate: 'N/A',
    },
    timeline: [
      { title: 'Booking Confirmed', time: 'June 14, 2026, 09:30 PM', completed: true },
      { title: 'Booking Start Time', time: 'June 15, 2026, 04:00 PM', completed: true },
      { title: 'No-Show Triggered (System)', time: 'June 15, 2026, 04:30 PM', completed: true },
      { title: 'Session Cancelled (0% Refund)', time: 'June 15, 2026, 04:30 PM', completed: true },
    ]
  },
  {
    id: 'ZYV-2026-002810',
    spaceId: '4',
    spaceName: 'Nexus Study Lab',
    spaceImageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=600&auto=format&fit=crop',
    city: 'Noida',
    date: 'May 10, 2026',
    dateObj: new Date('2026-05-10'),
    timeSlot: '01:00 PM – 03:00 PM',
    seatNumber: 'Seat E02',
    duration: '2 hours',
    paymentMethod: 'UPI (PhonePe)',
    transactionId: 'TXN-7489201948',
    notes: 'Cancelled space due to personal emergency.',
    supportRef: 'SR-2026-4021',
    cancellation: {
      cancelledOn: 'May 09, 2026, 09:00 PM',
      cancelledBy: 'User',
      reason: 'Personal emergency',
      policyApplied: 'Standard policy: Free cancellation before 2 hours of slot start',
    },
    refund: {
      originalAmount: 110,
      cancellationCharges: 0,
      refundAmount: 110,
      status: 'Refunded',
      method: 'UPI Wallet Account',
      refundDate: 'May 10, 2026',
    },
    timeline: [
      { title: 'Booking Confirmed', time: 'May 09, 2026, 10:00 AM', completed: true },
      { title: 'Cancellation Requested', time: 'May 09, 2026, 09:00 PM', completed: true },
      { title: 'Refund Completed', time: 'May 10, 2026, 12:00 PM', completed: true },
    ]
  }
];

// Additional mock data page for simulating infinite scroll pagination
const PAGINATED_MOCK_CANCELLED_BOOKINGS: CancelledBooking[] = [
  {
    id: 'ZYV-2026-001920',
    spaceId: '5',
    spaceName: 'Hacker Cabin Hub',
    spaceImageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=600&auto=format&fit=crop',
    city: 'Gurugram',
    date: 'April 22, 2026',
    dateObj: new Date('2026-04-22'),
    timeSlot: '09:00 AM – 01:00 PM',
    seatNumber: 'Seat B15',
    duration: '4 hours',
    paymentMethod: 'Credit Card',
    transactionId: 'TXN-3829012948',
    notes: 'Space booked incorrectly, selected PM instead of AM.',
    supportRef: 'SR-2026-2189',
    cancellation: {
      cancelledOn: 'April 22, 2026, 08:35 AM',
      cancelledBy: 'User',
      reason: 'Booked incorrect date/time slot',
      policyApplied: 'Late cancellation policy applies (50% charge inside 1 hour)',
    },
    refund: {
      originalAmount: 320,
      cancellationCharges: 160,
      refundAmount: 160,
      status: 'Partial Refund',
      method: 'Credit Card Source',
      refundDate: 'April 24, 2026',
    },
    timeline: [
      { title: 'Booking Confirmed', time: 'April 22, 2026, 08:30 AM', completed: true },
      { title: 'Cancellation Requested', time: 'April 22, 2026, 08:35 AM', completed: true },
      { title: 'Refund Completed', time: 'April 24, 2026, 03:00 PM', completed: true },
    ]
  }
];

// ─── SHIMMER SKELETON COMPONENT ───────────────────────────────────────────────
function ShimmerCard() {
  const pulse = useRef(new Animated.Value(0.4)).current;
  
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.0, duration: 800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.4, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={[styles.shimmerCard, { opacity: pulse }]}>
      <View style={styles.shimmerTop}>
        <View style={styles.shimmerImg} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <View style={styles.shimmerTitle} />
          <View style={styles.shimmerSubtitle} />
        </View>
        <View style={styles.shimmerBadge} />
      </View>
      <View style={styles.shimmerMiddle}>
        <View style={styles.shimmerLine} />
        <View style={styles.shimmerLineShort} />
      </View>
      <View style={styles.shimmerBottom}>
        <View style={styles.shimmerButton} />
        <View style={styles.shimmerButton} />
      </View>
    </Animated.View>
  );
}

// ─── MAIN SCREEN ─────────────────────────────────────────────────────────────
export default function CancellationHistory() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  // States
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  
  // Life states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  // Pagination
  const [visibleBookings, setVisibleBookings] = useState<CancelledBooking[]>([]);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  
  // Policy Bottom Sheet
  const [policyVisible, setPolicyVisible] = useState(false);

  // Screen entrance animation
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Load data mock
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = (retry = false) => {
    if (retry) {
      setError(false);
    }
    setLoading(true);
    setPage(1);
    setHasMore(true);
    
    setTimeout(() => {
      // Small chance to simulate loading failure for robust error handling demonstration (if search is 'error')
      if (search.toLowerCase() === 'error') {
        setError(true);
        setLoading(false);
        return;
      }
      
      setVisibleBookings(MOCK_CANCELLED_BOOKINGS);
      setLoading(false);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }, 1500);
  };

  // Expand / collapse card with layout animation
  const toggleExpandCard = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (expandedCardId === id) {
      setExpandedCardId(null);
    } else {
      setExpandedCardId(id);
    }
  };

  // Load more pagination simulation
  const handleLoadMore = () => {
    if (loadingMore || !hasMore || loading) return;
    
    setLoadingMore(true);
    setTimeout(() => {
      // Append additional paginated items
      setVisibleBookings(prev => [...prev, ...PAGINATED_MOCK_CANCELLED_BOOKINGS]);
      setLoadingMore(false);
      setHasMore(false); // No more pages after page 2
      setPage(prev => prev + 1);
    }, 1200);
  };

  // Filter & Search Logic
  const filteredBookings = useMemo(() => {
    return visibleBookings.filter(b => {
      // 1. Filter by Search Query
      const query = search.trim().toLowerCase();
      const matchSearch =
        !query ||
        b.spaceName.toLowerCase().includes(query) ||
        b.id.toLowerCase().includes(query) ||
        b.city.toLowerCase().includes(query);

      if (!matchSearch) return false;

      // 2. Filter by Active Chip Option
      const now = new Date();
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(now.getMonth() - 1);
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(now.getMonth() - 3);

      switch (activeFilter) {
        case 'Refunded':
          return b.refund.status === 'Refunded';
        case 'Partial Refund':
          return b.refund.status === 'Partial Refund';
        case 'No Refund':
          return b.refund.status === 'No Refund';
        case 'This Month':
          return b.dateObj >= oneMonthAgo;
        case 'Last 3 Months':
          return b.dateObj >= threeMonthsAgo;
        case 'All':
        default:
          return true;
      }
    });
  }, [visibleBookings, search, activeFilter]);

  // Statistics derived from full dataset
  const stats = useMemo(() => {
    const totalCount = visibleBookings.length;
    const totalRefund = visibleBookings.reduce((sum, item) => sum + item.refund.refundAmount, 0);
    // Cancellation rate relative to a hypothetical 25 total bookings
    const cancellationRate = totalCount > 0 ? ((totalCount / (totalCount + 16)) * 100).toFixed(0) : '0';

    return {
      totalCount,
      totalRefund,
      cancellationRate: `${cancellationRate}%`,
    };
  }, [visibleBookings]);

  // Trigger search error hook for testing
  const handleSearchSubmit = () => {
    if (search.toLowerCase() === 'error') {
      setError(true);
    }
  };

  // Bottom Sheet Modal Animation
  const sheetTranslateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const sheetBackdropOpacity = useRef(new Animated.Value(0)).current;

  const openPolicySheet = () => {
    setPolicyVisible(true);
    Animated.parallel([
      Animated.spring(sheetTranslateY, {
        toValue: 0,
        damping: 20,
        stiffness: 110,
        useNativeDriver: true,
      }),
      Animated.timing(sheetBackdropOpacity, {
        toValue: 0.5,
        duration: 250,
        useNativeDriver: true,
      })
    ]).start();
  };

  const closePolicySheet = () => {
    Animated.parallel([
      Animated.timing(sheetTranslateY, {
        toValue: SCREEN_HEIGHT,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(sheetBackdropOpacity, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      })
    ]).start(() => {
      setPolicyVisible(false);
    });
  };

  // Actions simulators
  const handleBookAgain = (spaceId: string) => {
    router.push('/(tabs)/discover');
  };

  const handleViewSpace = (spaceId: string) => {
    router.push(`/space/${spaceId}`);
  };

  const simulateAction = (title: string, message: string) => {
    alert(`${title}\n${message}`);
  };

  // ─── UI RENDERS ─────────────────────────────────────────────────────────────
  
  if (loading) {
    return (
      <View style={[styles.root, { paddingTop: insets.top || 20 }]}>
        <StatusBar barStyle="dark-content" backgroundColor="#F4F6FA" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityLabel="Go back">
            <Feather name="chevron-left" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Cancellation History</Text>
            <Text style={styles.headerSubtitle}>Review your cancelled bookings and refund status.</Text>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
          {/* Skeleton Summaries */}
          <View style={styles.summaryRow}>
            {[1, 2, 3].map(i => (
              <View key={i} style={[styles.summaryCard, { backgroundColor: '#FFFFFF', borderWidth: 0 }]} />
            ))}
          </View>
          <View style={{ height: 46, backgroundColor: '#E2E8F0', borderRadius: 14, marginVertical: 14, opacity: 0.5 }} />
          {/* Skeleton Cards */}
          <ShimmerCard />
          <ShimmerCard />
        </ScrollView>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.root, styles.centerAlign, { paddingHorizontal: 24 }]}>
        <StatusBar barStyle="dark-content" backgroundColor="#F4F6FA" />
        <View style={styles.errorIconWrap}>
          <Feather name="alert-triangle" size={48} color={COLORS.error} />
        </View>
        <Text style={styles.errorTitle}>Unable to load cancellation history.</Text>
        <Text style={styles.errorDesc}>
          There was an error communicating with the ZYVO servers. Please check your internet connection and try again.
        </Text>
        <TouchableOpacity style={styles.errorRetryBtn} activeOpacity={0.8} onPress={() => loadInitialData(true)}>
          <Text style={styles.errorRetryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top || 20 }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F6FA" />
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityLabel="Go back">
            <Feather name="chevron-left" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Cancellation History</Text>
            <Text style={styles.headerSubtitle}>Review your cancelled bookings and refund status.</Text>
          </View>
        </View>

        {/* MAIN CONTAINER */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
          onScroll={({ nativeEvent }) => {
            const isCloseToBottom = nativeEvent.layoutMeasurement.height + nativeEvent.contentOffset.y >= nativeEvent.contentSize.height - 120;
            if (isCloseToBottom) {
              handleLoadMore();
            }
          }}
          scrollEventThrottle={400}
        >
          {/* SUMMARY CARDS */}
          <View style={styles.summaryRow}>
            {/* Summary Card 1 */}
            <LinearGradient
              colors={['#FFFFFF', '#EEF2FF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.summaryCard}
            >
              <View style={styles.summaryIconBox}>
                <Feather name="calendar" size={16} color="#6366F1" />
              </View>
              <Text style={styles.summaryValue}>{stats.totalCount}</Text>
              <Text style={styles.summaryLabel}>Total Cancelled</Text>
            </LinearGradient>

            {/* Summary Card 2 */}
            <LinearGradient
              colors={['#FFFFFF', '#ECFDF5']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.summaryCard}
            >
              <View style={[styles.summaryIconBox, { backgroundColor: '#D1FAE5' }]}>
                <Feather name="credit-card" size={16} color="#10B981" />
              </View>
              <Text style={[styles.summaryValue, { color: '#047857' }]}>₹{stats.totalRefund}</Text>
              <Text style={styles.summaryLabel}>Total Refunded</Text>
            </LinearGradient>

            {/* Summary Card 3 */}
            <LinearGradient
              colors={['#FFFFFF', '#FFFBEB']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.summaryCard}
            >
              <View style={[styles.summaryIconBox, { backgroundColor: '#FEF3C7' }]}>
                <Feather name="percent" size={16} color="#D97706" />
              </View>
              <Text style={[styles.summaryValue, { color: '#B45309' }]}>{stats.cancellationRate}</Text>
              <Text style={styles.summaryLabel}>Cancellation Rate</Text>
            </LinearGradient>
          </View>

          {/* SEARCH BAR */}
          <View style={styles.searchRow}>
            <View style={styles.searchBox}>
              <Feather name="search" size={16} color="#9CA3AF" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by Library, ID, or City..."
                placeholderTextColor="#9CA3AF"
                value={search}
                onChangeText={setSearch}
                onSubmitEditing={handleSearchSubmit}
              />
              {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch('')}>
                  <Feather name="x" size={15} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity style={styles.policyHeaderBtn} activeOpacity={0.8} onPress={openPolicySheet}>
              <Feather name="shield" size={16} color="#6366F1" />
              <Text style={styles.policyHeaderBtnText}>Policy</Text>
            </TouchableOpacity>
          </View>

          {/* FILTERS */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterTabsContent}
            style={styles.filterScroll}
          >
            {['All', 'Refunded', 'Partial Refund', 'No Refund', 'This Month', 'Last 3 Months'].map(chip => {
              const active = activeFilter === chip;
              return (
                <TouchableOpacity
                  key={chip}
                  onPress={() => {
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                    setActiveFilter(chip);
                  }}
                  style={[styles.filterChip, active && styles.filterChipActive]}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                    {chip}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* HISTORY CARDS LIST */}
          <View style={styles.cardsWrapper}>
            {filteredBookings.length === 0 ? (
              <View style={styles.emptyStateContainer}>
                <View style={styles.emptyIconBox}>
                  <Feather name="slash" size={36} color="#6366F1" />
                </View>
                <Text style={styles.emptyTitle}>No Cancelled Bookings</Text>
                <Text style={styles.emptyDesc}>
                  {search.trim().length > 0
                    ? 'No cancellations matched your search criteria.'
                    : "You haven't cancelled any bookings yet."}
                </Text>
                <TouchableOpacity
                  style={styles.emptyExploreBtn}
                  activeOpacity={0.85}
                  onPress={() => router.push('/(tabs)/discover')}
                >
                  <LinearGradient
                    colors={['#6B7CFF', '#4F7EFF']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.emptyExploreGrad}
                  >
                    <Text style={styles.emptyExploreBtnText}>Explore Study Spaces</Text>
                    <Feather name="arrow-right" size={14} color="#FFF" style={{ marginLeft: 6 }} />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ) : (
              filteredBookings.map((item, index) => {
                const isExpanded = expandedCardId === item.id;
                
                // Color mapping for refund statuses
                let statusColor = '#22C55E'; // green
                let statusBg = '#DCFCE7';
                if (item.refund.status === 'Partial Refund') {
                  statusColor = '#D97706'; // orange
                  statusBg = '#FEF3C7';
                } else if (item.refund.status === 'No Refund') {
                  statusColor = '#EF4444'; // red
                  statusBg = '#FEE2E2';
                }

                return (
                  <View key={item.id} style={styles.glassCard}>
                    
                    {/* TOP ACCENT LINE (Gives a premium aesthetic) */}
                    <View style={[styles.cardAccentBar, { backgroundColor: statusColor }]} />

                    {/* CARD HEADER */}
                    <TouchableOpacity
                      activeOpacity={0.9}
                      onPress={() => toggleExpandCard(item.id)}
                      style={styles.cardHeaderArea}
                    >
                      <Image source={{ uri: item.spaceImageUrl }} style={styles.cardThumb} resizeMode="cover" />
                      <View style={styles.cardHeaderMain}>
                        <View style={styles.badgeRow}>
                          <View style={styles.cancelledBadge}>
                            <Text style={styles.cancelledBadgeText}>Cancelled</Text>
                          </View>
                          <View style={[styles.refundBadge, { backgroundColor: statusBg }]}>
                            <Text style={[styles.refundBadgeText, { color: statusColor }]}>
                              {item.refund.status}
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.spaceName} numberOfLines={1}>{item.spaceName}</Text>
                        <View style={styles.metaRow}>
                          <Feather name="map-pin" size={10} color="#9CA3AF" />
                          <Text style={styles.metaText}> {item.city} • ID: {item.id}</Text>
                        </View>
                      </View>
                      <Feather
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={20}
                        color="#9CA3AF"
                        style={{ marginTop: 2 }}
                      />
                    </TouchableOpacity>

                    {/* ALWAYS VISIBLE QUICK DETAILS */}
                    <View style={styles.quickDetailsGrid}>
                      <View style={styles.quickDetailsCell}>
                        <Feather name="calendar" size={12} color="#6B7280" />
                        <Text style={styles.quickDetailsVal}> {item.date}</Text>
                      </View>
                      <View style={styles.quickDetailsCell}>
                        <Feather name="clock" size={12} color="#6B7280" />
                        <Text style={styles.quickDetailsVal}> {item.timeSlot}</Text>
                      </View>
                      <View style={styles.quickDetailsCell}>
                        <Feather name="layers" size={12} color="#6B7280" />
                        <Text style={styles.quickDetailsVal}> {item.seatNumber}</Text>
                      </View>
                    </View>

                    {/* EXPANDABLE SECTION */}
                    {isExpanded && (
                      <View style={styles.expandedWrapper}>
                        <View style={styles.divider} />
                        
                        {/* Cancellation Specs */}
                        <Text style={styles.expandedHeading}>Cancellation Details</Text>
                        <View style={styles.detailsList}>
                          <View style={styles.detailsRow}>
                            <Text style={styles.detailsLabel}>Cancelled On</Text>
                            <Text style={styles.detailsValue}>{item.cancellation.cancelledOn}</Text>
                          </View>
                          <View style={styles.detailsRow}>
                            <Text style={styles.detailsLabel}>Cancelled By</Text>
                            <Text style={styles.detailsValue}>{item.cancellation.cancelledBy}</Text>
                          </View>
                          <View style={styles.detailsRow}>
                            <Text style={styles.detailsLabel}>Reason</Text>
                            <Text style={[styles.detailsValue, { color: COLORS.textPrimary, fontFamily: FONTS.semiBold }]}>
                              {item.cancellation.reason}
                            </Text>
                          </View>
                          <View style={styles.detailsRow}>
                            <Text style={styles.detailsLabel}>Policy Applied</Text>
                            <TouchableOpacity activeOpacity={0.7} onPress={openPolicySheet}>
                              <Text style={[styles.detailsValue, { color: '#6366F1', textDecorationLine: 'underline' }]}>
                                {item.cancellation.policyApplied}
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </View>

                        {/* Refund Summary Info */}
                        <View style={styles.divider} />
                        <Text style={styles.expandedHeading}>Refund Summary</Text>
                        <View style={styles.detailsList}>
                          <View style={styles.detailsRow}>
                            <Text style={styles.detailsLabel}>Original Booking Paid</Text>
                            <Text style={styles.detailsValue}>₹{item.refund.originalAmount}</Text>
                          </View>
                          <View style={styles.detailsRow}>
                            <Text style={styles.detailsLabel}>Cancellation Charge</Text>
                            <Text style={[styles.detailsValue, { color: item.refund.cancellationCharges > 0 ? '#EF4444' : '#6B7280' }]}>
                              {item.refund.cancellationCharges > 0 ? `+ ₹${item.refund.cancellationCharges}` : '₹0'}
                            </Text>
                          </View>
                          <View style={styles.detailsRow}>
                            <Text style={styles.detailsLabel}>Final Refund Amount</Text>
                            <Text style={[styles.detailsValue, { color: '#10B981', fontFamily: FONTS.bold, fontSize: 14 }]}>
                              ₹{item.refund.refundAmount}
                            </Text>
                          </View>
                          <View style={styles.detailsRow}>
                            <Text style={styles.detailsLabel}>Refund Method</Text>
                            <Text style={styles.detailsValue}>{item.refund.method}</Text>
                          </View>
                          <View style={styles.detailsRow}>
                            <Text style={styles.detailsLabel}>Processing Date</Text>
                            <Text style={styles.detailsValue}>{item.refund.refundDate}</Text>
                          </View>
                        </View>

                        {/* Booking Timeline */}
                        <View style={styles.divider} />
                        <Text style={styles.expandedHeading}>Transaction Timeline</Text>
                        <View style={styles.timelineContainer}>
                          {item.timeline.map((step, idx) => {
                            const isLast = idx === item.timeline.length - 1;
                            return (
                              <View key={idx} style={styles.timelineRow}>
                                <View style={styles.timelineLeft}>
                                  <View style={[styles.timelineNode, step.completed && styles.timelineNodeDone]}>
                                    {step.completed && <Feather name="check" size={8} color="#FFFFFF" />}
                                  </View>
                                  {!isLast && <View style={styles.timelineLine} />}
                                </View>
                                <View style={styles.timelineRight}>
                                  <Text style={styles.timelineTitle}>{step.title}</Text>
                                  <Text style={styles.timelineTime}>{step.time}</Text>
                                </View>
                              </View>
                            );
                          })}
                        </View>

                        {/* Extra Metadata Notes */}
                        <View style={styles.metaBox}>
                          <Text style={styles.metaBoxTitle}>Support & References</Text>
                          <Text style={styles.metaBoxItem}><Text style={{ fontFamily: FONTS.semiBold }}>Transaction ID:</Text> {item.transactionId}</Text>
                          <Text style={styles.metaBoxItem}><Text style={{ fontFamily: FONTS.semiBold }}>Support Ticket:</Text> {item.supportRef}</Text>
                          <Text style={styles.metaBoxItem}><Text style={{ fontFamily: FONTS.semiBold }}>Notes:</Text> {item.notes}</Text>
                        </View>
                      </View>
                    )}

                    {/* CARD ACTIONS */}
                    <View style={styles.actionButtonsRow}>
                      <TouchableOpacity
                        style={styles.cardActionBtn}
                        activeOpacity={0.8}
                        onPress={() => handleBookAgain(item.spaceId)}
                      >
                        <Feather name="repeat" size={13} color="#6366F1" style={{ marginRight: 4 }} />
                        <Text style={styles.cardActionBtnText}>Book Again</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.cardActionBtn}
                        activeOpacity={0.8}
                        onPress={() => handleViewSpace(item.spaceId)}
                      >
                        <Feather name="eye" size={13} color="#6366F1" style={{ marginRight: 4 }} />
                        <Text style={styles.cardActionBtnText}>View Space</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.cardActionBtn}
                        activeOpacity={0.8}
                        onPress={() => simulateAction('Receipt Downloaded', `Receipt for Booking ID ${item.id} has been saved to your local storage.`)}
                      >
                        <Feather name="download" size={13} color="#6366F1" style={{ marginRight: 4 }} />
                        <Text style={styles.cardActionBtnText}>Receipt</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.cardActionBtn}
                        activeOpacity={0.8}
                        onPress={() => simulateAction('Help Desk Opened', `Opening support window for ticket reference ${item.supportRef}.`)}
                      >
                        <Feather name="mail" size={13} color="#6366F1" style={{ marginRight: 4 }} />
                        <Text style={styles.cardActionBtnText}>Support</Text>
                      </TouchableOpacity>
                    </View>

                  </View>
                );
              })
            )}
          </View>

          {/* INFINITE SCROLL LOADER */}
          {loadingMore && (
            <View style={styles.paginationLoader}>
              <ActivityIndicator size="small" color="#6366F1" />
              <Text style={styles.paginationText}>Loading past cancellations...</Text>
            </View>
          )}
          
          {!hasMore && filteredBookings.length > 0 && (
            <Text style={styles.endOfListText}>Showing all cancelled bookings</Text>
          )}
        </ScrollView>

      </Animated.View>

      {/* CANCELLATION POLICY BOTTOM SHEET */}
      <Modal
        visible={policyVisible}
        transparent
        animationType="none"
        onRequestClose={closePolicySheet}
      >
        <View style={styles.sheetBackdrop}>
          <TouchableOpacity
            style={styles.sheetBackdropClose}
            activeOpacity={1}
            onPress={closePolicySheet}
          />
          <Animated.View
            style={[
              styles.sheetContainer,
              { transform: [{ translateY: sheetTranslateY }] },
              { paddingBottom: insets.bottom || 24 }
            ]}
          >
            {/* Grab handle indicator */}
            <View style={styles.sheetDragBar} />

            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>ZYVO Cancellation Policy</Text>
              <TouchableOpacity style={styles.sheetCloseBtn} onPress={closePolicySheet}>
                <Feather name="x" size={20} color="#374151" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.sheetScroll}>
              <Text style={styles.sheetDesc}>
                We aim to provide flexible study spaces while maintaining fairness for library providers and other students. Refunds depend on the timeframe of cancellation.
              </Text>

              {/* Time Percentages Table */}
              <Text style={styles.sheetSectionTitle}>Time-Based Refund Percentage</Text>
              <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableHeader]}>
                  <Text style={[styles.tableCell, styles.tableCellHeader]}>Time of Cancellation</Text>
                  <Text style={[styles.tableCell, styles.tableCellHeader, styles.alignRight]}>Refund Amount</Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={styles.tableCell}>More than 2 hours before slot start</Text>
                  <Text style={[styles.tableCell, styles.alignRight, { color: '#10B981', fontFamily: FONTS.bold }]}>100% Refund</Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={styles.tableCell}>1 to 2 hours before slot start</Text>
                  <Text style={[styles.tableCell, styles.alignRight, { color: '#F59E0B', fontFamily: FONTS.bold }]}>50% Refund</Text>
                </View>
                <View style={[styles.tableRow, { borderBottomWidth: 0 }]}>
                  <Text style={styles.tableCell}>Less than 1 hour before / No-Show</Text>
                  <Text style={[styles.tableCell, styles.alignRight, { color: '#EF4444', fontFamily: FONTS.bold }]}>No Refund (0%)</Text>
                </View>
              </View>

              {/* Processing Timeline */}
              <Text style={styles.sheetSectionTitle}>Refund Processing Timeline</Text>
              <View style={styles.bulletList}>
                <View style={styles.bulletRow}>
                  <View style={styles.bulletDot} />
                  <Text style={styles.bulletText}>UPI payments are processed within 15 minutes to 2 hours directly back to the source account wallet.</Text>
                </View>
                <View style={styles.bulletRow}>
                  <View style={styles.bulletDot} />
                  <Text style={styles.bulletText}>Debit/Credit cards usually take 2 to 5 banking working days depending on your bank.</Text>
                </View>
                <View style={styles.bulletRow}>
                  <View style={styles.bulletDot} />
                  <Text style={styles.bulletText}>Wallet top-up refunds are instant and reflect immediately on your ZYVO wallet ledger balance.</Text>
                </View>
              </View>

              {/* Support Info */}
              <View style={styles.policySupportBox}>
                <Feather name="help-circle" size={18} color="#6366F1" style={{ marginRight: 8, marginTop: 2 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.policySupportTitle}>Need assistance with refunds?</Text>
                  <Text style={styles.policySupportDesc}>
                    For transaction disputes or questions regarding processing errors, write to ZYVO helpdesk at support@zyvoapp.com.
                  </Text>
                </View>
              </View>
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>

    </View>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F4F6FA',
  },
  centerAlign: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(229, 231, 235, 0.4)',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  headerTitle: {
    fontFamily: FONTS.bold,
    fontSize: 22,
    color: '#0D1B2A',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: '#4B5563',
    marginTop: 2,
  },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 80,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryCard: {
    width: (SCREEN_WIDTH - 44) / 3,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(229, 231, 235, 0.5)',
    shadowColor: '#0D1B2A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  summaryValue: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: '#6366F1',
    lineHeight: 20,
  },
  summaryLabel: {
    fontFamily: FONTS.medium,
    fontSize: 9,
    color: '#6B7280',
    marginTop: 2,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 46,
    borderWidth: 1,
    borderColor: 'rgba(229, 231, 235, 0.5)',
    shadowColor: '#0D1B2A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: '#0D1B2A',
  },
  policyHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    height: 46,
    borderRadius: 14,
    marginLeft: 10,
  },
  policyHeaderBtnText: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    color: '#6366F1',
    marginLeft: 4,
  },
  filterScroll: {
    flexGrow: 0,
    marginBottom: 16,
  },
  filterTabsContent: {
    paddingRight: 16,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(229, 231, 235, 0.5)',
  },
  filterChipActive: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  filterChipText: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: '#4B5563',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontFamily: FONTS.bold,
  },
  cardsWrapper: {
    marginTop: 2,
  },
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 24,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(229, 231, 235, 0.5)',
    shadowColor: '#0D1B2A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardAccentBar: {
    height: 4,
    width: '100%',
  },
  cardHeaderArea: {
    flexDirection: 'row',
    padding: 14,
    alignItems: 'flex-start',
  },
  cardThumb: {
    width: 68,
    height: 68,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    marginRight: 12,
  },
  cardHeaderMain: {
    flex: 1,
    marginRight: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  cancelledBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 6,
  },
  cancelledBadgeText: {
    fontFamily: FONTS.bold,
    fontSize: 9,
    color: '#4B5563',
    textTransform: 'uppercase',
  },
  refundBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  refundBadgeText: {
    fontFamily: FONTS.bold,
    fontSize: 9,
    textTransform: 'uppercase',
  },
  spaceName: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: '#0D1B2A',
    marginBottom: 3,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontFamily: FONTS.medium,
    fontSize: 11,
    color: '#9CA3AF',
  },
  quickDetailsGrid: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(229, 231, 235, 0.3)',
    backgroundColor: 'rgba(248, 250, 252, 0.5)',
    paddingVertical: 8,
  },
  quickDetailsCell: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickDetailsVal: {
    fontFamily: FONTS.medium,
    fontSize: 11,
    color: '#4B5563',
  },
  expandedWrapper: {
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(229, 231, 235, 0.4)',
    marginVertical: 12,
  },
  expandedHeading: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: '#4B5563',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  detailsList: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(229, 231, 235, 0.3)',
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  detailsLabel: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: '#6B7280',
  },
  detailsValue: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: '#0D1B2A',
    textAlign: 'right',
  },
  timelineContainer: {
    paddingLeft: 8,
    marginTop: 4,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: 10,
    width: 12,
  },
  timelineNode: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    zIndex: 2,
  },
  timelineNodeDone: {
    backgroundColor: '#6366F1',
  },
  timelineLine: {
    width: 2,
    height: 32,
    backgroundColor: '#E5E7EB',
    position: 'absolute',
    top: 12,
    zIndex: 1,
  },
  timelineRight: {
    flex: 1,
  },
  timelineTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    color: '#374151',
  },
  timelineTime: {
    fontFamily: FONTS.regular,
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 1,
  },
  metaBox: {
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  metaBoxTitle: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    color: '#4338CA',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  metaBoxItem: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: '#3730A3',
    lineHeight: 16,
    marginBottom: 4,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: 'rgba(229, 231, 235, 0.4)',
    paddingVertical: 10,
    paddingHorizontal: 8,
    justifyContent: 'space-between',
  },
  cardActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  cardActionBtnText: {
    fontFamily: FONTS.semiBold,
    fontSize: 11,
    color: '#6366F1',
  },
  paginationLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  paginationText: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 8,
  },
  endOfListText: {
    fontFamily: FONTS.medium,
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },

  // EMPTY STATE
  emptyStateContainer: {
    alignItems: 'center',
    paddingTop: 48,
    paddingHorizontal: 24,
  },
  emptyIconBox: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: '#0D1B2A',
    marginBottom: 6,
  },
  emptyDesc: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
  },
  emptyExploreBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    alignSelf: 'stretch',
  },
  emptyExploreGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
  },
  emptyExploreBtnText: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: '#FFFFFF',
  },

  // SHIMMER SKELETON
  shimmerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 14,
    marginBottom: 16,
  },
  shimmerTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shimmerImg: {
    width: 68,
    height: 68,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
  },
  shimmerTitle: {
    width: '70%',
    height: 14,
    borderRadius: 6,
    backgroundColor: '#E2E8F0',
    marginBottom: 8,
  },
  shimmerSubtitle: {
    width: '45%',
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E2E8F0',
  },
  shimmerBadge: {
    width: 50,
    height: 18,
    borderRadius: 6,
    backgroundColor: '#E2E8F0',
  },
  shimmerMiddle: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
    paddingVertical: 8,
    marginVertical: 12,
  },
  shimmerLine: {
    width: '80%',
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E2E8F0',
    marginBottom: 6,
  },
  shimmerLineShort: {
    width: '50%',
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E2E8F0',
  },
  shimmerBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  shimmerButton: {
    width: '23%',
    height: 24,
    borderRadius: 6,
    backgroundColor: '#E2E8F0',
  },

  // ERROR STATE
  errorIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  errorTitle: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: '#0D1B2A',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorDesc: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  errorRetryBtn: {
    backgroundColor: '#6366F1',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 14,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  errorRetryText: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: '#FFFFFF',
  },

  // BOTTOM SHEET
  sheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end',
  },
  sheetBackdropClose: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: SCREEN_HEIGHT * 0.8,
    paddingHorizontal: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  sheetDragBar: {
    width: 40,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#E2E8F0',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 14,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  sheetTitle: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: '#0D1B2A',
  },
  sheetCloseBtn: {
    padding: 4,
  },
  sheetScroll: {
    paddingTop: 12,
  },
  sheetDesc: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 16,
  },
  sheetSectionTitle: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: '#0D1B2A',
    marginTop: 8,
    marginBottom: 10,
  },
  table: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    marginBottom: 16,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tableHeader: {
    backgroundColor: '#EEF2FF',
  },
  tableCell: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: '#4B5563',
    flex: 1,
  },
  tableCellHeader: {
    fontFamily: FONTS.bold,
    color: '#3730A3',
  },
  alignRight: {
    textAlign: 'right',
  },
  bulletList: {
    marginBottom: 16,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#6366F1',
    marginRight: 10,
    marginTop: 6,
  },
  bulletText: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: '#4B5563',
    flex: 1,
    lineHeight: 16,
  },
  policySupportBox: {
    flexDirection: 'row',
    backgroundColor: '#EEF2FF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0E7FF',
    marginBottom: 24,
  },
  policySupportTitle: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: '#3730A3',
    marginBottom: 2,
  },
  policySupportDesc: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: '#4338CA',
    lineHeight: 15,
  },
});
