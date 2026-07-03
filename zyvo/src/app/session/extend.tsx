import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, StatusBar, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { FONTS } from '../../constants/fonts';

export default function SessionExtend() {
  const router = useRouter();
  const [hours, setHours] = useState(1);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Extend Session</Text>
        <View style={styles.placeholder} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.durationCard}>
          <Text style={styles.cardLabel}>Choose Extra Time</Text>
          <View style={styles.stepper}>
            <TouchableOpacity onPress={() => setHours(Math.max(1, hours - 1))} style={styles.stepBtn}>
              <Text style={styles.stepBtnText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.hoursText}>{hours} hour{hours > 1 ? 's' : ''}</Text>
            <TouchableOpacity onPress={() => setHours(hours + 1)} style={styles.stepBtn}>
              <Text style={styles.stepBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.costBox}>
          <Text style={styles.costLabel}>Total Cost</Text>
          <Text style={styles.costValue}>₹{hours * 70}.00</Text>
        </View>

        <TouchableOpacity onPress={() => router.back()} style={styles.btnConfirm}>
          <Text style={styles.btnText}>Pay & Confirm Extension</Text>
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
  durationCard: { backgroundColor: COLORS.card, padding: 24, borderRadius: 24, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', marginBottom: 24 },
  cardLabel: { fontFamily: FONTS.bold, fontSize: 16, color: COLORS.textPrimary, marginBottom: 16 },
  stepper: { flexDirection: 'row', alignItems: 'center' },
  stepBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center' },
  stepBtnText: { fontFamily: FONTS.bold, fontSize: 20, color: COLORS.primary },
  hoursText: { fontFamily: FONTS.bold, fontSize: 18, color: COLORS.textPrimary, marginHorizontal: 24 },
  costBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border, marginBottom: 40 },
  costLabel: { fontFamily: FONTS.bold, fontSize: 16, color: COLORS.textPrimary },
  costValue: { fontFamily: FONTS.bold, fontSize: 20, color: COLORS.primary },
  btnConfirm: { height: 48, borderRadius: 24, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  btnText: { fontFamily: FONTS.bold, fontSize: 16, color: '#FFF' },
});
