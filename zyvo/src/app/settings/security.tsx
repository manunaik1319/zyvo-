import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Switch,
  Platform,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  Animated,
  Vibration,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FONTS } from '../../constants/fonts';

const PRIMARY_COLOR = '#4F46E5';

export default function SecuritySettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [biometrics, setBiometrics] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);

  const [locationPerm, setLocationPerm] = useState(true);
  const [cameraPerm, setCameraPerm] = useState(true);
  const [notifyPerm, setNotifyPerm] = useState(true);

  // Change Password States
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [oldPasswordError, setOldPasswordError] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  // Password Visibility
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  // Animations
  const modalScale = useRef(new Animated.Value(0.85)).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;

  const triggerChangePassword = () => {
    setShowPasswordModal(true);
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setOldPasswordError('');
    setNewPasswordError('');
    setConfirmPasswordError('');
    
    Animated.parallel([
      Animated.timing(modalOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.spring(modalScale, { toValue: 1, friction: 6, tension: 120, useNativeDriver: true }),
    ]).start();
  };

  const closePasswordModal = () => {
    Animated.parallel([
      Animated.timing(modalOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(modalScale, { toValue: 0.9, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      setShowPasswordModal(false);
    });
  };

  const handleChangePasswordSubmit = () => {
    let hasErr = false;
    setOldPasswordError('');
    setNewPasswordError('');
    setConfirmPasswordError('');

    if (!oldPassword) {
      setOldPasswordError('Old password is required.');
      hasErr = true;
    }
    if (!newPassword) {
      setNewPasswordError('New password is required.');
      hasErr = true;
    } else if (newPassword.length < 8) {
      setNewPasswordError('Password must be at least 8 characters.');
      hasErr = true;
    }
    if (newPassword !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match.');
      hasErr = true;
    }

    if (hasErr) {
      if (Platform.OS !== 'web') Vibration.vibrate(10);
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      closePasswordModal();
      Alert.alert('Success', 'Your password has been successfully updated.');
    }, 1500);
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* HEADER */}
      <View style={[styles.header, { paddingTop: insets.top || 14 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.75}>
          <Feather name="arrow-left" size={20} color="#0F172A" />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 14 }}>
          <Text style={styles.headerTitle}>Privacy & Security</Text>
          <Text style={styles.headerSubtitle}>Manage your authorization keys</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
        {/* LOGIN CREDENTIALS */}
        <Text style={styles.sectionTitle}>Login Security</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.row} onPress={triggerChangePassword} activeOpacity={0.7}>
            <View style={styles.rowLeft}>
              <Feather name="lock" size={15} color={PRIMARY_COLOR} style={{ marginRight: 10 }} />
              <Text style={styles.rowLabel}>Change Password</Text>
            </View>
            <Feather name="chevron-right" size={14} color="#D1D5DB" />
          </TouchableOpacity>
          
          <View style={styles.divider} />
          
          <View style={styles.switchRow}>
            <View style={styles.rowLeft}>
              <Feather name="shield" size={15} color={PRIMARY_COLOR} style={{ marginRight: 10 }} />
              <Text style={styles.rowLabel}>Biometric Login (Face ID)</Text>
            </View>
            <Switch
              value={biometrics}
              onValueChange={setBiometrics}
              trackColor={{ false: '#E2E8F0', true: PRIMARY_COLOR }}
              thumbColor={Platform.OS === 'ios' ? undefined : '#FFFFFF'}
            />
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.switchRow}>
            <View style={styles.rowLeft}>
              <Feather name="key" size={15} color={PRIMARY_COLOR} style={{ marginRight: 10 }} />
              <Text style={styles.rowLabel}>Two-Factor Authentication</Text>
            </View>
            <Switch
              value={twoFactor}
              onValueChange={setTwoFactor}
              trackColor={{ false: '#E2E8F0', true: PRIMARY_COLOR }}
              thumbColor={Platform.OS === 'ios' ? undefined : '#FFFFFF'}
            />
          </View>
        </View>

        {/* DEVICE PERMISSIONS */}
        <Text style={styles.sectionTitle}>System Permissions</Text>
        <View style={styles.card}>
          <View style={styles.switchRow}>
            <View style={styles.rowLeft}>
              <Feather name="map-pin" size={15} color={PRIMARY_COLOR} style={{ marginRight: 10 }} />
              <Text style={styles.rowLabel}>Location Permission</Text>
            </View>
            <Switch
              value={locationPerm}
              onValueChange={setLocationPerm}
              trackColor={{ false: '#E2E8F0', true: PRIMARY_COLOR }}
              thumbColor={Platform.OS === 'ios' ? undefined : '#FFFFFF'}
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.switchRow}>
            <View style={styles.rowLeft}>
              <Feather name="camera" size={15} color={PRIMARY_COLOR} style={{ marginRight: 10 }} />
              <Text style={styles.rowLabel}>Camera Permission</Text>
            </View>
            <Switch
              value={cameraPerm}
              onValueChange={setCameraPerm}
              trackColor={{ false: '#E2E8F0', true: PRIMARY_COLOR }}
              thumbColor={Platform.OS === 'ios' ? undefined : '#FFFFFF'}
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.switchRow}>
            <View style={styles.rowLeft}>
              <Feather name="bell" size={15} color={PRIMARY_COLOR} style={{ marginRight: 10 }} />
              <Text style={styles.rowLabel}>Notification Permission</Text>
            </View>
            <Switch
              value={notifyPerm}
              onValueChange={setNotifyPerm}
              trackColor={{ false: '#E2E8F0', true: PRIMARY_COLOR }}
              thumbColor={Platform.OS === 'ios' ? undefined : '#FFFFFF'}
            />
          </View>
        </View>
      </ScrollView>

      {/* PREMIUM CHANGE PASSWORD MODAL */}
      <Modal visible={showPasswordModal} transparent animationType="none">
        <View style={styles.modalBg}>
          <Animated.View style={[styles.modalCard, { opacity: modalOpacity, transform: [{ scale: modalScale }] }]}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Change Password</Text>
              <TouchableOpacity onPress={closePasswordModal} style={styles.closeBtn}>
                <Feather name="x" size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ width: '100%' }} contentContainerStyle={{ gap: 14, paddingTop: 10 }}>
              {/* Old Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Old Password</Text>
                <View style={[styles.inputWrapper, !!oldPasswordError && styles.inputWrapperError]}>
                  <TextInput
                    style={styles.input}
                    secureTextEntry={!showOldPass}
                    placeholder="Enter old password"
                    placeholderTextColor="#94A3B8"
                    value={oldPassword}
                    onChangeText={setOldPassword}
                  />
                  <TouchableOpacity onPress={() => setShowOldPass(!showOldPass)}>
                    <Feather name={showOldPass ? "eye" : "eye-off"} size={16} color="#64748B" />
                  </TouchableOpacity>
                </View>
                {!!oldPasswordError && <Text style={styles.errorText}>{oldPasswordError}</Text>}
              </View>

              {/* New Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>New Password</Text>
                <View style={[styles.inputWrapper, !!newPasswordError && styles.inputWrapperError]}>
                  <TextInput
                    style={styles.input}
                    secureTextEntry={!showNewPass}
                    placeholder="Min 8 characters"
                    placeholderTextColor="#94A3B8"
                    value={newPassword}
                    onChangeText={setNewPassword}
                  />
                  <TouchableOpacity onPress={() => setShowNewPass(!showNewPass)}>
                    <Feather name={showNewPass ? "eye" : "eye-off"} size={16} color="#64748B" />
                  </TouchableOpacity>
                </View>
                {!!newPasswordError && <Text style={styles.errorText}>{newPasswordError}</Text>}
              </View>

              {/* Confirm New Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Confirm New Password</Text>
                <View style={[styles.inputWrapper, !!confirmPasswordError && styles.inputWrapperError]}>
                  <TextInput
                    style={styles.input}
                    secureTextEntry={true}
                    placeholder="Repeat new password"
                    placeholderTextColor="#94A3B8"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                  />
                </View>
                {!!confirmPasswordError && <Text style={styles.errorText}>{confirmPasswordError}</Text>}
              </View>

              {/* Modal Buttons */}
              <TouchableOpacity
                style={[styles.modalSubmitBtn, loading && styles.modalSubmitBtnDisabled]}
                onPress={handleChangePasswordSubmit}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalSubmitBtnText}>Update Password</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 14, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  backBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#F1F5F9' },
  headerTitle: { fontFamily: FONTS.bold, fontSize: 18, color: '#0F172A', fontWeight: 'bold' },
  headerSubtitle: { fontFamily: FONTS.medium, fontSize: 12, color: '#64748B', marginTop: 1 },

  scrollBody: { paddingHorizontal: 20, paddingBottom: 60 },

  sectionTitle: { fontFamily: FONTS.bold, fontSize: 13, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 20, marginBottom: 8, paddingHorizontal: 4 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#0F172A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 8, elevation: 1 },
  
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: 44 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: 44 },
  rowLeft: { flexDirection: 'row', alignItems: 'center' },
  rowLabel: { fontFamily: FONTS.medium, fontSize: 13.5, color: '#475569' },
  divider: { height: 1, backgroundColor: '#F8FAFC', marginVertical: 10 },

  // Change Password Modal Styles
  modalBg: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.45)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  modalCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, width: '100%', alignItems: 'center', borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#0F172A', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 12, maxHeight: '80%' },
  modalHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', borderBottomWidth: 1, borderBottomColor: '#F8FAFC', paddingBottom: 12, marginBottom: 10 },
  modalTitle: { fontFamily: FONTS.bold, fontSize: 18, color: '#0F172A', fontWeight: 'bold' },
  closeBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center' },
  inputGroup: { gap: 6, width: '100%' },
  inputLabel: { fontFamily: FONTS.bold, fontSize: 12, color: '#0F172A', fontWeight: 'bold' },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 12, height: 46, paddingHorizontal: 12 },
  inputWrapperError: { borderColor: '#EF4444' },
  input: { flex: 1, fontFamily: FONTS.regular, fontSize: 13.5, color: '#0F172A' },
  errorText: { fontFamily: FONTS.medium, fontSize: 11, color: '#EF4444' },
  modalSubmitBtn: { height: 46, borderRadius: 12, backgroundColor: PRIMARY_COLOR, alignItems: 'center', justifyContent: 'center', shadowColor: PRIMARY_COLOR, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 2, marginTop: 14, width: '100%' },
  modalSubmitBtnDisabled: { opacity: 0.6 },
  modalSubmitBtnText: { fontFamily: FONTS.bold, fontSize: 14, color: '#FFFFFF', fontWeight: 'bold' },
});
