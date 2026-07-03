import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Share,
  Linking,
  Animated,
  Modal,
  SafeAreaView,
  Platform,
  Vibration,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSpaceStore } from '../../store/spaceStore';
import { useBookingStore } from '../../store/bookingStore';
import { FONTS } from '../../constants/fonts';
import { Skeleton } from '../../components/ui/Skeleton';

const { width: W } = Dimensions.get('window');
const PRIMARY_COLOR = '#4F46E5';

const GALLERY_PHOTOS = [
  'https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1542744094-3a31f103e35f?q=80&w=800&auto=format&fit=crop',
];

const AMENITIES = [
  { label: 'High-Speed Wi-Fi', icon: 'wifi' },
  { label: 'Air Conditioning', icon: 'wind' },
  { label: 'Charging Points', icon: 'zap' },
  { label: 'Café', icon: 'coffee' },
  { label: 'Parking', icon: 'activity' },
  { label: 'Washroom', icon: 'smile' },
  { label: 'Drinking Water', icon: 'droplet' },
  { label: 'Comfortable Seating', icon: 'user' },
];

const REVIEWS = [
  { id: '1', name: 'Rahul Sharma', rating: 5, date: 'June 25, 2026', comment: 'Perfect environment for exam prep. Very quiet and clean. High-speed internet is extremely reliable.', avatar: 'RS' },
  { id: '2', name: 'Priya Patel', rating: 5, date: 'June 22, 2026', comment: 'Great amenities and comfortable chairs. Noise levels are strictly monitored which keeps you focused.', avatar: 'PP' },
];

export default function SpaceDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();
  const spaces = useSpaceStore((state) => state.spaces);
  const favoritedIds = useSpaceStore((state) => state.favoritedIds);
  const toggleFavorite = useSpaceStore((state) => state.toggleFavorite);

  const [loading, setLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState(0);
  const [descExpanded, setDescExpanded] = useState(false);
  const [galleryVisible, setGalleryVisible] = useState(false);

  const isFavorite = favoritedIds.includes(id as string);
  
  // Animation values
  const favoriteScale = useRef(new Animated.Value(1)).current;
  const bookScale = useRef(new Animated.Value(1)).current;

  const baseSpace = spaces.find((s) => s.id === id);
  const space = baseSpace || {
    id: '1',
    name: "The Scholar's Haven",
    category: 'Libraries',
    price: 60,
    rating: 4.9,
    reviewsCount: 520,
    distance: '1.8 km away',
    availableSeats: 48,
    totalSeats: 60,
    description: 'A peaceful, air-conditioned study space designed for focused learning with high-speed Wi-Fi and comfortable seating. Fully soundproofed zones ensure the absolute best academic environment.',
    location: '412 Library Lane, University District',
  };

  const similarSpaces = useMemo(() => {
    return spaces.filter((s) => s.id !== id).slice(0, 3);
  }, [spaces, id]);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(t);
  }, []);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out ${space.name} on ZYVO! Clean, quiet study spaces starting from ₹${space.price}/hour.`,
      });
    } catch (e) {
      console.log(e);
    }
  };

  const handleToggleFavorite = () => {
    if (Platform.OS !== 'web') {
      Vibration.vibrate(10);
    }
    toggleFavorite(space.id);
    Animated.sequence([
      Animated.timing(favoriteScale, { toValue: 1.3, duration: 100, useNativeDriver: true }),
      Animated.spring(favoriteScale, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();
  };

  const handlePressIn = (animation: Animated.Value) => {
    Animated.spring(animation, {
      toValue: 0.96,
      useNativeDriver: true,
      tension: 180,
      friction: 12,
    }).start();
  };

  const handlePressOut = (animation: Animated.Value) => {
    Animated.spring(animation, {
      toValue: 1,
      useNativeDriver: true,
      tension: 180,
      friction: 12,
    }).start();
  };

  const handleGalleryScroll = (e: any) => {
    const offset = e.nativeEvent.contentOffset.x;
    const idx = Math.round(offset / W);
    if (idx >= 0 && idx < GALLERY_PHOTOS.length) {
      setActivePhoto(idx);
    }
  };

  const headerTop = Platform.OS === 'android'
    ? (StatusBar.currentHeight ? StatusBar.currentHeight + 12 : 36)
    : (insets.top || 12);

  if (loading) {
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
        <View style={{ padding: 20 }}>
          <Skeleton width="100%" height={240} radius={24} style={{ marginBottom: 20 }} />
          <Skeleton width="40%" height={16} radius={6} style={{ marginBottom: 10 }} />
          <Skeleton width="90%" height={26} radius={8} style={{ marginBottom: 12 }} />
          <Skeleton width="60%" height={14} radius={6} style={{ marginBottom: 24 }} />
          <Skeleton width="100%" height={90} radius={20} style={{ marginBottom: 16 }} />
          <Skeleton width="100%" height={110} radius={20} />
        </View>
      </View>
    );
  }

  // Get color for category badge
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
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>
        {/* HERO GALLERY */}
        <View style={styles.heroWrap}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleGalleryScroll}
            scrollEventThrottle={16}
          >
            {GALLERY_PHOTOS.map((img, i) => (
              <TouchableOpacity key={i} activeOpacity={0.95} onPress={() => setGalleryVisible(true)}>
                <Image source={{ uri: img }} style={styles.heroImage} resizeMode="cover" />
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Indicator tag */}
          <View style={styles.indicatorTag}>
            <Text style={styles.indicatorText}>{activePhoto + 1} / {GALLERY_PHOTOS.length}</Text>
          </View>

          {/* Floaters / Nav Bar */}
          <View style={[styles.floatHeader, { top: headerTop }]}>
            <TouchableOpacity style={styles.circleBtn} onPress={() => router.back()} activeOpacity={0.85}>
              <Feather name="arrow-left" size={18} color="#0F172A" />
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity style={styles.circleBtn} onPress={handleShare} activeOpacity={0.85}>
                <Feather name="share-2" size={16} color="#0F172A" />
              </TouchableOpacity>
              <Animated.View style={{ transform: [{ scale: favoriteScale }] }}>
                <TouchableOpacity style={styles.circleBtn} onPress={handleToggleFavorite} activeOpacity={0.85}>
                  <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={19} color={isFavorite ? "#EF4444" : "#0F172A"} />
                </TouchableOpacity>
              </Animated.View>
            </View>
          </View>

          {/* Cover gradient overlay */}
          <LinearGradient colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.85)', '#FFFFFF']} style={styles.coverGradient} />
        </View>

        {/* INFO SECTION */}
        <View style={styles.body}>
          <View style={styles.titleRow}>
            <View style={[styles.categoryBadge, { backgroundColor: catStyle.bg }]}>
              <Text style={[styles.categoryText, { color: catStyle.text }]}>{space.category.toUpperCase()}</Text>
            </View>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={12} color="#F59E0B" />
              <Text style={styles.ratingText}> {space.rating} ({space.reviewsCount} Reviews)</Text>
            </View>
          </View>

          <Text style={styles.spaceTitle}>{space.name}</Text>

          <View style={styles.metaInfoRow}>
            <View style={styles.metaLabelItem}>
              <Feather name="map-pin" size={12} color="#64748B" />
              <Text style={styles.metaLabelText}> {space.distance}</Text>
            </View>
            <Text style={styles.metaSeparator}>•</Text>
            <View style={styles.metaLabelItem}>
              <Feather name="clock" size={12} color="#64748B" />
              <Text style={styles.metaLabelText}> Open until 11:00 PM</Text>
            </View>
            <Text style={styles.metaSeparator}>•</Text>
            <View style={styles.metaLabelItem}>
              <View style={styles.openDot} />
              <Text style={styles.openText}>Open Now</Text>
            </View>
          </View>

          <Text style={styles.descText} numberOfLines={descExpanded ? undefined : 3}>
            {space.description}
          </Text>
          <TouchableOpacity onPress={() => setDescExpanded(!descExpanded)} activeOpacity={0.75}>
            <Text style={styles.readMore}>{descExpanded ? 'Show Less' : 'Read More'}</Text>
          </TouchableOpacity>

          {/* LIVE AVAILABILITY CARD */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <View style={styles.liveIndicatorDot} />
                <Text style={styles.cardTitle}>Live Availability</Text>
              </View>
              <Text style={styles.updateBadge}>Updated just now</Text>
            </View>

            <View style={styles.seatsSummaryRow}>
              <View>
                <Text style={styles.seatsLeftVal}>{space.availableSeats} Seats</Text>
                <Text style={styles.seatsLeftLabel}>Available / {space.totalSeats} Total</Text>
              </View>
              <View style={styles.occupancyBarContainer}>
                <View style={[styles.occupancyBarFill, { width: `${(space.availableSeats / space.totalSeats) * 100}%` }]} />
              </View>
            </View>

            <View style={styles.cardInfoGrid}>
              <View style={styles.cardInfoCell}>
                <Feather name="volume-x" size={14} color="#64748B" style={{ marginRight: 6 }} />
                <Text style={styles.cardCellLabel}>Noise: </Text>
                <Text style={styles.cardCellVal}>Very Quiet</Text>
              </View>
              <View style={styles.cardInfoCell}>
                <Feather name="wifi" size={14} color="#64748B" style={{ marginRight: 6 }} />
                <Text style={styles.cardCellLabel}>Wifi: </Text>
                <Text style={styles.cardCellVal}>High-Speed</Text>
              </View>
            </View>
          </View>

          {/* AMENITIES */}
          <Text style={styles.sectionTitle}>Amenities Offered</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.amenitiesScroll}>
            {AMENITIES.map((am, i) => (
              <View key={i} style={styles.amenityChip}>
                <Feather name={am.icon as any} size={13} color={PRIMARY_COLOR} style={{ marginRight: 6 }} />
                <Text style={styles.amenityChipText}>{am.label}</Text>
              </View>
            ))}
          </ScrollView>

          {/* PRICING CARD */}
          <Text style={styles.sectionTitle}>Pricing Plans</Text>
          <View style={styles.card}>
            <View style={styles.priceHeaderRow}>
              <View>
                <Text style={styles.priceCardTitle}>Flexible Access Passes</Text>
                <Text style={styles.priceCardSubtitle}>Choose the plan that suits you best</Text>
              </View>
              <View style={styles.discountBadge}>
                <Text style={styles.discountBadgeText}>STUDENT -15%</Text>
              </View>
            </View>

            <View style={styles.priceOptions}>
              <View style={styles.priceOptionItem}>
                <Text style={styles.optionName}>Hourly Pass</Text>
                <Text style={styles.optionPrice}>₹{space.price} <Text style={styles.optionPriceUnit}>/ hour</Text></Text>
              </View>
              <View style={styles.priceOptionItem}>
                <Text style={styles.optionName}>Daily Pass</Text>
                <Text style={styles.optionPrice}>₹{space.price * 5} <Text style={styles.optionPriceUnit}>/ day</Text></Text>
              </View>
              <View style={styles.priceOptionItem}>
                <Text style={styles.optionName}>Monthly Pass</Text>
                <Text style={styles.optionPrice}>₹{space.price * 25} <Text style={styles.optionPriceUnit}>/ month</Text></Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.plansBtn}
              activeOpacity={0.8}
              onPress={() => router.push({ pathname: '/booking/seats', params: { spaceId: space.id } } as any)}
            >
              <Text style={styles.plansBtnText}>View Available Seats & Plans</Text>
              <Feather name="arrow-right" size={14} color={PRIMARY_COLOR} style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          </View>

          {/* MEET YOUR HOST */}
          <Text style={styles.sectionTitle}>Owner Information</Text>
          <View style={styles.card}>
            <View style={styles.hostRow}>
              <View style={styles.hostAvatar}>
                <Text style={styles.hostAvatarTxt}>AI</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.hostName}>Ananya Iyer</Text>
                <Text style={styles.hostTag}>Superhost · Verified Host</Text>
              </View>
              <TouchableOpacity style={styles.contactHostBtn} activeOpacity={0.8}>
                <Text style={styles.contactHostText}>Contact</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.hostMetaRow}>
              <View style={styles.hostMetaCell}>
                <Ionicons name="star" size={12} color="#F59E0B" style={{ marginRight: 4 }} />
                <Text style={styles.hostMetaVal}>4.9</Text>
                <Text style={styles.hostMetaLbl}> Host Rating</Text>
              </View>
              <View style={styles.hostMetaCell}>
                <Feather name="clock" size={12} color="#64748B" style={{ marginRight: 4 }} />
                <Text style={styles.hostMetaVal}>5m</Text>
                <Text style={styles.hostMetaLbl}> Response Time</Text>
              </View>
            </View>
          </View>

          {/* RULES & POLICIES */}
          <Text style={styles.sectionTitle}>Rules of the Space</Text>
          <View style={styles.card}>
            <View style={styles.ruleItem}>
              <Text style={styles.ruleIcon}>🔇</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.ruleTitle}>Quiet Study Zone</Text>
                <Text style={styles.ruleDesc}>Maintain absolute silence inside the reading zones.</Text>
              </View>
            </View>
            <View style={[styles.ruleItem, { marginTop: 12 }]}>
              <Text style={styles.ruleIcon}>🥤</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.ruleTitle}>Covered Drinks Only</Text>
                <Text style={styles.ruleDesc}>Outside food is not allowed. Bottled water is fine.</Text>
              </View>
            </View>
            <View style={[styles.ruleItem, { marginTop: 12 }]}>
              <Text style={styles.ruleIcon}>🔌</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.ruleTitle}>Fair Power Usage</Text>
                <Text style={styles.ruleDesc}>Charge your laptops, but please share multi-plug ports.</Text>
              </View>
            </View>
          </View>

          {/* REVIEWS */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Reviews ({space.reviewsCount})</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="star" size={13} color="#F59E0B" />
              <Text style={styles.reviewsRatingOverall}> {space.rating}</Text>
            </View>
          </View>

          <View style={{ gap: 12 }}>
            {REVIEWS.map((rv) => (
              <View key={rv.id} style={styles.reviewCard}>
                <View style={styles.reviewHead}>
                  <View style={styles.reviewAvatar}>
                    <Text style={styles.reviewAvatarText}>{rv.avatar}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.reviewerName}>{rv.name}</Text>
                    <Text style={styles.reviewerDate}>{rv.date}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 2 }}>
                    {Array.from({ length: rv.rating }).map((_, i) => (
                      <Ionicons key={i} name="star" size={10} color="#F59E0B" />
                    ))}
                  </View>
                </View>
                <Text style={styles.reviewComment}>"{rv.comment}"</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.allReviewsBtn} activeOpacity={0.85}>
            <Text style={styles.allReviewsText}>View All {space.reviewsCount} Reviews</Text>
          </TouchableOpacity>

          {/* LOCATION */}
          <Text style={styles.sectionTitle}>Location</Text>
          <View style={styles.card}>
            <View style={styles.mapWrap}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=600&auto=format&fit=crop' }}
                style={styles.mapImage}
                resizeMode="cover"
              />
              <View style={styles.mapOverlay} />
              <View style={styles.mapMarker}>
                <Ionicons name="location" size={24} color={PRIMARY_COLOR} />
              </View>
            </View>

            <View style={styles.mapInfo}>
              <View style={{ flex: 1 }}>
                <Text style={styles.mapName} numberOfLines={1}>{space.name}</Text>
                <Text style={styles.mapAddr} numberOfLines={1}>{space.location}</Text>
              </View>
              <TouchableOpacity
                style={styles.directionsBtn}
                activeOpacity={0.8}
                onPress={() => Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(space.name + ', ' + space.location)}`)}
              >
                <Feather name="navigation" size={13} color="#FFFFFF" style={{ marginRight: 4 }} />
                <Text style={styles.directionsText}>Directions</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* SIMILAR STUDY HALLS */}
          {similarSpaces.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Similar Study Halls Nearby</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.similarScroll}>
                {similarSpaces.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.similarCard}
                    activeOpacity={0.9}
                    onPress={() => router.push(`/space/${item.id}`)}
                  >
                    <Image source={{ uri: item.imageUrl }} style={styles.similarImg} />
                    <View style={styles.similarContent}>
                      <Text style={styles.similarName} numberOfLines={1}>{item.name}</Text>
                      <Text style={styles.similarMeta}>{item.distance} • ₹{item.price}/hr</Text>
                      <View style={styles.similarRatingRow}>
                        <Ionicons name="star" size={10} color="#F59E0B" style={{ marginRight: 3 }} />
                        <Text style={styles.similarRatingVal}>{item.rating}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          )}
        </View>
      </ScrollView>

      {/* STICKY BOTTOM BOOKING BAR */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <View style={styles.bottomBarLeft}>
          <Text style={styles.bottomBarStarts}>Starting from</Text>
          <Text style={styles.bottomBarPrice}>₹{space.price}<Text style={styles.bottomBarUnit}>/hr</Text></Text>
        </View>

        <Animated.View style={{ transform: [{ scale: bookScale }] }}>
          <TouchableOpacity
            style={styles.bookBtn}
            activeOpacity={1}
            onPressIn={() => handlePressIn(bookScale)}
            onPressOut={() => handlePressOut(bookScale)}
            onPress={() => router.push({ pathname: '/booking/seats', params: { spaceId: space.id } } as any)}
          >
            <Text style={styles.bookBtnText}>Book Now</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* FULLSCREEN GALLERY LIGHTBOX */}
      <Modal visible={galleryVisible} transparent={false} animationType="fade" onRequestClose={() => setGalleryVisible(false)}>
        <SafeAreaView style={styles.lightboxBg}>
          <View style={styles.lightboxHeader}>
            <TouchableOpacity onPress={() => setGalleryVisible(false)} style={styles.lightboxBack}>
              <Feather name="arrow-left" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.lightboxTitle}>Gallery</Text>
            <View style={{ width: 44 }} />
          </View>
          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
            {GALLERY_PHOTOS.map((img, i) => (
              <View key={i} style={styles.lightboxSlide}>
                <Image source={{ uri: img }} style={styles.lightboxImg} resizeMode="contain" />
              </View>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFFFF' },

  // Hero gallery section
  heroWrap: { width: W, height: 280, position: 'relative' },
  heroImage: { width: W, height: 280 },
  indicatorTag: { position: 'absolute', bottom: 18, right: 20, backgroundColor: 'rgba(15,23,42,0.7)', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 12 },
  indicatorText: { fontFamily: FONTS.bold, fontSize: 11, color: '#FFFFFF' },
  floatHeader: { position: 'absolute', left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  circleBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#0F172A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 4 },
  coverGradient: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 60 },

  // Content body
  body: { paddingHorizontal: 20 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6, marginTop: 4 },
  categoryBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  categoryText: { fontFamily: FONTS.bold, fontSize: 10, fontWeight: 'bold' },
  ratingBadge: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { fontFamily: FONTS.bold, fontSize: 12, color: '#0F172A', fontWeight: 'bold' },
  spaceTitle: { fontFamily: FONTS.bold, fontSize: 24, color: '#0F172A', marginBottom: 10, letterSpacing: -0.5, fontWeight: 'bold' },
  metaInfoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  metaLabelItem: { flexDirection: 'row', alignItems: 'center' },
  metaLabelText: { fontFamily: FONTS.medium, fontSize: 12, color: '#64748B' },
  metaSeparator: { marginHorizontal: 8, color: '#E2E8F0' },
  openDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#22C55E', marginRight: 5 },
  openText: { fontFamily: FONTS.bold, fontSize: 12, color: '#22C55E', fontWeight: 'bold' },
  descText: { fontFamily: FONTS.regular, fontSize: 13.5, color: '#475569', lineHeight: 20 },
  readMore: { fontFamily: FONTS.bold, fontSize: 13, color: PRIMARY_COLOR, marginTop: 4, marginBottom: 20, fontWeight: 'bold' },

  // Section title
  sectionTitle: { fontFamily: FONTS.bold, fontSize: 16, color: '#0F172A', marginTop: 22, marginBottom: 10, fontWeight: 'bold' },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 22, marginBottom: 10 },

  // Card designs
  card: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#0F172A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 8, elevation: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  liveIndicatorDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#22C55E' },
  cardTitle: { fontFamily: FONTS.bold, fontSize: 14, color: '#0F172A', fontWeight: 'bold' },
  updateBadge: { fontFamily: FONTS.medium, fontSize: 10, color: '#94A3B8' },
  seatsSummaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  seatsLeftVal: { fontFamily: FONTS.bold, fontSize: 18, color: '#0F172A', fontWeight: 'bold' },
  seatsLeftLabel: { fontFamily: FONTS.medium, fontSize: 12, color: '#64748B', marginTop: 1 },
  occupancyBarContainer: { width: 100, height: 6, borderRadius: 3, backgroundColor: '#F8FAFC', overflow: 'hidden' },
  occupancyBarFill: { height: '100%', borderRadius: 3, backgroundColor: '#22C55E' },
  cardInfoGrid: { flexDirection: 'row', gap: 18 },
  cardInfoCell: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  cardCellLabel: { fontFamily: FONTS.medium, fontSize: 12, color: '#64748B' },
  cardCellVal: { fontFamily: FONTS.bold, fontSize: 12, color: '#0F172A', fontWeight: 'bold' },

  // Amenities list style
  amenitiesScroll: { paddingBottom: 2 },
  amenityChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 8, marginRight: 8, borderWidth: 1, borderColor: '#F1F5F9' },
  amenityChipText: { fontFamily: FONTS.medium, fontSize: 12, color: '#475569' },

  // Pricing styles
  priceHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  priceCardTitle: { fontFamily: FONTS.bold, fontSize: 14, color: '#0F172A', fontWeight: 'bold' },
  priceCardSubtitle: { fontFamily: FONTS.medium, fontSize: 11, color: '#64748B', marginTop: 1 },
  discountBadge: { backgroundColor: 'rgba(79, 70, 229, 0.08)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  discountBadgeText: { fontFamily: FONTS.bold, fontSize: 9, color: PRIMARY_COLOR, fontWeight: 'bold' },
  priceOptions: { marginBottom: 14 },
  priceOptionItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  optionName: { fontFamily: FONTS.medium, fontSize: 13, color: '#475569' },
  optionPrice: { fontFamily: FONTS.bold, fontSize: 14, color: '#0F172A', fontWeight: 'bold' },
  optionPriceUnit: { fontFamily: FONTS.medium, fontSize: 11, color: '#64748B' },
  plansBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#F8FAFC' },
  plansBtnText: { fontFamily: FONTS.bold, fontSize: 12, color: PRIMARY_COLOR, fontWeight: 'bold' },

  // Host styles
  hostRow: { flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: 1, borderBottomColor: '#F8FAFC', paddingBottom: 12, marginBottom: 12 },
  hostAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(79, 70, 229, 0.08)', alignItems: 'center', justifyContent: 'center' },
  hostAvatarTxt: { fontFamily: FONTS.bold, fontSize: 14, color: PRIMARY_COLOR, fontWeight: 'bold' },
  hostName: { fontFamily: FONTS.bold, fontSize: 14, color: '#0F172A', fontWeight: 'bold' },
  hostTag: { fontFamily: FONTS.medium, fontSize: 11.5, color: '#64748B' },
  contactHostBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 10, borderWidth: 1.5, borderColor: PRIMARY_COLOR },
  contactHostText: { fontFamily: FONTS.bold, fontSize: 12, color: PRIMARY_COLOR, fontWeight: 'bold' },
  hostMetaRow: { flexDirection: 'row', gap: 20 },
  hostMetaCell: { flexDirection: 'row', alignItems: 'center' },
  hostMetaVal: { fontFamily: FONTS.bold, fontSize: 12, color: '#0F172A', fontWeight: 'bold' },
  hostMetaLbl: { fontFamily: FONTS.medium, fontSize: 11.5, color: '#64748B' },

  // Rules styles
  ruleItem: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  ruleIcon: { fontSize: 16 },
  ruleTitle: { fontFamily: FONTS.bold, fontSize: 13, color: '#0F172A', fontWeight: 'bold', marginBottom: 2 },
  ruleDesc: { fontFamily: FONTS.medium, fontSize: 11.5, color: '#64748B', lineHeight: 16 },

  // Review styles
  reviewsRatingOverall: { fontFamily: FONTS.bold, fontSize: 14, color: '#0F172A', fontWeight: 'bold' },
  reviewCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#F1F5F9' },
  reviewHead: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  reviewAvatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(79, 70, 229, 0.08)', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  reviewAvatarText: { fontFamily: FONTS.bold, fontSize: 12, color: PRIMARY_COLOR, fontWeight: 'bold' },
  reviewerName: { fontFamily: FONTS.bold, fontSize: 13, color: '#0F172A', fontWeight: 'bold' },
  reviewerDate: { fontFamily: FONTS.medium, fontSize: 10.5, color: '#94A3B8', marginTop: 1 },
  reviewComment: { fontFamily: FONTS.regular, fontSize: 13, color: '#475569', lineHeight: 18 },
  allReviewsBtn: { alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 14, borderStyle: 'dashed', borderWidth: 1, borderColor: PRIMARY_COLOR, marginTop: 14 },
  allReviewsText: { fontFamily: FONTS.bold, fontSize: 13, color: PRIMARY_COLOR, fontWeight: 'bold' },

  // Location map styles
  mapWrap: { height: 120, borderRadius: 14, overflow: 'hidden', position: 'relative' },
  mapImage: { width: '100%', height: '100%' },
  mapOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.45)' },
  mapMarker: { position: 'absolute', alignSelf: 'center', top: '40%' },
  mapInfo: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  mapName: { fontFamily: FONTS.bold, fontSize: 14, color: '#0F172A', marginBottom: 2, fontWeight: 'bold' },
  mapAddr: { fontFamily: FONTS.medium, fontSize: 11, color: '#64748B' },
  directionsBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: PRIMARY_COLOR, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  directionsText: { fontFamily: FONTS.bold, fontSize: 12, color: '#FFFFFF', fontWeight: 'bold' },

  // Similar card styles
  similarScroll: { paddingBottom: 4 },
  similarCard: { width: 180, backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#F1F5F9', overflow: 'hidden', marginRight: 12, shadowColor: '#0F172A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 6, elevation: 1 },
  similarImg: { width: '100%', height: 100 },
  similarContent: { padding: 10 },
  similarName: { fontFamily: FONTS.bold, fontSize: 12.5, color: '#0F172A', fontWeight: 'bold', marginBottom: 2 },
  similarMeta: { fontFamily: FONTS.medium, fontSize: 10.5, color: '#64748B', marginBottom: 4 },
  similarRatingRow: { flexDirection: 'row', alignItems: 'center' },
  similarRatingVal: { fontFamily: FONTS.bold, fontSize: 11, color: '#0F172A', fontWeight: 'bold' },

  // Sticky bottom bar
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#F1F5F9', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 12, shadowColor: '#0F172A', shadowOffset: { width: 0, height: -6 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 10 },
  bottomBarLeft: { justifyContent: 'center' },
  bottomBarStarts: { fontFamily: FONTS.medium, fontSize: 10.5, color: '#64748B', marginBottom: 1 },
  bottomBarPrice: { fontFamily: FONTS.bold, fontSize: 18, color: '#0F172A', fontWeight: 'bold' },
  bottomBarUnit: { fontFamily: FONTS.medium, fontSize: 12, color: '#64748B' },
  bookBtn: { backgroundColor: PRIMARY_COLOR, borderRadius: 14, paddingHorizontal: 36, height: 48, justifyContent: 'center', alignItems: 'center', shadowColor: PRIMARY_COLOR, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 2 },
  bookBtnText: { fontFamily: FONTS.bold, fontSize: 14.5, color: '#FFFFFF', fontWeight: 'bold' },

  // Fullscreen Lightbox
  lightboxBg: { flex: 1, backgroundColor: '#0F172A' },
  lightboxHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, height: 50 },
  lightboxBack: { padding: 4 },
  lightboxTitle: { fontFamily: FONTS.bold, fontSize: 16, color: '#FFFFFF', fontWeight: 'bold' },
  lightboxSlide: { width: W, height: '100%', justifyContent: 'center', alignItems: 'center' },
  lightboxImg: { width: W, height: '75%' },
});
