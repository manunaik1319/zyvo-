import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { FONTS } from '../../constants/fonts';

const FAQS = [
  { q: 'How do I check in to my study desk?', a: 'Once you arrive at your study desk, open the ZYVO app and click the "Scan QR" button, then scan the sticker on your desk to begin.' },
  { q: 'What is the cancellation policy?', a: 'You can cancel any booking for a full refund up to 1 hour before your slot starts. Cancelling under 1 hour may incur a reservation fee.' },
  { q: 'Can I extend my ongoing focus session?', a: 'Yes! If the seat is not reserved by someone else, you can click "Extend" on your Active Session dashboard to add more hours.' },
  { q: 'How does student verification work?', a: 'We require a valid Stanford or District email verification to unlock exclusive study hall rates.' },
];

export default function SupportFAQ() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Frequently Asked Questions</Text>
        <View style={styles.placeholder} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {FAQS.map((faq, index) => (
          <View key={index} style={styles.faqCard}>
            <Text style={styles.faqQuestion}>{faq.q}</Text>
            <Text style={styles.faqAnswer}>{faq.a}</Text>
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
  faqCard: { backgroundColor: COLORS.card, padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  faqQuestion: { fontFamily: FONTS.bold, fontSize: 16, color: COLORS.textPrimary, marginBottom: 8 },
  faqAnswer: { fontFamily: FONTS.regular, fontSize: 14, color: COLORS.textSecondary, lineHeight: 20 },
});
