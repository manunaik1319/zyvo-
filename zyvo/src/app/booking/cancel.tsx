import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, StatusBar, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { FONTS } from '../../constants/fonts';

const REASONS = [
  'Change of plans',
  'Found a better study location',
  'Class schedule conflict',
  'Booked incorrect date/time slot',
  'Other reasons',
];

export default function BookingCancel() {
  const router = useRouter();
  const [selectedReason, setSelectedReason] = useState<string | null>(null);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cancel Booking</Text>
        <View style={styles.placeholder} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.warningBox}>
          <Ionicons name="warning" size={24} color="#D97706" style={{ marginRight: 12 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.warningTitle}>Cancellation Policy</Text>
            <Text style={styles.warningDesc}>Free cancellations are allowed up to 1 hour before scheduled start time.</Text>
          </View>
        </View>

        <Text style={styles.title}>Please select a cancellation reason:</Text>
        {REASONS.map((r) => (
          <TouchableOpacity key={r} onPress={() => setSelectedReason(r)} style={styles.reasonRow}>
            <Ionicons
              name={selectedReason === r ? 'radio-button-on' : 'radio-button-off'}
              size={20}
              color={selectedReason === r ? COLORS.primary : COLORS.textMuted}
              style={{ marginRight: 12 }}
            />
            <Text style={styles.reasonText}>{r}</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity disabled={!selectedReason} style={[styles.btnCancel, !selectedReason && styles.btnDisabled]}>
          <Text style={styles.btnText}>Confirm Cancellation</Text>
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
  warningBox: { flexDirection: 'row', backgroundColor: '#FEF3C7', padding: 16, borderRadius: 16, marginBottom: 24 },
  warningTitle: { fontFamily: FONTS.bold, fontSize: 15, color: '#92400E', marginBottom: 2 },
  warningDesc: { fontFamily: FONTS.regular, fontSize: 13, color: '#B45309', lineHeight: 18 },
  title: { fontFamily: FONTS.bold, fontSize: 16, color: COLORS.textPrimary, marginBottom: 16 },
  reasonRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  reasonText: { fontFamily: FONTS.medium, fontSize: 15, color: COLORS.textPrimary },
  btnCancel: { marginTop: 40, height: 48, borderRadius: 24, backgroundColor: COLORS.error, justifyContent: 'center', alignItems: 'center' },
  btnDisabled: { backgroundColor: '#FCA5A5' },
  btnText: { fontFamily: FONTS.bold, fontSize: 16, color: '#FFF' },
});
