import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
  Animated,
  Modal,
  Vibration,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../store/authStore';
import { FONTS } from '../../constants/fonts';

interface SettingRowProps {
  icon: string;
  title: string;
  value?: string;
  onPress: () => void;
  showChevron?: boolean;
}

const SettingRow: React.FC<SettingRowProps> = ({ icon, title, value, onPress, showChevron = true }) => (
  <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
    <View style={styles.rowLeft}>
      <View style={styles.iconContainer}>
        <Feather name={icon as any} size={15} color="#4F46E5" />
      </View>
      <Text style={styles.rowTitle}>{title}</Text>
    </View>
    <View style={styles.rowRight}>
      {value && <Text style={styles.rowValue}>{value}</Text>}
      {showChevron && <Feather name="chevron-right" size={14} color="#D1D5DB" style={{ marginLeft: 6 }} />}
    </View>
  </TouchableOpacity>
);

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuthStore();

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Animations
  const contentFade = useRef(new Animated.Value(0)).current;
  const modalScale = useRef(new Animated.Value(0.85)).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(contentFade, { toValue: 1, duration: 450, useNativeDriver: true }).start();
  }, []);

  const triggerLogoutModal = () => {
    setShowLogoutConfirm(true);
    if (Platform.OS !== 'web') {
      Vibration.vibrate(15);
    }
    Animated.parallel([
      Animated.timing(modalOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.spring(modalScale, { toValue: 1, friction: 6, tension: 120, useNativeDriver: true }),
    ]).start();
  };

  const cancelLogout = () => {
    Animated.parallel([
      Animated.timing(modalOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(modalScale, { toValue: 0.9, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      setShowLogoutConfirm(false);
    });
  };

  const confirmLogout = () => {
    cancelLogout();
    logout();
    router.replace('/(auth)/login' as any);
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
          <Text style={styles.headerTitle}>Settings</Text>
          <Text style={styles.headerSubtitle}>Manage your account and preferences</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollBody}
      >
        <Animated.View style={{ opacity: contentFade }}>
          
          {/* ACCOUNT CARD */}
          <TouchableOpacity
            style={[styles.card, styles.accountCard]}
            activeOpacity={0.9}
            onPress={() => router.push('/profile/edit' as any)}
          >
            <Image
              source={{ uri: user?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop' }}
              style={styles.avatar}
            />
            <View style={styles.accountInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.accountName}>{user?.name || 'Manohar Naik'}</Text>
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={12} color="#22C55E" style={{ marginRight: 2 }} />
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              </View>
              <Text style={styles.collegeText}>IIIT Sonepat · Computer Science</Text>
            </View>
            <Feather name="chevron-right" size={16} color="#D1D5DB" />
          </TouchableOpacity>

          {/* ACCOUNT SETTINGS GROUP */}
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.card}>
            <SettingRow icon="user" title="Edit Profile" onPress={() => router.push('/profile/edit' as any)} />
            <View style={styles.rowDivider} />
            <SettingRow icon="credit-card" title="Payment Methods" onPress={() => router.push('/settings/payments' as any)} />
            <View style={styles.rowDivider} />
            <SettingRow icon="compass" title="Study Preferences" onPress={() => router.push('/settings/preferences' as any)} />
          </View>

          {/* PREFERENCES */}
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.card}>
            <SettingRow icon="bell" title="Notifications" onPress={() => router.push('/settings/notifications' as any)} />
            <View style={styles.rowDivider} />
            <SettingRow icon="moon" title="Appearance" value="Light Mode" onPress={() => router.push('/settings/appearance' as any)} />
            <View style={styles.rowDivider} />
            <SettingRow icon="globe" title="Language" value="English" onPress={() => router.push('/settings/language' as any)} />
          </View>

          {/* PRIVACY & SECURITY */}
          <Text style={styles.sectionTitle}>Privacy & Security</Text>
          <View style={styles.card}>
            <SettingRow icon="shield" title="Privacy Settings" onPress={() => router.push('/settings/security' as any)} />
            <View style={styles.rowDivider} />
            <SettingRow icon="eye" title="Biometric Login" onPress={() => router.push('/settings/security' as any)} />
          </View>

          {/* SUPPORT */}
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.card}>
            <SettingRow icon="help-circle" title="Help Center" onPress={() => router.push('/settings/support' as any)} />
            <View style={styles.rowDivider} />
            <SettingRow icon="message-square" title="Contact Support" onPress={() => router.push('/settings/contact-support' as any)} />
            <View style={styles.rowDivider} />
            <SettingRow icon="alert-triangle" title="Report a Problem" onPress={() => router.push('/settings/report-problem' as any)} />
          </View>

          {/* ABOUT */}
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.card}>
            <SettingRow icon="info" title="About Zyvo" onPress={() => router.push('/settings/about' as any)} />
            <View style={styles.rowDivider} />
            <SettingRow icon="lock" title="Privacy Policy" onPress={() => router.push('/legal/privacy-policy' as any)} />
            <View style={styles.rowDivider} />
            <SettingRow icon="file" title="Terms & Conditions" onPress={() => router.push('/legal/terms' as any)} />
            <View style={styles.rowDivider} />
            <SettingRow icon="cpu" title="App Version" value="v1.0.4" onPress={() => {}} showChevron={false} />
          </View>

          {/* LOGOUT */}
          <TouchableOpacity style={styles.logoutBtn} activeOpacity={0.8} onPress={triggerLogoutModal}>
            <Feather name="log-out" size={16} color="#EF4444" style={{ marginRight: 8 }} />
            <Text style={styles.logoutBtnTxt}>Logout</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

      {/* PREMIUM LOGOUT CONFIRMATION MODAL */}
      <Modal visible={showLogoutConfirm} transparent animationType="none">
        <View style={styles.modalBg}>
          <Animated.View style={[styles.modalCard, { opacity: modalOpacity, transform: [{ scale: modalScale }] }]}>
            {/* Friendly logout icon inside soft orange warning circle */}
            <View style={styles.logoutIconBox}>
              <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.logoutIconGrad}>
                <Ionicons name="log-out-outline" size={24} color="#FFFFFF" />
              </LinearGradient>
            </View>

            <Text style={styles.modalTitle}>Log Out?</Text>
            <Text style={styles.modalDesc}>Are you sure you want to log out?{'\n'}You can sign back in anytime.</Text>

            {/* BUTTONS */}
            <View style={{ width: '100%', gap: 10 }}>
              <TouchableOpacity style={styles.modalPrimaryBtn} onPress={confirmLogout} activeOpacity={0.85}>
                <Text style={styles.modalPrimaryBtnTxt}>Log Out</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSecondaryBtn} onPress={cancelLogout} activeOpacity={0.8}>
                <Text style={styles.modalSecondaryBtnTxt}>Stay Logged In</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFFFF' },

  // Header styles
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 14, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  backBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#F1F5F9' },
  headerTitle: { fontFamily: FONTS.bold, fontSize: 18, color: '#0F172A', fontWeight: 'bold' },
  headerSubtitle: { fontFamily: FONTS.medium, fontSize: 12, color: '#64748B', marginTop: 1 },

  scrollBody: { paddingHorizontal: 20, paddingBottom: 60 },

  // Grouped cards layout
  card: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 10, marginBottom: 14, borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#0F172A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 8, elevation: 1 },

  // Account row profile card
  accountCard: { flexDirection: 'row', alignItems: 'center', padding: 14, marginTop: 16 },
  avatar: { width: 48, height: 48, borderRadius: 24, marginRight: 12, backgroundColor: '#F8FAFC' },
  accountInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center' },
  accountName: { fontFamily: FONTS.bold, fontSize: 15, color: '#0F172A', fontWeight: 'bold' },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECFDF5', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginLeft: 6 },
  verifiedText: { fontFamily: FONTS.bold, fontSize: 9.5, color: '#10B981' },
  collegeText: { fontFamily: FONTS.medium, fontSize: 11.5, color: '#64748B', marginTop: 2 },

  sectionTitle: { fontFamily: FONTS.bold, fontSize: 14, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 18, marginBottom: 10, paddingHorizontal: 4 },

  // Rows
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: 48, paddingHorizontal: 8 },
  rowLeft: { flexDirection: 'row', alignItems: 'center' },
  iconContainer: { width: 30, height: 30, borderRadius: 10, backgroundColor: 'rgba(79, 70, 229, 0.08)', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  rowTitle: { fontFamily: FONTS.medium, fontSize: 13.5, color: '#475569' },
  rowRight: { flexDirection: 'row', alignItems: 'center' },
  rowValue: { fontFamily: FONTS.bold, fontSize: 12, color: '#64748B' },
  rowDivider: { height: 1, backgroundColor: '#F8FAFC', marginHorizontal: 8 },

  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FEE2E2', borderRadius: 20, height: 48, marginTop: 14, marginBottom: 20 },
  logoutBtnTxt: { fontFamily: FONTS.bold, fontSize: 14, color: '#EF4444', fontWeight: 'bold' },

  // LOGOUT CONFIRMATION MODAL POPUP
  modalBg: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.45)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 36 },
  modalCard: { backgroundColor: '#FFFFFF', borderRadius: 28, padding: 24, width: '100%', alignItems: 'center', borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#0F172A', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 12 },
  
  logoutIconBox: { marginBottom: 18 },
  logoutIconGrad: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', shadowColor: '#F59E0B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 6 },
  modalTitle: { fontFamily: FONTS.bold, fontSize: 22, color: '#0F172A', marginBottom: 8, textAlign: 'center', fontWeight: 'bold' },
  modalDesc: { fontFamily: FONTS.medium, fontSize: 15, color: '#64748B', textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  
  modalPrimaryBtn: { width: '100%', height: 48, backgroundColor: '#EF4444', borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  modalPrimaryBtnTxt: { fontFamily: FONTS.bold, fontSize: 14.5, color: '#FFFFFF', fontWeight: 'bold' },
  
  modalSecondaryBtn: { width: '100%', height: 44, justifyContent: 'center', alignItems: 'center' },
  modalSecondaryBtnTxt: { fontFamily: FONTS.bold, fontSize: 14, color: '#64748B', fontWeight: 'bold' },
});
