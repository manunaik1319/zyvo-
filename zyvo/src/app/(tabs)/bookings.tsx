import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  StyleSheet, Text, View, ScrollView, StatusBar,
  TouchableOpacity, Animated, RefreshControl, TextInput,
  Image, Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useBookingStore, Booking } from "../../store/bookingStore";
import { FONTS } from "../../constants/fonts";
import { SkeletonBookingsScreen } from "../../components/ui/Skeleton";

const { width: W } = Dimensions.get("window");

const TABS = [
  { id: "upcoming",  label: "Upcoming",  color: "#4F7EFF" },
  { id: "active",    label: "Active",    color: "#22C55E" },
  { id: "completed", label: "Completed", color: "#6B7280" },
  { id: "cancelled", label: "Cancelled", color: "#EF4444" },
];

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=600&auto=format&fit=crop",
];

function getTabId(b: Booking): string {
  if (b.status === "cancelled") return "cancelled";
  if (b.status === "completed") return "completed";
  if (b.checkInStatus === "checked_in") return "active";
  return "upcoming";
}

// ── Premium horizontal booking card ───────────────────────────────
function BookingCard({ booking, index }: { booking: Booking; index: number }) {
  const router = useRouter();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const tabId     = getTabId(booking);
  const tabMeta   = TABS.find((t) => t.id === tabId) || TABS[0];
  const imgUri    = booking.spaceImageUrl || FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 300, delay: index * 50, useNativeDriver: true }).start();
  }, []);

  const onIn  = () => Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true, tension: 220, friction: 10 }).start();
  const onOut = () => Animated.spring(scaleAnim, { toValue: 1,    useNativeDriver: true, tension: 140, friction: 8  }).start();

  // action button sets per status
  const renderActions = () => {
    if (tabId === "upcoming") return (
      <View style={C.actionRow}>
        <TouchableOpacity style={C.btnPrimary} activeOpacity={0.85} onPress={() => router.push("/(tabs)/scan")}>
          <LinearGradient colors={["#6B7CFF","#4F7EFF"]} start={{x:0,y:0}} end={{x:1,y:0}} style={C.btnGrad}>
            <Ionicons name="qr-code-outline" size={13} color="#FFF" />
            <Text style={C.btnPrimaryTxt}>  View QR</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity style={C.btnOutline} activeOpacity={0.8}>
          <Feather name="navigation" size={13} color="#4F7EFF" />
          <Text style={C.btnOutlineTxt}>  Directions</Text>
        </TouchableOpacity>
      </View>
    );
    if (tabId === "active") return (
      <View style={C.actionRow}>
        <TouchableOpacity style={C.btnPrimary} activeOpacity={0.85} onPress={() => router.push({ pathname: '/session/active', params: { bookingId: booking.id } } as any)}>
          <LinearGradient colors={["#34D399","#22C55E"]} start={{x:0,y:0}} end={{x:1,y:0}} style={C.btnGrad}>
            <Feather name="activity" size={13} color="#FFF" />
            <Text style={C.btnPrimaryTxt}>  Active Session</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity style={[C.btnOutline, {borderColor: "#22C55E"}]} activeOpacity={0.8}>
          <Feather name="plus" size={13} color="#22C55E" />
          <Text style={[C.btnOutlineTxt, {color:"#22C55E"}]}>  Extend</Text>
        </TouchableOpacity>
      </View>
    );
    if (tabId === "completed") return (
      <View style={C.actionRow}>
        <TouchableOpacity style={C.btnPrimary} activeOpacity={0.85} onPress={() => router.push("/(tabs)/discover")}>
          <LinearGradient colors={["#6B7CFF","#4F7EFF"]} start={{x:0,y:0}} end={{x:1,y:0}} style={C.btnGrad}>
            <Feather name="repeat" size={13} color="#FFF" />
            <Text style={C.btnPrimaryTxt}>  Book Again</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity style={[C.btnOutline, {borderColor:"#F59E0B"}]} activeOpacity={0.8}>
          <Feather name="star" size={13} color="#F59E0B" />
          <Text style={[C.btnOutlineTxt, {color:"#F59E0B"}]}>  Review</Text>
        </TouchableOpacity>
      </View>
    );
    return (
      <TouchableOpacity style={C.btnFull} activeOpacity={0.85} onPress={() => router.push("/(tabs)/discover")}>
        <LinearGradient colors={["#6B7CFF","#4F7EFF"]} start={{x:0,y:0}} end={{x:1,y:0}} style={C.btnGrad}>
          <Text style={C.btnPrimaryTxt}>Book Again</Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }], marginBottom: 14 }}>
      <TouchableOpacity activeOpacity={1} onPressIn={onIn} onPressOut={onOut}>
        <View style={C.card}>

          {/* HEADER ROW: image + info */}
          <View style={C.cardHeader}>
            <Image source={{ uri: imgUri }} style={C.thumb} resizeMode="cover" />
            <View style={C.info}>
              {/* Status pill — no background */}
              <View style={C.pill}>
                <View style={[C.pillDot, { backgroundColor: tabMeta.color }]} />
                <Text style={[C.pillTxt, { color: tabMeta.color }]}>{tabMeta.label}</Text>
              </View>
              <Text style={C.spaceName} numberOfLines={1}>{booking.spaceName}</Text>
              <View style={C.chip}>
                <Feather name="map-pin" size={10} color="#9CA3AF" />
                <Text style={C.chipTxt}> {booking.location || booking.category}</Text>
              </View>
            </View>
            <Text style={C.priceAmt}>₹{booking.totalPrice}</Text>
          </View>

          {/* META GRID */}
          <View style={C.metaGrid}>
            <View style={C.metaCell}>
              <Feather name="calendar" size={11} color="#9CA3AF" />
              <Text style={C.metaVal}> {booking.date}</Text>
            </View>
            <View style={C.metaDivider} />
            <View style={C.metaCell}>
              <Feather name="clock" size={11} color="#9CA3AF" />
              <Text style={C.metaVal}> {booking.timeSlot}</Text>
            </View>
            {booking.seatId ? (
              <>
                <View style={C.metaDivider} />
                <View style={C.metaCell}>
                  <Feather name="layers" size={11} color="#9CA3AF" />
                  <Text style={C.metaVal}> Seat {booking.seatId}</Text>
                </View>
              </>
            ) : null}
          </View>

          {/* ACTION BUTTONS */}
          {renderActions()}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ── Empty state ────────────────────────────────────────────────────
function EmptyState() {
  const router = useRouter();
  return (
    <View style={ES.wrap}>
      <View style={ES.iconBox}>
        <Feather name="calendar" size={36} color="#4F7EFF" />
      </View>
      <Text style={ES.title}>No Bookings Yet</Text>
      <Text style={ES.desc}>Discover beautiful study spaces and reserve your first seat.</Text>
      <TouchableOpacity style={ES.btn} activeOpacity={0.85} onPress={() => router.push("/(tabs)/discover")}>
        <LinearGradient colors={["#6B7CFF","#4F7EFF"]} start={{x:0,y:0}} end={{x:1,y:0}} style={ES.btnGrad}>
          <Text style={ES.btnTxt}>Explore Spaces</Text>
          <Feather name="arrow-right" size={14} color="#FFF" style={{ marginLeft: 6 }} />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

// ── Screen ─────────────────────────────────────────────────────────
export default function BookingsScreen() {
  const router   = useRouter();
  const insets   = useSafeAreaInsets();
  const allB     = useBookingStore((s) => s.bookings);
  const [tab, setTab]         = useState("upcoming");
  const [search, setSearch]   = useState("");
  const [refreshing, setRef]  = useState(false);
  const [loading, setLoading]   = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(false);
      Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }).start();
    }, 1200);
    return () => clearTimeout(t);
  }, []);

  const filtered = useMemo(() =>
    allB.filter((b) => {
      const matchTab = getTabId(b) === tab;
      const q = search.toLowerCase();
      return matchTab && (!q || b.spaceName.toLowerCase().includes(q) || b.id.toLowerCase().includes(q));
    }),
  [allB, tab, search]);

  if (loading) {
    return (
      <View style={[P.root, { paddingTop: insets.top || 20 }]}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
        <SkeletonBookingsScreen />
      </View>
    );
  }

  return (
    <View style={[P.root, { paddingTop: insets.top || 20 }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <Animated.View style={[{ flex: 1 }, { opacity: fadeAnim }]}>

        {/* HEADER */}
        <View style={P.header}>
          <Text style={P.title}>My Bookings</Text>
          <TouchableOpacity style={P.iconBtn} onPress={() => router.push('/notifications' as any)} activeOpacity={0.7}>
            <Feather name="bell" size={19} color="#374151" />
          </TouchableOpacity>
        </View>

        {/* SEARCH ROW */}
        <View style={P.searchRow}>
          <View style={P.searchBox}>
            <Feather name="search" size={16} color="#9CA3AF" />
            <TextInput
              style={P.searchInput}
              placeholder="Search spaces or booking ID"
              placeholderTextColor="#9CA3AF"
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch("")}>
                <Feather name="x" size={15} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity style={P.filterBtn}>
            <Feather name="sliders" size={17} color="#4F7EFF" />
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={P.tabsContent}
          style={{ flexGrow: 0, marginBottom: 4 }}
        >
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <TouchableOpacity
                key={t.id}
                onPress={() => setTab(t.id)}
                style={P.tabPill}
                activeOpacity={0.7}
              >
                <Text style={[P.tabTxt, active && P.tabTxtActive]}>{t.label}</Text>
                {active && <View style={P.tabUnderline} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* CARDS */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120, paddingTop: 2 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRef(true); setTimeout(() => setRef(false), 1000); }} tintColor="#4F7EFF" colors={["#4F7EFF"]} />}
        >
          {tab === "cancelled" && (
            <TouchableOpacity
              style={P.cancellationBanner}
              activeOpacity={0.8}
              onPress={() => router.push("/bookings/cancellation-history" as any)}
            >
              <LinearGradient
                colors={["#EEF2FF", "#E0E7FF"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={P.cancellationBannerGrad}
              >
                <View style={P.cancellationBannerIcon}>
                  <Ionicons name="receipt-outline" size={16} color="#4F7EFF" />
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={P.cancellationBannerTitle}>Cancellation & Refund History</Text>
                  <Text style={P.cancellationBannerSub}>View refund logs, policies, and detailed timelines.</Text>
                </View>
                <Feather name="arrow-right" size={14} color="#4F7EFF" />
              </LinearGradient>
            </TouchableOpacity>
          )}

          {filtered.length === 0 ? <EmptyState /> : filtered.map((b, i) => <BookingCard key={b.id} booking={b} index={i} />)}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

// ─── STYLES ────────────────────────────────────────────────────────

const P = StyleSheet.create({
  root:        { flex: 1, backgroundColor: "#F8FAFC" },
  header:      { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 14 },
  title:       { fontFamily: FONTS.bold, fontSize: 26, color: "#111827", letterSpacing: -0.4 },
  iconBtn:     { width: 38, height: 38, borderRadius: 12, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center", shadowColor: "#111827", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  searchRow:   { flexDirection: "row", paddingHorizontal: 20, marginBottom: 14 },
  searchBox:   { flex: 1, flexDirection: "row", alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 14, paddingHorizontal: 12, height: 46, borderWidth: 1, borderColor: "#E8EEF8", marginRight: 10 },
  searchInput: { flex: 1, marginLeft: 8, fontFamily: FONTS.regular, fontSize: 13, color: "#111827" },
  filterBtn:   { width: 46, height: 46, borderRadius: 14, backgroundColor: "#EEF2FF", alignItems: "center", justifyContent: "center" },
  tabsContent: { paddingHorizontal: 20, paddingBottom: 4 },
  tabPill:     { alignItems: 'center', paddingHorizontal: 12, paddingBottom: 8, marginRight: 20 },
  tabUnderline:{ height: 2, width: '100%', backgroundColor: '#111827', borderRadius: 1, marginTop: 4 },
  tabTxt:      { fontFamily: FONTS.medium, fontSize: 14, color: '#9CA3AF' },
  tabTxtActive:{ color: '#111827', fontFamily: FONTS.bold },
  cancellationBanner: {
    marginBottom: 14,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E0E7FF",
    shadowColor: "#4F7EFF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  cancellationBannerGrad: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  cancellationBannerIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: 'center',
  },
  cancellationBannerTitle: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: "#1E1B4B",
  },
  cancellationBannerSub: {
    fontFamily: FONTS.medium,
    fontSize: 10,
    color: "#4F7EFF",
    marginTop: 2,
  },
});

const C = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: "#111827",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },
  accentBar: { height: 3, width: "100%" },

  // Header row
  cardHeader:  { flexDirection: "row", padding: 14, alignItems: "flex-start" },
  thumb:       { width: 72, height: 72, borderRadius: 12, backgroundColor: "#E5E7EB", marginRight: 12 },
  info:        { flex: 1 },
  spaceName:   { fontFamily: FONTS.bold, fontSize: 14, color: "#111827", marginBottom: 5, marginTop: 2 },
  chip:        { flexDirection: "row", alignItems: "center" },
  chipTxt:     { fontFamily: FONTS.medium, fontSize: 11, color: "#9CA3AF" },

  // Status pill
  pill:        { flexDirection: "row", alignItems: "center", alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, marginBottom: 4 },
  pillDot:     { width: 5, height: 5, borderRadius: 3, marginRight: 4 },
  pillTxt:     { fontFamily: FONTS.bold, fontSize: 10 },

  // Price
  priceBadge:  { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, backgroundColor: "#F8FAFC", borderWidth: 1, borderColor: "#E8EEF8" },
  priceAmt:    { fontFamily: FONTS.bold, fontSize: 14, color: "#111827" },

  // Meta grid
  metaGrid:    { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingBottom: 12, paddingTop: 0 },
  metaCell:    { flexDirection: "row", alignItems: "center", flex: 1 },
  metaVal:     { fontFamily: FONTS.medium, fontSize: 11, color: "#6B7280" },
  metaDivider: { width: 1, height: 14, backgroundColor: "#E5E7EB", marginHorizontal: 8 },

  // Actions
  actionRow:   { flexDirection: "row", paddingHorizontal: 14, paddingBottom: 14 },
  btnPrimary:  { flex: 1, borderRadius: 11, overflow: "hidden", marginRight: 8 },
  btnFull:     { marginHorizontal: 14, marginBottom: 14, borderRadius: 11, overflow: "hidden" },
  btnGrad:     { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 10, borderRadius: 11 },
  btnPrimaryTxt: { fontFamily: FONTS.bold, fontSize: 12, color: "#FFFFFF" },
  btnOutline:  { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#F8FAFC", borderRadius: 11, paddingVertical: 10, borderWidth: 1, borderColor: "#E5E7EB" },
  btnOutlineTxt: { fontFamily: FONTS.bold, fontSize: 12, color: "#4F7EFF" },
});

const ES = StyleSheet.create({
  wrap:    { alignItems: "center", paddingTop: 52, paddingHorizontal: 32 },
  iconBox: { width: 80, height: 80, borderRadius: 24, backgroundColor: "#EEF2FF", alignItems: "center", justifyContent: "center", marginBottom: 20 },
  title:   { fontFamily: FONTS.bold, fontSize: 20, color: "#111827", marginBottom: 8, textAlign: "center" },
  desc:    { fontFamily: FONTS.regular, fontSize: 13, color: "#6B7280", textAlign: "center", lineHeight: 20, marginBottom: 28 },
  btn:     { borderRadius: 14, overflow: "hidden", alignSelf: "stretch" },
  btnGrad: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 14, borderRadius: 14 },
  btnTxt:  { fontFamily: FONTS.bold, fontSize: 14, color: "#FFFFFF" },
});
