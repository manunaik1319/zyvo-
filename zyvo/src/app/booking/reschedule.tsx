import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, StatusBar, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { FONTS } from '../../constants/fonts';

const TIMESLOTS = [
  { id: '1', time: '10:00 AM – 1:00 PM', available: true },
  { id: '2', time: '1:00 PM – 4:00 PM', available: true },
  { id: '3', time: '4:00 PM – 7:00 PM', available: false },
  { id: '4', time: '7:00 PM – 10:00 PM', available: true },
];

export default function BookingReschedule() {
  const router = useRouter();
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reschedule Booking</Text>
        <View style={styles.placeholder} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Select New Time Slot</Text>
        {TIMESLOTS.map((slot) => (
          <TouchableOpacity
            key={slot.id}
            disabled={!slot.available}
            onPress={() => setSelectedSlot(slot.id)}
            style={[
              styles.slotRow,
              !slot.available && styles.disabledRow,
              selectedSlot === slot.id && styles.selectedRow,
            ]}
          >
            <Text style={[styles.slotTime, !slot.available && styles.disabledText]}>{slot.time}</Text>
            {!slot.available && <Text style={styles.soldoutText}>Sold Out</Text>}
          </TouchableOpacity>
        ))}

        <TouchableOpacity disabled={!selectedSlot} style={[styles.btnReschedule, !selectedSlot && styles.btnDisabled]}>
          <Text style={styles.btnText}>Confirm Reschedule</Text>
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
  placeholder: { width: 32 },
  content: { padding: 16 },
  sectionTitle: { fontFamily: FONTS.bold, fontSize: 16, color: COLORS.textPrimary, marginBottom: 16 },
  slotRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.card, padding: 18, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, marginBottom: 12 },
  disabledRow: { backgroundColor: '#F3F4F6' },
  selectedRow: { borderColor: COLORS.primary, borderWidth: 2 },
  slotTime: { fontFamily: FONTS.bold, fontSize: 15, color: COLORS.textPrimary },
  disabledText: { color: COLORS.textMuted },
  soldoutText: { fontFamily: FONTS.bold, fontSize: 12, color: COLORS.error },
  btnReschedule: { marginTop: 40, height: 48, borderRadius: 24, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  btnDisabled: { backgroundColor: '#93C5FD' },
  btnText: { fontFamily: FONTS.bold, fontSize: 16, color: '#FFF' },
});
