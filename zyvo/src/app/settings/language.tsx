import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FONTS } from '../../constants/fonts';

const LANGUAGES = [
  'English',
  'Hindi',
  'Telugu',
  'Tamil',
  'Kannada',
  'Malayalam',
  'Marathi',
];

export default function LanguageSettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [search, setSearch] = useState('');
  const [selectedLang, setSelectedLang] = useState('English');

  const filtered = LANGUAGES.filter((l) => l.toLowerCase().includes(search.toLowerCase()));

  const handleSave = (lang: string) => {
    setSelectedLang(lang);
    Alert.alert('Language Saved', `Application language set to ${lang}.`, [
      { text: 'OK', onPress: () => router.back() }
    ]);
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* HEADER */}
      <View style={[styles.header, { paddingTop: insets.top || 14 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.75}>
          <Feather name="arrow-left" size={20} color="#111827" />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 14 }}>
          <Text style={styles.headerTitle}>Language</Text>
          <Text style={styles.headerSubtitle}>Change application default language</Text>
        </View>
      </View>

      {/* SEARCH BAR */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Feather name="search" size={16} color="#9CA3AF" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search language..."
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
        {/* LANGUAGES LIST */}
        <Text style={styles.sectionTitle}>Available Languages</Text>
        <View style={styles.card}>
          {filtered.length === 0 ? (
            <Text style={styles.emptyText}>No matching language found</Text>
          ) : (
            filtered.map((lang, index) => {
              const active = selectedLang === lang;
              return (
                <View key={lang}>
                  <TouchableOpacity style={styles.optionRow} onPress={() => handleSave(lang)} activeOpacity={0.8}>
                    <Text style={[styles.optionLabel, active && styles.activeLabel]}>{lang}</Text>
                    {active && <Ionicons name="checkmark" size={16} color="#4F7EFF" />}
                  </TouchableOpacity>
                  {index < filtered.length - 1 && <View style={styles.divider} />}
                </View>
              );
            })
          )}
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

  scrollBody: { paddingHorizontal: 20, paddingBottom: 60 },

  sectionTitle: { fontFamily: FONTS.bold, fontSize: 13, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 20, marginBottom: 8, paddingHorizontal: 4 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#E8EEF8' },
  
  optionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: 46 },
  optionLabel: { fontFamily: FONTS.medium, fontSize: 13.5, color: '#374151' },
  activeLabel: { fontFamily: FONTS.bold, color: '#4F7EFF' },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 4 },

  emptyText: { fontFamily: FONTS.medium, fontSize: 13, color: '#9CA3AF', textAlign: 'center', paddingVertical: 12 },
});
