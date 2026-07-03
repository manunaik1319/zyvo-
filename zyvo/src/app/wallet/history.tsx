import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { FONTS } from '../../constants/fonts';

const MOCK_TRANSACTIONS = [
  { id: '1', desc: 'Paid for Booking ZYV-003184', type: 'debit', amount: '-₹315', date: 'June 29, 2026' },
  { id: '2', desc: 'Wallet Topup via UPI', type: 'credit', amount: '+₹500', date: 'June 25, 2026' },
  { id: '3', desc: 'Paid for Booking ZYV-002910', type: 'debit', amount: '-₹280', date: 'June 18, 2026' },
  { id: '4', desc: 'Refund ZYV-002415', type: 'credit', amount: '+₹210', date: 'June 05, 2026' },
];

export default function WalletHistory() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transaction History</Text>
        <View style={styles.placeholder} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {MOCK_TRANSACTIONS.map((tx) => (
          <View key={tx.id} style={styles.txRow}>
            <View style={styles.txLeft}>
              <Text style={styles.txDesc}>{tx.desc}</Text>
              <Text style={styles.txDate}>{tx.date}</Text>
            </View>
            <Text style={[styles.txAmount, tx.type === 'credit' ? styles.creditText : styles.debitText]}>
              {tx.amount}
            </Text>
          </View>
        ))}
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
  txRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  txLeft: { flex: 1 },
  txDesc: { fontFamily: FONTS.semiBold, fontSize: 15, color: COLORS.textPrimary, marginBottom: 4 },
  txDate: { fontFamily: FONTS.regular, fontSize: 12, color: COLORS.textMuted },
  txAmount: { fontFamily: FONTS.bold, fontSize: 16 },
  creditText: { color: COLORS.success },
  debitText: { color: COLORS.error },
});
