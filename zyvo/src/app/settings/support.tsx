import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  LayoutAnimation,
  Alert,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FONTS } from '../../constants/fonts';

const { width: W } = Dimensions.get('window');

const CATEGORIES = [
  { name: 'Booking', icon: 'calendar' },
  { name: 'Payments', icon: 'credit-card' },
  { name: 'QR Check-in', icon: 'qr-code-outline' },
  { name: 'Account', icon: 'user' },
  { name: 'Study Spaces', icon: 'book-open' },
];

const FAQS = [
  { q: 'How do I check into my seat?', a: 'Locate the QR code sign at the study space desk or entry door, open the Scan tab inside ZYVO, scan the code, and your timer starts!' },
  { q: 'Can I extend my ongoing session?', a: 'Yes! Tap the Extend Session button on either your Active Session dashboard or inside your booking card in the Bookings history tab.' },
  { q: 'What is the cancellation policy?', a: 'Free cancellation is supported up to 1 hour before your reservation starts. Cancellations made within 1 hour receive a 50% refund.' },
  { q: 'Are students eligible for discounts?', a: 'Absolutely. Upload your student registration card in your Edit Profile parameters to get flat 20% discounts on all study hubs.' },
];

export default function SupportSettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('Booking');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleExpand = (idx: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  const filteredFaqs = FAQS.filter(f => f.q.toLowerCase().includes(search.toLowerCase()));

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* HEADER */}
      <View style={[styles.header, { paddingTop: insets.top || 14 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.75}>
          <Feather name="arrow-left" size={20} color="#111827" />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 14 }}>
          <Text style={styles.headerTitle}>Help Center</Text>
          <Text style={styles.headerSubtitle}>How can we help you today?</Text>
        </View>
      </View>

      {/* SEARCH BAR */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Feather name="search" size={16} color="#9CA3AF" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search help topics or questions..."
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
        {/* HELPFUL CATEGORIES CHIPS */}
        <Text style={styles.sectionTitle}>Helpful Categories</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
          {CATEGORIES.map((cat) => {
            const active = selectedCat === cat.name;
            const isFeather = cat.name !== 'QR Check-in';
            return (
              <TouchableOpacity
                key={cat.name}
                style={[styles.catChip, active && styles.catChipActive]}
                activeOpacity={0.8}
                onPress={() => setSelectedCat(cat.name)}
              >
                {isFeather ? (
                  <Feather name={cat.icon as any} size={13} color={active ? '#FFFFFF' : '#4F7EFF'} style={{ marginRight: 6 }} />
                ) : (
                  <Ionicons name={cat.icon as any} size={13} color={active ? '#FFFFFF' : '#4F7EFF'} style={{ marginRight: 6 }} />
                )}
                <Text style={[styles.catChipTxt, active && styles.catChipTxtActive]}>{cat.name}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* FAQS SECTION */}
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        {filteredFaqs.map((faq, idx) => {
          const isOpen = expandedIndex === idx;
          return (
            <TouchableOpacity key={idx} style={styles.faqCard} onPress={() => toggleExpand(idx)} activeOpacity={0.85}>
              <View style={styles.faqHeader}>
                <Text style={styles.faqQuestion}>{faq.q}</Text>
                <Feather name={isOpen ? "chevron-up" : "chevron-down"} size={14} color="#6B7280" />
              </View>
              {isOpen && <Text style={styles.faqAnswer}>{faq.a}</Text>}
            </TouchableOpacity>
          );
        })}

        {/* QUICK SUPPORT ACTION CARDS */}
        <Text style={styles.sectionTitle}>Quick Support Actions</Text>
        <View style={styles.grid}>
          <TouchableOpacity style={styles.gridCard} activeOpacity={0.8} onPress={() => router.push('/settings/contact-support' as any)}>
            <View style={[styles.iconContainer, { backgroundColor: '#EEF2FF' }]}>
              <Feather name="message-square" size={16} color="#4F7EFF" />
            </View>
            <Text style={styles.gridLabel}>Live Chat</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.gridCard} activeOpacity={0.8} onPress={() => router.push('/settings/contact-support' as any)}>
            <View style={[styles.iconContainer, { backgroundColor: '#EEF2FF' }]}>
              <Feather name="mail" size={16} color="#4F7EFF" />
            </View>
            <Text style={styles.gridLabel}>Email Support</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.gridCard} activeOpacity={0.8} onPress={() => router.push('/settings/contact-support' as any)}>
            <View style={[styles.iconContainer, { backgroundColor: '#EEF2FF' }]}>
              <Feather name="phone" size={16} color="#4F7EFF" />
            </View>
            <Text style={styles.gridLabel}>Call Support</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.gridCard} activeOpacity={0.8} onPress={() => router.push('/settings/report-problem' as any)}>
            <View style={[styles.iconContainer, { backgroundColor: '#FEF2F2' }]}>
              <Feather name="alert-triangle" size={16} color="#EF4444" />
            </View>
            <Text style={styles.gridLabel}>Report Issue</Text>
          </TouchableOpacity>
        </View>

        {/* LEGAL LINKS AND APP DETAILS */}
        <Text style={styles.sectionTitle}>App Details</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.row} onPress={() => router.push('/legal/terms' as any)} activeOpacity={0.8}>
            <Text style={styles.rowLabel}>Terms of Service</Text>
            <Feather name="chevron-right" size={14} color="#D1D5DB" />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.row} onPress={() => router.push('/legal/privacy-policy' as any)} activeOpacity={0.8}>
            <Text style={styles.rowLabel}>Privacy Policy</Text>
            <Feather name="chevron-right" size={14} color="#D1D5DB" />
          </TouchableOpacity>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.rowLabel}>App Version</Text>
            <Text style={styles.verVal}>v1.0.4</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 14, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E8EEF8' },
  backBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: FONTS.bold, fontSize: 18, color: '#111827' },
  headerSubtitle: { fontFamily: FONTS.medium, fontSize: 12, color: '#6B7280', marginTop: 1 },

  searchRow: { paddingHorizontal: 20, marginTop: 16, marginBottom: 4 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, paddingHorizontal: 12, height: 48, borderWidth: 1, borderColor: '#E8EEF8', shadowColor: '#111827', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 1 },
  searchInput: { flex: 1, fontFamily: FONTS.regular, fontSize: 13, color: '#111827' },

  scrollBody: { paddingHorizontal: 20, paddingBottom: 60, paddingTop: 14 },

  sectionTitle: { fontFamily: FONTS.bold, fontSize: 13, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 14, marginBottom: 10, paddingHorizontal: 4 },
  
  catScroll: { paddingBottom: 6, gap: 8 },
  catChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E8EEF8', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 14 },
  catChipActive: { backgroundColor: '#4F7EFF', borderColor: '#4F7EFF' },
  catChipTxt: { fontFamily: FONTS.medium, fontSize: 12.5, color: '#4B5563' },
  catChipTxtActive: { fontFamily: FONTS.bold, color: '#FFFFFF' },

  faqCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, marginBottom: 8, borderWidth: 1, borderColor: '#E8EEF8' },
  faqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  faqQuestion: { fontFamily: FONTS.bold, fontSize: 13.5, color: '#111827', flex: 1, marginRight: 10 },
  faqAnswer: { fontFamily: FONTS.medium, fontSize: 12.5, color: '#6B7280', lineHeight: 18, marginTop: 10, borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 10 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  gridCard: { width: (W - 48) / 2, backgroundColor: '#FFFFFF', borderRadius: 20, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#E8EEF8' },
  iconContainer: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  gridLabel: { fontFamily: FONTS.bold, fontSize: 12.5, color: '#374151' },

  card: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#E8EEF8' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: 44 },
  rowLabel: { fontFamily: FONTS.medium, fontSize: 13.5, color: '#374151' },
  verVal: { fontFamily: FONTS.bold, fontSize: 12.5, color: '#6B7280' },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 8 },
});
