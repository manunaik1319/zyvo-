import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, StatusBar } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FONTS } from "../../constants/fonts";
import { SkeletonNotificationsScreen } from "../../components/ui/Skeleton";

const NOTIFICATIONS = [
  { id: "1", title: "Booking Confirmed",    message: "Your seat A12 at The Scholar's Haven is ready for June 29.", time: "2 hours ago",  unread: true,  icon: "check-circle", color: "#22C55E" },
  { id: "2", title: "Session Ending Soon",  message: "Your focus session ends in 15 minutes. Need more time?",       time: "3 hours ago",  unread: true,  icon: "clock",        color: "#F59E0B" },
  { id: "3", title: "UPI Refund Processed", message: "Refund of ₹315 for cancelled booking ZYV-002415 processed.",   time: "1 day ago",    unread: false, icon: "credit-card",  color: "#4F7EFF" },
  { id: "4", title: "New Space Available!", message: "Zenith Study Lounge added 10 new private focus cabins.",        time: "2 days ago",   unread: false, icon: "map-pin",      color: "#8B5CF6" },
];

export default function NotificationsScreen() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(t);
  }, []);

  if (loading) {
    return (
      <View style={[S.root, { paddingTop: insets.top || 24 }]}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
        <SkeletonNotificationsScreen />
      </View>
    );
  }

  return (
    <View style={[S.root, { paddingTop: insets.top || 24 }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* Header */}
      <View style={S.header}>
        <TouchableOpacity style={S.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <Feather name="arrow-left" size={20} color="#111827" />
        </TouchableOpacity>
        <Text style={S.title}>Notifications</Text>
        <TouchableOpacity activeOpacity={0.7}>
          <Text style={S.clearTxt}>Clear all</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={S.list}>
        {NOTIFICATIONS.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[S.card, item.unread && S.cardUnread]}
            activeOpacity={0.8}
            onPress={() => router.push({ pathname: "/notifications/[id]", params: { id: item.id } })}
          >
            <View style={[S.iconBox, { backgroundColor: item.color + "18" }]}>
              <Feather name={item.icon as any} size={19} color={item.color} />
            </View>
            <View style={S.cardBody}>
              <View style={S.topRow}>
                <Text style={S.cardTitle}>{item.title}</Text>
                {item.unread && <View style={S.dot} />}
              </View>
              <Text style={S.cardMsg} numberOfLines={2}>{item.message}</Text>
              <Text style={S.cardTime}>{item.time}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const S = StyleSheet.create({
  root:      { flex: 1, backgroundColor: "#F8FAFC" },
  header:    { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 14 },
  backBtn:   { width: 38, height: 38, borderRadius: 12, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#E8EEF8" },
  title:     { fontFamily: FONTS.bold, fontSize: 20, color: "#111827" },
  clearTxt:  { fontFamily: FONTS.medium, fontSize: 13, color: "#4F7EFF" },
  list:      { paddingHorizontal: 20, paddingBottom: 48, paddingTop: 4 },
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E8EEF8",
    shadowColor: "#111827",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardUnread: { borderColor: "#C7D8FF", backgroundColor: "#F5F8FF" },
  iconBox:    { width: 44, height: 44, borderRadius: 13, alignItems: "center", justifyContent: "center", marginRight: 12, flexShrink: 0 },
  cardBody:   { flex: 1 },
  topRow:     { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  cardTitle:  { fontFamily: FONTS.bold, fontSize: 14, color: "#111827", flex: 1 },
  dot:        { width: 8, height: 8, borderRadius: 4, backgroundColor: "#4F7EFF", marginLeft: 8 },
  cardMsg:    { fontFamily: FONTS.regular, fontSize: 13, color: "#6B7280", marginBottom: 5, lineHeight: 19 },
  cardTime:   { fontFamily: FONTS.medium, fontSize: 11, color: "#9CA3AF" },
});
