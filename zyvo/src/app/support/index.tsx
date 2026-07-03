import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { FONTS } from '../../constants/fonts';

export default function SupportIndex() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Support Center</Text>
        <View style={styles.placeholder} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.headline}>How can we help you today?</Text>

        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/support/faq')}>
          <Feather name="help-circle" size={22} color={COLORS.primary} style={styles.icon} />
          <Text style={styles.menuText}>Read FAQs</Text>
          <Feather name="chevron-right" size={18} color={COLORS.textMuted} />
        </TouchableOpacity>




        <View style={styles.contactCard}>
          <Text style={styles.contactTitle}>Emergency Support</Text>
          <Text style={styles.contactDesc}>Locked out of a focus cabin or having checkout billing issues?</Text>
          <TouchableOpacity style={styles.btnChat}>
            <Text style={styles.btnChatText}>Chat with Us Live</Text>
          </TouchableOpacity>
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
  headline: { fontFamily: FONTS.bold, fontSize: 20, color: COLORS.textPrimary, marginBottom: 20 },
  menuItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  icon: { marginRight: 12 },
  menuText: { flex: 1, fontFamily: FONTS.medium, fontSize: 15, color: COLORS.textPrimary },
  contactCard: { backgroundColor: COLORS.card, padding: 20, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, marginTop: 12, alignItems: 'center' },
  contactTitle: { fontFamily: FONTS.bold, fontSize: 16, color: COLORS.textPrimary, marginBottom: 4 },
  contactDesc: { fontFamily: FONTS.regular, fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 16 },
  btnChat: { height: 40, paddingHorizontal: 24, borderRadius: 20, backgroundColor: COLORS.primary, justifyContent: 'center' },
  btnChatText: { fontFamily: FONTS.bold, fontSize: 14, color: '#FFF' },
});
