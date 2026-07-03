import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FONTS } from '../../constants/fonts';

export default function StudyPreferencesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [preferredSpace, setPreferredSpace] = useState<'Library' | 'Study Café' | 'Coworking' | 'Silent Pods'>('Library');
  const [preferredSeat, setPreferredSeat] = useState<'Window' | 'Charging Point' | 'Corner' | 'Silent Zone'>('Window');
  const [preferredTime, setPreferredTime] = useState<'Morning' | 'Afternoon' | 'Evening' | 'Night'>('Morning');
  const [duration, setDuration] = useState<'1 Hour' | '2 Hours' | '3 Hours' | 'Full Day'>('3 Hours');

  const handleSave = () => {
    Alert.alert('Preferences Saved', 'Study setup options updated.', [
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
          <Text style={styles.headerTitle}>Study Preferences</Text>
          <Text style={styles.headerSubtitle}>Customize your session defaults</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
        {/* PREFERRED STUDY SPACE */}
        <Text style={styles.sectionTitle}>Preferred Study Space</Text>
        <View style={styles.card}>
          {['Library', 'Study Café', 'Coworking', 'Silent Pods'].map((item, index) => {
            const active = preferredSpace === item;
            return (
              <View key={item}>
                <TouchableOpacity style={styles.optionRow} onPress={() => setPreferredSpace(item as any)} activeOpacity={0.8}>
                  <Text style={[styles.optionLabel, active && styles.activeLabel]}>{item}</Text>
                  {active && <Ionicons name="checkmark" size={16} color="#4F7EFF" />}
                </TouchableOpacity>
                {index < 3 && <View style={styles.divider} />}
              </View>
            );
          })}
        </View>

        {/* PREFERRED SEAT */}
        <Text style={styles.sectionTitle}>Seat Amenities</Text>
        <View style={styles.card}>
          {['Window', 'Charging Point', 'Corner', 'Silent Zone'].map((item, index) => {
            const active = preferredSeat === item;
            return (
              <View key={item}>
                <TouchableOpacity style={styles.optionRow} onPress={() => setPreferredSeat(item as any)} activeOpacity={0.8}>
                  <Text style={[styles.optionLabel, active && styles.activeLabel]}>{item}</Text>
                  {active && <Ionicons name="checkmark" size={16} color="#4F7EFF" />}
                </TouchableOpacity>
                {index < 3 && <View style={styles.divider} />}
              </View>
            );
          })}
        </View>

        {/* PREFERRED TIME */}
        <Text style={styles.sectionTitle}>Time Slot preferences</Text>
        <View style={styles.card}>
          {['Morning', 'Afternoon', 'Evening', 'Night'].map((item, index) => {
            const active = preferredTime === item;
            return (
              <View key={item}>
                <TouchableOpacity style={styles.optionRow} onPress={() => setPreferredTime(item as any)} activeOpacity={0.8}>
                  <Text style={[styles.optionLabel, active && styles.activeLabel]}>{item}</Text>
                  {active && <Ionicons name="checkmark" size={16} color="#4F7EFF" />}
                </TouchableOpacity>
                {index < 3 && <View style={styles.divider} />}
              </View>
            );
          })}
        </View>

        {/* DURATION */}
        <Text style={styles.sectionTitle}>Default Booking Duration</Text>
        <View style={styles.card}>
          {['1 Hour', '2 Hours', '3 Hours', 'Full Day'].map((item, index) => {
            const active = duration === item;
            return (
              <View key={item}>
                <TouchableOpacity style={styles.optionRow} onPress={() => setDuration(item as any)} activeOpacity={0.8}>
                  <Text style={[styles.optionLabel, active && styles.activeLabel]}>{item}</Text>
                  {active && <Ionicons name="checkmark" size={16} color="#4F7EFF" />}
                </TouchableOpacity>
                {index < 3 && <View style={styles.divider} />}
              </View>
            );
          })}
        </View>

        {/* SAVE BUTTON */}
        <TouchableOpacity style={styles.saveBtn} activeOpacity={0.85} onPress={handleSave}>
          <Text style={styles.saveBtnTxt}>Save Settings</Text>
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
  activeLabel: { fontFamily: FONTS.bold, color: '#4F7EFF' },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 4 },

  saveBtn: { backgroundColor: '#4F7EFF', borderRadius: 20, height: 50, justifyContent: 'center', alignItems: 'center', marginTop: 14 },
  saveBtnTxt: { fontFamily: FONTS.bold, fontSize: 14, color: '#FFFFFF' },
});
