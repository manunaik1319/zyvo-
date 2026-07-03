import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Switch,
  TouchableOpacity,
  StatusBar,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FONTS } from '../../constants/fonts';

export default function NotificationsSettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [bookingConfirmation, setBookingConfirmation] = useState(true);
  const [bookingReminder, setBookingReminder] = useState(true);
  const [checkInReminder, setCheckInReminder] = useState(true);
  const [sessionEnding, setSessionEnding] = useState(true);
  const [offersDiscounts, setOffersDiscounts] = useState(false);
  const [marketingEmails, setMarketingEmails] = useState(false);

  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);

  const handleSave = () => {
    Alert.alert('Settings Updated', 'Your notification preferences have been saved.', [
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
          <Text style={styles.headerTitle}>Notifications</Text>
          <Text style={styles.headerSubtitle}>Customize your alert frequencies</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
        {/* SESSION REMINDERS */}
        <Text style={styles.sectionTitle}>Session & Bookings</Text>
        <View style={styles.card}>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Booking Confirmation</Text>
            <Switch
              value={bookingConfirmation}
              onValueChange={setBookingConfirmation}
              trackColor={{ false: '#E5E7EB', true: '#4F7EFF' }}
              thumbColor={Platform.OS === 'ios' ? undefined : '#FFFFFF'}
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Booking Reminder</Text>
            <Switch
              value={bookingReminder}
              onValueChange={setBookingReminder}
              trackColor={{ false: '#E5E7EB', true: '#4F7EFF' }}
              thumbColor={Platform.OS === 'ios' ? undefined : '#FFFFFF'}
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Check-in Reminder</Text>
            <Switch
              value={checkInReminder}
              onValueChange={setCheckInReminder}
              trackColor={{ false: '#E5E7EB', true: '#4F7EFF' }}
              thumbColor={Platform.OS === 'ios' ? undefined : '#FFFFFF'}
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Session Ending Reminder</Text>
            <Switch
              value={sessionEnding}
              onValueChange={setSessionEnding}
              trackColor={{ false: '#E5E7EB', true: '#4F7EFF' }}
              thumbColor={Platform.OS === 'ios' ? undefined : '#FFFFFF'}
            />
          </View>
        </View>

        {/* PROMO & MARKETING */}
        <Text style={styles.sectionTitle}>Offers & News</Text>
        <View style={styles.card}>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Offers & Discounts</Text>
            <Switch
              value={offersDiscounts}
              onValueChange={setOffersDiscounts}
              trackColor={{ false: '#E5E7EB', true: '#4F7EFF' }}
              thumbColor={Platform.OS === 'ios' ? undefined : '#FFFFFF'}
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Marketing Emails</Text>
            <Switch
              value={marketingEmails}
              onValueChange={setMarketingEmails}
              trackColor={{ false: '#E5E7EB', true: '#4F7EFF' }}
              thumbColor={Platform.OS === 'ios' ? undefined : '#FFFFFF'}
            />
          </View>
        </View>

        {/* CHANNELS */}
        <Text style={styles.sectionTitle}>Delivery Channels</Text>
        <View style={styles.card}>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Push Notifications</Text>
            <Switch
              value={pushEnabled}
              onValueChange={setPushEnabled}
              trackColor={{ false: '#E5E7EB', true: '#4F7EFF' }}
              thumbColor={Platform.OS === 'ios' ? undefined : '#FFFFFF'}
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Email Notifications</Text>
            <Switch
              value={emailEnabled}
              onValueChange={setEmailEnabled}
              trackColor={{ false: '#E5E7EB', true: '#4F7EFF' }}
              thumbColor={Platform.OS === 'ios' ? undefined : '#FFFFFF'}
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>SMS Notifications</Text>
            <Switch
              value={smsEnabled}
              onValueChange={setSmsEnabled}
              trackColor={{ false: '#E5E7EB', true: '#4F7EFF' }}
              thumbColor={Platform.OS === 'ios' ? undefined : '#FFFFFF'}
            />
          </View>
        </View>

        {/* SAVE BUTTON */}
        <TouchableOpacity style={styles.saveBtn} activeOpacity={0.85} onPress={handleSave}>
          <Text style={styles.saveBtnTxt}>Save Preferences</Text>
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
  
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: 44 },
  switchLabel: { fontFamily: FONTS.medium, fontSize: 13.5, color: '#374151' },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 10 },

  saveBtn: { backgroundColor: '#4F7EFF', borderRadius: 20, height: 50, justifyContent: 'center', alignItems: 'center', marginTop: 14 },
  saveBtnTxt: { fontFamily: FONTS.bold, fontSize: 14, color: '#FFFFFF' },
});
