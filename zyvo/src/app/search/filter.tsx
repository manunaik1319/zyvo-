import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, StatusBar, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { FONTS } from '../../constants/fonts';

export default function SearchFilter() {
  const router = useRouter();
  const [selectedCat, setSelectedCat] = useState('all');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="close" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Filter Options</Text>
        <TouchableOpacity style={styles.resetBtn}>
          <Text style={styles.resetText}>Reset</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Category Type</Text>
        <View style={styles.row}>
          {['all', 'Libraries', 'Focus Pods', 'Silent'].map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setSelectedCat(cat)}
              style={[styles.chip, selectedCat === cat && styles.selectedChip]}
            >
              <Text style={[styles.chipText, selectedCat === cat && styles.selectedChipText]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity onPress={() => router.back()} style={styles.applyBtn}>
          <Text style={styles.applyText}>Apply Filters</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border, backgroundColor: COLORS.card },
  backButton: { padding: 4 },
  headerTitle: { fontFamily: FONTS.bold, fontSize: 18, color: COLORS.textPrimary },
  resetBtn: { padding: 4 },
  resetText: { fontFamily: FONTS.medium, fontSize: 14, color: COLORS.error },
  content: { padding: 16 },
  sectionTitle: { fontFamily: FONTS.bold, fontSize: 16, color: COLORS.textPrimary, marginBottom: 12 },
  row: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 24 },
  chip: { height: 38, borderRadius: 19, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 16, justifyContent: 'center', marginRight: 8, marginBottom: 8 },
  selectedChip: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontFamily: FONTS.medium, fontSize: 14, color: COLORS.textSecondary },
  selectedChipText: { color: '#FFF' },
  applyBtn: { marginTop: 40, height: 48, borderRadius: 24, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  applyText: { fontFamily: FONTS.bold, fontSize: 16, color: '#FFF' },
});
