import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, StatusBar, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FONTS } from '../../constants/fonts';

const DETAIL_DATA: Record<string, { title: string; message: string; time: string; icon: string; color: string }> = {
  '1': { title: 'Booking Confirmed',    message: "Your seat A12 at The Scholar's Haven is confirmed and ready for June 29, 2026. Please check in at least 5 minutes before your session starts.", time: '2 hours ago',  icon: 'check-circle', color: '#22C55E' },
  '2': { title: 'Session Ending Soon',  message: 'Your focus session at StudyHub Library ends in 15 minutes. Tap "Extend" in your active session to add more time.',                              time: '3 hours ago',  icon: 'clock',        color: '#F59E0B' },
  '3': { title: 'UPI Refund Processed', message: 'A refund of ₹315 for your cancelled booking ZYV-002415 has been successfully processed to your original payment method.',                     time: '1 day ago',    icon: 'credit-card',  color: '#4F7EFF' },
  '4': { title: 'New Space Available!', message: 'Zenith Study Lounge has added 10 new private focus cabins to their floor plan. Book early — these spots fill up fast!',                       time: '2 days ago',   icon: 'map-pin',      color: '#8B5CF6' },
};

export default function NotificationDetail() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const { id }  = useLocalSearchParams<{ id: string }>();
  const data    = DETAIL_DATA[id as string] ?? DETAIL_DATA['1'];

  return (
    <View style={[S.root, { paddingTop: insets.top || 24 }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* Header */}
      <View style={S.header}>
        <TouchableOpacity style={S.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <Feather name="arrow-left" size={20} color="#111827" />
        </TouchableOpacity>
        <Text style={S.headerTitle}>Notification</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={S.content}>
        {/* Icon */}
        <View style={[S.iconWrap, { backgroundColor: data.color + '18' }]}>
          <Feather name={data.icon as any} size={32} color={data.color} />
        </View>

        <Text style={S.title}>{data.title}</Text>
        <Text style={S.time}>{data.time}</Text>
        <Text style={S.body}>{data.message}</Text>

        <TouchableOpacity style={[S.actionBtn, { backgroundColor: data.color }]} onPress={() => router.back()} activeOpacity={0.85}>
          <Text style={S.actionTxt}>Back to Notifications</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const S = StyleSheet.create({
  root:      { flex: 1, backgroundColor: '#F8FAFC' },
  header:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14 },
  backBtn:   { width: 38, height: 38, borderRadius: 12, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E8EEF8' },
  headerTitle: { fontFamily: FONTS.bold, fontSize: 18, color: '#111827' },
  content:   { paddingHorizontal: 24, paddingBottom: 48, alignItems: 'center', paddingTop: 24 },
  iconWrap:  { width: 80, height: 80, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  title:     { fontFamily: FONTS.bold, fontSize: 22, color: '#111827', marginBottom: 6, textAlign: 'center' },
  time:      { fontFamily: FONTS.medium, fontSize: 12, color: '#9CA3AF', marginBottom: 20 },
  body:      { fontFamily: FONTS.regular, fontSize: 15, color: '#4B5563', textAlign: 'center', lineHeight: 24, marginBottom: 32 },
  actionBtn: { width: '100%', height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  actionTxt: { fontFamily: FONTS.bold, fontSize: 15, color: '#FFFFFF' },
});
