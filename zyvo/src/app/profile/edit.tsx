import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Animated,
  Modal,
  Vibration,
  Platform,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../store/authStore';
import { FONTS } from '../../constants/fonts';

export default function ProfileEdit() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, setUser } = useAuthStore();

  const [name, setName] = useState(user?.name || 'Manohar Naik');
  const [email, setEmail] = useState(user?.email || 'manohar.naik@iiitsonepat.ac.in');
  const [uni, setUni] = useState(user?.university || 'IIIT Sonepat');
  const [phone, setPhone] = useState('+91 98765 43210');

  // Modal success state
  const [showSuccess, setShowSuccess] = useState(false);

  // Animations
  const modalScale = useRef(new Animated.Value(0.85)).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;
  const checkScale = useRef(new Animated.Value(0.4)).current;
  const btnScale = useRef(new Animated.Value(1)).current;

  const handleSave = () => {
    if (user) {
      setUser({ ...user, name, email, university: uni });
    }

    // Trigger Success Modal
    setShowSuccess(true);
    if (Platform.OS !== 'web') {
      Vibration.vibrate(15);
    }

    // Modal Entrance animations
    Animated.parallel([
      Animated.timing(modalOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.spring(modalScale, { toValue: 1, friction: 6, tension: 120, useNativeDriver: true }),
    ]).start(() => {
      // Checkmark bounce
      Animated.spring(checkScale, { toValue: 1, friction: 4, tension: 100, useNativeDriver: true }).start();
    });

    // Auto dismiss after 2 seconds
    setTimeout(() => {
      dismissModal();
    }, 2000);
  };

  const dismissModal = () => {
    Animated.parallel([
      Animated.timing(modalOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(modalScale, { toValue: 0.9, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      setShowSuccess(false);
      router.back();
    });
  };

  const handlePressBtnIn = () => {
    Animated.timing(btnScale, { toValue: 0.95, duration: 100, useNativeDriver: true }).start();
  };

  const handlePressBtnOut = () => {
    Animated.timing(btnScale, { toValue: 1, duration: 100, useNativeDriver: true }).start();
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
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <Text style={styles.headerSubtitle}>Keep your personal records updated</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
        {/* AVATAR ROW */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrapper}>
            <Image
              source={{ uri: user?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop' }}
              style={styles.avatar}
            />
            <TouchableOpacity style={styles.editPhotoBtn} activeOpacity={0.8}>
              <Feather name="camera" size={13} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <Text style={styles.avatarLabel}>Tap to upload custom photo</Text>
        </View>

        {/* DETAILS INPUTS */}
        <Text style={styles.sectionTitle}>Details</Text>
        <View style={styles.card}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput style={styles.textInput} value={name} onChangeText={setName} />
          </View>
          <View style={styles.divider} />
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput style={styles.textInput} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          </View>
          <View style={styles.divider} />
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phone Number</Text>
            <TextInput style={styles.textInput} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Education</Text>
        <View style={styles.card}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>University</Text>
            <TextInput style={styles.textInput} value={uni} onChangeText={setUni} />
          </View>
          <View style={styles.divider} />
          <View style={styles.verifiedRow}>
            <View>
              <Text style={styles.inputLabel}>Verification Status</Text>
              <Text style={styles.verifiedVal}>✓ Verified Student Account</Text>
            </View>
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={12} color="#10B981" style={{ marginRight: 2 }} />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          </View>
        </View>

        {/* SAVE CTA */}
        <TouchableOpacity style={styles.saveBtn} activeOpacity={0.85} onPress={handleSave}>
          <Text style={styles.saveBtnTxt}>Save Changes</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* SUCCESS MODAL POPUP */}
      <Modal visible={showSuccess} transparent animationType="none">
        <View style={styles.modalBg}>
          <Animated.View style={[styles.modalCard, { opacity: modalOpacity, transform: [{ scale: modalScale }] }]}>
            {/* Smooth animated success icon green gradient */}
            <Animated.View style={{ transform: [{ scale: checkScale }] }}>
              <LinearGradient colors={['#22C55E', '#16A34A']} style={styles.badgeCircle}>
                <Ionicons name="checkmark" size={28} color="#FFFFFF" />
              </LinearGradient>
            </Animated.View>

            <Text style={styles.modalTitle}>Profile Updated!</Text>
            <Text style={styles.modalDesc}>Your profile changes have been saved successfully.</Text>

            {/* DONE BUTTON */}
            <Animated.View style={{ width: '100%', transform: [{ scale: btnScale }] }}>
              <TouchableOpacity
                onPress={dismissModal}
                onPressIn={handlePressBtnIn}
                onPressOut={handlePressBtnOut}
                activeOpacity={0.9}
                style={styles.doneBtnWrap}
              >
                <LinearGradient colors={['#6B7CFF', '#4F7EFF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.doneBtn}>
                  <Text style={styles.doneBtnTxt}>Done</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
        </View>
      </Modal>
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

  avatarSection: { alignItems: 'center', marginVertical: 24 },
  avatarWrapper: { position: 'relative' },
  avatar: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#F3F4F6', borderWidth: 2, borderColor: '#FFFFFF' },
  editPhotoBtn: { position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: 14, backgroundColor: '#4F7EFF', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFFFFF' },
  avatarLabel: { fontFamily: FONTS.medium, fontSize: 12, color: '#6B7280', marginTop: 8 },

  sectionTitle: { fontFamily: FONTS.bold, fontSize: 13, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 14, marginBottom: 8, paddingHorizontal: 4 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#E8EEF8' },
  
  inputGroup: { paddingVertical: 4 },
  inputLabel: { fontFamily: FONTS.medium, fontSize: 11, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  textInput: { fontFamily: FONTS.bold, fontSize: 14, color: '#111827', padding: 0 },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 12 },

  verifiedRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  verifiedVal: { fontFamily: FONTS.bold, fontSize: 13.5, color: '#22C55E', marginTop: 4 },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECFDF5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  verifiedText: { fontFamily: FONTS.bold, fontSize: 10, color: '#10B981' },

  saveBtn: { backgroundColor: '#4F7EFF', borderRadius: 20, height: 50, justifyContent: 'center', alignItems: 'center', marginTop: 14 },
  saveBtnTxt: { fontFamily: FONTS.bold, fontSize: 14, color: '#FFFFFF' },

  // MODAL STYLES (Glassmorphism layout)
  modalBg: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.45)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 36 },
  modalCard: { backgroundColor: '#FFFFFF', borderRadius: 28, padding: 24, width: '100%', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#111827', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 12 },
  
  badgeCircle: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 18, shadowColor: '#22C55E', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 6 },
  modalTitle: { fontFamily: FONTS.bold, fontSize: 22, color: '#111827', marginBottom: 8, textAlign: 'center' },
  modalDesc: { fontFamily: FONTS.medium, fontSize: 15, color: '#6B7280', textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  
  doneBtnWrap: { width: '100%', borderRadius: 16, overflow: 'hidden', shadowColor: '#4F7EFF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 3 },
  doneBtn: { width: '100%', height: 48, justifyContent: 'center', alignItems: 'center', borderRadius: 16 },
  doneBtnTxt: { fontFamily: FONTS.bold, fontSize: 16, color: '#FFFFFF' },
});
