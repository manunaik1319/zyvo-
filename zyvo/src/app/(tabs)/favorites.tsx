import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Platform,
  Animated,
  Easing,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSpaceStore } from '../../store/spaceStore';
import { FONTS } from '../../constants/fonts';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SYSTEM_COLORS = {
  primary: '#6366F1',      // Premium Indigo
  secondary: '#06B6D4',    // Cyan Accent
  background: '#FAFAFA',   // Premium Background
  cardBg: '#FFFFFF',
  border: '#F1F5F9',       // Clean Border
  text: '#111827',
  textSecondary: '#4B5563',
  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',
};

export default function FavoritesTabScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { spaces, favoritedIds, toggleFavorite } = useSpaceStore();
  const isLarge = SCREEN_WIDTH > 768;

  // Filter list of favorited spaces
  const favoriteSpaces = spaces.filter((space) => favoritedIds.includes(space.id));

  // Entrance animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.bezier(0.25, 1, 0.5, 1),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        easing: Easing.bezier(0.25, 1, 0.5, 1),
        useNativeDriver: true,
      }),
    ]).start();
  }, [favoriteSpaces.length]); // Re-animate if items list changes empty state

  const handleExplore = () => {
    router.replace('/(tabs)/discover');
  };

  const handleCardPress = (spaceId: string) => {
    router.push({ pathname: `/space/${spaceId}` } as any);
  };

  const handleBookPress = (spaceId: string) => {
    router.push({ pathname: '/booking/seats', params: { spaceId } } as any);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      {/* Unified Background Layer Group */}
      <View style={styles.bgWrapper} pointerEvents="none">
        <View style={styles.solidBg} />
        <View style={styles.bgBlob1} />
        <View style={styles.bgBlob2} />
      </View>

      <View style={[styles.header, { paddingTop: insets.top || 16 }]}>
        <Text style={styles.pageTitle}>Favorites</Text>
      </View>

      {favoriteSpaces.length === 0 ? (
        /* Empty State */
        <Animated.View style={[
          styles.emptyContainer, 
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="heart-dislike-outline" size={44} color="#94A3B8" />
          </View>
          <Text style={styles.emptyTitle}>No favorites yet</Text>
          <Text style={styles.emptySubtitle}>
            Tap the heart icon on spaces you like to save them here for quick access.
          </Text>
          <TouchableOpacity 
            style={styles.exploreBtn} 
            onPress={handleExplore}
            activeOpacity={0.85}
          >
            <Text style={styles.exploreBtnText}>Explore Spaces</Text>
            <Feather name="arrow-right" size={14} color="#FFFFFF" style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </Animated.View>
      ) : (
        /* Favorites List */
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            isLarge && styles.largeContainer,
            { paddingBottom: 140 }
          ]}
        >
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <Text style={styles.favoritesCount}>
              {favoriteSpaces.length} saved study spot{favoriteSpaces.length > 1 ? 's' : ''}
            </Text>

            <View style={styles.listContainer}>
              {favoriteSpaces.map((space) => (
                <TouchableOpacity
                  key={space.id}
                  style={styles.spaceCard}
                  onPress={() => handleCardPress(space.id)}
                  activeOpacity={0.9}
                >
                  <Image source={{ uri: space.imageUrl }} style={styles.spaceImage} />
                  <View style={styles.spaceInfo}>
                    <View style={styles.titleRow}>
                      <Text style={styles.spaceName} numberOfLines={1}>
                        {space.name}
                      </Text>
                      <TouchableOpacity
                        style={styles.heartBtn}
                        onPress={(e) => {
                          e.stopPropagation();
                          toggleFavorite(space.id);
                        }}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="heart" size={20} color={SYSTEM_COLORS.danger} />
                      </TouchableOpacity>
                    </View>

                    <Text style={styles.spaceCategory}>{space.category}</Text>

                    <View style={styles.metaRow}>
                      <View style={styles.metaItem}>
                        <Ionicons name="star" size={12} color="#F59E0B" />
                        <Text style={styles.metaText}>{space.rating.toFixed(1)}</Text>
                      </View>
                      <Text style={styles.metaDivider}>•</Text>
                      <View style={styles.metaItem}>
                        <Feather name="map-pin" size={11} color="#6B7280" />
                        <Text style={styles.metaText}>{space.distance}</Text>
                      </View>
                    </View>

                    <View style={styles.footerRow}>
                      <Text style={styles.spacePrice}>
                        ₹{space.price}<Text style={styles.priceUnit}>/hr</Text>
                      </Text>
                      <TouchableOpacity 
                        style={styles.bookBadge} 
                        onPress={(e) => {
                          e.stopPropagation();
                          handleBookPress(space.id);
                        }}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.bookBadgeText}>Book Now</Text>
                        <Feather name="chevron-right" size={12} color={SYSTEM_COLORS.primary} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SYSTEM_COLORS.background,
    position: 'relative',
    overflow: 'hidden',
  },
  bgWrapper: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -10,
    overflow: 'hidden',
  },
  solidBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: SYSTEM_COLORS.background,
  },
  bgBlob1: {
    position: 'absolute',
    top: -100,
    left: -100,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: SYSTEM_COLORS.primary,
    opacity: 0.05,
    ...Platform.select({
      web: {
        filter: 'blur(70px)',
      } as any,
    }),
  },
  bgBlob2: {
    position: 'absolute',
    bottom: 120,
    right: -100,
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: SYSTEM_COLORS.secondary,
    opacity: 0.04,
    ...Platform.select({
      web: {
        filter: 'blur(80px)',
      } as any,
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  pageTitle: {
    fontFamily: FONTS.bold,
    fontSize: 28,
    color: SYSTEM_COLORS.text,
    letterSpacing: -0.5,
    fontWeight: 'bold',
    paddingVertical: 8,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  largeContainer: {
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
  },
  favoritesCount: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 16,
  },
  listContainer: {
    gap: 16,
  },
  spaceCard: {
    flexDirection: 'row',
    backgroundColor: SYSTEM_COLORS.cardBg,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: SYSTEM_COLORS.border,
    overflow: 'hidden',
    height: 128,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 12,
    elevation: 2,
  },
  spaceImage: {
    width: 108,
    height: '100%',
    backgroundColor: '#F3F4F6',
  },
  spaceInfo: {
    flex: 1,
    padding: 14,
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  spaceName: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: SYSTEM_COLORS.text,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  heartBtn: {
    padding: 2,
  },
  spaceCategory: {
    fontFamily: FONTS.medium,
    fontSize: 11,
    color: '#6B7280',
    marginTop: -4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metaText: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    color: SYSTEM_COLORS.text,
  },
  metaDivider: {
    color: '#E5E7EB',
    fontSize: 10,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderColor: '#F3F4F6',
    paddingTop: 8,
    marginTop: 4,
  },
  spacePrice: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: SYSTEM_COLORS.primary,
    fontWeight: 'bold',
  },
  priceUnit: {
    fontFamily: FONTS.medium,
    fontSize: 10,
    color: '#6B7280',
  },
  bookBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: 2,
  },
  bookBadgeText: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    color: SYSTEM_COLORS.primary,
  },
  emptyContainer: {
    flex: 0.8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: SYSTEM_COLORS.border,
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  emptyTitle: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: SYSTEM_COLORS.text,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
  },
  exploreBtn: {
    backgroundColor: SYSTEM_COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: SYSTEM_COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
  },
  exploreBtnText: {
    fontFamily: FONTS.bold,
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
});
