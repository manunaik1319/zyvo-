import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FONTS } from '../../constants/fonts';

export default function PaymentMethodsSettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleAddNew = () => {
    Alert.alert('Add Method', 'Saved card or UPI channel registry setup is opened.');
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
          <Text style={styles.headerTitle}>Payments</Text>
          <Text style={styles.headerSubtitle}>Manage your checkout accounts</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
        {/* SAVED CARDS */}
        <Text style={styles.sectionTitle}>Saved Cards</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons name="card-outline" size={18} color="#4F7EFF" style={{ marginRight: 10 }} />
              <View>
                <Text style={styles.rowTitle}>Visa ending in 4587</Text>
                <Text style={styles.rowSubtitle}>Expires 12/28</Text>
              </View>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeTxt}>Default</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons name="card-outline" size={18} color="#6B7280" style={{ marginRight: 10 }} />
              <View>
                <Text style={styles.rowTitle}>Mastercard ending in 9012</Text>
                <Text style={styles.rowSubtitle}>Expires 08/29</Text>
              </View>
            </View>
          </View>
        </View>

        {/* UPI PAYMENTS */}
        <Text style={styles.sectionTitle}>Saved UPI Handles</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons name="logo-google" size={16} color="#6B7280" style={{ marginRight: 10 }} />
              <Text style={styles.rowTitle}>manohar.naik@okhdfcbank</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons name="phone-portrait-outline" size={16} color="#6B7280" style={{ marginRight: 10 }} />
              <Text style={styles.rowTitle}>9876543210@ybl (PhonePe)</Text>
            </View>
          </View>
        </View>

        {/* ACTIONS */}
        <TouchableOpacity style={styles.addBtn} activeOpacity={0.8} onPress={handleAddNew}>
          <Feather name="plus" size={16} color="#4F7EFF" style={{ marginRight: 6 }} />
          <Text style={styles.addBtnTxt}>Add New Payment Method</Text>
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

  sectionTitle: { fontFamily: FONTS.bold, fontSize: 13, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 20, marginBottom: 8, paddingHorizontal: 4 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#E8EEF8' },
  
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: 46 },
  rowLeft: { flexDirection: 'row', alignItems: 'center' },
  rowTitle: { fontFamily: FONTS.medium, fontSize: 13.5, color: '#374151' },
  rowSubtitle: { fontFamily: FONTS.medium, fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 8 },

  badge: { backgroundColor: '#EEF2FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeTxt: { fontFamily: FONTS.bold, fontSize: 10, color: '#4F7EFF' },

  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E8EEF8', borderRadius: 16, height: 48, marginBottom: 14 },
  addBtnTxt: { fontFamily: FONTS.bold, fontSize: 13, color: '#4F7EFF' },
});
