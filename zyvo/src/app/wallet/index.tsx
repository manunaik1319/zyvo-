import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { FONTS } from '../../constants/fonts';

export default function WalletIndex() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Wallet</Text>
        <View style={styles.placeholder} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceAmount}>₹750.00</Text>
          <View style={styles.row}>
            <TouchableOpacity style={styles.btnSecondary} onPress={() => router.push('/wallet/history')}>
              <Feather name="list" size={18} color={COLORS.primary} style={{ marginRight: 6 }} />
              <Text style={styles.btnSecondaryText}>History</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnPrimary}>
              <Feather name="plus" size={18} color="#FFF" style={{ marginRight: 6 }} />
              <Text style={styles.btnPrimaryText}>Add Funds</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Quick Top-Up</Text>
        <View style={styles.quickTopupRow}>
          {['₹100', '₹200', '₹500', '₹1000'].map((amount) => (
            <TouchableOpacity key={amount} style={styles.amountChip}>
              <Text style={styles.amountText}>{amount}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Payment Methods</Text>
        <View style={styles.paymentCard}>
          <Feather name="credit-card" size={24} color={COLORS.textSecondary} />
          <Text style={styles.paymentName}>Stanford Student Card</Text>
          <Text style={styles.paymentStatus}>Primary</Text>
        </View>
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
  balanceCard: { backgroundColor: COLORS.textPrimary, padding: 24, borderRadius: 24, marginBottom: 24 },
  balanceLabel: { fontFamily: FONTS.medium, fontSize: 14, color: 'rgba(255, 255, 255, 0.7)', marginBottom: 4 },
  balanceAmount: { fontFamily: FONTS.bold, fontSize: 36, color: '#FFF', marginBottom: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  btnSecondary: { flex: 1, height: 44, borderRadius: 22, backgroundColor: '#FFF', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  btnSecondaryText: { fontFamily: FONTS.bold, fontSize: 14, color: COLORS.primary },
  btnPrimary: { flex: 1, height: 44, borderRadius: 22, backgroundColor: COLORS.primary, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  btnPrimaryText: { fontFamily: FONTS.bold, fontSize: 14, color: '#FFF' },
  sectionTitle: { fontFamily: FONTS.bold, fontSize: 18, color: COLORS.textPrimary, marginBottom: 12 },
  quickTopupRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  amountChip: { flex: 1, height: 40, borderRadius: 20, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, justifyContent: 'center', alignItems: 'center', marginHorizontal: 4 },
  amountText: { fontFamily: FONTS.semiBold, fontSize: 14, color: COLORS.textPrimary },
  paymentCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border },
  paymentName: { flex: 1, fontFamily: FONTS.medium, fontSize: 15, color: COLORS.textPrimary, marginLeft: 12 },
  paymentStatus: { fontFamily: FONTS.regular, fontSize: 12, color: COLORS.textMuted },
});
