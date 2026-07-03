import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Linking,
  Share,
  Dimensions,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { FONTS } from '../../constants/fonts';

const FEATURES = [
  { name: 'Smart Search', desc: 'Find relevant study halls instantly', icon: 'search' },
  { name: 'Live Availability', desc: 'Real-time countdown occupancy stats', icon: 'users' },
  { name: 'QR Check-in', desc: 'Easy scanned arrivals at entrance desk', icon: 'qr-code-outline' },
  { name: 'Easy Booking', desc: 'Frictionless checkouts in seconds', icon: 'calendar' },
  { name: 'Reviews', desc: 'Verified peer ratings and reviews', icon: 'star' },
  { name: 'Secure Payments', desc: 'Stripe encrypted checkout flow', icon: 'lock' },
];

export default function AboutSettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleShare = async () => {
    try {
      await Share.share({
        message: 'Join ZYVO and reserve premium, quiet study spaces and coworking seats near your university!',
      });
    } catch (e) {
      console.log(e);
    }
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
          <Text style={styles.headerTitle}>About ZYVO</Text>
          <Text style={styles.headerSubtitle}>App information and mission</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
        {/* LOGO BOX */}
        <View style={styles.logoSection}>
          <Image source={require('../../../assets/images/icon.png')} style={styles.logoImage} />
          <Text style={styles.appName}>ZYVO</Text>
          <Text style={styles.tagline}>Discover & Book Premium Study Spaces</Text>
          <Text style={styles.appVer}>Version 1.0.4 (Build 248)</Text>
        </View>

        {/* MISSION SECTION */}
        <Text style={styles.sectionTitle}>Our Mission</Text>
        <View style={styles.missionCard}>
          <Text style={styles.missionText}>
            "Helping students discover and book the best study spaces effortlessly."
          </Text>
        </View>

        {/* FEATURES GRID */}
        <Text style={styles.sectionTitle}>Key Features</Text>
        <View style={styles.featuresGrid}>
          {FEATURES.map((feat) => {
            const isFeather = feat.icon !== 'QR Check-in' && feat.icon !== 'qr-code-outline';
            return (
              <View key={feat.name} style={styles.featureCard}>
                <View style={styles.featIconBox}>
                  {isFeather ? (
                    <Feather name={feat.icon as any} size={15} color="#4F7EFF" />
                  ) : (
                    <Ionicons name={feat.icon as any} size={15} color="#4F7EFF" />
                  )}
                </View>
                <Text style={styles.featName}>{feat.name}</Text>
                <Text style={styles.featDesc}>{feat.desc}</Text>
              </View>
            );
          })}
        </View>

        {/* QUICK ACTIONS */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.row} onPress={() => Linking.openURL('https://zyvoapp.com')} activeOpacity={0.8}>
            <View style={styles.rowLeft}>
              <Feather name="globe" size={15} color="#4F7EFF" style={{ marginRight: 10 }} />
              <Text style={styles.rowLabel}>Visit Website</Text>
            </View>
            <Feather name="chevron-right" size={14} color="#D1D5DB" />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.row} onPress={handleShare} activeOpacity={0.8}>
            <View style={styles.rowLeft}>
              <Feather name="share-2" size={15} color="#4F7EFF" style={{ marginRight: 10 }} />
              <Text style={styles.rowLabel}>Share App</Text>
            </View>
            <Feather name="chevron-right" size={14} color="#D1D5DB" />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.row} activeOpacity={0.8}>
            <View style={styles.rowLeft}>
              <Feather name="star" size={15} color="#4F7EFF" style={{ marginRight: 10 }} />
              <Text style={styles.rowLabel}>Rate App</Text>
            </View>
            <Feather name="chevron-right" size={14} color="#D1D5DB" />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.row} onPress={() => router.push('/settings/contact-support' as any)} activeOpacity={0.8}>
            <View style={styles.rowLeft}>
              <Feather name="message-square" size={15} color="#4F7EFF" style={{ marginRight: 10 }} />
              <Text style={styles.rowLabel}>Contact Us</Text>
            </View>
            <Feather name="chevron-right" size={14} color="#D1D5DB" />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.row} onPress={() => router.push('/legal/privacy-policy' as any)} activeOpacity={0.8}>
            <View style={styles.rowLeft}>
              <Feather name="lock" size={15} color="#4F7EFF" style={{ marginRight: 10 }} />
              <Text style={styles.rowLabel}>Privacy Policy</Text>
            </View>
            <Feather name="chevron-right" size={14} color="#D1D5DB" />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.row} onPress={() => router.push('/legal/terms' as any)} activeOpacity={0.8}>
            <View style={styles.rowLeft}>
              <Feather name="file-text" size={15} color="#4F7EFF" style={{ marginRight: 10 }} />
              <Text style={styles.rowLabel}>Terms & Conditions</Text>
            </View>
            <Feather name="chevron-right" size={14} color="#D1D5DB" />
          </TouchableOpacity>
        </View>

        {/* FOOTER */}
        <View style={styles.footerSection}>
          <Text style={styles.footerLove}>Made with ❤️ for Students</Text>
          <Text style={styles.footerCopy}>Copyright © 2026 Zyvo</Text>
        </View>
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

  logoSection: { alignItems: 'center', marginVertical: 32 },
  logoImage: { width: 80, height: 80, borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0' },
  appName: { fontFamily: FONTS.bold, fontSize: 22, color: '#111827', marginTop: 14 },
  tagline: { fontFamily: FONTS.medium, fontSize: 13, color: '#6B7280', marginTop: 6, textAlign: 'center' },
  appVer: { fontFamily: FONTS.medium, fontSize: 11, color: '#9CA3AF', marginTop: 4 },

  sectionTitle: { fontFamily: FONTS.bold, fontSize: 13, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 18, marginBottom: 10, paddingHorizontal: 4 },
  
  missionCard: { backgroundColor: '#F0FDF4', borderRadius: 20, padding: 16, borderLeftWidth: 4, borderColor: '#22C55E' },
  missionText: { fontFamily: FONTS.bold, fontSize: 13.5, color: '#166534', lineHeight: 20 },

  featuresGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 2 },
  featureCard: { width: (Dimensions.get('window').width - 50) / 2, backgroundColor: '#FFFFFF', borderRadius: 20, padding: 14, borderWidth: 1, borderColor: '#E8EEF8' },
  featIconBox: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  featName: { fontFamily: FONTS.bold, fontSize: 13.5, color: '#111827' },
  featDesc: { fontFamily: FONTS.medium, fontSize: 11.5, color: '#6B7280', marginTop: 4, lineHeight: 16 },

  card: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 16, marginTop: 4, borderWidth: 1, borderColor: '#E8EEF8' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: 44 },
  rowLeft: { flexDirection: 'row', alignItems: 'center' },
  rowLabel: { fontFamily: FONTS.medium, fontSize: 13.5, color: '#374151' },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 8 },

  footerSection: { alignItems: 'center', marginVertical: 32 },
  footerLove: { fontFamily: FONTS.bold, fontSize: 13, color: '#374151' },
  footerCopy: { fontFamily: FONTS.medium, fontSize: 11.5, color: '#9CA3AF', marginTop: 6 },
});
