import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { FONTS } from '../../constants/fonts';

export default function LegalTerms() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms of Service</Text>
        <View style={styles.placeholder} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.para}>
          By installing and utilizing ZYVO, you agree to comply with our general user terms of usage.
        </Text>
        <Text style={styles.subtitle}>1. Eligibility & Accounts</Text>
        <Text style={styles.para}>
          You must keep credentials secure. Student pricing categories require authentic active verification emails.
        </Text>
        <Text style={styles.subtitle}>2. Conduct & Space Rules</Text>
        <Text style={styles.para}>
          Users must maintain silence guidelines at partner library spaces. Damage to workspace furniture will result in account penalties.
        </Text>
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
  content: { padding: 20 },
  subtitle: { fontFamily: FONTS.bold, fontSize: 16, color: COLORS.textPrimary, marginTop: 20, marginBottom: 8 },
  para: { fontFamily: FONTS.regular, fontSize: 14, color: COLORS.textSecondary, lineHeight: 22, marginBottom: 12 },
});
