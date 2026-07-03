import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { FONTS } from '../../constants/fonts';

export default function SearchResults() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Search Results</Text>
        <TouchableOpacity onPress={() => router.push('/search/filter')} style={styles.filterBtn}>
          <Ionicons name="options-outline" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.noResults}>No search filters active. Tap filters icon to configure criteria.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border, backgroundColor: COLORS.card },
  backButton: { padding: 4 },
  headerTitle: { fontFamily: FONTS.bold, fontSize: 18, color: COLORS.textPrimary },
  filterBtn: { padding: 4 },
  content: { padding: 16, alignItems: 'center', justifyContent: 'center', flexGrow: 1 },
  noResults: { fontFamily: FONTS.medium, fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', paddingHorizontal: 32 },
});
