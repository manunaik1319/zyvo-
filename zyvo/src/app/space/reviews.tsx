import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { FONTS } from '../../constants/fonts';

const MOCK_REVIEWS = [
  { id: '1', user: 'Hannah S.', rating: '5.0', comment: 'Extremely silent focus space. Power sockets are available right on the desk.', date: 'Yesterday' },
  { id: '2', user: 'James M.', rating: '4.5', comment: 'Loved the workspace! Wi-Fi speed was top notch (around 250Mbps).', date: '3 days ago' },
  { id: '3', user: 'Linus O.', rating: '4.0', comment: 'Very comfortable chairs but can get a bit chilly. Bring a sweater!', date: '1 week ago' },
];

export default function SpaceReviews() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ratings & Reviews</Text>
        <View style={styles.placeholder} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.scoreRow}>
          <Text style={styles.averageRating}>4.7</Text>
          <View style={styles.stars}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Ionicons key={i} name="star" size={20} color={COLORS.warning} />
            ))}
          </View>
          <Text style={styles.ratingCount}>based on 124 reviews</Text>
        </View>

        <Text style={styles.sectionTitle}>User Opinions</Text>
        {MOCK_REVIEWS.map((review) => (
          <View key={review.id} style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <Text style={styles.reviewerName}>{review.user}</Text>
              <View style={styles.reviewBadge}>
                <Ionicons name="star" size={12} color={COLORS.warning} style={{ marginRight: 4 }} />
                <Text style={styles.badgeText}>{review.rating}</Text>
              </View>
            </View>
            <Text style={styles.comment}>{review.comment}</Text>
            <Text style={styles.date}>{review.date}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border, backgroundColor: COLORS.card },
  backButton: { padding: 4 },
  headerTitle: { fontFamily: FONTS.bold, fontSize: 18, color: COLORS.textPrimary },
  placeholder: { width: 32 },
  content: { padding: 16 },
  scoreRow: { backgroundColor: COLORS.card, padding: 20, borderRadius: 20, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, marginBottom: 24 },
  averageRating: { fontFamily: FONTS.bold, fontSize: 48, color: COLORS.textPrimary },
  stars: { flexDirection: 'row', marginVertical: 8 },
  ratingCount: { fontFamily: FONTS.regular, fontSize: 13, color: COLORS.textSecondary },
  sectionTitle: { fontFamily: FONTS.bold, fontSize: 18, color: COLORS.textPrimary, marginBottom: 12 },
  reviewCard: { backgroundColor: COLORS.card, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, marginBottom: 12 },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  reviewerName: { fontFamily: FONTS.bold, fontSize: 15, color: COLORS.textPrimary },
  reviewBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFBEB', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontFamily: FONTS.bold, fontSize: 12, color: '#D97706' },
  comment: { fontFamily: FONTS.regular, fontSize: 14, color: COLORS.textSecondary, lineHeight: 20, marginBottom: 8 },
  date: { fontFamily: FONTS.regular, fontSize: 12, color: COLORS.textMuted },
});
