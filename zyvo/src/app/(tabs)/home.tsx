import React, { useState, useEffect, useRef, useMemo, memo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  Platform,
  Animated,
  RefreshControl,
  Pressable,
  FlatList,
  StatusBar,
  Dimensions,
  Modal,
  Vibration,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, Stop, LinearGradient as SvgLinearGradient } from 'react-native-svg';
import { FONTS } from '../../constants/fonts';
import { useAuthStore } from '../../store/authStore';
import { useSpaceStore, StudySpace } from '../../store/spaceStore';
import { useBookingStore, Booking } from '../../store/bookingStore';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// ─── SaaS 2026 UI Color Palette ──────────────────────────────────────────────
const PALETTE = {
  primary: '#2563EB',
  primaryHover: '#1D4ED8',
  lightBlue: '#DBEAFE',
  background: '#F8FAFC',
  cardBg: '#FFFFFF',
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  border: '#E2E8F0',
  success: '#10B981',
  warning: '#F59E0B',
};

const CAROUSEL_BANNERS = [
  {
    id: 'banner-1',
    tag: 'EXAMS PREP',
    title: 'Prepare for Exams',
    desc: 'Book quiet study spaces with fast WiFi.',
    btnLabel: 'Explore',
    bgImage: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=600&auto=format&fit=crop',
    gradient: ['#2563EB', '#1D4ED8'] as const,
  },
  {
    id: 'banner-2',
    tag: 'LIMITED SPECIAL',
    title: 'Student Special',
    desc: '20% Discount on Premium Spaces.',
    btnLabel: 'Book Now',
    bgImage: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=600&auto=format&fit=crop',
    gradient: ['#10B981', '#059669'] as const,
  },
  {
    id: 'banner-3',
    tag: 'NEW ARRIVALS',
    title: 'New Near You',
    desc: 'Discover newly added study halls around your campus.',
    btnLabel: 'Discover',
    bgImage: 'https://images.unsplash.com/photo-1542744094-3a31f103e35f?q=80&w=600&auto=format&fit=crop',
    gradient: ['#F59E0B', '#D97706'] as const,
  },
];

const CATEGORIES = [
  { id: 'libraries', label: 'Libraries', icon: 'book-open', bg: '#EFF6FF', color: '#2563EB' },
  { id: 'study_halls', label: 'Study Halls', icon: 'home', bg: '#F0FDF4', color: '#10B981' },
  { id: 'study_cafes', label: 'Study Cafés', icon: 'coffee', bg: '#FFF7ED', color: '#F97316' },
  { id: 'coworking', label: 'Coworking', icon: 'briefcase', bg: '#FAF5FF', color: '#A855F7' },
  { id: 'focus_pods', label: 'Focus Pods', icon: 'target', bg: '#ECFDF5', color: '#06B6D4' },
  { id: '24x7', label: '24×7 Spaces', icon: 'clock', bg: '#FFF1F2', color: '#F43F5E' },
  { id: 'group_study', label: 'Group Study', icon: 'users', bg: '#F5F3FF', color: '#6366F1' },
  { id: 'premium_spaces', label: 'Premium Spaces', icon: 'award', bg: '#FFFBEB', color: '#F59E0B' },
];

const STUDENT_OFFERS = [
  { id: 'offer-1', title: '20% OFF Premium Membership', desc: 'Unlock key card access to silent study zones.', tag: 'MEMBERSHIP', grad: ['#3B82F6', '#2563EB'] as const },
  { id: 'offer-2', title: 'Book 5 Hours, Get 1 Free', desc: 'Valid for focus pods and reading rooms.', tag: 'PASS VOUCHER', grad: ['#10B981', '#059669'] as const },
  { id: 'offer-3', title: 'Refer Friends & Earn Credits', desc: 'Get ₹50 wallet credits per referral sign up.', tag: 'REFERRALS', grad: ['#F59E0B', '#D97706'] as const },
];

const EVENTS = [
  { id: 'ev-1', title: 'Coding Meetup', date: 'Tomorrow • 5:00 PM', attendees: 14, image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=400&auto=format&fit=crop' },
  { id: 'ev-2', title: 'UPSC Discussion', date: 'July 5 • 3:00 PM', attendees: 8, image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=400&auto=format&fit=crop' },
  { id: 'ev-3', title: 'Group Study Session', date: 'July 6 • 11:00 AM', attendees: 22, image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=400&auto=format&fit=crop' },
  { id: 'ev-4', title: 'Mock Interview Practice', date: 'July 8 • 4:00 PM', attendees: 10, image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=400&auto=format&fit=crop' },
  { id: 'ev-5', title: 'Hackathon Preparation', date: 'July 10 • 9:00 AM', attendees: 32, image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=400&auto=format&fit=crop' },
];

const QUICK_FILTERS = [
  { id: 'open_now', label: 'Open Now' },
  { id: 'libraries', label: 'Libraries' },
  { id: 'study_halls', label: 'Study Halls' },
  { id: 'nearby', label: 'Nearby' },
  { id: 'fast_wifi', label: 'Fast WiFi' },
  { id: 'ac', label: 'AC' },
  { id: 'budget', label: 'Budget' },
  { id: '24_7', label: '24×7' },
  { id: 'silent_zone', label: 'Silent Zone' },
  { id: 'charging', label: 'Charging' },
];

// Helper to determine mock features for real spaces
const getExtraSpaceData = (id: string) => {
  const custom: Record<string, { verified: boolean; isOpen: boolean; amenities: string[] }> = {
    '1': { verified: true, isOpen: true, amenities: ['WiFi', 'AC', 'Silent'] },
    '2': { verified: true, isOpen: true, amenities: ['WiFi', 'AC', 'Charging'] },
    '3': { verified: true, isOpen: true, amenities: ['WiFi', 'Silent', 'Charging'] },
    '4': { verified: false, isOpen: true, amenities: ['WiFi', 'AC'] },
    '5': { verified: true, isOpen: false, amenities: ['WiFi', 'AC', 'Whiteboards'] },
  };
  return custom[id] || { verified: false, isOpen: true, amenities: ['WiFi', 'AC', 'Charging'] };
};

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const user = useAuthStore((state) => state.user);
  const spaces = useSpaceStore((state) => state.spaces);
  const favoritedIds = useSpaceStore((state) => state.favoritedIds);
  const toggleFavorite = useSpaceStore((state) => state.toggleFavorite);
  const bookings = useBookingStore((state) => state.bookings);
  const tickLiveTimer = useBookingStore((state) => state.tickLiveTimer);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('open_now');
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [qrModalVisible, setQrModalVisible] = useState(false);

  const carouselScrollRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 8, useNativeDriver: true }),
    ]).start();
  }, []);

  // Time ticking for greeting
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  // Auto carousel slide timer (5 seconds)
  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCarouselIndex((prev) => {
        const next = (prev + 1) % CAROUSEL_BANNERS.length;
        carouselScrollRef.current?.scrollTo({ x: next * (SCREEN_WIDTH - 24), animated: true });
        return next;
      });
    }, 5000);
    return () => clearInterval(slideTimer);
  }, []);

  // Active or Checked In Booking widget detection
  const activeBooking = useMemo(() => {
    return bookings.find(b => b.status === 'active');
  }, [bookings]);

  useEffect(() => {
    let interval: any;
    if (activeBooking && activeBooking.checkInStatus === 'checked_in') {
      interval = setInterval(() => {
        tickLiveTimer(activeBooking.id);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeBooking?.id, activeBooking?.checkInStatus]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1200);
  };

  const getGreeting = () => {
    const hrs = currentTime.getHours();
    if (hrs < 12) return 'Good Morning 👋';
    if (hrs < 17) return 'Good Afternoon 👋';
    return 'Good Evening 👋';
  };

  // Filter spaces based on quick filters + search query
  const filteredSpaces = useMemo(() => {
    return spaces.filter((space) => {
      // Search text match
      const text = searchQuery.toLowerCase().trim();
      const nameMatch = space.name.toLowerCase().includes(text) || space.category.toLowerCase().includes(text);
      if (text && !nameMatch) return false;

      // Filter chips match
      const extra = getExtraSpaceData(space.id);
      switch (selectedFilter) {
        case 'open_now':
          return extra.isOpen;
        case 'libraries':
          return space.category === 'Libraries';
        case 'study_halls':
          return space.category === 'Study Halls';
        case 'nearby':
          return parseFloat(space.distance) <= 1.5;
        case 'fast_wifi':
          return extra.amenities.includes('WiFi');
        case 'ac':
          return extra.amenities.includes('AC');
        case 'budget':
          return space.price <= 10;
        case 'silent_zone':
          return extra.amenities.includes('Silent');
        case 'charging':
          return extra.amenities.includes('Charging');
        default:
          return true;
      }
    });
  }, [spaces, searchQuery, selectedFilter]);

  const handleSpacePress = (id: string) => {
    router.push({ pathname: `/space/${id}` } as any);
  };

  const handleBookNow = (id: string) => {
    router.push({ pathname: '/booking/seats', params: { spaceId: id } } as any);
  };

  const headerPaddingTop = Platform.OS === 'android'
    ? (StatusBar.currentHeight ? StatusBar.currentHeight + 12 : 40)
    : (insets.top || 16);

  // Unified Header right action component
  const HeaderRightButton = ({ icon, onPress, badge }: { icon: keyof typeof Ionicons.glyphMap; onPress: () => void; badge?: boolean }) => (
    <TouchableOpacity style={styles.headerBtn} activeOpacity={0.7} onPress={onPress}>
      <Ionicons name={icon} size={20} color={PALETTE.textPrimary} />
      {badge && <View style={styles.headerBadgeDot} />}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* ── Full-Page Background Blobs (non-interactive) ── */}
      <LinearGradient
        colors={['rgba(91,76,246,0.15)', 'transparent']}
        style={[styles.pageBlob, { top: -80, right: -60, width: 260, height: 260, borderRadius: 130 }]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        pointerEvents="none"
      />
      <LinearGradient
        colors={['rgba(37,99,235,0.12)', 'transparent']}
        style={[styles.pageBlob, { top: 180, left: -80, width: 220, height: 220, borderRadius: 110 }]}
        start={{ x: 1, y: 0 }} end={{ x: 0, y: 1 }}
        pointerEvents="none"
      />
      <LinearGradient
        colors={['rgba(245,158,11,0.10)', 'transparent']}
        style={[styles.pageBlob, { top: SCREEN_HEIGHT * 0.38, right: -50, width: 200, height: 200, borderRadius: 100 }]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        pointerEvents="none"
      />
      <LinearGradient
        colors={['rgba(16,185,129,0.09)', 'transparent']}
        style={[styles.pageBlob, { top: SCREEN_HEIGHT * 0.58, left: -60, width: 180, height: 180, borderRadius: 90 }]}
        start={{ x: 1, y: 1 }} end={{ x: 0, y: 0 }}
        pointerEvents="none"
      />
      <LinearGradient
        colors={['rgba(249,115,22,0.10)', 'transparent']}
        style={[styles.pageBlob, { top: SCREEN_HEIGHT * 0.78, right: -40, width: 200, height: 200, borderRadius: 100 }]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        pointerEvents="none"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingTop: headerPaddingTop }]}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={PALETTE.primary} colors={[PALETTE.primary]} />
        }
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          {/* 🏠 Section 1 — Personalized Header */}
          <View style={styles.headerContainer}>
            {/* Row 1: Greeting + Action Buttons */}
            <View style={styles.headerTopRow}>
              <Text style={styles.headerGreeting}>{getGreeting()}</Text>
              <View style={styles.headerRight}>
                <HeaderRightButton icon="wallet-outline" onPress={() => alert('Zyvo Wallet opened')} />
                <HeaderRightButton icon="notifications-outline" badge onPress={() => alert('Notifications opened')} />
                <TouchableOpacity activeOpacity={0.8} onPress={() => router.push('/(tabs)/profile')} style={styles.avatarWrapper}>
                  <Image
                    source={{ uri: user?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=120&auto=format&fit=crop' }}
                    style={styles.avatarImage}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Row 2: User's Name */}
            <Text style={styles.headerUserName}>{user?.name || 'Manu'}</Text>

            {/* Row 3: Location • Weather • Streak */}
            <View style={styles.headerInfoRow}>
              <Ionicons name="location-outline" size={13} color={PALETTE.primary} />
              <Text style={styles.headerInfoText}>Near IIIT Sonepat</Text>
              <Text style={styles.headerInfoDot}>•</Text>
              <Ionicons name="sunny-outline" size={13} color={PALETTE.warning} />
              <Text style={styles.headerInfoText}>29°C</Text>
              <Text style={styles.headerInfoDot}>•</Text>
              <Ionicons name="flame-outline" size={13} color="#F97316" />
              <Text style={styles.headerInfoText}>5 Day Streak</Text>
            </View>
          </View>

          {/* 🔍 Section 2 — Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Feather name="search" size={20} color={PALETTE.textSecondary} style={{ marginRight: 10 }} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search libraries, study halls, cafés..."
                placeholderTextColor={PALETTE.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')} style={{ marginRight: 8 }}>
                  <Ionicons name="close-circle" size={18} color={PALETTE.textSecondary} />
                </TouchableOpacity>
              )}
              <TouchableOpacity activeOpacity={0.7} style={styles.searchActionBtn} onPress={() => alert('Voice search activated')}>
                <Feather name="mic" size={18} color={PALETTE.textSecondary} />
              </TouchableOpacity>
              <View style={styles.searchDivider} />
              <TouchableOpacity activeOpacity={0.7} style={styles.searchActionBtn} onPress={() => alert('Search filters')}>
                <Feather name="sliders" size={18} color={PALETTE.primary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* 🏷️ Section 3 — Quick Filters */}
          <View style={styles.quickFiltersContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
              {QUICK_FILTERS.map((chip) => {
                const isSelected = selectedFilter === chip.id;
                return (
                  <TouchableOpacity
                    key={chip.id}
                    activeOpacity={0.85}
                    style={[styles.chip, isSelected && styles.chipSelected]}
                    onPress={() => setSelectedFilter(chip.id)}
                  >
                    <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                      {chip.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* 🎠 Section 4 — Hero Carousel */}
          <View style={styles.carouselSection}>
            <ScrollView
              ref={carouselScrollRef}
              horizontal
              decelerationRate="fast"
              snapToInterval={SCREEN_WIDTH - 40}
              snapToAlignment="start"
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) => {
                const index = Math.round(e.nativeEvent.contentOffset.x / (SCREEN_WIDTH - 40));
                setCarouselIndex(index);
              }}
              contentContainerStyle={styles.carouselScroll}
            >
              {CAROUSEL_BANNERS.map((banner, idx) => (
                <View key={banner.id} style={styles.carouselSlide}>
                  <Image source={{ uri: banner.bgImage }} style={styles.carouselSlideImg} />
                  {/* Deep left-to-right scrim for text legibility */}
                  <LinearGradient
                    colors={['rgba(5, 10, 28, 0.80)', 'rgba(5, 10, 28, 0.40)', 'rgba(5,10,28,0.05)']}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={StyleSheet.absoluteFillObject}
                  />
                  {/* Bottom vignette for depth */}
                  <LinearGradient
                    colors={['transparent', 'rgba(5,10,28,0.55)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={StyleSheet.absoluteFillObject}
                  />
                  {/* Slide counter – top right */}
                  <View style={styles.carouselCounter}>
                    <Text style={styles.carouselCounterTxt}>{idx + 1} / {CAROUSEL_BANNERS.length}</Text>
                  </View>
                  <View style={styles.carouselSlideContent}>
                    {/* Tag pill */}
                    <View style={styles.carouselSlideTag}>
                      <View style={[styles.carouselTagDot, { backgroundColor: banner.gradient[0] }]} />
                      <Text style={styles.carouselSlideTagTxt}>{banner.tag}</Text>
                    </View>
                    <Text style={styles.carouselSlideTitle}>{banner.title}</Text>
                    <Text style={styles.carouselSlideDesc} numberOfLines={2}>{banner.desc}</Text>
                    {/* Solid white CTA button */}
                    <TouchableOpacity
                      activeOpacity={0.88}
                      style={styles.carouselSlideBtn}
                      onPress={() => router.push('/(tabs)/discover')}
                    >
                      <Text style={[styles.carouselSlideBtnTxt, { color: banner.gradient[0] }]}>{banner.btnLabel}</Text>
                      <Feather name="arrow-right" size={11} color={banner.gradient[0]} style={{ marginLeft: 4 }} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
            {/* Pill dot indicators */}
            <View style={styles.indicatorsRow}>
              {CAROUSEL_BANNERS.map((_, index) => (
                <View key={index} style={[styles.indicatorDot, carouselIndex === index && styles.indicatorDotActive]} />
              ))}
            </View>
          </View>

          {/* 📚 Section 5 — Explore Categories */}
          <View style={styles.sectionWrapper}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Explore Categories</Text>
            </View>
            <View style={styles.categoriesGrid}>
              {CATEGORIES.slice(0, 4).map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  activeOpacity={0.95}
                  style={styles.categoryCard}
                  onPress={() => router.push('/(tabs)/discover')}
                >
                  <View style={[styles.categoryIconBg, { backgroundColor: cat.bg }]}>
                    <Feather name={cat.icon as any} size={20} color={cat.color} />
                  </View>
                  <Text style={styles.categoryLabel} numberOfLines={1}>{cat.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* ⭐ Section 6 — Popular Near You */}
          <View style={styles.sectionWrapper}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Popular Near You</Text>
              <TouchableOpacity activeOpacity={0.7} style={styles.viewAllBtn} onPress={() => router.push('/(tabs)/discover')}>
                <Text style={styles.viewAllTxt}>View All</Text>
                <Feather name="chevron-right" size={14} color={PALETTE.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScrollPadding}
            >
              {filteredSpaces.map((space) => {
                const extra = getExtraSpaceData(space.id);
                return (
                  <TouchableOpacity
                    key={`popular-${space.id}`}
                    activeOpacity={0.95}
                    style={styles.spaceCard}
                    onPress={() => handleSpacePress(space.id)}
                  >
                    <View style={styles.spaceCardImgContainer}>
                      <Image source={{ uri: space.imageUrl }} style={styles.spaceCardImg} />
                      {extra.verified && (
                        <View style={styles.verifiedBadge}>
                          <Ionicons name="checkmark-circle" size={10} color="#FFFFFF" style={{ marginRight: 2 }} />
                          <Text style={styles.verifiedBadgeTxt}>VERIFIED</Text>
                        </View>
                      )}
                      <View style={[styles.statusBadge, { backgroundColor: extra.isOpen ? 'rgba(16, 185, 129, 0.9)' : 'rgba(239, 68, 68, 0.9)' }]}>
                        <Text style={styles.statusBadgeTxt}>{extra.isOpen ? 'Open Now' : 'Closed'}</Text>
                      </View>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        style={styles.favoriteBtn}
                        onPress={(e) => {
                          e.stopPropagation();
                          if (Platform.OS !== 'web') Vibration.vibrate(8);
                          toggleFavorite(space.id);
                        }}
                      >
                        <Ionicons
                          name={favoritedIds.includes(space.id) ? 'heart' : 'heart-outline'}
                          size={16}
                          color={favoritedIds.includes(space.id) ? '#EF4444' : PALETTE.textSecondary}
                        />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.spaceCardBody}>
                      <Text style={styles.spaceCardName} numberOfLines={1}>{space.name}</Text>

                      <View style={styles.spaceCardMetaRow}>
                        <View style={styles.spaceCardMetaItem}>
                          <Ionicons name="star" size={12} color="#F59E0B" style={{ marginRight: 2 }} />
                          <Text style={styles.spaceCardMetaTxt}>{space.rating.toFixed(1)}</Text>
                        </View>
                        <Text style={styles.spaceCardBullet}>•</Text>
                        <View style={styles.spaceCardMetaItem}>
                          <Ionicons name="location" size={12} color={PALETTE.textSecondary} style={{ marginRight: 2 }} />
                          <Text style={styles.spaceCardMetaTxt}>{space.distance}</Text>
                        </View>
                      </View>

                      <View style={styles.amenitiesContainer}>
                        {extra.amenities.map((amenity, idx) => (
                          <View key={idx} style={styles.amenityChip}>
                            <Text style={styles.amenityChipTxt}>{amenity}</Text>
                          </View>
                        ))}
                      </View>

                      <View style={styles.spaceCardDivider} />

                      <View style={styles.spaceCardFooter}>
                        <View>
                          <Text style={styles.priceLabel}>Starting at</Text>
                          <Text style={styles.priceValue}>₹{space.price}<Text style={styles.priceUnit}>/hr</Text></Text>
                        </View>
                        <TouchableOpacity
                          activeOpacity={0.85}
                          style={styles.cardCTA}
                          onPress={() => handleBookNow(space.id)}
                        >
                          <Text style={styles.cardCTATxt}>Book Now</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
              {filteredSpaces.length === 0 && (
                <View style={styles.emptyCardState}>
                  <Feather name="search" size={24} color={PALETTE.textSecondary} style={{ marginBottom: 6 }} />
                  <Text style={styles.emptyCardTxt}>No spaces match filters.</Text>
                </View>
              )}
            </ScrollView>
          </View>

          {/* 🕒 Section 7 — Recently Viewed */}
          <View style={styles.sectionWrapper}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Recently Viewed</Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScrollPadding}
            >
              {spaces.slice(2, 6).map((space) => (
                <TouchableOpacity key={`recent-${space.id}`} activeOpacity={0.88} style={styles.recentCard} onPress={() => handleSpacePress(space.id)}>
                  <Image source={{ uri: space.imageUrl }} style={styles.recentThumbnail} />
                  <View style={styles.recentContent}>
                    <View>
                      <Text style={styles.recentName} numberOfLines={1}>{space.name}</Text>
                      <Text style={styles.recentMeta}>Visited 2 days ago</Text>
                    </View>
                    <View style={styles.recentMetaRow}>
                      <Ionicons name="time-outline" size={10} color={PALETTE.primary} style={{ marginRight: 3 }} />
                      <Text style={styles.recentMetaAlt}>{space.price > 0 ? `₹${space.price}/hr` : 'Free'}</Text>
                    </View>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={styles.recentBtn}
                      onPress={() => handleSpacePress(space.id)}
                    >
                      <Text style={styles.recentBtnTxt}>Continue →</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* 🎁 Section 8 — Student Offers */}
          <View style={styles.sectionWrapper}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Student Offers</Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScrollPadding}
            >
              {STUDENT_OFFERS.map((offer) => (
                <TouchableOpacity key={offer.id} activeOpacity={0.88} style={styles.offerCardWrapper}>
                  <LinearGradient
                    colors={offer.grad}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.offerCard}
                  >
                    {/* Decorative large circle accent */}
                    <View style={styles.offerCircleAccent} />
                    <View style={styles.offerTagContainer}>
                      <Text style={styles.offerTagTxt}>{offer.tag}</Text>
                    </View>
                    <Text style={styles.offerTitle}>{offer.title}</Text>
                    <Text style={styles.offerDesc}>{offer.desc}</Text>
                    {/* Subtle arrow */}
                    <View style={styles.offerArrow}>
                      <Feather name="arrow-right" size={12} color="rgba(255,255,255,0.75)" />
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* 🎓 Section 9 — Nearby Study Events */}
          <View style={[styles.sectionWrapper, { marginBottom: 110 }]}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Nearby Study Events</Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScrollPadding}
            >
              {EVENTS.map((event) => (
                <View key={event.id} style={styles.eventCard}>
                  <View style={styles.eventImgContainer}>
                    <Image source={{ uri: event.image }} style={styles.eventImg} />
                    <LinearGradient
                      colors={['transparent', 'rgba(5,10,28,0.55)']}
                      style={StyleSheet.absoluteFillObject}
                    />
                    <View style={styles.eventAttendeeBadge}>
                      <Ionicons name="people" size={9} color="#FFFFFF" style={{ marginRight: 2 }} />
                      <Text style={styles.eventAttendeeBadgeTxt}>{event.attendees}</Text>
                    </View>
                  </View>
                  <View style={styles.eventBody}>
                    <Text style={styles.eventName} numberOfLines={2}>{event.title}</Text>
                    <View style={styles.eventTimeRow}>
                      <Ionicons name="calendar-outline" size={10} color={PALETTE.primary} style={{ marginRight: 3 }} />
                      <Text style={styles.eventTime}>{event.date}</Text>
                    </View>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={styles.eventBtn}
                      onPress={() => alert(`Joined ${event.title} group chat!`)}
                    >
                      <Text style={styles.eventBtnTxt}>Join Event</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>

        </Animated.View>
      </ScrollView>


      {/* QR Ticket Entry Pass Modal */}
      <Modal
        visible={qrModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setQrModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.ticketBox}>
            <View style={styles.cutoutL} />
            <View style={styles.cutoutR} />

            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Entrance Ticket Pass</Text>
              <TouchableOpacity onPress={() => setQrModalVisible(false)}>
                <Ionicons name="close" size={24} color={PALETTE.textPrimary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalInstruction}>Scan this ticket pass code at the facility scan console to check in.</Text>

            <View style={styles.dashedDivider} />

            <View style={styles.modalBody}>
              <View style={styles.qrCodeBox}>
                <Ionicons name="qr-code" size={180} color={PALETTE.primary} />
              </View>
              <Text style={styles.qrCodeLabel}>TICKET ID: {activeBooking?.qrCode || 'ZYVO-PASS-A15'}</Text>
            </View>

            <TouchableOpacity style={styles.closeBtn} activeOpacity={0.95} onPress={() => setQrModalVisible(false)}>
              <Text style={styles.closeBtnTxt}>Close Pass</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PALETTE.background,
  },
  pageBlob: {
    position: 'absolute',
    zIndex: 0,
  },
  scrollContent: {
    paddingBottom: 40,
  },

  // Section Header & Structure
  sectionWrapper: {
    marginBottom: 32,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: PALETTE.textPrimary,
    letterSpacing: -0.2,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllTxt: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: PALETTE.primary,
  },
  horizontalScrollPadding: {
    paddingLeft: 20,
    paddingRight: 4,
  },

  // 🏠 Section 1 — Personalized Header
  headerContainer: {
    paddingHorizontal: 22,
    paddingTop: 4,
    paddingBottom: 14,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 7,
  },
  headerGreeting: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: PALETTE.textSecondary,
    letterSpacing: 0.1,
  },
  headerUserName: {
    fontFamily: FONTS.bold,
    fontSize: 26,
    color: PALETTE.textPrimary,
    letterSpacing: -0.5,
    marginBottom: 7,
    lineHeight: 32,
  },
  headerInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexWrap: 'nowrap',
  },
  headerInfoText: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: PALETTE.textSecondary,
  },
  headerInfoDot: {
    fontFamily: FONTS.medium,
    fontSize: 11,
    color: PALETTE.textSecondary,
    marginHorizontal: 2,
    opacity: 0.55,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#FAFAFA',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: PALETTE.border,
    position: 'relative',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  headerBadgeDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  avatarWrapper: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },

  // 🔍 Section 2 — Search
  searchContainer: {
    paddingHorizontal: 22,
    marginTop: 16,
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PALETTE.cardBg,
    borderRadius: 18,
    paddingHorizontal: 16,
    height: 52,
    borderWidth: 1,
    borderColor: PALETTE.border,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: PALETTE.textPrimary,
    paddingVertical: 0,
  },
  searchActionBtn: {
    padding: 6,
  },
  searchDivider: {
    width: 1,
    height: 18,
    backgroundColor: PALETTE.border,
    marginHorizontal: 8,
  },

  // 🏷️ Section 3 — Quick Filters
  quickFiltersContainer: {
    marginBottom: 24,
  },
  chipsScroll: {
    paddingLeft: 20,
    paddingRight: 8,
  },
  chip: {
    paddingHorizontal: 16,
    height: 38,
    borderRadius: 19,
    backgroundColor: PALETTE.cardBg,
    borderWidth: 1,
    borderColor: PALETTE.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  chipSelected: {
    backgroundColor: PALETTE.primary,
    borderColor: PALETTE.primary,
  },
  chipText: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: PALETTE.textSecondary,
  },
  chipTextSelected: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: '#FFFFFF',
  },

  // 🎠 Section 4 — Hero Carousel
  carouselSection: {
    marginBottom: 32,
  },
  carouselScroll: {
    paddingLeft: 20,
    paddingRight: 20,
  },
  carouselSlide: {
    width: SCREEN_WIDTH - 40,
    height: 145,
    borderRadius: 20,
    marginRight: 16,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#050A1C',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 6,
  },
  carouselSlideImg: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    opacity: 0.72,
  },
  carouselCounter: {
    position: 'absolute',
    top: 12,
    right: 14,
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
  },
  carouselCounterTxt: {
    fontFamily: FONTS.bold,
    fontSize: 9,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  carouselSlideContent: {
    position: 'absolute',
    left: 16,
    bottom: 16,
    right: 16,
  },
  carouselSlideTag: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  carouselTagDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginRight: 5,
  },
  carouselSlideTagTxt: {
    fontFamily: FONTS.bold,
    fontSize: 8.5,
    color: '#FFFFFF',
    letterSpacing: 0.6,
  },
  carouselSlideTitle: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 3,
    letterSpacing: -0.3,
    lineHeight: 22,
  },
  carouselSlideDesc: {
    fontFamily: FONTS.medium,
    fontSize: 11.5,
    color: 'rgba(226,232,240,0.90)',
    marginBottom: 10,
    lineHeight: 15,
  },
  carouselSlideBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 13,
    height: 28,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  carouselSlideBtnTxt: {
    fontFamily: FONTS.bold,
    fontSize: 11,
  },
  indicatorsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    marginTop: 10,
  },
  indicatorDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#CBD5E1',
  },
  indicatorDotActive: {
    width: 18,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: PALETTE.primary,
  },

  // 📚 Section 5 — Explore Categories Grid
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    gap: 10,
  },
  categoryCard: {
    width: (SCREEN_WIDTH - 40 - 30) / 4,
    height: 80,
    backgroundColor: PALETTE.cardBg,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: PALETTE.border,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  categoryIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  categoryLabel: {
    fontFamily: FONTS.bold,
    fontSize: 10.5,
    color: PALETTE.textPrimary,
    textAlign: 'center',
  },

  // ⭐ Section 6 — Popular Study Spaces Card
  spaceCard: {
    width: 250,
    height: 310,
    backgroundColor: PALETTE.cardBg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: PALETTE.border,
    marginRight: 14,
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  spaceCardImgContainer: {
    width: '100%',
    height: 130,
    position: 'relative',
    backgroundColor: '#E2E8F0',
  },
  spaceCardImg: {
    width: '100%',
    height: '100%',
  },
  verifiedBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#0284C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  verifiedBadgeTxt: {
    fontFamily: FONTS.bold,
    fontSize: 8,
    color: '#FFFFFF',
  },
  statusBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusBadgeTxt: {
    fontFamily: FONTS.bold,
    fontSize: 8,
    color: '#FFFFFF',
  },
  favoriteBtn: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  spaceCardBody: {
    padding: 12,
    flex: 1,
    justifyContent: 'space-between',
  },
  spaceCardName: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: PALETTE.textPrimary,
  },
  spaceCardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  spaceCardMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spaceCardMetaTxt: {
    fontFamily: FONTS.bold,
    fontSize: 11.5,
    color: PALETTE.textSecondary,
  },
  spaceCardBullet: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    color: PALETTE.textSecondary,
    marginHorizontal: 6,
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 6,
  },
  amenityChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  amenityChipTxt: {
    fontFamily: FONTS.medium,
    fontSize: 9.5,
    color: PALETTE.textSecondary,
  },
  spaceCardDivider: {
    height: 1,
    backgroundColor: PALETTE.border,
    marginVertical: 10,
  },
  spaceCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontFamily: FONTS.medium,
    fontSize: 10,
    color: PALETTE.textSecondary,
  },
  priceValue: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: PALETTE.primary,
  },
  priceUnit: {
    fontFamily: FONTS.medium,
    fontSize: 10.5,
    color: PALETTE.textSecondary,
  },
  cardCTA: {
    backgroundColor: PALETTE.primary,
    paddingHorizontal: 12,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardCTATxt: {
    fontFamily: FONTS.bold,
    fontSize: 11.5,
    color: '#FFFFFF',
  },
  emptyCardState: {
    width: SCREEN_WIDTH - 40,
    height: 120,
    backgroundColor: PALETTE.cardBg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: PALETTE.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20,
  },
  emptyCardTxt: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: PALETTE.textSecondary,
  },

  // 🕒 Section 7 — Recently Viewed
  recentCard: {
    width: 220,
    height: 90,
    backgroundColor: PALETTE.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: PALETTE.border,
    marginRight: 12,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  recentThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
    marginRight: 10,
  },
  recentContent: {
    flex: 1,
    justifyContent: 'space-between',
    height: 68,
  },
  recentName: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: PALETTE.textPrimary,
    letterSpacing: -0.1,
    marginBottom: 1,
  },
  recentMeta: {
    fontFamily: FONTS.medium,
    fontSize: 9.5,
    color: PALETTE.textSecondary,
  },
  recentMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  recentMetaAlt: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    color: PALETTE.primary,
  },
  recentBtn: {
    backgroundColor: '#EFF6FF',
    alignSelf: 'flex-start',
    paddingHorizontal: 9,
    height: 21,
    borderRadius: 6,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  recentBtnTxt: {
    fontFamily: FONTS.bold,
    fontSize: 9.5,
    color: PALETTE.primary,
  },

  // 🎁 Section 8 — Student Offers
  offerCardWrapper: {
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 12,
    elevation: 4,
    borderRadius: 20,
  },
  offerCard: {
    width: 220,
    height: 110,
    borderRadius: 20,
    padding: 14,
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  offerCircleAccent: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(255,255,255,0.08)',
    right: -30,
    top: -30,
  },
  offerTagContainer: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 20,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.30)',
  },
  offerTagTxt: {
    fontFamily: FONTS.bold,
    fontSize: 8,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  offerTitle: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: '#FFFFFF',
    lineHeight: 17,
    letterSpacing: -0.1,
  },
  offerDesc: {
    fontFamily: FONTS.medium,
    fontSize: 9.5,
    color: 'rgba(255, 255, 255, 0.82)',
    marginTop: 3,
    lineHeight: 12,
  },
  offerArrow: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // 🎓 Section 9 — Nearby Study Events
  eventCard: {
    width: 180,
    height: 205,
    backgroundColor: PALETTE.cardBg,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: PALETTE.border,
    marginRight: 12,
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  eventImgContainer: {
    width: '100%',
    height: 90,
    position: 'relative',
  },
  eventImg: {
    width: '100%',
    height: 90,
  },
  eventAttendeeBadge: {
    position: 'absolute',
    bottom: 6,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.50)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventAttendeeBadgeTxt: {
    fontFamily: FONTS.bold,
    fontSize: 8.5,
    color: '#FFFFFF',
  },
  eventBody: {
    padding: 10,
    flex: 1,
    justifyContent: 'space-between',
  },
  eventName: {
    fontFamily: FONTS.bold,
    fontSize: 12.5,
    color: PALETTE.textPrimary,
    lineHeight: 16,
    letterSpacing: -0.1,
  },
  eventTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventTime: {
    fontFamily: FONTS.medium,
    fontSize: 9.5,
    color: PALETTE.textSecondary,
  },
  eventAttendees: {
    fontFamily: FONTS.medium,
    fontSize: 9.5,
    color: PALETTE.textSecondary,
  },
  eventBtn: {
    backgroundColor: PALETTE.primary,
    height: 24,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventBtnTxt: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    color: '#FFFFFF',
  },

  // Continue Studying Active widget styles
  activeBookingCard: {
    marginHorizontal: 20,
    backgroundColor: '#F0F7FF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    borderLeftWidth: 4,
    borderLeftColor: PALETTE.primary,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  activeBookingImg: {
    width: 68,
    height: 68,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: '#E2E8F0',
  },
  activeBookingContent: {
    flex: 1,
  },
  activeBookingHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  activeBookingTag: {
    fontFamily: FONTS.bold,
    fontSize: 9,
    color: PALETTE.primary,
    letterSpacing: 0.5,
  },
  pulseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 4,
  },
  pulseText: {
    fontFamily: FONTS.bold,
    fontSize: 9,
    color: '#047857',
  },
  activeBookingName: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: PALETTE.textPrimary,
  },
  activeBookingSlot: {
    fontFamily: FONTS.medium,
    fontSize: 11.5,
    color: PALETTE.textSecondary,
    marginBottom: 8,
  },
  activeBookingButtons: {
    flexDirection: 'row',
  },
  activeBookingBtn: {
    flex: 1,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  activeBookingBtnTxt: {
    fontFamily: FONTS.bold,
    fontSize: 10.5,
    color: '#FFFFFF',
  },

  // Floating map trigger button style
  floatingMapButton: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: '#0F172A',
    height: 44,
    borderRadius: 22,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  floatingMapTxt: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: '#FFFFFF',
  },

  // QR Entrance Modal Ticket Pass styling
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  ticketBox: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  cutoutL: {
    position: 'absolute',
    left: -12,
    top: '32%',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  cutoutR: {
    position: 'absolute',
    right: -12,
    top: '32%',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  modalTitle: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: PALETTE.textPrimary,
  },
  modalInstruction: {
    fontFamily: FONTS.medium,
    fontSize: 11.5,
    color: PALETTE.textSecondary,
    marginBottom: 14,
  },
  dashedDivider: {
    height: 1,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginVertical: 14,
  },
  modalBody: {
    alignItems: 'center',
    marginVertical: 8,
  },
  qrCodeBox: {
    padding: 10,
    backgroundColor: '#FAFBFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 8,
  },
  qrCodeLabel: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    color: PALETTE.primary,
    letterSpacing: 0.5,
  },
  closeBtn: {
    backgroundColor: PALETTE.primary,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  closeBtnTxt: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: '#FFFFFF',
  },
});
