import React, { useRef, useEffect } from 'react';
import {
  StyleSheet, Text, View, ScrollView, Image,
  TouchableOpacity, StatusBar, Alert, Animated, Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FONTS } from '../../constants/fonts';
import { useAuthStore } from '../../store/authStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PROFILE_COMPLETION = 72;

export default function Profile() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuthStore();
  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 380, useNativeDriver: true }),
      Animated.timing(progressAnim, { toValue: PROFILE_COMPLETION / 100, duration: 900, delay: 300, useNativeDriver: false }),
    ]).start();
  }, []);

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: () => { logout(); router.replace('/(auth)/login' as any); } },
    ]);
  };

  const progressWidth = progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  const STATS = [
    { icon: 'clock', value: '24', label: 'Hrs Studied' },
    { icon: 'calendar', value: '8', label: 'Bookings' },
    { icon: 'heart', value: '5', label: 'Saved' },
  ];

  const QUICK_ACCESS = [
    { icon: 'calendar', label: 'My Bookings', desc: 'View all your bookings', route: '/(tabs)/bookings' },
    { icon: 'heart', label: 'Saved Spaces', desc: 'Your favourite spaces', route: '/favorites/index' as any },
  ];

  const ACCOUNT_ITEMS = [
    { icon: 'user', label: 'Edit Profile', desc: 'Update your info', route: '/profile/edit' },
    { icon: 'bell', label: 'Notifications', desc: 'Alerts & reminders', route: '/notifications' },
    { icon: 'database', label: 'My Wallet', desc: 'Balance & top-up history', route: '/wallet/index' as any },
    { icon: 'x-circle', label: 'Cancellation History', desc: 'Refunds & cancelled bookings', route: '/bookings/cancellation-history' },
    { icon: 'credit-card', label: 'Payment Methods', desc: 'Cards & UPI', route: '/settings/payments' },
    { icon: 'lock', label: 'Privacy & Security', desc: 'Password, 2FA', route: '/settings/security' },
    { icon: 'help-circle', label: 'Help & Support', desc: 'FAQ & contact', route: '/settings/support' },
  ];

  const MORE_ITEMS = [
    { icon: 'info', label: 'About Zyvo', route: '/settings/about' },
    { icon: 'file-text', label: 'Privacy Policy', route: '/legal/privacy-policy' },
    { icon: 'file', label: 'Terms & Conditions', route: '/legal/terms' },
    { icon: 'star', label: 'Rate App', route: '/rate' },
    { icon: 'share-2', label: 'Share App', route: '/share' },
  ];

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <Animated.View style={[{ flex: 1 }, { opacity: fadeAnim }]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, { paddingTop: (insets.top || 20) + 12, paddingBottom: 120 }]}
        >
          {/* HEADER */}
          <View style={styles.header}>
            <Text style={styles.pageTitle}>Profile</Text>
            <TouchableOpacity style={styles.settingsBtn} activeOpacity={0.7} onPress={() => router.push('/settings' as any)}>
              <Feather name="settings" size={20} color="#374151" />
            </TouchableOpacity>
          </View>

          {/* PROFILE CARD */}
          <View style={styles.profileCard}>
            <View style={styles.avatarWrapper}>
              <Image
                source={{ uri: user?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop' }}
                style={styles.avatar}
              />
              <View style={styles.avatarOnlineDot} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{user?.name || 'Manohar Naik'}</Text>
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={13} color="#10B981" />
                <Text style={styles.verifiedText}>Verified Student</Text>
              </View>
              <Text style={styles.collegeText}>IIIT Sonepat · Computer Science</Text>
            </View>
            <TouchableOpacity style={styles.editBtn} activeOpacity={0.8} onPress={() => router.push('/profile/edit' as any)}>
              <Feather name="edit-2" size={13} color="#5B5CEB" />
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
          </View>

          {/* PROFILE COMPLETION */}
          <View style={styles.completionCard}>
            <View style={styles.completionHeader}>
              <View>
                <Text style={styles.completionTitle}>Profile {PROFILE_COMPLETION}% complete</Text>
                <Text style={styles.completionDesc}>Complete your profile for better recommendations</Text>
              </View>
              <TouchableOpacity style={styles.completionCta} activeOpacity={0.85} onPress={() => router.push('/profile/edit' as any)}>
                <Text style={styles.completionCtaText}>Complete</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.progressTrack}>
              <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
            </View>
          </View>

          {/* STUDY STATS */}
          <View style={styles.statsRow}>
            {STATS.map((stat, i) => (
              <View key={i} style={styles.statCard}>
                <Feather name={stat.icon as any} size={18} color="#5B5CEB" style={{ marginBottom: 8 }} />
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>

          {/* QUICK ACCESS */}
          <Text style={styles.sectionHeading}>Quick Access</Text>
          <View style={styles.card}>
            {QUICK_ACCESS.map((item, i) => (
              <TouchableOpacity key={i} style={[styles.listRow, i < QUICK_ACCESS.length - 1 && styles.listRowBorder]} activeOpacity={0.7} onPress={() => router.push(item.route as any)}>
                <View style={styles.listIconBox}>
                  <Feather name={item.icon as any} size={17} color="#5B5CEB" />
                </View>
                <View style={styles.listContent}>
                  <Text style={styles.listLabel}>{item.label}</Text>
                  <Text style={styles.listDesc}>{item.desc}</Text>
                </View>
                <Feather name="chevron-right" size={16} color="#D1D5DB" />
              </TouchableOpacity>
            ))}
          </View>

          {/* ACCOUNT */}
          <Text style={styles.sectionHeading}>Account</Text>
          <View style={styles.card}>
            {ACCOUNT_ITEMS.map((item, i) => (
              <TouchableOpacity key={i} style={[styles.listRow, i < ACCOUNT_ITEMS.length - 1 && styles.listRowBorder]} activeOpacity={0.7} onPress={() => router.push(item.route as any)}>
                <View style={styles.listIconBox}>
                  <Feather name={item.icon as any} size={17} color="#6B7280" />
                </View>
                <View style={styles.listContent}>
                  <Text style={styles.listLabel}>{item.label}</Text>
                  <Text style={styles.listDesc}>{item.desc}</Text>
                </View>
                <Feather name="chevron-right" size={16} color="#D1D5DB" />
              </TouchableOpacity>
            ))}
          </View>

          {/* MORE */}
          <Text style={styles.sectionHeading}>More</Text>
          <View style={styles.card}>
            {MORE_ITEMS.map((item, i) => (
              <TouchableOpacity key={i} style={[styles.listRow, styles.listRowBorder]} activeOpacity={0.7} onPress={() => router.push(item.route as any)}>
                <View style={styles.listIconBox}>
                  <Feather name={item.icon as any} size={17} color="#6B7280" />
                </View>
                <Text style={[styles.listLabel, { flex: 1 }]}>{item.label}</Text>
                <Feather name="chevron-right" size={16} color="#D1D5DB" />
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.listRow} activeOpacity={0.7} onPress={handleLogout}>
              <View style={[styles.listIconBox, { backgroundColor: '#FEF2F2' }]}>
                <Feather name="log-out" size={17} color="#EF4444" />
              </View>
              <Text style={[styles.listLabel, { flex: 1, color: '#EF4444' }]}>Log Out</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.versionText}>ZYVO v1.0.0 · Made with love for students</Text>
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  pageTitle: { fontFamily: FONTS.bold, fontSize: 28, color: '#111827', letterSpacing: -0.5 },
  settingsBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', shadowColor: '#111827', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  profileCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, flexDirection: 'row', alignItems: 'center', marginBottom: 16, shadowColor: '#111827', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 16, elevation: 3 },
  avatarWrapper: { position: 'relative', marginRight: 16 },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#E5E7EB', borderWidth: 3, borderColor: '#EEF2FF' },
  avatarOnlineDot: { position: 'absolute', bottom: 2, right: 2, width: 14, height: 14, borderRadius: 7, backgroundColor: '#10B981', borderWidth: 2, borderColor: '#FFFFFF' },
  profileInfo: { flex: 1 },
  userName: { fontFamily: FONTS.bold, fontSize: 18, color: '#111827', letterSpacing: -0.3, marginBottom: 4 },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  verifiedText: { fontFamily: FONTS.medium, fontSize: 12, color: '#10B981' },
  collegeText: { fontFamily: FONTS.regular, fontSize: 12, color: '#6B7280' },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#EEF2FF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  editBtnText: { fontFamily: FONTS.bold, fontSize: 12, color: '#5B5CEB' },
  completionCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 18, marginBottom: 16, shadowColor: '#111827', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 2 },
  completionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  completionTitle: { fontFamily: FONTS.bold, fontSize: 14, color: '#111827', marginBottom: 3 },
  completionDesc: { fontFamily: FONTS.regular, fontSize: 12, color: '#6B7280', maxWidth: SCREEN_WIDTH * 0.5 },
  completionCta: { backgroundColor: '#5B5CEB', paddingHorizontal: 16, paddingVertical: 9, borderRadius: 12 },
  completionCtaText: { fontFamily: FONTS.bold, fontSize: 12, color: '#FFFFFF' },
  progressTrack: { height: 6, backgroundColor: '#EEF2FF', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#5B5CEB', borderRadius: 3 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  statCard: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 18, paddingVertical: 18, alignItems: 'center', shadowColor: '#111827', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 2 },
  statValue: { fontFamily: FONTS.bold, fontSize: 22, color: '#111827', marginBottom: 3 },
  statLabel: { fontFamily: FONTS.medium, fontSize: 11, color: '#6B7280' },
  sectionHeading: { fontFamily: FONTS.bold, fontSize: 16, color: '#111827', marginBottom: 12, marginTop: 4 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 20, marginBottom: 24, shadowColor: '#111827', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 2, overflow: 'hidden' },
  listRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 14, gap: 14 },
  listRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  listIconBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#F9FAFB', alignItems: 'center', justifyContent: 'center' },
  listContent: { flex: 1 },
  listLabel: { fontFamily: FONTS.bold, fontSize: 14, color: '#111827' },
  listDesc: { fontFamily: FONTS.regular, fontSize: 12, color: '#9CA3AF', marginTop: 1 },
  versionText: { fontFamily: FONTS.regular, fontSize: 12, color: '#9CA3AF', textAlign: 'center', marginBottom: 8 },
});
