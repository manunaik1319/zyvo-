import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { FONTS } from '../../constants/fonts';

export default function LegalPrivacyPolicy() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={styles.placeholder} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.para}>
          Last updated: June 29, 2026. ZYVO ("we", "us", or "our") operates the mobile focus space reservation platform. We respect your privacy and protect personal credentials.
        </Text>
        <Text style={styles.subtitle}>1. Information We Collect</Text>
        <Text style={styles.para}>
          We collect account registration data (name, email, university details) and device location telemetry (GPS coordinates) to recommend nearby study centers.
        </Text>
        <Text style={styles.subtitle}>2. Data Usage</Text>
        <Text style={styles.para}>
          Your location data is only processed while finding close libraries or cabins and is never shared with third-party advertising companies.
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
