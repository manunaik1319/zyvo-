import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Modal,
  Animated,
  PanResponder,
  Dimensions,
  Platform,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { FONTS } from '../../constants/fonts';

const SCREEN_HEIGHT = Dimensions.get('window').height;

export interface Venue {
  name: string;
  category: string;
  image: any;
  rating: number;
  reviews: number;
  distance: string;
  amenities: string[];
  seatsRemaining: number;
  pricePerHr: number;
}

interface VenueBottomSheetProps {
  venue: Venue | null;
  isVisible: boolean;
  onClose: () => void;
  onBook: (venue: Venue) => void;
}

export default function VenueBottomSheet({ venue, isVisible, onClose, onBook }: VenueBottomSheetProps) {
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      // Reset position and slide up with spring
      translateY.setValue(SCREEN_HEIGHT);
      backdropOpacity.setValue(0);
      
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          damping: 18,
          stiffness: 120,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0.5,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Slide down and fade out
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: SCREEN_HEIGHT,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible]);

  // Swipe-down gestures responder
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Track vertical drag gestures downward
        return gestureState.dy > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 120 || gestureState.vy > 0.5) {
          // Swipe down past threshold, close
          Animated.parallel([
            Animated.timing(translateY, {
              toValue: SCREEN_HEIGHT,
              duration: 180,
              useNativeDriver: true,
            }),
            Animated.timing(backdropOpacity, {
              toValue: 0,
              duration: 180,
              useNativeDriver: true,
            }),
          ]).start(() => onClose());
        } else {
          // Snap back into place
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            damping: 15,
          }).start();
        }
      },
    })
  ).current;

  if (!venue) return null;

  const handleBookPress = () => {
    onBook(venue);
  };

  return (
    <Modal
      transparent
      visible={isVisible}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        {/* Backdrop Tap to Close */}
        <Animated.View 
          style={[styles.backdrop, { opacity: backdropOpacity }]}
        >
          <TouchableOpacity 
            style={StyleSheet.absoluteFillObject} 
            activeOpacity={1} 
            onPress={onClose} 
          />
        </Animated.View>

        {/* Bottom Sheet Body */}
        <Animated.View
          style={[
            styles.sheetContainer,
            { transform: [{ translateY }] }
          ]}
        >
          {/* Header Drag Handle Area */}
          <View style={styles.dragHandleContainer} {...panResponder.panHandlers}>
            <View style={styles.dragHandle} />
          </View>

          {/* Venue Info Content */}
          <View style={styles.contentContainer}>
            {/* Venue Photo & Category Badge Overlay */}
            <View style={styles.photoContainer}>
              <Image 
                source={typeof venue.image === 'string' ? { uri: venue.image } : venue.image} 
                style={styles.photo} 
                resizeMode="cover"
              />
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{venue.category.toUpperCase()}</Text>
              </View>
            </View>

            {/* Venue Name */}
            <Text style={styles.name}>{venue.name}</Text>

            {/* Review and Distance Row */}
            <View style={styles.metaRow}>
              <Ionicons name="star" size={14} color="#F59E0B" style={styles.starIcon} />
              <Text style={styles.metaText}>
                {venue.rating.toFixed(1)} · ({venue.reviews} reviews) · {venue.distance}
              </Text>
            </View>

            {/* Amenities scrollable chips */}
            <View style={styles.amenitiesContainer}>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.amenitiesScroll}
              >
                {venue.amenities.map((amenity, index) => (
                  <View key={index} style={styles.amenityChip}>
                    <Text style={styles.amenityText}>{amenity}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* Availability and Price Row */}
            <View style={styles.priceRow}>
              <Text style={styles.seatsRemainingText}>
                {venue.seatsRemaining} seats remaining
              </Text>
              <View style={styles.priceContainer}>
                <Text style={styles.priceAmount}>₹{venue.pricePerHr}</Text>
                <Text style={styles.priceSuffix}>/hr</Text>
              </View>
            </View>

            {/* Action Book Button */}
            <TouchableOpacity 
              style={styles.bookButton} 
              onPress={handleBookPress}
              activeOpacity={0.85}
            >
              <Text style={styles.bookButtonText}>Book Now</Text>
            </TouchableOpacity>
          </View>

          {/* Bottom Space Padding for Safe Area */}
          <SafeAreaView style={styles.safeAreaBottom} />
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'transparent',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0F172A',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dragHandleContainer: {
    width: '100%',
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 8 : 20,
  },
  photoContainer: {
    width: '100%',
    height: 130,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#F1F5F9',
    marginBottom: 16,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  categoryBadge: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: '#0B1B66',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  name: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: '#0F172A',
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  starIcon: {
    marginRight: 4,
  },
  metaText: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: '#64748B',
  },
  amenitiesContainer: {
    marginBottom: 18,
  },
  amenitiesScroll: {
    paddingRight: 10,
  },
  amenityChip: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 8,
    backgroundColor: '#F8FAFC',
  },
  amenityText: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: '#475569',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  seatsRemainingText: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: '#22C55E',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceAmount: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: '#0F172A',
  },
  priceSuffix: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: '#64748B',
    marginLeft: 1,
  },
  bookButton: {
    height: 48,
    borderRadius: 12,
    backgroundColor: '#1A73E8',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1A73E8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  bookButtonText: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: '#FFFFFF',
  },
  safeAreaBottom: {
    backgroundColor: '#FFFFFF',
  },
});
