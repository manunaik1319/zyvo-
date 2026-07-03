import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';
import { FONTS } from '../../constants/fonts';

export default function EditProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();

  const [name, setName] = useState(user?.name || 'Manohar Naik');
  const [email, setEmail] = useState(user?.email || 'manohar.naik@iiitsonepat.ac.in');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [college, setCollege] = useState('IIIT Sonepat');
  const [location, setLocation] = useState('Sector 15, Sonipat');

  const handleSave = () => {
    Alert.alert('Success', 'Profile changes saved successfully.', [
      { text: 'OK', onPress: () => router.back() }
    ]);
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
          <Text style={styles.headerSubtitle}>Keep your student profile updated</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
        {/* PROFILE PICTURE */}
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
          <Text style={styles.avatarLabel}>Tap to change photo</Text>
        </View>

        {/* PROFILE FORM */}
        <Text style={styles.sectionTitle}>Account Details</Text>
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

        {/* VERIFICATION AND COLLEGE */}
        <Text style={styles.sectionTitle}>Education</Text>
        <View style={styles.card}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>College / University</Text>
            <TextInput style={styles.textInput} value={college} onChangeText={setCollege} />
          </View>
          <View style={styles.divider} />
          <View style={styles.verificationRow}>
            <View>
              <Text style={styles.inputLabel}>Verification Status</Text>
              <Text style={styles.verifiedVal}>✓ Verified Student Account</Text>
            </View>
            <View style={styles.badge}>
              <Ionicons name="checkmark-circle" size={13} color="#22C55E" style={{ marginRight: 3 }} />
              <Text style={styles.badgeTxt}>Active</Text>
            </View>
          </View>
        </View>

        {/* STUDY PREFERENCES PREVIEW */}
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.card}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Preferred Study Location</Text>
            <TextInput style={styles.textInput} value={location} onChangeText={setLocation} />
          </View>
        </View>

        {/* SAVE BUTTON */}
        <TouchableOpacity style={styles.saveBtn} activeOpacity={0.85} onPress={handleSave}>
          <Text style={styles.saveBtnTxt}>Save Changes</Text>
        </TouchableOpacity>
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

  verificationRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  verifiedVal: { fontFamily: FONTS.bold, fontSize: 13.5, color: '#22C55E', marginTop: 4 },
  badge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECFDF5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeTxt: { fontFamily: FONTS.bold, fontSize: 10, color: '#10B981' },

  saveBtn: { backgroundColor: '#4F7EFF', borderRadius: 20, height: 50, justifyContent: 'center', alignItems: 'center', marginTop: 14 },
  saveBtnTxt: { fontFamily: FONTS.bold, fontSize: 14, color: '#FFFFFF' },
});
