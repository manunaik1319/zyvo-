import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Image,
  Dimensions,
  Animated,
  ActivityIndicator,
  RefreshControl,
  Platform,
  Vibration,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useSpaceStore, StudySpace } from '../../store/spaceStore';
import { FONTS } from '../../constants/fonts';

const { width: W } = Dimensions.get('window');
const PRIMARY_COLOR = '#5B4CF6'; // Zyvo Purple
const PRIMARY_GRADIENT = [PRIMARY_COLOR, '#7C3AED'] as const;

const SUGGESTIONS = [
  'Focus Library',
  'Scholar Haven',
  'Apex Pods',
  'Vibe Modern Café',
  'Silent study room',
  'Coworking Space',
];

const FILTERS = [
  'Open Now',
  'Nearby',
  'Libraries',
  'Study Halls',
  'Focus Pods',
  'Silent Zone',
  'Air Conditioned',
  'Fast WiFi',
  'Charging',
  'Budget',
  'Premium',
  'Group Study',
  '24×7',
  'Student Favourite',
];

const RECENT_SEARCHES = [
  'Silent study room',
  'Focus Library Sonepat',
  'Apex Pods',
];

// Helper to resolve dynamic recommendations/highlights based on ID
const getSpaceRecommendations = (spaceId: string) => {
  const recommendations: Record<string, { label: string; wifi: string; noise: string; open: string; hasPower: boolean; isVerified: boolean }> = {
    '1': { label: 'Best for Exams', wifi: '300 Mbps', noise: 'Silent', open: '11 PM', hasPower: true, isVerified: true },
    '2': { label: 'Most Booked Today', wifi: '150 Mbps', noise: 'Quiet', open: '10 PM', hasPower: true, isVerified: true },
    '3': { label: 'Quietest Space', wifi: '500 Mbps', noise: 'Acoustic Silent', open: '12 AM', hasPower: true, isVerified: true },
    '4': { label: 'Best Value', wifi: '100 Mbps', noise: 'Low Hum', open: '9 PM', hasPower: false, isVerified: false },
    '5': { label: 'High-Speed WiFi', wifi: '1 Gbps', noise: 'Collaborative', open: '11 PM', hasPower: true, isVerified: true },
  };
  return recommendations[spaceId] || { label: 'Student Favourite', wifi: '100 Mbps', noise: 'Quiet', open: '10 PM', hasPower: true, isVerified: false };
};

// ─── SHIMMER SKELETON LOADER ─────────────────────────────────────────────────
function ShimmerSpaceCard() {
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.0, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.4, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={[styles.shimmerCard, { opacity: pulseAnim }]}>
      <View style={styles.shimmerImg} />
      <View style={{ padding: 16 }}>
        <View style={styles.shimmerRow}>
          <View style={styles.shimmerTitle} />
          <View style={styles.shimmerBadge} />
        </View>
        <View style={[styles.shimmerLine, { width: '60%', marginVertical: 8 }]} />
        <View style={[styles.shimmerLine, { width: '40%' }]} />
        <View style={styles.shimmerFooter}>
          <View style={styles.shimmerBtn} />
          <View style={styles.shimmerBtn} />
        </View>
      </View>
    </Animated.View>
  );
}

// ─── EXPLORE SPACES SCREEN ───────────────────────────────────────────────────
export default function ExploreSpacesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  // Zustand State
  const spaces = useSpaceStore((state) => state.spaces);
  const favoritedIds = useSpaceStore((state) => state.favoritedIds);
  const toggleFavorite = useSpaceStore((state) => state.toggleFavorite);

  // States
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('Open Now');
  const [mapMode, setMapMode] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  // Scroll tracking for header effects
  const [scrollY, setScrollY] = useState(0);

  // Simulated initial load
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(t);
  }, []);

  // Handle pull-to-refresh
  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  // Filter and search spaces logic
  const filteredSpaces = useMemo(() => {
    return spaces.filter((s) => {
      // 1. Search Query Match
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q) || s.location.toLowerCase().includes(q);
      
      if (!matchesSearch) return false;

      // 2. Chip Filter Match
      const rec = getSpaceRecommendations(s.id);
      switch (selectedFilter) {
        case 'Open Now':
          return rec.open !== 'N/A'; // Mock condition
        case 'Nearby':
          return parseFloat(s.distance) <= 1.5;
        case 'Libraries':
          return s.category === 'Libraries';
        case 'Study Halls':
          return s.category === 'Study Halls';
        case 'Focus Pods':
          return s.category === 'Focus Pods';
        case 'Silent Zone':
          return rec.noise.toLowerCase().includes('silent');
        case 'Air Conditioned':
          return s.description.toLowerCase().includes('air-conditioned') || s.description.toLowerCase().includes('filtration') || s.id !== '4';
        case 'Fast WiFi':
          return rec.wifi.includes('Gbps') || rec.wifi.includes('300') || rec.wifi.includes('500');
        case 'Charging':
          return rec.hasPower;
        case 'Budget':
          return s.price <= 10;
        case 'Premium':
          return s.price >= 18;
        case 'Group Study':
          return s.category === 'Group Rooms';
        case '24×7':
          return s.id === '3';
        case 'Student Favourite':
          return s.rating >= 4.8 && s.reviewsCount > 50;
        default:
          return true;
      }
    });
  }, [spaces, searchQuery, selectedFilter]);

  // Derived sections
  const recommendedSpaces = useMemo(() => {
    return spaces.filter((s) => s.rating >= 4.8);
  }, [spaces]);

  const trendingSpaces = useMemo(() => {
    return spaces.slice().reverse();
  }, [spaces]);

  const studentFavorites = useMemo(() => {
    return spaces.filter((s) => s.reviewsCount >= 60);
  }, [spaces]);

  const handleCardPress = (spaceId: string) => {
    router.push({ pathname: `/space/${spaceId}` } as any);
  };

  const handleBookNow = (spaceId: string) => {
    router.push({ pathname: '/booking/seats', params: { spaceId } } as any);
  };

  // Header dynamic safe dimensions
  const headerPaddingTop = Platform.OS === 'android'
    ? (StatusBar.currentHeight ? StatusBar.currentHeight + 8 : 36)
    : (insets.top || 12);

  // ─── RENDERS ───────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <View style={[styles.root, { paddingTop: headerPaddingTop }]}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent />
        
        {/* Skeleton Header */}
        <View style={styles.headerContainer}>
          <View>
            <View style={{ width: 140, height: 26, borderRadius: 6, backgroundColor: '#E2E8F0', marginBottom: 6 }} />
            <View style={{ width: 220, height: 12, borderRadius: 4, backgroundColor: '#E2E8F0' }} />
          </View>
          <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#E2E8F0' }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
          <View style={{ height: 48, borderRadius: 16, backgroundColor: '#E2E8F0', marginVertical: 16 }} />
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20 }}>
            {[80, 100, 70, 90].map((w, i) => (
              <View key={i} style={{ width: w, height: 32, borderRadius: 16, backgroundColor: '#E2E8F0' }} />
            ))}
          </View>
          <View style={{ height: 160, borderRadius: 24, backgroundColor: '#E2E8F0', marginBottom: 24 }} />
          <ShimmerSpaceCard />
          <ShimmerSpaceCard />
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent />

      {/* HEADER SECTION */}
      <View
        style={[
          styles.headerContainer,
          { paddingTop: headerPaddingTop },
          scrollY > 15 && styles.headerSticky,
        ]}
      >
        <View style={styles.headerTopRow}>
          <View>
            <Text style={styles.headerTitle}>Explore Spaces</Text>
            <Text style={styles.headerSubtitle}>Find your perfect place to study, focus, and work.</Text>
          </View>
          <View style={styles.headerRightActions}>
            <TouchableOpacity style={styles.headerBtn} activeOpacity={0.8}>
              <Feather name="bell" size={18} color="#0F172A" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.headerBtn, { marginLeft: 8 }]}
              activeOpacity={0.8}
              onPress={() => setMapMode(!mapMode)}
            >
              <Feather name={mapMode ? "list" : "map"} size={18} color="#0F172A" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Location Info Chip */}
        <View style={styles.locationChipRow}>
          <TouchableOpacity style={styles.locationChip} activeOpacity={0.8}>
            <Ionicons name="location" size={12} color="#5B4CF6" style={{ marginRight: 4 }} />
            <Text style={styles.locationChipText}>Near IIIT Sonepat</Text>
            <Feather name="chevron-down" size={10} color="#64748B" style={{ marginLeft: 4 }} />
          </TouchableOpacity>
          <View style={styles.gpsLiveIndicator}>
            <View style={styles.gpsIndicatorDot} />
            <Text style={styles.gpsIndicatorText}>Live GPS</Text>
          </View>
        </View>
      </View>

      {mapMode ? (
        /* MAP VIEW MODE */
        <View style={styles.mapContainer}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=800&auto=format&fit=crop' }}
            style={StyleSheet.absoluteFillObject}
            resizeMode="cover"
          />
          <View style={styles.mapDarkenOverlay} />

          {/* Custom Animated Pins */}
          <View style={[styles.mapPinContainer, { top: '35%', left: '35%' }]}>
            <View style={styles.mapPinPulse} />
            <View style={styles.mapPinCore}>
              <Ionicons name="location" size={20} color="#FFFFFF" />
            </View>
          </View>
          <View style={[styles.mapPinContainer, { top: '50%', left: '65%' }]}>
            <View style={styles.mapPinPulse} />
            <View style={styles.mapPinCore}>
              <Ionicons name="location" size={20} color="#FFFFFF" />
            </View>
          </View>
          <View style={[styles.mapPinContainer, { top: '22%', left: '72%' }]}>
            <View style={styles.mapPinPulse} />
            <View style={styles.mapPinCore}>
              <Ionicons name="location" size={20} color="#FFFFFF" />
            </View>
          </View>

          {/* Swipeable Bottom Cards */}
          <View style={[styles.mapBottomCardWrap, { bottom: insets.bottom + 90 }]}>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              snapToInterval={W - 40}
              decelerationRate="fast"
              contentContainerStyle={{ paddingHorizontal: 20 }}
            >
              {spaces.map((item) => {
                const rec = getSpaceRecommendations(item.id);
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.mapMiniCard}
                    activeOpacity={0.9}
                    onPress={() => handleCardPress(item.id)}
                  >
                    <Image source={{ uri: item.imageUrl }} style={styles.mapCardImg} />
                    <View style={styles.mapCardInfo}>
                      <View style={styles.mapCardBadgeRow}>
                        <View style={styles.mapCardBadge}>
                          <Text style={styles.mapCardBadgeText}>{item.category}</Text>
                        </View>
                        <Text style={styles.mapCardPriceText}>₹{item.price}/hr</Text>
                      </View>
                      <Text style={styles.mapCardName} numberOfLines={1}>{item.name}</Text>
                      <Text style={styles.mapCardDetails}>⭐ {item.rating} • 📍 {item.distance} • 💺 {item.availableSeats} left</Text>
                      <View style={styles.mapCardCtaRow}>
                        <TouchableOpacity
                          style={styles.mapCardCta}
                          activeOpacity={0.8}
                          onPress={() => handleBookNow(item.id)}
                        >
                          <Text style={styles.mapCardCtaText}>Book Now</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      ) : (
        /* STANDARD LIST FEED MODE */
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          onScroll={(event) => {
            setScrollY(event.nativeEvent.contentOffset.y);
          }}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={PRIMARY_COLOR}
              colors={[PRIMARY_COLOR]}
            />
          }
        >
          {/* SMART FLOATING SEARCH BAR */}
          <View style={styles.searchRow}>
            <View style={styles.searchBox}>
              <Feather name="search" size={18} color="#9CA3AF" style={{ marginRight: 8 }} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search libraries, study halls, cafés..."
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={setSearchQuery}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')} style={{ marginRight: 8 }}>
                  <Feather name="x" size={16} color="#9CA3AF" />
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.micBtn} activeOpacity={0.7} onPress={() => alert('Voice search activated... Speak now.')}>
                <Feather name="mic" size={16} color="#4B5563" />
              </TouchableOpacity>
              <View style={styles.verticalDivider} />
              <TouchableOpacity style={styles.filterShortcutBtn} activeOpacity={0.7}>
                <Feather name="sliders" size={16} color={PRIMARY_COLOR} />
              </TouchableOpacity>
            </View>
          </View>

          {/* SEARCH SUGGESTIONS & RECENT SEARCHES PANEL */}
          {searchFocused && (
            <View style={styles.suggestionsContainer}>
              <Text style={styles.suggestionsHeader}>Recent Searches</Text>
              <View style={styles.recentSearchesList}>
                {RECENT_SEARCHES.map((item, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.recentSearchItem}
                    onPress={() => {
                      setSearchQuery(item);
                      setSearchFocused(false);
                    }}
                  >
                    <Feather name="clock" size={12} color="#9CA3AF" style={{ marginRight: 8 }} />
                    <Text style={styles.recentSearchText}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <Text style={[styles.suggestionsHeader, { marginTop: 12 }]}>AI Suggestions</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestionsScroll}>
                {SUGGESTIONS.map((item, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.suggestionPill}
                    onPress={() => {
                      setSearchQuery(item);
                      setSearchFocused(false);
                    }}
                  >
                    <Feather name="trending-up" size={11} color={PRIMARY_COLOR} style={{ marginRight: 4 }} />
                    <Text style={styles.suggestionPillTxt}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* QUICK FILTER CHIPS */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterList}
            style={styles.filterScroll}
          >
            {FILTERS.map((f) => {
              const active = selectedFilter === f;
              if (active) {
                return (
                  <TouchableOpacity
                    key={f}
                    style={styles.filterChipActiveWrapper}
                    activeOpacity={0.8}
                    onPress={() => setSelectedFilter(f)}
                  >
                    <LinearGradient
                      colors={PRIMARY_GRADIENT}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.filterChipActiveGrad}
                    >
                      <Text style={styles.filterChipTextActive}>{f}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                );
              }

              return (
                <TouchableOpacity
                  key={f}
                  style={styles.filterChip}
                  activeOpacity={0.8}
                  onPress={() => setSelectedFilter(f)}
                >
                  <Text style={styles.filterChipText}>{f}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* INTERACTIVE MAP PREVIEW CARD */}
          <View style={styles.mapPreviewCardContainer}>
            <View style={styles.mapPreviewCard}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=600&auto=format&fit=crop' }}
                style={styles.mapPreviewImage}
              />
              <View style={styles.mapPreviewOverlay} />
              
              {/* Simulated pins on preview */}
              <View style={[styles.previewPin, { top: '30%', left: '45%' }]} />
              <View style={[styles.previewPin, { top: '55%', left: '70%' }]} />
              <View style={[styles.previewPin, { top: '25%', left: '20%' }]} />

              <View style={styles.mapPreviewContent}>
                <Text style={styles.mapPreviewTitle}>127 Spaces Around You</Text>
                <Text style={styles.mapPreviewDesc}>Find the best study desk within a few minutes nearby.</Text>
                
                <TouchableOpacity
                  style={styles.mapPreviewBtn}
                  activeOpacity={0.85}
                  onPress={() => setMapMode(true)}
                >
                  <Text style={styles.mapPreviewBtnTxt}>Open Full Map</Text>
                  <Feather name="arrow-right" size={13} color="#FFFFFF" style={{ marginLeft: 6 }} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* DYNAMIC RESULTS FEED OR SECTIONS */}
          {searchQuery.trim().length > 0 ? (
            /* SEARCH MODE RESULTS LIST */
            <View style={styles.sectionBody}>
              <Text style={styles.sectionHeading}>Search Results ({filteredSpaces.length})</Text>
              {filteredSpaces.length === 0 ? (
                <View style={styles.emptyResultsBox}>
                  <Feather name="slash" size={32} color="#94A3B8" style={{ marginBottom: 8 }} />
                  <Text style={styles.emptyResultsTitle}>No study spaces matched</Text>
                  <Text style={styles.emptyResultsSub}>Try refining your keywords or clearing the query.</Text>
                </View>
              ) : (
                filteredSpaces.map((item) => (
                  <PremiumSpaceCard
                    key={item.id}
                    item={item}
                    onPress={() => handleCardPress(item.id)}
                    onBook={() => handleBookNow(item.id)}
                    toggleFavorite={toggleFavorite}
                    favoritedIds={favoritedIds}
                  />
                ))
              )}
            </View>
          ) : (
            /* STANDARD HOME SECTIONS MODE */
            <View>
              {/* SECTION 1: RECOMMENDED FOR YOU */}
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionHeading}>Recommended For You</Text>
                <TouchableOpacity onPress={() => setSearchQuery('Library')}>
                  <Text style={styles.viewAllText}>View All</Text>
                </TouchableOpacity>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={W * 0.72 + 14}
                decelerationRate="fast"
                contentContainerStyle={styles.snapScrollContent}
              >
                {recommendedSpaces.map((item) => (
                  <PremiumSpaceCard
                    key={item.id}
                    item={item}
                    horizontal
                    onPress={() => handleCardPress(item.id)}
                    onBook={() => handleBookNow(item.id)}
                    toggleFavorite={toggleFavorite}
                    favoritedIds={favoritedIds}
                  />
                ))}
              </ScrollView>

              {/* SECTION 2: TRENDING TODAY */}
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionHeading}>Trending Today</Text>
                <TouchableOpacity onPress={() => setSearchQuery('Hall')}>
                  <Text style={styles.viewAllText}>View All</Text>
                </TouchableOpacity>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={W * 0.72 + 14}
                decelerationRate="fast"
                contentContainerStyle={styles.snapScrollContent}
              >
                {trendingSpaces.map((item) => (
                  <PremiumSpaceCard
                    key={item.id}
                    item={item}
                    horizontal
                    onPress={() => handleCardPress(item.id)}
                    onBook={() => handleBookNow(item.id)}
                    toggleFavorite={toggleFavorite}
                    favoritedIds={favoritedIds}
                  />
                ))}
              </ScrollView>

              {/* SECTION 3: STUDENT FAVORITES (Vertical List) */}
              <View style={[styles.sectionHeaderRow, { marginBottom: 12 }]}>
                <Text style={styles.sectionHeading}>Student Favorites</Text>
                <TouchableOpacity onPress={() => setSelectedFilter('Student Favourite')}>
                  <Text style={styles.viewAllText}>View All</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.sectionBody}>
                {studentFavorites.map((item) => (
                  <PremiumSpaceCard
                    key={item.id}
                    item={item}
                    onPress={() => handleCardPress(item.id)}
                    onBook={() => handleBookNow(item.id)}
                    toggleFavorite={toggleFavorite}
                    favoritedIds={favoritedIds}
                  />
                ))}
              </View>

              {/* SECTION 4: BUDGET FRIENDLY */}
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionHeading}>Budget Friendly (Under ₹10/hr)</Text>
                <TouchableOpacity onPress={() => setSelectedFilter('Budget')}>
                  <Text style={styles.viewAllText}>View All</Text>
                </TouchableOpacity>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={W * 0.72 + 14}
                decelerationRate="fast"
                contentContainerStyle={styles.snapScrollContent}
              >
                {spaces.filter(s => s.price <= 10).map((item) => (
                  <PremiumSpaceCard
                    key={item.id}
                    item={item}
                    horizontal
                    onPress={() => handleCardPress(item.id)}
                    onBook={() => handleBookNow(item.id)}
                    toggleFavorite={toggleFavorite}
                    favoritedIds={favoritedIds}
                  />
                ))}
              </ScrollView>
            </View>
          )}

        </ScrollView>
      )}

      {/* FLOATING GLASSMOPRHIC MAP TOGGLE PILL */}
      {!mapMode && (
        <TouchableOpacity
          style={[styles.floatingMapBtn, { bottom: insets.bottom + 90 }]}
          activeOpacity={0.85}
          onPress={() => setMapMode(true)}
        >
          <Ionicons name="map" size={15} color="#FFFFFF" style={{ marginRight: 6 }} />
          <Text style={styles.floatingMapText}>Map View</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── PREMIUM SPACE CARDS COMPONENT ───────────────────────────────────────────
interface SpaceCardProps {
  item: StudySpace;
  horizontal?: boolean;
  onPress: () => void;
  onBook: () => void;
  toggleFavorite: (id: string) => void;
  favoritedIds: string[];
}

function PremiumSpaceCard({ item, horizontal = false, onPress, onBook, toggleFavorite, favoritedIds }: SpaceCardProps) {
  const isFav = favoritedIds.includes(item.id);
  const rec = getSpaceRecommendations(item.id);

  // Badge mapping helper
  const getBadgeText = (spaceId: string) => {
    if (spaceId === '1') return 'STUDENT FAVORITE';
    if (spaceId === '2') return 'TRENDING';
    if (spaceId === '3') return 'OPEN NOW';
    return 'VERIFIED';
  };

  const badgeText = getBadgeText(item.id);

  return (
    <TouchableOpacity
      activeOpacity={0.95}
      onPress={onPress}
      style={[
        styles.premiumCard,
        horizontal ? styles.premiumCardHorizontal : styles.premiumCardVertical
      ]}
    >
      {/* IMMERSIVE IMAGE CONTAINER */}
      <View style={styles.cardImgWrapper}>
        <Image source={{ uri: item.imageUrl }} style={styles.cardImg} resizeMode="cover" />
        
        {/* badges overlay left */}
        <View style={styles.cardBadgesRow}>
          {rec.isVerified && (
            <View style={[styles.statusBadge, { backgroundColor: '#EEF2FF', borderColor: '#C7D2FE' }]}>
              <Ionicons name="checkmark-circle" size={10} color={PRIMARY_COLOR} style={{ marginRight: 2 }} />
              <Text style={[styles.statusBadgeText, { color: PRIMARY_COLOR }]}>VERIFIED</Text>
            </View>
          )}
          <View style={styles.statusBadge}>
            <Text style={styles.statusBadgeText}>{badgeText}</Text>
          </View>
        </View>

        {/* Action icons right */}
        <View style={styles.cardActionsOverlay}>
          <TouchableOpacity
            style={styles.cardFavBtn}
            activeOpacity={0.8}
            onPress={() => {
              if (Platform.OS !== 'web') Vibration.vibrate(10);
              toggleFavorite(item.id);
            }}
          >
            <Ionicons name={isFav ? 'heart' : 'heart-outline'} size={15} color={isFav ? '#EF4444' : '#0F172A'} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.cardFavBtn, { marginTop: 6 }]}
            activeOpacity={0.8}
            onPress={() => alert(`Shared Link: space/${item.id}`)}
          >
            <Feather name="share-2" size={14} color="#0F172A" />
          </TouchableOpacity>
        </View>

        {/* Occupancy Badge overlay bottom left */}
        <View style={styles.occupancyOverlayPill}>
          <View style={styles.occupancyDot} />
          <Text style={styles.occupancyText}>{item.availableSeats} / {item.totalSeats} seats left</Text>
        </View>
      </View>

      {/* CARD CONTENT */}
      <View style={styles.cardContent}>
        {/* Smart recommendation label */}
        <View style={styles.recommendationTag}>
          <Text style={styles.recommendationTagText}>{rec.label}</Text>
        </View>

        <Text style={styles.spaceCardName} numberOfLines={1}>{item.name}</Text>
        
        <View style={styles.metadataCardRow}>
          <View style={styles.metaLabelCell}>
            <Ionicons name="star" size={12} color="#F5C842" style={{ marginRight: 2 }} />
            <Text style={styles.metaLabelText}>{item.rating} ({item.reviewsCount})</Text>
          </View>
          <View style={styles.metaLabelCell}>
            <Ionicons name="location" size={12} color="#64748B" style={{ marginRight: 2 }} />
            <Text style={styles.metaLabelText}>{item.distance}</Text>
          </View>
          <View style={styles.metaLabelCell}>
            <Feather name="volume-x" size={11} color="#64748B" style={{ marginRight: 2 }} />
            <Text style={styles.metaLabelText}>{rec.noise}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Amenities grid line */}
        <View style={styles.amenitiesGrid}>
          <View style={styles.amenityItem}>
            <Feather name="wifi" size={11} color="#475569" style={{ marginRight: 4 }} />
            <Text style={styles.amenityItemText}>{rec.wifi}</Text>
          </View>
          {rec.hasPower && (
            <View style={styles.amenityItem}>
              <Feather name="zap" size={11} color="#475569" style={{ marginRight: 4 }} />
              <Text style={styles.amenityItemText}>Charging</Text>
            </View>
          )}
          <View style={styles.amenityItem}>
            <Feather name="clock" size={11} color="#475569" style={{ marginRight: 4 }} />
            <Text style={styles.amenityItemText}>Till {rec.open}</Text>
          </View>
        </View>

        {/* Pricing + Action Buttons */}
        <View style={styles.cardFooterRow}>
          <View>
            <Text style={styles.priceText}>₹{item.price}</Text>
            <Text style={styles.priceUnit}>/hour</Text>
          </View>
          <View style={styles.cardFooterCtaRow}>
            <TouchableOpacity style={styles.detailsBtn} activeOpacity={0.7} onPress={onPress}>
              <Text style={styles.detailsBtnText}>Details</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.bookCtaBtnWrapper} activeOpacity={0.85} onPress={onBook}>
              <LinearGradient
                colors={PRIMARY_GRADIENT}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.bookCtaBtnGrad}
              >
                <Text style={styles.bookCtaBtnText}>Book Now</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FAFBFF',
  },
  headerContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingBottom: 14,
    zIndex: 10,
  },
  headerSticky: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(226, 232, 240, 0.8)',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 3,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontFamily: FONTS.bold,
    fontSize: 24,
    color: '#0F172A',
    letterSpacing: -0.4,
  },
  headerSubtitle: {
    fontFamily: FONTS.medium,
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationChipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  locationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  locationChipText: {
    fontFamily: FONTS.bold,
    fontSize: 10.5,
    color: '#334155',
  },
  gpsLiveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  gpsIndicatorDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#10B981',
    marginRight: 4,
  },
  gpsIndicatorText: {
    fontFamily: FONTS.medium,
    fontSize: 9.5,
    color: '#64748B',
  },
  scrollContent: {
    paddingBottom: 160,
  },

  // Search Layout
  searchRow: {
    paddingHorizontal: 16,
    marginVertical: 14,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: '#0F172A',
    marginLeft: 4,
  },
  micBtn: {
    padding: 6,
  },
  verticalDivider: {
    width: 1,
    height: 18,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 10,
  },
  filterShortcutBtn: {
    padding: 4,
  },

  // Suggestions Box
  suggestionsContainer: {
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  suggestionsHeader: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    color: '#64748B',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  recentSearchesList: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  recentSearchText: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: '#334155',
  },
  suggestionsScroll: {
    gap: 6,
  },
  suggestionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    marginRight: 6,
  },
  suggestionPillTxt: {
    fontFamily: FONTS.medium,
    fontSize: 11,
    color: '#334155',
  },

  // Filters Scroll
  filterScroll: {
    flexGrow: 0,
    marginBottom: 16,
  },
  filterList: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 8,
  },
  filterChipActiveWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 8,
  },
  filterChipActiveGrad: {
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  filterChipText: {
    fontFamily: FONTS.medium,
    fontSize: 12.5,
    color: '#4B5563',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontFamily: FONTS.bold,
    fontSize: 12.5,
  },

  // Live Map Preview
  mapPreviewCardContainer: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  mapPreviewCard: {
    height: 150,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 2,
  },
  mapPreviewImage: {
    width: '100%',
    height: '100%',
  },
  mapPreviewOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
  },
  previewPin: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#5B4CF6',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  mapPreviewContent: {
    position: 'absolute',
    left: 16,
    bottom: 16,
    right: 16,
  },
  mapPreviewTitle: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: '#0F172A',
    marginBottom: 2,
  },
  mapPreviewDesc: {
    fontFamily: FONTS.medium,
    fontSize: 11,
    color: '#475569',
    marginBottom: 10,
  },
  mapPreviewBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#0F172A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  mapPreviewBtnTxt: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    color: '#FFFFFF',
  },

  // Curriculum Sections
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 10,
    marginBottom: 8,
  },
  sectionHeading: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: '#0F172A',
  },
  viewAllText: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: '#5B4CF6',
  },
  snapScrollContent: {
    paddingLeft: 16,
    paddingRight: 8,
    paddingBottom: 12,
  },
  sectionBody: {
    paddingHorizontal: 16,
  },

  // Premium Space Cards
  premiumCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 3,
  },
  premiumCardHorizontal: {
    width: W * 0.72,
    marginRight: 14,
  },
  premiumCardVertical: {
    width: '100%',
    marginBottom: 16,
  },
  cardImgWrapper: {
    width: '100%',
    height: 120,
    position: 'relative',
    backgroundColor: '#E2E8F0',
  },
  cardImg: {
    width: '100%',
    height: '100%',
  },
  cardBadgesRow: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    gap: 4,
  },
  statusBadge: {
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadgeText: {
    fontFamily: FONTS.bold,
    fontSize: 8.5,
    color: '#FFFFFF',
  },
  cardActionsOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  cardFavBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  occupancyOverlayPill: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  occupancyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 5,
  },
  occupancyText: {
    fontFamily: FONTS.bold,
    fontSize: 9.5,
    color: '#065F46',
  },
  cardContent: {
    padding: 16,
  },
  recommendationTag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(91, 76, 246, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
  },
  recommendationTagText: {
    fontFamily: FONTS.bold,
    fontSize: 9.5,
    color: '#5B4CF6',
  },
  spaceCardName: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: '#0F172A',
    marginBottom: 6,
  },
  metadataCardRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metaLabelCell: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaLabelText: {
    fontFamily: FONTS.medium,
    fontSize: 11,
    color: '#64748B',
  },
  amenitiesGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amenityItemText: {
    fontFamily: FONTS.medium,
    fontSize: 10.5,
    color: '#475569',
  },
  cardFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceText: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: '#5B4CF6',
  },
  priceUnit: {
    fontFamily: FONTS.medium,
    fontSize: 10,
    color: '#64748B',
    marginTop: -2,
  },
  cardFooterCtaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailsBtn: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsBtnText: {
    fontFamily: FONTS.bold,
    fontSize: 11.5,
    color: '#475569',
  },
  bookCtaBtnWrapper: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  bookCtaBtnGrad: {
    paddingHorizontal: 14,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookCtaBtnText: {
    fontFamily: FONTS.bold,
    fontSize: 11.5,
    color: '#FFFFFF',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },

  // Shimmer Loader Skeletons
  shimmerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 16,
    overflow: 'hidden',
  },
  shimmerImg: {
    height: 120,
    backgroundColor: '#E2E8F0',
  },
  shimmerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  shimmerTitle: {
    width: '50%',
    height: 14,
    borderRadius: 6,
    backgroundColor: '#E2E8F0',
  },
  shimmerBadge: {
    width: 60,
    height: 20,
    borderRadius: 6,
    backgroundColor: '#E2E8F0',
  },
  shimmerLine: {
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E2E8F0',
  },
  shimmerFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  shimmerBtn: {
    width: 80,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
  },

  // Map Mode Layout
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  mapDarkenOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.15)',
  },
  mapPinContainer: {
    position: 'absolute',
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapPinPulse: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(91, 76, 246, 0.3)',
    borderWidth: 1,
    borderColor: '#5B4CF6',
  },
  mapPinCore: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#5B4CF6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#5B4CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  mapBottomCardWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  mapMiniCard: {
    width: W - 40,
    height: 120,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 12,
    marginRight: 10,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },
  mapCardImg: {
    width: 96,
    height: 96,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
    marginRight: 12,
  },
  mapCardInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  mapCardBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  mapCardBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  mapCardBadgeText: {
    fontFamily: FONTS.bold,
    fontSize: 8.5,
    color: '#5B4CF6',
  },
  mapCardPriceText: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: '#5B4CF6',
  },
  mapCardName: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: '#0F172A',
    marginBottom: 3,
  },
  mapCardDetails: {
    fontFamily: FONTS.medium,
    fontSize: 10.5,
    color: '#64748B',
    marginBottom: 6,
  },
  mapCardCtaRow: {
    flexDirection: 'row',
  },
  mapCardCta: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
  },
  mapCardCtaText: {
    fontFamily: FONTS.bold,
    fontSize: 10.5,
    color: '#FFFFFF',
  },

  // Floating CTA Map Button
  floatingMapBtn: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderRadius: 20,
    paddingHorizontal: 18,
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  floatingMapText: {
    fontFamily: FONTS.bold,
    fontSize: 12.5,
    color: '#FFFFFF',
  },

  // Empty search state
  emptyResultsBox: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyResultsTitle: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: '#475569',
    marginBottom: 2,
  },
  emptyResultsSub: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
  },
});
