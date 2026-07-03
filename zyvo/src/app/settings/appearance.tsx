import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Switch,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FONTS } from '../../constants/fonts';

export default function AppearanceSettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light');
  const [accent, setAccent] = useState<'blue' | 'indigo' | 'purple'>('blue');
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [reduceMotion, setReduceMotion] = useState(false);

  const handleSave = () => {
    Alert.alert('Saved', 'Theme configuration updated.', [
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
          <Text style={styles.headerTitle}>Appearance</Text>
          <Text style={styles.headerSubtitle}>Customize the application interface styling</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
        {/* THEME SELECTION */}
        <Text style={styles.sectionTitle}>Theme</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.optionRow} onPress={() => setTheme('light')} activeOpacity={0.8}>
            <Text style={styles.optionLabel}>Light Theme</Text>
            <View style={theme === 'light' ? styles.checkedOutline : styles.checkEmpty} />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.optionRow} onPress={() => setTheme('dark')} activeOpacity={0.8}>
            <Text style={styles.optionLabel}>Dark Theme</Text>
            <View style={theme === 'dark' ? styles.checkedOutline : styles.checkEmpty} />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.optionRow} onPress={() => setTheme('system')} activeOpacity={0.8}>
            <Text style={styles.optionLabel}>System Default</Text>
            <View style={theme === 'system' ? styles.checkedOutline : styles.checkEmpty} />
          </TouchableOpacity>
        </View>

        {/* ACCENT SELECTION */}
        <Text style={styles.sectionTitle}>Accent Color</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.optionRow} onPress={() => setAccent('blue')} activeOpacity={0.8}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={[styles.colorDot, { backgroundColor: '#4F7EFF' }]} />
              <Text style={styles.optionLabel}>Blue (Default)</Text>
            </View>
            {accent === 'blue' && <Ionicons name="checkmark" size={16} color="#4F7EFF" />}
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.optionRow} onPress={() => setAccent('indigo')} activeOpacity={0.8}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={[styles.colorDot, { backgroundColor: '#6366F1' }]} />
              <Text style={styles.optionLabel}>Indigo</Text>
            </View>
            {accent === 'indigo' && <Ionicons name="checkmark" size={16} color="#4F7EFF" />}
          </TouchableOpacity>
        </View>

        {/* FONT SIZES */}
        <Text style={styles.sectionTitle}>Font Size</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.optionRow} onPress={() => setFontSize('small')} activeOpacity={0.8}>
            <Text style={[styles.optionLabel, { fontSize: 12 }]}>Small text</Text>
            {fontSize === 'small' && <Ionicons name="checkmark" size={16} color="#4F7EFF" />}
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.optionRow} onPress={() => setFontSize('medium')} activeOpacity={0.8}>
            <Text style={[styles.optionLabel, { fontSize: 14 }]}>Medium text (Recommended)</Text>
            {fontSize === 'medium' && <Ionicons name="checkmark" size={16} color="#4F7EFF" />}
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.optionRow} onPress={() => setFontSize('large')} activeOpacity={0.8}>
            <Text style={[styles.optionLabel, { fontSize: 16 }]}>Large text</Text>
            {fontSize === 'large' && <Ionicons name="checkmark" size={16} color="#4F7EFF" />}
          </TouchableOpacity>
        </View>

        {/* REDUCE MOTION SWITCH */}
        <Text style={styles.sectionTitle}>Accessibility</Text>
        <View style={styles.card}>
          <View style={styles.switchRow}>
            <View>
              <Text style={styles.switchLabel}>Reduce Motion</Text>
              <Text style={styles.switchDesc}>Disables transitions and live progress animations</Text>
            </View>
            <Switch
              value={reduceMotion}
              onValueChange={setReduceMotion}
              trackColor={{ false: '#E5E7EB', true: '#4F7EFF' }}
              thumbColor={Platform.OS === 'ios' ? undefined : '#FFFFFF'}
            />
          </View>
        </View>

        {/* SAVE BUTTON */}
        <TouchableOpacity style={styles.saveBtn} activeOpacity={0.85} onPress={handleSave}>
          <Text style={styles.saveBtnTxt}>Save Changes</Text>
        </TouchableOpacity>
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

  scrollBody: { paddingHorizontal: 20, paddingBottom: 60 },

  sectionTitle: { fontFamily: FONTS.bold, fontSize: 13, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 20, marginBottom: 8, paddingHorizontal: 4 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#E8EEF8' },
  
  optionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: 44 },
  optionLabel: { fontFamily: FONTS.medium, fontSize: 13.5, color: '#374151' },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 10 },

  checkedOutline: { width: 18, height: 18, borderRadius: 9, backgroundColor: '#4F7EFF', borderWidth: 2, borderColor: '#FFFFFF', shadowColor: '#4F7EFF', shadowOpacity: 0.2, shadowRadius: 3, elevation: 1 },
  checkEmpty: { width: 18, height: 18, borderRadius: 9, borderWidth: 1.5, borderColor: '#CBD5E1' },
  
  colorDot: { width: 14, height: 14, borderRadius: 7, marginRight: 10 },

  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  switchLabel: { fontFamily: FONTS.medium, fontSize: 13.5, color: '#374151' },
  switchDesc: { fontFamily: FONTS.medium, fontSize: 11, color: '#9CA3AF', marginTop: 2 },

  saveBtn: { backgroundColor: '#4F7EFF', borderRadius: 20, height: 50, justifyContent: 'center', alignItems: 'center', marginTop: 14 },
  saveBtnTxt: { fontFamily: FONTS.bold, fontSize: 14, color: '#FFFFFF' },
});
