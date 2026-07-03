import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Platform,
  Animated,
  Dimensions,
  StatusBar,
  Pressable,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { FONTS } from '../constants/fonts';
import { COLORS } from '../constants/colors';

const { width } = Dimensions.get('window');
const isLarge = width > 768;

// Space interface
interface Space {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviewsCount: number;
  distance: string;
  distanceVal: number; // in meters for sorting
  availableSeats: number;
  noiseLevel: 'Quiet' | 'Silent' | 'Moderate';
  price: number;
  imageUrl: string;
  amenities: string[];
  isOpen: boolean;
  isTrending?: boolean;
}

const MOCK_SPACES: Space[] = [
  {
    id: '1',
    name: "The Scholar's Haven",
    category: 'LIBRARY',
    rating: 4.9,
    reviewsCount: 248,
    distance: '650 m',
    distanceVal: 650,
    availableSeats: 12,
    noiseLevel: 'Quiet',
    price: 80,
    imageUrl: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=600&auto=format&fit=crop',
    amenities: ['WiFi', 'Power', 'AC', 'Coffee'],
    isOpen: true,
    isTrending: true,
  },
  {
    id: '2',
    name: 'Quiet Café & Study Lounge',
    category: 'STUDY CAFÉ',
    rating: 4.5,
    reviewsCount: 95,
    distance: '800 m',
    distanceVal: 800,
    availableSeats: 4,
    noiseLevel: 'Moderate',
    price: 120,
    imageUrl: 'https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=600&auto=format&fit=crop',
    amenities: ['WiFi', 'Power', 'AC', 'Coffee'],
    isOpen: true,
  },
  {
    id: '3',
    name: 'IIIT Study Hall',
    category: 'STUDY HALL',
    rating: 4.7,
    reviewsCount: 189,
    distance: '1.2 km',
    distanceVal: 1200,
    availableSeats: 8,
    noiseLevel: 'Quiet',
    price: 50,
    imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=600&auto=format&fit=crop',
    amenities: ['WiFi', 'Power', 'AC'],
    isOpen: true,
    isTrending: true,
  },
  {
    id: '4',
    name: 'Apex Soundproof Pods',
    category: 'FOCUS POD',
    rating: 4.9,
    reviewsCount: 64,
    distance: '300 m',
    distanceVal: 300,
    availableSeats: 2,
    noiseLevel: 'Silent',
    price: 100,
    imageUrl: 'https://images.unsplash.com/photo-1542744094-3a31f103e35f?q=80&w=600&auto=format&fit=crop',
    amenities: ['WiFi', 'Power', 'AC', 'Soundproof'],
    isOpen: true,
  },
  {
    id: '5',
    name: 'Central University Library',
    category: 'LIBRARY',
    rating: 4.8,
    reviewsCount: 340,
    distance: '2.1 km',
    distanceVal: 2100,
    availableSeats: 15,
    noiseLevel: 'Silent',
    price: 40,
    imageUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=600&auto=format&fit=crop',
    amenities: ['Power', 'AC'],
    isOpen: false,
  },
  {
    id: '6',
    name: 'Synergy Co-working Space',
    category: 'COWORKING',
    rating: 4.6,
    reviewsCount: 112,
    distance: '1.8 km',
    distanceVal: 1800,
    availableSeats: 6,
    noiseLevel: 'Moderate',
    price: 150,
    imageUrl: 'https://images.unsplash.com/photo-1517502884422-41eaaced0168?q=80&w=600&auto=format&fit=crop',
    amenities: ['WiFi', 'Power', 'AC', 'Whiteboard'],
    isOpen: true,
  }
];

export default function SearchResults() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/(tabs)/home');
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [sortBy, setSortBy] = useState<'Nearest' | 'Top Rated' | 'Lowest Price' | 'Most Popular' | 'Quietest'>('Nearest');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [results, setResults] = useState<Space[]>(MOCK_SPACES);

  // Background splash values
  const blueTranslateY = useRef(new Animated.Value(0)).current;
  const cyanTranslateX = useRef(new Animated.Value(0)).current;

  // Search input focus glow anim
  const focusAnim = useRef(new Animated.Value(0)).current;

  // Page elements enter animation list
  const listFadeAnim = useRef(new Animated.Value(0)).current;

  const triggerLoading = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 800);
  };

  const onRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      clearAllFilters();
    }, 1000);
  };

  // Background loops
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(blueTranslateY, { toValue: 30, duration: 8000, useNativeDriver: true }),
        Animated.timing(blueTranslateY, { toValue: 0, duration: 8000, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(cyanTranslateX, { toValue: -30, duration: 10000, useNativeDriver: true }),
        Animated.timing(cyanTranslateX, { toValue: 0, duration: 10000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // Animate input focus glow
  useEffect(() => {
    Animated.timing(focusAnim, {
      toValue: isFocused ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isFocused]);

  // Card slide-in animation
  useEffect(() => {
    if (!loading) {
      listFadeAnim.setValue(0);
      Animated.timing(listFadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }
  }, [loading, results]);

  // Filter and sorting logic
  useEffect(() => {
    let filtered = MOCK_SPACES.filter((space) => {
      const query = searchQuery.trim().toLowerCase();
      const textMatch =
        query === '' ||
        space.name.toLowerCase().includes(query) ||
        space.category.toLowerCase().includes(query) ||
        space.noiseLevel.toLowerCase().includes(query);

      const matchesTopRated = !activeFilters.includes('Top Rated') || space.rating >= 4.7;
      const matchesNearby = !activeFilters.includes('Nearby') || space.distanceVal <= 800;
      const matchesOpen = !activeFilters.includes('Open Now') || space.isOpen;
      const matchesPrice = !activeFilters.includes('Under ₹100') || space.price < 100;
      const matchesQuiet = !activeFilters.includes('Quiet') || space.noiseLevel === 'Quiet' || space.noiseLevel === 'Silent';
      const matchesWifi = !activeFilters.includes('WiFi') || space.amenities.includes('WiFi');
      const matchesPower = !activeFilters.includes('Power') || space.amenities.includes('Power');
      const matchesAC = !activeFilters.includes('AC') || space.amenities.includes('AC');

      return (
        textMatch &&
        matchesTopRated &&
        matchesNearby &&
        matchesOpen &&
        matchesPrice &&
        matchesQuiet &&
        matchesWifi &&
        matchesPower &&
        matchesAC
      );
    });

    if (sortBy === 'Nearest') {
      filtered.sort((a, b) => a.distanceVal - b.distanceVal);
    } else if (sortBy === 'Top Rated') {
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'Lowest Price') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'Most Popular') {
      filtered.sort((a, b) => b.reviewsCount - a.reviewsCount);
    } else if (sortBy === 'Quietest') {
      const noiseOrder = { Silent: 3, Quiet: 2, Moderate: 1 };
      filtered.sort((a, b) => noiseOrder[b.noiseLevel] - noiseOrder[a.noiseLevel]);
    }

    setResults(filtered);
  }, [searchQuery, activeFilters, sortBy]);

  const toggleFilter = (filter: string) => {
    triggerLoading();
    if (activeFilters.includes(filter)) {
      setActiveFilters(activeFilters.filter((f) => f !== filter));
    } else {
      setActiveFilters([...activeFilters, filter]);
    }
  };

  const toggleFavorite = (id: string) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter((favId) => favId !== id));
    } else {
      setFavorites([...favorites, id]);
    }
  };

  const clearAllFilters = () => {
    triggerLoading();
    setSearchQuery('');
    setActiveFilters([]);
    setSortBy('Nearest');
  };

  const handleChipPress = (chipText: string) => {
    triggerLoading();
    setSearchQuery(chipText);
  };

  const inputBorderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#F1F5F9', '#6366F1'],
  });

  const inputGlowShadow = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.04, 0.12],
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      {/* Blurred Accent Splashes */}
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <Animated.View
          style={[
            styles.indigoSplash,
            { transform: [{ translateY: blueTranslateY }] },
          ]}
        >
          <LinearGradient
            colors={['rgba(99, 102, 241, 0.15)', 'rgba(99, 102, 241, 0.02)', 'transparent']}
            start={{ x: 0.5, y: 0.5 }}
            end={{ x: 1, y: 1 }}
            style={{ flex: 1, borderRadius: 200 }}
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.cyanSplash,
            { transform: [{ translateX: cyanTranslateX }] },
          ]}
        >
          <LinearGradient
            colors={['rgba(6, 182, 212, 0.14)', 'rgba(6, 182, 212, 0.02)', 'transparent']}
            start={{ x: 0.5, y: 0.5 }}
            end={{ x: 1, y: 1 }}
            style={{ flex: 1, borderRadius: 180 }}
          />
        </Animated.View>
      </View>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={20} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Search</Text>
        <View style={styles.headerRightRow}>
          <TouchableOpacity
            style={[styles.headerBtn, activeFilters.length > 0 && styles.activeHeaderBtn]}
            onPress={() => setShowSortMenu(true)}
            activeOpacity={0.7}
          >
            <Feather name="sliders" size={18} color={activeFilters.length > 0 ? '#6366F1' : '#111827'} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => router.push('/(tabs)/discover')}
            activeOpacity={0.7}
          >
            <Feather name="map" size={18} color="#111827" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Layout Area */}
      <View style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
        {/* Floating Spotlight Search Bar */}
        <View style={styles.searchBarWrapper}>
          <Animated.View
            style={[
              styles.searchBarContainer,
              { borderColor: inputBorderColor, shadowOpacity: inputGlowShadow },
            ]}
          >
            <Feather name="search" size={20} color="#6B7280" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search libraries, cafés, coworking spaces..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                if (text === '') triggerLoading();
              }}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 250)}
              autoCorrect={false}
            />
            {searchQuery.length > 0 ? (
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery('');
                  triggerLoading();
                }}
                style={styles.clearBtn}
                activeOpacity={0.7}
              >
                <Ionicons name="close-circle" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.clearBtn} activeOpacity={0.7}>
                <Feather name="mic" size={18} color="#6B7280" />
              </TouchableOpacity>
            )}
          </Animated.View>
        </View>

        {/* Dropdown Suggestions Overlay */}
        {isFocused && (
          <View style={styles.searchDropdownOverlay}>
            <Text style={styles.dropdownTitle}>Recent Searches</Text>
            {['Central Library', 'Quiet Café', 'IIIT Study Hall'].map((search) => (
              <TouchableOpacity
                key={search}
                style={styles.dropdownItem}
                onPress={() => {
                  setSearchQuery(search);
                  setIsFocused(false);
                  triggerLoading();
                }}
                activeOpacity={0.7}
              >
                <Feather name="clock" size={14} color="#94A3B8" style={{ marginRight: 10 }} />
                <Text style={styles.dropdownItemText}>{search}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#6366F1" />
          }
        >
          {/* Recent & Trending Section (Inline only if not focused for clean composition) */}
          {!isFocused && searchQuery === '' && (
            <View style={styles.trendingSection}>
              <Text style={styles.sectionTitle}>Trending & Categories</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
                <TouchableOpacity
                  style={styles.categoryChip}
                  onPress={() => handleChipPress('Library')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.categoryChipText}>📚 Library</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.categoryChip}
                  onPress={() => handleChipPress('Café')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.categoryChipText}>☕ Study Café</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.categoryChip}
                  onPress={() => handleChipPress('Campus')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.categoryChipText}>🏫 Campus Library</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.categoryChip}
                  onPress={() => handleChipPress('Coworking')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.categoryChipText}>💻 Coworking</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.categoryChip}
                  onPress={() => handleChipPress('Silent')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.categoryChipText}>🌳 Quiet Zone</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          )}

          {/* Filter Chips Horizontal Pill Scroll */}
          <View style={styles.filtersWrapper}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
              {[
                { id: 'Top Rated', label: '⭐ Top Rated' },
                { id: 'Nearby', label: '📍 Nearby' },
                { id: 'Open Now', label: '🟢 Open Now' },
                { id: 'Under ₹100', label: '💰 Under ₹100' },
                { id: 'Quiet', label: '🤫 Quiet' },
                { id: 'WiFi', label: '⚡ WiFi' },
                { id: 'Power', label: '🔌 Power' },
                { id: 'AC', label: '❄️ AC' },
              ].map((filter) => {
                const isActive = activeFilters.includes(filter.id);
                return (
                  <TouchableOpacity
                    key={filter.id}
                    style={[styles.filterChip, isActive && styles.filterChipActive]}
                    onPress={() => toggleFilter(filter.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                      {filter.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Results Summary Bar */}
          <View style={styles.summaryBar}>
            <Text style={styles.summaryCount}>{results.length} Study Spaces Found</Text>
            <TouchableOpacity
              style={styles.sortButton}
              onPress={() => setShowSortMenu(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.sortText}>Sort: {sortBy}</Text>
              <Feather name="chevron-down" size={14} color="#6366F1" style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          </View>

          {/* Results Cards List */}
          {loading ? (
            <View style={styles.listContainer}>
              <SkeletonCard />
              <SkeletonCard />
            </View>
          ) : results.length > 0 ? (
            <Animated.View style={[styles.listContainer, { opacity: listFadeAnim }]}>
              {results.map((space, index) => {
                const isFavorite = favorites.includes(space.id);
                const cardView = (
                  <SearchResultCard
                    key={space.id}
                    space={space}
                    isFavorite={isFavorite}
                    onToggleFavorite={toggleFavorite}
                    onPressBook={() => {
                      router.push({
                        pathname: '/booking/seats',
                        params: { spaceId: space.id }
                      });
                    }}
                    onPressCard={() => router.push(`/space/${space.id}`)}
                  />
                );

                // Render AI Recommendation card after the second result (index === 1)
                if (index === 1) {
                  return (
                    <View key={`ai-group-${space.id}`}>
                      {cardView}
                      <LinearGradient
                        colors={['#6366F1', '#06B6D4']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.aiCard}
                      >
                        <View style={styles.aiCardGlass}>
                          <View style={styles.aiCardHeader}>
                            <View style={styles.aiRobotCircle}>
                              <MaterialCommunityIcons name="robot" size={20} color="#FFFFFF" />
                            </View>
                            <View>
                              <Text style={styles.aiCardTag}>AI RECOMMENDATION</Text>
                              <Text style={styles.aiCardTitle}>Best Match For You</Text>
                            </View>
                          </View>

                          <Text style={styles.aiCardBody}>
                            "Based on your study preferences, this library has a 96% compatibility score."
                          </Text>

                          {/* Stats Grid */}
                          <View style={styles.aiStatsRow}>
                            <View style={styles.aiStatItem}>
                              <Text style={styles.aiStatVal}>96%</Text>
                              <Text style={styles.aiStatLabel}>Match Score</Text>
                            </View>
                            <View style={styles.aiStatDivider} />
                            <View style={styles.aiStatItem}>
                              <Text style={styles.aiStatVal}>98/100</Text>
                              <Text style={styles.aiStatLabel}>Focus Score</Text>
                            </View>
                            <View style={styles.aiStatDivider} />
                            <View style={styles.aiStatItem}>
                              <Text style={styles.aiStatVal}>2-4 Hrs</Text>
                              <Text style={styles.aiStatLabel}>Rec. Time</Text>
                            </View>
                          </View>

                          <TouchableOpacity
                            style={styles.aiCardCta}
                            onPress={() => router.push(`/space/${results[0]?.id || '1'}`)}
                            activeOpacity={0.8}
                          >
                            <Text style={styles.aiCardCtaText}>View Recommendation</Text>
                            <Feather name="arrow-right" size={14} color="#FFFFFF" style={{ marginLeft: 4 }} />
                          </TouchableOpacity>
                        </View>
                      </LinearGradient>
                    </View>
                  );
                }

                return cardView;
              })}
            </Animated.View>
          ) : (
            /* Empty Search Results Layout */
            <View style={styles.emptyStateContainer}>
              <View style={styles.emptyIllustrationContainer}>
                <View style={styles.emptyMapCircle}>
                  <Feather name="map-pin" size={44} color="#6366F1" />
                </View>
                <View style={styles.emptyMagnifier}>
                  <Feather name="search" size={24} color="#06B6D4" />
                </View>
              </View>
              <Text style={styles.emptyTitle}>No Study Spaces Found</Text>
              <Text style={styles.emptyDescription}>
                Try changing filters or searching another area.
              </Text>
              <TouchableOpacity
                style={styles.clearAllBtn}
                onPress={clearAllFilters}
                activeOpacity={0.8}
              >
                <Text style={styles.clearAllBtnText}>Clear Filters</Text>
              </TouchableOpacity>
            </View>
          )}
          <View style={{ height: 120 }} />
        </ScrollView>
      </View>

      {/* Sort Overlay Sheet */}
      {showSortMenu && (
        <View style={styles.sortOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFillObject}
            onPress={() => setShowSortMenu(false)}
            activeOpacity={1}
          />
          <View style={styles.sortDialog}>
            <Text style={styles.sortDialogTitle}>Sort Results</Text>
            {['Nearest', 'Top Rated', 'Lowest Price', 'Most Popular', 'Quietest'].map((opt: any) => {
              const isSelected = sortBy === opt;
              return (
                <TouchableOpacity
                  key={opt}
                  style={styles.sortOptionRow}
                  onPress={() => {
                    triggerLoading();
                    setSortBy(opt);
                    setShowSortMenu(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.sortOptionText, isSelected && styles.sortOptionTextActive]}>
                    {opt}
                  </Text>
                  {isSelected && (
                    <Feather name="check" size={16} color="#6366F1" />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      {/* Simulated Bottom Navigation */}
      <View style={styles.bottomNavContainer}>
        <View style={styles.bottomNavInner}>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => router.push('/(tabs)/home')}
            activeOpacity={0.7}
          >
            <Ionicons name="home-outline" size={20} color="#64748B" />
            <Text style={styles.navLabel}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navItem, styles.activeNavItem]}
            onPress={() => router.push('/(tabs)/discover')}
            activeOpacity={0.7}
          >
            <Ionicons name="compass" size={21} color="#6366F1" />
            <Text style={[styles.navLabel, styles.activeNavLabel]}>Explore</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => router.push('/(tabs)/bookings')}
            activeOpacity={0.7}
          >
            <Ionicons name="calendar-outline" size={20} color="#64748B" />
            <Text style={styles.navLabel}>Bookings</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => router.push('/(tabs)/profile')}
            activeOpacity={0.7}
          >
            <Ionicons name="person-outline" size={20} color="#64748B" />
            <Text style={styles.navLabel}>Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

// Redesigned Premium Card Component
function SearchResultCard({
  space,
  isFavorite,
  onToggleFavorite,
  onPressBook,
  onPressCard,
}: {
  space: Space;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onPressBook: () => void;
  onPressCard: () => void;
}) {
  const cardScale = useRef(new Animated.Value(1)).current;
  const imageScale = useRef(new Animated.Value(1)).current;
  const favScale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(cardScale, { toValue: 0.98, tension: 80, friction: 8, useNativeDriver: true }),
      Animated.spring(imageScale, { toValue: 1.04, tension: 80, friction: 8, useNativeDriver: true }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(cardScale, { toValue: 1, tension: 80, friction: 8, useNativeDriver: true }),
      Animated.spring(imageScale, { toValue: 1, tension: 80, friction: 8, useNativeDriver: true }),
    ]).start();
  };

  const handleFavPress = () => {
    onToggleFavorite(space.id);
    Animated.sequence([
      Animated.timing(favScale, { toValue: 1.3, duration: 100, useNativeDriver: true }),
      Animated.spring(favScale, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.spaceCard,
        { transform: [{ scale: cardScale }] }
      ]}
      onPress={onPressCard}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      {/* Cover Image */}
      <View style={styles.cardImageContainer}>
        <Animated.Image
          source={{ uri: space.imageUrl }}
          style={[styles.cardImage, { transform: [{ scale: imageScale }] }]}
        />

        {/* Fading bottom shadow gradient for readability */}
        <LinearGradient
          colors={['transparent', 'rgba(15, 23, 42, 0.65)']}
          style={styles.imageBottomOverlay}
        />

        {/* Status Badges Row (Open/Rating) */}
        <View style={styles.badgeRow}>
          <View style={[styles.badge, space.isOpen ? styles.statusBadgeOpen : styles.statusBadgeClosed]}>
            <View style={[styles.badgeDot, space.isOpen ? styles.dotOpen : styles.dotClosed]} />
            <Text style={[styles.badgeText, space.isOpen ? styles.textOpen : styles.textClosed]}>
              {space.isOpen ? 'Open' : 'Closed'}
            </Text>
          </View>
          {space.rating >= 4.8 && (
            <View style={[styles.badge, styles.trendingBadge]}>
              <Text style={styles.trendingBadgeText}>🔥 Trending</Text>
            </View>
          )}
        </View>

        {/* Glassmorphic Favorite Circle */}
        <Animated.View style={{ transform: [{ scale: favScale }], position: 'absolute', top: 16, right: 16 }}>
          <TouchableOpacity
            style={styles.favoriteCircle}
            onPress={handleFavPress}
            activeOpacity={0.85}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={18}
              color={isFavorite ? '#EF4444' : '#111827'}
            />
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText}>{space.category}</Text>
        </View>
      </View>

      {/* Info details */}
      <View style={styles.cardInfo}>
        <Text style={styles.spaceName}>{space.name}</Text>

        {/* Structured Row 1 */}
        <View style={styles.metaRow}>
          <View style={styles.metaBadge}>
            <Ionicons name="star" size={11} color="#F59E0B" style={{ marginRight: 2 }} />
            <Text style={styles.metaBadgeText}>{space.rating.toFixed(1)} ({space.reviewsCount})</Text>
          </View>
          <View style={styles.metaBadge}>
            <Text style={styles.metaBadgeText}>📍 {space.distance}</Text>
          </View>
          <View style={[styles.metaBadge, space.availableSeats <= 4 ? styles.lowSeatsBg : null]}>
            <Text style={[styles.metaBadgeText, space.availableSeats <= 4 ? styles.lowSeatsText : null]}>
              🪑 {space.availableSeats} Seats
            </Text>
          </View>
          <View style={styles.metaBadge}>
            <Text style={styles.metaBadgeText}>🤫 {space.noiseLevel}</Text>
          </View>
        </View>

        {/* Structured Row 2 (Amenities) */}
        <View style={styles.amenitiesContainer}>
          {space.amenities.map((amenity) => (
            <View key={amenity} style={styles.amenityPill}>
              <Text style={styles.amenityPillText}>
                {amenity === 'WiFi' ? '⚡ ' : amenity === 'Power' ? '🔌 ' : amenity === 'AC' ? '❄️ ' : amenity === 'Coffee' ? '☕ ' : ''}
                {amenity}
              </Text>
            </View>
          ))}
        </View>

        {/* Structured Row 3 (Price / Action) */}
        <View style={styles.cardFooter}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceText}>₹{space.price}</Text>
            <Text style={styles.priceUnit}>/hr</Text>
          </View>
          <TouchableOpacity
            style={styles.bookBtnContainer}
            onPress={onPressBook}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#6366F1', '#4F46E5']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.bookBtnGradient}
            >
              <Text style={styles.bookBtnText}>Book Now →</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Pressable>
  );
}

// Pulses skeletal structure
const SkeletonCard = () => {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 800, useNativeDriver: true })
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={[styles.skeletonCard, { opacity }]}>
      <View style={styles.skeletonImage} />
      <View style={styles.skeletonTitle} />
      <View style={styles.skeletonMeta} />
      <View style={styles.skeletonFooter}>
        <View style={styles.skeletonPrice} />
        <View style={styles.skeletonBtn} />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    ...Platform.select({
      web: {
        backgroundColor: '#FAFAFA',
        backgroundImage: 'radial-gradient(rgba(99, 102, 241, 0.05) 1px, transparent 0)',
        backgroundSize: '24px 24px',
      } as any
    })
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  // Indigo / Cyan Accent Blobs
  indigoSplash: {
    position: 'absolute',
    top: -80,
    left: -80,
    width: 360,
    height: 360,
  },
  cyanSplash: {
    position: 'absolute',
    bottom: 40,
    right: -80,
    width: 320,
    height: 320,
  },
  // Header section
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 18,
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  headerBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  activeHeaderBtn: {
    borderColor: '#6366F1',
    backgroundColor: 'rgba(99, 102, 241, 0.05)',
  },
  headerTitle: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: '#111827',
  },
  headerRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  // Floating Search bar
  searchBarWrapper: {
    paddingHorizontal: 24,
    marginBottom: 20,
    zIndex: 100,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    borderWidth: 1.5,
    height: 60,
    paddingHorizontal: 18,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 4,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: '#111827',
    padding: 0,
    ...Platform.select({ web: { outlineStyle: 'none' } as any }),
  },
  clearBtn: {
    padding: 4,
  },
  // Spotlight suggestion dropdown
  searchDropdownOverlay: {
    position: 'absolute',
    top: 142,
    left: 24,
    right: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.08,
    shadowRadius: 30,
    elevation: 8,
    zIndex: 99,
  },
  dropdownTitle: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  dropdownItemText: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: '#334155',
  },
  // Trending category section
  trendingSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chipsScroll: {
    paddingBottom: 6,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  categoryChipText: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: '#111827',
  },
  // Filters list
  filtersWrapper: {
    marginBottom: 24,
  },
  filtersScroll: {
    paddingBottom: 4,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 2,
  },
  filterChipText: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: '#6B7280',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  // Summary Info & Sort triggers
  summaryBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  summaryCount: {
    fontFamily: FONTS.bold,
    fontSize: 28,
    color: '#111827',
    letterSpacing: -0.5,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.06)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  sortText: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: '#6366F1',
  },
  listContainer: {
    width: '100%',
  },
  // Redesigned premium space cards styles
  spaceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.04,
    shadowRadius: 24,
    elevation: 3,
  },
  cardImageContainer: {
    width: '100%',
    height: 200,
    position: 'relative',
    backgroundColor: '#F1F5F9',
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  imageBottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 90,
  },
  badgeRow: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusBadgeOpen: {
    backgroundColor: '#E6F4EA',
    borderColor: '#CEEAD6',
  },
  statusBadgeClosed: {
    backgroundColor: '#FCE8E6',
    borderColor: '#FAD2CF',
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  dotOpen: {
    backgroundColor: '#22C55E',
  },
  dotClosed: {
    backgroundColor: '#EF4444',
  },
  badgeText: {
    fontFamily: FONTS.bold,
    fontSize: 10,
  },
  textOpen: {
    color: '#137333',
  },
  textClosed: {
    color: '#C5221F',
  },
  trendingBadge: {
    backgroundColor: '#FFFDF5',
    borderColor: '#FEF3C7',
  },
  trendingBadgeText: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    color: '#B06000',
  },
  // Circular glass Favorite Button
  favoriteCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    ...Platform.select({
      web: {
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      } as any,
    }),
  },
  categoryBadge: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.70)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  categoryBadgeText: {
    fontFamily: FONTS.bold,
    fontSize: 9,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  cardInfo: {
    padding: 20,
  },
  spaceName: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: '#111827',
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  lowSeatsBg: {
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderColor: 'rgba(245, 158, 11, 0.15)',
  },
  lowSeatsText: {
    color: '#B45309',
  },
  metaBadgeText: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: '#475569',
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
  },
  amenityPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  amenityPillText: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: '#475569',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1.5,
    borderTopColor: '#F8FAFC',
    paddingTop: 16,
    marginTop: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceText: {
    fontFamily: FONTS.bold,
    fontSize: 24,
    color: '#111827',
  },
  priceUnit: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 2,
  },
  bookBtnContainer: {
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  bookBtnGradient: {
    height: 44,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookBtnText: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: '#FFFFFF',
  },
  // Elevate AI Card layout with Glass overlays
  aiCard: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 20,
    padding: 1.5,
  },
  aiCardGlass: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 23,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.20)',
    ...Platform.select({
      web: {
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      } as any,
    }),
  },
  aiCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  aiRobotCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  aiCardTag: {
    fontFamily: FONTS.bold,
    fontSize: 8,
    color: '#FFFFFF',
    opacity: 0.8,
    letterSpacing: 0.8,
  },
  aiCardTitle: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: '#FFFFFF',
  },
  aiCardBody: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: '#FFFFFF',
    opacity: 0.9,
    lineHeight: 20,
    marginBottom: 16,
  },
  aiStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  aiStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  aiStatVal: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: '#FFFFFF',
  },
  aiStatLabel: {
    fontFamily: FONTS.medium,
    fontSize: 9,
    color: '#FFFFFF',
    opacity: 0.7,
    marginTop: 2,
  },
  aiStatDivider: {
    width: 1.5,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  aiCardCta: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  aiCardCtaText: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: '#FFFFFF',
  },
  // Empty State illustration styles
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyIllustrationContainer: {
    width: 110,
    height: 110,
    position: 'relative',
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyMapCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyMagnifier: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  emptyTitle: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  clearAllBtn: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  clearAllBtnText: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: '#FFFFFF',
  },
  // Sort Overlay drop sheets
  sortOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.40)',
    justifyContent: 'flex-end',
    zIndex: 100,
  },
  sortDialog: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
  },
  sortDialogTitle: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: '#111827',
    marginBottom: 20,
    textAlign: 'center',
  },
  sortOptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1.5,
    borderBottomColor: '#F8FAFC',
  },
  sortOptionText: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: '#4B5563',
  },
  sortOptionTextActive: {
    color: '#6366F1',
  },
  // Mock Bottom Nav bar styles mimicking discover tabs
  bottomNavContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 16,
    left: 20,
    right: 20,
    height: 68,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 34,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.60)',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 8,
    zIndex: 90,
  },
  bottomNavInner: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    width: 44,
    borderRadius: 22,
  },
  activeNavItem: {
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
  },
  navLabel: {
    display: 'none',
  },
  activeNavLabel: {
    display: 'none',
  },
  // Pulsing loading cards skeletal styles
  skeletonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  skeletonImage: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
  },
  skeletonTitle: {
    height: 20,
    borderRadius: 6,
    backgroundColor: '#E2E8F0',
    width: '60%',
    marginTop: 16,
    marginBottom: 10,
  },
  skeletonMeta: {
    height: 14,
    borderRadius: 6,
    backgroundColor: '#E2E8F0',
    width: '80%',
    marginBottom: 20,
  },
  skeletonFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skeletonPrice: {
    height: 18,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
    width: '25%',
  },
  skeletonBtn: {
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E2E8F0',
    width: '30%',
  },
});
