import React, { useRef } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Animated, Platform, Vibration } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { FONTS, TYPOGRAPHY } from '../../constants/fonts';
import { useRouter } from 'expo-router';
import { useSpaceStore } from '../../store/spaceStore';

interface SpaceProps {
  space: {
    id: string;
    name: string;
    category: string;
    price: number;
    rating: number;
    reviewsCount: number;
    distance: string;
    availableSeats: number;
    totalSeats: number;
    imageUrl: string;
    location: string;
  };
  onPress: () => void;
  showBookButton?: boolean;
}

const PRIMARY_COLOR = '#4F46E5';

export default function SpaceCard({ space, onPress, showBookButton = true }: SpaceProps) {
  const router = useRouter();
  const favoritedIds = useSpaceStore((state) => state.favoritedIds);
  const toggleFavorite = useSpaceStore((state) => state.toggleFavorite);
  const isFavorite = favoritedIds.includes(space.id);

  // Interaction animators
  const cardScale = useRef(new Animated.Value(1)).current;
  const favoriteScale = useRef(new Animated.Value(1)).current;
  const bookBtnScale = useRef(new Animated.Value(1)).current;

  const handlePressIn = (animation: Animated.Value) => {
    Animated.spring(animation, {
      toValue: 0.98,
      useNativeDriver: true,
      tension: 200,
      friction: 12,
    }).start();
  };

  const handlePressOut = (animation: Animated.Value) => {
    Animated.spring(animation, {
      toValue: 1,
      useNativeDriver: true,
      tension: 200,
      friction: 12,
    }).start();
  };

  const handleFavoritePress = () => {
    if (Platform.OS !== 'web') {
      Vibration.vibrate(10);
    }
    // Heart pop sequence
    Animated.sequence([
      Animated.timing(favoriteScale, { toValue: 1.3, duration: 100, useNativeDriver: true }),
      Animated.spring(favoriteScale, { toValue: 1, tension: 160, friction: 6, useNativeDriver: true })
    ]).start();
    toggleFavorite(space.id);
  };

  // Color code mappings for category badges
  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Libraries': return { bg: 'rgba(16, 185, 129, 0.08)', text: '#059669' };
      case 'Study Halls': return { bg: 'rgba(79, 70, 229, 0.08)', text: '#4F46E5' };
      case 'Focus Pods': return { bg: 'rgba(245, 158, 11, 0.08)', text: '#D97706' };
      case 'Group Rooms': return { bg: 'rgba(139, 92, 246, 0.08)', text: '#7C3AED' };
      case 'Reading Rooms': return { bg: 'rgba(6, 182, 212, 0.08)', text: '#0891B2' };
      default: return { bg: 'rgba(100, 116, 139, 0.08)', text: '#475569' };
    }
  };

  const catStyle = getCategoryColor(space.category);

  return (
    <Animated.View style={[styles.cardContainer, { transform: [{ scale: cardScale }] }]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={() => handlePressIn(cardScale)}
        onPressOut={() => handlePressOut(cardScale)}
        activeOpacity={1}
        style={styles.card}
      >
        <View style={styles.imageContainer}>
          <Image source={{ uri: space.imageUrl }} style={styles.image} />
          
          {/* Favorite button icon */}
          <Animated.View style={{ transform: [{ scale: favoriteScale }], position: 'absolute', top: 12, right: 12 }}>
            <TouchableOpacity
              style={styles.favoriteBtn}
              onPress={handleFavoritePress}
              activeOpacity={0.8}
            >
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={18}
                color={isFavorite ? '#EF4444' : '#475569'}
              />
            </TouchableOpacity>
          </Animated.View>

          {/* Category overlay label */}
          <View style={[styles.categoryOverlay, { backgroundColor: catStyle.bg }]}>
            <Text style={[styles.categoryText, { color: catStyle.text }]}>{space.category}</Text>
          </View>
        </View>

        <View style={styles.info}>
          {/* Space Title Name & Rating */}
          <View style={styles.headerRow}>
            <Text style={styles.name} numberOfLines={1}>{space.name}</Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={13} color="#F59E0B" style={{ marginRight: 3 }} />
              <Text style={styles.ratingText}>{space.rating.toFixed(1)}</Text>
              <Text style={styles.reviewsText}>({space.reviewsCount})</Text>
            </View>
          </View>

          {/* Location row details */}
          <View style={styles.locationRow}>
            <Feather name="map-pin" size={11} color="#94A3B8" style={{ marginRight: 4 }} />
            <Text style={styles.locationText} numberOfLines={1}>
              {space.location} • <Text style={styles.distanceText}>{space.distance} away</Text>
            </Text>
          </View>

          {/* Footer seats and price info */}
          <View style={styles.footer}>
            <View style={styles.seatsContainer}>
              <View style={styles.seatsIndicator} />
              <Text style={styles.seatsText}>{space.availableSeats} / {space.totalSeats} seats available</Text>
            </View>

            <View style={styles.priceContainer}>
              <Text style={styles.priceAmount}>₹{space.price}</Text>
              <Text style={styles.priceLabel}>/hr</Text>
            </View>
          </View>

          {/* Primary CTA Book Now */}
          {showBookButton && (
            <Animated.View style={{ transform: [{ scale: bookBtnScale }], marginTop: 14 }}>
              <TouchableOpacity
                style={styles.bookBtn}
                onPressIn={() => handlePressIn(bookBtnScale)}
                onPressOut={() => handlePressOut(bookBtnScale)}
                onPress={(e) => {
                  e.stopPropagation();
                  if (Platform.OS !== 'web') Vibration.vibrate(10);
                  router.push({
                    pathname: '/booking/seats',
                    params: { spaceId: space.id }
                  });
                }}
                activeOpacity={1}
              >
                <Feather name="zap" size={13} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.bookBtnText}>Book Now</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 2,
  },
  card: {
    borderRadius: 18,
    overflow: 'hidden',
    width: '100%',
  },
  imageContainer: {
    width: '100%',
    height: 184,
    position: 'relative',
    backgroundColor: '#F8FAFC',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  favoriteBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  categoryOverlay: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  categoryText: {
    fontFamily: FONTS.bold,
    fontSize: 10.5,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  info: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  name: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
    flex: 1,
    marginRight: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 7,
    paddingVertical: 3.5,
    borderRadius: 6,
  },
  ratingText: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: '#D97706',
    fontWeight: 'bold',
  },
  reviewsText: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: '#94A3B8',
    marginLeft: 1,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  locationText: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: '#64748B',
  },
  distanceText: {
    fontFamily: FONTS.medium,
    color: '#64748B',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  seatsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seatsIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  seatsText: {
    fontFamily: FONTS.medium,
    fontSize: 12.5,
    color: '#475569',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceAmount: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: '#0F172A',
    fontWeight: 'bold',
  },
  priceLabel: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: '#64748B',
    marginLeft: 1,
  },
  bookBtn: {
    width: '100%',
    height: 44,
    borderRadius: 10,
    backgroundColor: PRIMARY_COLOR,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: PRIMARY_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
  },
  bookBtnText: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
