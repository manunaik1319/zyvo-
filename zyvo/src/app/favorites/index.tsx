import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useSpaceStore } from '../../store/spaceStore';
import { FONTS } from '../../constants/fonts';

export default function FavoritesScreen() {
  const router = useRouter();
  const { spaces, favoritedIds, toggleFavorite } = useSpaceStore();
  const { width } = Dimensions.get('window');
  const isLarge = width > 768;

  // Filter list of favorited spaces
  const favoriteSpaces = spaces.filter((space) => favoritedIds.includes(space.id));

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/home');
    }
  };

  const handleExplore = () => {
    router.replace('/(tabs)/discover');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <SafeAreaView style={styles.safeArea}>
        {/* Header Bar */}
        <View style={styles.headerBar}>
          <TouchableOpacity style={styles.backBtn} onPress={handleBack} activeOpacity={0.7}>
            <Feather name="arrow-left" size={24} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Favorites</Text>
          <View style={{ width: 44 }} />
        </View>

        {favoriteSpaces.length === 0 ? (
          /* Empty State */
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="heart-dislike-outline" size={48} color="#94A3B8" />
            </View>
            <Text style={styles.emptyTitle}>No favorites yet</Text>
            <Text style={styles.emptySubtitle}>
              Tap the heart icon on any space to add it here for quick access.
            </Text>
            <TouchableOpacity 
              style={styles.exploreBtn} 
              onPress={handleExplore}
              activeOpacity={0.8}
            >
              <Text style={styles.exploreBtnText}>Explore Spaces</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Favorites List */
          <ScrollView
            contentContainerStyle={[styles.scrollContent, isLarge && styles.largeContainer]}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.favoritesCount}>
              {favoriteSpaces.length} saved space{favoriteSpaces.length > 1 ? 's' : ''}
            </Text>

            <View style={styles.listContainer}>
              {favoriteSpaces.map((space) => (
                <TouchableOpacity
                  key={space.id}
                  style={styles.spaceCard}
                  onPress={() => router.push({ pathname: '/booking/seats', params: { spaceId: space.id } } as any)}
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
                        onPress={() => toggleFavorite(space.id)}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="heart" size={20} color="#EF4444" />
                      </TouchableOpacity>
                    </View>

                    <Text style={styles.spaceCategory}>{space.category}</Text>

                    <View style={styles.metaRow}>
                      <View style={styles.metaItem}>
                        <Ionicons name="star" size={13} color="#F59E0B" />
                        <Text style={styles.metaText}>{space.rating.toFixed(1)}</Text>
                      </View>
                      <Text style={styles.metaDivider}>•</Text>
                      <View style={styles.metaItem}>
                        <Feather name="map-pin" size={12} color="#64748B" />
                        <Text style={styles.metaText}>{space.distance}</Text>
                      </View>
                    </View>

                    <View style={styles.footerRow}>
                      <Text style={styles.spacePrice}>
                        ₹{space.price}<Text style={styles.priceUnit}>/hr</Text>
                      </Text>
                      <View style={styles.bookBadge}>
                        <Text style={styles.bookBadgeText}>Book Space</Text>
                        <Feather name="chevron-right" size={12} color="#4F7EFF" />
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  safeArea: {
    flex: 1,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: '#0F172A',
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  largeContainer: {
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
  },
  favoritesCount: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: '#64748B',
    marginBottom: 16,
  },
  listContainer: {
    gap: 16,
  },
  spaceCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    height: 120,
  },
  spaceImage: {
    width: 100,
    height: '100%',
    backgroundColor: '#F8FAFC',
  },
  spaceInfo: {
    flex: 1,
    padding: 12,
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
    color: '#0F172A',
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
    color: '#64748B',
    marginTop: -2,
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
    fontFamily: FONTS.medium,
    fontSize: 11,
    color: '#475569',
  },
  metaDivider: {
    color: '#94A3B8',
    fontSize: 10,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  spacePrice: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: '#0F172A',
    fontWeight: 'bold',
  },
  priceUnit: {
    fontFamily: FONTS.medium,
    fontSize: 10,
    color: '#64748B',
  },
  bookBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  bookBadgeText: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    color: '#4F7EFF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: '#ECEFF2',
  },
  emptyTitle: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: '#0F172A',
    fontWeight: 'bold',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
  },
  exploreBtn: {
    backgroundColor: '#4F7EFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: '#4F7EFF',
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
