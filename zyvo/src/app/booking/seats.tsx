import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Animated,
  Vibration,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSpaceStore } from '../../store/spaceStore';
import { FONTS } from '../../constants/fonts';

const { width: W } = Dimensions.get('window');
const PRIMARY_COLOR = '#5B4CF5'; // Modern ZYVO purple

// Generate 14 days from today
const getNext14Days = () => {
  const days = [];
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  for (let i = 0; i < 14; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dayOfWeek = d.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    days.push({
      id: `d_${i}`,
      dayNum: d.getDate(),
      dayName: i === 0 ? 'Today' : weekdays[dayOfWeek],
      monthName: monthNames[d.getMonth()],
      formatted: `${d.getDate()} ${monthNames[d.getMonth()]}`,
      isWeekend,
      disabled: i > 11, // Disable last 2 days to simulate fully-booked slots
    });
  }
  return days;
};

const TIME_SLOTS = [
  { id: 't1', time: '09:00 AM', status: 'available', info: 'Available' },
  { id: 't2', time: '10:00 AM', status: 'popular', info: '🔥 Popular' },
  { id: 't3', time: '11:00 AM', status: 'limited', info: 'Only 3 left' },
  { id: 't4', time: '12:00 PM', status: 'available', info: 'Available' },
  { id: 't5', time: '02:00 PM', status: 'available', info: 'Available' },
  { id: 't6', time: '04:00 PM', status: 'popular', info: '🔥 Popular' },
  { id: 't7', time: '06:00 PM', status: 'unavailable', info: 'Unavailable' },
  { id: 't8', time: '08:00 PM', status: 'unavailable', info: 'Unavailable' },
];

const DURATIONS = [
  { label: '1 Hr', value: 1, recommended: false },
  { label: '2 Hrs', value: 2, recommended: true },
  { label: '3 Hrs', value: 3, recommended: false },
  { label: 'Half Day', value: 4, recommended: false },
  { label: 'Full Day', value: 8, recommended: false },
];

const FILTER_OPTIONS = [
  { label: '⚡ Charging', key: 'hasPower', icon: 'zap' },
  { label: '🪟 Window', key: 'isWindow', icon: 'sidebar' },
  { label: '🤫 Silent Zone', key: 'isSilent', icon: 'volume-x' },
  { label: '❄ AC', key: 'hasAC', icon: 'wind' },
  { label: '☀ Natural Light', key: 'hasNaturalLight', icon: 'sun' },
  { label: '👥 Group', key: 'isGroup', icon: 'users' },
  { label: '📚 Individual', key: 'isIndividual', icon: 'book-open' },
  { label: '♿ Accessible', key: 'isAccessible', icon: 'user' },
];

// Seat configuration type
interface SeatConfig {
  id: string;
  row: string;
  num: number;
  isWindow: boolean;
  hasPower: boolean;
  isSilent: boolean;
  isCorner: boolean;
  hasAC: boolean;
  hasNaturalLight: boolean;
  isGroup: boolean;
  isIndividual: boolean;
  isAccessible: boolean;
  isPremium: boolean;
  description: string;
}

// Generate premium grid rows A to H, seats 1 to 8
const SEATS_GRID: SeatConfig[] = [];
const ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
for (const r of ROWS) {
  for (let n = 1; n <= 8; n++) {
    const isWindow = n === 1 || n === 8;
    const hasPower = n % 2 === 1;
    const isSilent = r === 'A' || r === 'B' || r === 'C';
    const isCorner = (r === 'A' || r === 'H') && (n === 1 || n === 8);
    const hasAC = r !== 'E' && r !== 'F';
    const hasNaturalLight = n <= 2 || n >= 7;
    const isGroup = (r === 'F' || r === 'G' || r === 'H') && (n >= 3 && n <= 6);
    const isIndividual = !isGroup;
    const isAccessible = (r === 'D' || r === 'E') && (n === 1 || n === 2);
    const isPremium = r === 'A' || isCorner;

    let desc = 'Standard study desk, highly comfortable.';
    if (isSilent && isWindow && hasPower) desc = 'Quiet window desk with personal charger outlet. Ideal for intense deep focus sessions.';
    else if (isSilent) desc = 'Silent zone desk. Enforces absolute quietness.';
    else if (isWindow) desc = 'Provides natural light and window views.';
    else if (hasPower) desc = 'Includes dedicated electrical charging socket.';
    else if (isGroup) desc = 'Spacious table desk suitable for group study and projects.';

    SEATS_GRID.push({
      id: `${r}${n}`,
      row: r,
      num: n,
      isWindow,
      hasPower,
      isSilent,
      isCorner,
      hasAC,
      hasNaturalLight,
      isGroup,
      isIndividual,
      isAccessible,
      isPremium,
      description: desc,
    });
  }
}

export default function BookingSeatsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const spaces = useSpaceStore((state) => state.spaces);

  // Scroll offset tracking for sticky header shadow
  const [scrollY, setScrollY] = useState(0);

  // States
  const spaceId = (params.spaceId as string) || '1';
  const baseSpace = spaces.find((s) => s.id === spaceId);
  const space = (baseSpace || {
    id: '1',
    name: "The Scholar's Haven",
    price: 60,
    rating: 4.9,
    distance: '0.8 km',
    seatsAvailable: 23,
    hasAC: true,
    hasWiFi: true,
    hasPower: true,
    openUntil: '11:00 PM',
  }) as any;

  const dates = useMemo(() => getNext14Days(), []);

  // Selections
  const [selectedDate, setSelectedDate] = useState(dates[0]);
  const [selectedTime, setSelectedTime] = useState(TIME_SLOTS[1]); // Default 10:00 AM
  const [selectedDuration, setSelectedDuration] = useState(DURATIONS[1]); // Default 2 Hrs
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  
  // Quick Filters State
  const [activeFilterKey, setActiveFilterKey] = useState<string | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);

  // Animations
  const bottomBarTranslateY = useRef(new Animated.Value(200)).current;
  const seatCardOpacity = useRef(new Animated.Value(0)).current;
  const seatCardScale = useRef(new Animated.Value(0.95)).current;

  // Generate dynamic seat states based on selected date/time
  const seatStates = useMemo(() => {
    const seed = (selectedDate.dayNum + selectedTime.time.charCodeAt(0)) % 10;
    const states: Record<string, 'available' | 'occupied' | 'reserved_soon'> = {};
    
    SEATS_GRID.forEach((seat, idx) => {
      const hash = (idx + seed) % 7;
      if (hash === 2) {
        states[seat.id] = 'occupied';
      } else if (hash === 4) {
        states[seat.id] = 'reserved_soon';
      } else {
        states[seat.id] = 'available';
      }
    });
    return states;
  }, [selectedDate, selectedTime]);

  const selectedSeatObj = useMemo(() => {
    return SEATS_GRID.find((s) => s.id === selectedSeat);
  }, [selectedSeat]);

  // Handle slide up animations for selected seat cards
  useEffect(() => {
    if (selectedSeat) {
      // Animate bottom bar & seat details card in
      Animated.parallel([
        Animated.spring(bottomBarTranslateY, {
          toValue: 0,
          tension: 140,
          friction: 12,
          useNativeDriver: true,
        }),
        Animated.parallel([
          Animated.timing(seatCardOpacity, {
            toValue: 1,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.spring(seatCardScale, {
            toValue: 1,
            tension: 160,
            friction: 12,
            useNativeDriver: true,
          })
        ])
      ]).start();
    } else {
      // Hide components
      Animated.parallel([
        Animated.timing(bottomBarTranslateY, {
          toValue: 200,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.parallel([
          Animated.timing(seatCardOpacity, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(seatCardScale, {
            toValue: 0.95,
            duration: 150,
            useNativeDriver: true,
          })
        ])
      ]).start();
    }
  }, [selectedSeat]);

  const handleSeatPress = (seatId: string) => {
    const state = seatStates[seatId];
    if (state === 'occupied') {
      Alert.alert('Seat Occupied', 'This seat is currently occupied by another student.');
      return;
    }
    if (state === 'reserved_soon') {
      Alert.alert('Seat Reserved', 'This seat is blocked for an upcoming reservation.');
      return;
    }
    if (Platform.OS !== 'web') {
      Vibration.vibrate(12);
    }
    setSelectedSeat(selectedSeat === seatId ? null : seatId);
  };

  const toggleFilter = (key: string) => {
    if (activeFilterKey === key) {
      setActiveFilterKey(null);
    } else {
      setActiveFilterKey(key);
    }
  };

  const handleContinue = () => {
    if (!selectedSeat) return;

    // Financial breakdowns
    const basePrice = space.price * selectedDuration.value;
    const platformFee = 5;
    const discount = selectedDuration.value >= 4 ? 15 : 0;
    const finalPrice = basePrice + platformFee - discount;

    router.push({
      pathname: '/booking/summary',
      params: {
        spaceId: space.id,
        seatId: selectedSeat,
        floor: '1',
        slot: `${selectedTime.time} - ${selectedDuration.label}`,
        hoursCount: selectedDuration.value,
        zone: selectedSeatObj?.isSilent ? 'Silent Zone' : 'Standard Zone',
        isWindow: selectedSeatObj?.isWindow ? 'Yes' : 'No',
        hasPower: selectedSeatObj?.hasPower ? 'Yes' : 'No',
        price: space.price,
        total: finalPrice,
      },
    } as any);
  };

  const headerPaddingTop = Platform.OS === 'android'
    ? (StatusBar.currentHeight ? StatusBar.currentHeight + 12 : 36)
    : (insets.top || 12);

  // Financial calculations
  const basePriceVal = space.price * selectedDuration.value;
  const platformFeeVal = 5;
  const discountVal = selectedDuration.value >= 4 ? 15 : 0;
  const finalTotalVal = basePriceVal + platformFeeVal - discountVal;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent />

      {/* STICKY HEADER */}
      <View
        style={[
          styles.header,
          { paddingTop: headerPaddingTop },
          scrollY > 15 && styles.headerSticky,
        ]}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.75} accessibilityLabel="Go back">
          <Feather name="arrow-left" size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Choose Your Seat</Text>
        <View style={styles.headerRightActions}>
          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={() => setIsFavorited(!isFavorited)}
            activeOpacity={0.8}
            accessibilityLabel="Favorite study space"
          >
            <Ionicons
              name={isFavorited ? 'heart' : 'heart-outline'}
              size={20}
              color={isFavorited ? '#EF4444' : '#0F172A'}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerIconBtn, { marginLeft: 8 }]}
            onPress={() => alert('Share Study Space link copied to clipboard.')}
            activeOpacity={0.8}
            accessibilityLabel="Share study space"
          >
            <Feather name="share-2" size={18} color="#0F172A" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollBody}
        onScroll={(event) => {
          setScrollY(event.nativeEvent.contentOffset.y);
        }}
        scrollEventThrottle={16}
      >
        {/* PREMIUM STUDY SPACE CARD */}
        <View style={styles.spaceCard}>
          <View style={styles.spaceCardTop}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=200&auto=format&fit=crop' }}
              style={styles.spaceThumb}
            />
            <View style={styles.spaceInfoMain}>
              <Text style={styles.spaceName}>{space.name}</Text>
              <View style={styles.spaceMetaRow}>
                <Ionicons name="star" size={13} color="#F5C842" style={{ marginRight: 2 }} />
                <Text style={styles.spaceMetaText}>
                  {space.rating}  •  📍 {space.distance} away  •  💺 {space.seatsAvailable} Available
                </Text>
              </View>
            </View>
            <View style={styles.spacePriceWrap}>
              <Text style={styles.spacePriceText}>₹{space.price}</Text>
              <Text style={styles.spacePriceUnit}>/hr</Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.spaceFeaturesRow}>
            <View style={styles.featureBadge}>
              <Feather name="wind" size={11} color="#5B4CF5" style={{ marginRight: 4 }} />
              <Text style={styles.featureBadgeText}>AC Included</Text>
            </View>
            <View style={styles.featureBadge}>
              <Feather name="wifi" size={11} color="#5B4CF5" style={{ marginRight: 4 }} />
              <Text style={styles.featureBadgeText}>High-Speed WiFi</Text>
            </View>
            <View style={styles.featureBadge}>
              <Feather name="zap" size={11} color="#5B4CF5" style={{ marginRight: 4 }} />
              <Text style={styles.featureBadgeText}>Charging Outlets</Text>
            </View>
            <View style={styles.featureBadge}>
              <Feather name="clock" size={11} color="#64748B" style={{ marginRight: 4 }} />
              <Text style={styles.featureBadgeText}>Open until {space.openUntil || '11:00 PM'}</Text>
            </View>
          </View>
        </View>

        {/* DATE SELECTOR */}
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>Select Date</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateList}>
          {dates.map((d) => {
            const active = selectedDate.id === d.id;
            return (
              <TouchableOpacity
                key={d.id}
                disabled={d.disabled}
                style={[
                  styles.datePill,
                  active && styles.datePillActive,
                  d.isWeekend && !active && styles.datePillWeekend,
                  d.disabled && styles.datePillDisabled,
                ]}
                activeOpacity={0.8}
                onPress={() => {
                  setSelectedDate(d);
                  setSelectedSeat(null);
                }}
              >
                {d.id === 'd_0' && (
                  <View style={[styles.todayBadge, active && styles.todayBadgeActive]}>
                    <Text style={[styles.todayBadgeText, active && styles.todayBadgeTextActive]}>TODAY</Text>
                  </View>
                )}
                <Text style={[
                  styles.dateDayText, 
                  active && styles.dateDayTextActive, 
                  d.isWeekend && !active && styles.dateTextWeekend,
                  d.disabled && styles.dateTextDisabled,
                ]}>
                  {d.dayName}
                </Text>
                <Text style={[
                  styles.dateNumText, 
                  active && styles.dateNumTextActive, 
                  d.isWeekend && !active && styles.dateTextWeekend,
                  d.disabled && styles.dateTextDisabled,
                ]}>
                  {d.dayNum}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* TIME SLOT SELECTOR */}
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>Select Start Time</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.timeList}>
          {TIME_SLOTS.map((t) => {
            const active = selectedTime.id === t.id;
            const disabled = t.status === 'unavailable';
            
            // Availability state layout properties
            let tagBg = 'rgba(91, 76, 245, 0.08)';
            let tagTextCol = PRIMARY_COLOR;
            if (t.status === 'popular') {
              tagBg = '#FEF3C7';
              tagTextCol = '#D97706';
            } else if (t.status === 'limited') {
              tagBg = '#FEE2E2';
              tagTextCol = '#EF4444';
            }

            return (
              <TouchableOpacity
                key={t.id}
                disabled={disabled}
                style={[
                  styles.timeChip,
                  active && styles.timeChipActive,
                  disabled && styles.timeChipDisabled,
                ]}
                activeOpacity={0.8}
                onPress={() => {
                  setSelectedTime(t);
                  setSelectedSeat(null);
                }}
              >
                <Text style={[
                  styles.timeChipText,
                  active && styles.timeChipTextActive,
                  disabled && styles.timeChipTextDisabled,
                ]}>
                  {t.time}
                </Text>
                {!disabled && (
                  <View style={[styles.timeTag, active && styles.timeTagActive, { backgroundColor: active ? 'rgba(255,255,255,0.2)' : tagBg }]}>
                    <Text style={[styles.timeTagText, active && styles.timeTagTextActive, { color: active ? '#FFFFFF' : tagTextCol }]}>
                      {t.info}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* DURATION SELECTOR */}
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>Choose Duration</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.durationScrollList}>
          {DURATIONS.map((dur) => {
            const active = selectedDuration.value === dur.value;
            return (
              <TouchableOpacity
                key={dur.value}
                style={[styles.durationChip, active && styles.durationChipActive]}
                activeOpacity={0.85}
                onPress={() => {
                  setSelectedDuration(dur);
                }}
              >
                <Text style={[styles.durationText, active && styles.durationTextActive]}>
                  {dur.label}
                </Text>
                {dur.recommended && (
                  <View style={[styles.recommendedBadge, active && styles.recommendedBadgeActive]}>
                    <Text style={[styles.recommendedBadgeText, active && styles.recommendedBadgeTextActive]}>
                      Recommended
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* QUICK FILTERS ROW */}
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>Filter Layout Seats</Text>
          {activeFilterKey && (
            <TouchableOpacity onPress={() => setActiveFilterKey(null)}>
              <Text style={styles.clearFilterText}>Clear Filter</Text>
            </TouchableOpacity>
          )}
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScrollList} style={{ marginBottom: 16 }}>
          {FILTER_OPTIONS.map((f) => {
            const isFilterActive = activeFilterKey === f.key;
            return (
              <TouchableOpacity
                key={f.key}
                style={[styles.filterChip, isFilterActive && styles.filterChipActive]}
                activeOpacity={0.8}
                onPress={() => toggleFilter(f.key)}
              >
                <Feather
                  name={f.icon as any}
                  size={12}
                  color={isFilterActive ? '#FFFFFF' : '#4B5563'}
                  style={{ marginRight: 6 }}
                />
                <Text style={[styles.filterChipText, isFilterActive && styles.filterChipTextActive]}>
                  {f.label.replace(/⚡|🪟|🤫|❄|☀|👥|📚|♿/, '').trim()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* LEGEND ROW */}
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: PRIMARY_COLOR }]} />
            <Text style={styles.legendText}>Selected</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderWidth: 1 }]} />
            <Text style={styles.legendText}>Available</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: '#FEF3C7', borderColor: '#FDE68A', borderWidth: 1 }]} />
            <Text style={styles.legendText}>Reserved</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: '#FEE2E2', borderColor: '#FCA5A5', borderWidth: 1 }]} />
            <Text style={styles.legendText}>Occupied</Text>
          </View>
        </View>

        {/* FLOOR PLAN CONTAINER */}
        <View style={styles.floorPlanWrap}>
          {/* Live Indicator Bar */}
          <View style={styles.liveIndicatorBar}>
            <View style={styles.liveGreenDot} />
            <Text style={styles.liveText}>Live Right Now</Text>
            <View style={styles.liveDivider} />
            <Text style={styles.liveText}>23 Seats Available</Text>
            <View style={styles.liveDivider} />
            <Text style={styles.liveText}>Updated 12s ago</Text>
          </View>

          <View style={styles.entranceBar}>
            <Text style={styles.entranceText}>🚪 ENTRANCE & WALKWAY AREA</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.seatsScrollWrap}>
            <View style={styles.seatsGridContainer}>
              {ROWS.map((row) => (
                <View key={row} style={styles.seatRowWrap}>
                  {/* Row indicator label */}
                  <View style={styles.rowLabelBox}>
                    <Text style={styles.rowLabelText}>{row}</Text>
                  </View>

                  {/* Seats 1-8 */}
                  {Array.from({ length: 8 }).map((_, idx) => {
                    const seatNum = idx + 1;
                    const seatId = `${row}${seatNum}`;
                    const state = seatStates[seatId];
                    const config = SEATS_GRID.find((s) => s.id === seatId);

                    const isSelected = selectedSeat === seatId;
                    const isOccupied = state === 'occupied';
                    const isReserved = state === 'reserved_soon';

                    // Check if seat matches active quick filter
                    let matchesFilter = true;
                    if (activeFilterKey) {
                      const matchField = config ? (config[activeFilterKey as keyof SeatConfig] as boolean) : false;
                      if (!matchField) {
                        matchesFilter = false;
                      }
                    }

                    let seatBg = '#FFFFFF';
                    let borderCol = '#E2E8F0';
                    let textCol = '#0F172A';
                    let elevationVal = 1;
                    
                    if (isSelected) {
                      seatBg = PRIMARY_COLOR;
                      borderCol = PRIMARY_COLOR;
                      textCol = '#FFFFFF';
                      elevationVal = 4;
                    } else if (isOccupied) {
                      seatBg = '#FEE2E2';
                      borderCol = '#FCA5A5';
                      textCol = '#EF4444';
                      elevationVal = 0;
                    } else if (isReserved) {
                      seatBg = '#FEF3C7';
                      borderCol = '#FDE68A';
                      textCol = '#D97706';
                      elevationVal = 0;
                    }

                    return (
                      <React.Fragment key={seatId}>
                        {/* Middle walkway divider between seat 4 and seat 5 */}
                        {seatNum === 5 && <View style={styles.walkwaySpacer} />}

                        <TouchableOpacity
                          style={[
                            styles.seatCell,
                            { 
                              backgroundColor: seatBg, 
                              borderColor: borderCol,
                              opacity: matchesFilter ? 1 : 0.25,
                              shadowOpacity: isSelected ? 0.25 : 0.04,
                              elevation: elevationVal,
                            },
                          ]}
                          activeOpacity={0.7}
                          disabled={isOccupied || isReserved}
                          onPress={() => handleSeatPress(seatId)}
                        >
                          <Text style={[styles.seatText, { color: textCol }]}>
                            {seatNum}
                          </Text>

                          {/* Mini feature icon indicators (faint dots when available) */}
                          {config?.hasPower && !isSelected && !isOccupied && !isReserved && (
                            <View style={styles.featureIconIndicator}>
                              <Feather name="zap" size={6} color="#94A3B8" />
                            </View>
                          )}
                          {config?.isWindow && !isSelected && !isOccupied && !isReserved && (
                            <View style={[styles.featureIconIndicator, { left: 2, right: undefined }]}>
                              <Feather name="sidebar" size={6} color="#94A3B8" />
                            </View>
                          )}

                          {/* Premium Seat Badge Star */}
                          {config?.isPremium && !isSelected && !isOccupied && !isReserved && (
                            <View style={styles.premiumStarBadge}>
                              <Text style={styles.premiumStarText}>★</Text>
                            </View>
                          )}
                        </TouchableOpacity>
                      </React.Fragment>
                    );
                  })}
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* SEAT INFORMATION CARD (FLOAT ABOVE BOTTOM SHEET) */}
        {selectedSeatObj && (
          <Animated.View 
            style={[
              styles.seatDetailCard, 
              { opacity: seatCardOpacity, transform: [{ scale: seatCardScale }] }
            ]}
          >
            <View style={styles.seatDetailHeader}>
              <View style={styles.seatDetailTitleWrap}>
                <View style={styles.seatPill}>
                  <Text style={styles.seatPillText}>Seat {selectedSeat}</Text>
                </View>
                {selectedSeatObj.isPremium && (
                  <View style={styles.premiumBadgeLabel}>
                    <Text style={styles.premiumBadgeLabelText}>★ PREMIUM</Text>
                  </View>
                )}
              </View>
              <Text style={styles.seatZoneText}>
                {selectedSeatObj.isSilent ? '🔇 Silent Zone' : '💬 Standard Zone'}
              </Text>
            </View>
            <Text style={styles.seatDetailDesc}>{selectedSeatObj.description}</Text>
            
            <View style={styles.seatFeaturesGrid}>
              {selectedSeatObj.isWindow && (
                <View style={styles.seatFeatureCell}>
                  <Feather name="sidebar" size={12} color="#0F172A" style={{ marginRight: 6 }} />
                  <Text style={styles.seatFeatureText}>Window Seat</Text>
                </View>
              )}
              {selectedSeatObj.hasPower && (
                <View style={styles.seatFeatureCell}>
                  <Feather name="zap" size={12} color="#0F172A" style={{ marginRight: 6 }} />
                  <Text style={styles.seatFeatureText}>Charging Outlet</Text>
                </View>
              )}
              {selectedSeatObj.hasAC && (
                <View style={styles.seatFeatureCell}>
                  <Feather name="wind" size={12} color="#0F172A" style={{ marginRight: 6 }} />
                  <Text style={styles.seatFeatureText}>AC Cooling</Text>
                </View>
              )}
              {selectedSeatObj.hasNaturalLight && (
                <View style={styles.seatFeatureCell}>
                  <Feather name="sun" size={12} color="#0F172A" style={{ marginRight: 6 }} />
                  <Text style={styles.seatFeatureText}>Natural Light</Text>
                </View>
              )}
            </View>
            
            <Text style={styles.seatTipText}>✨ Perfect for long study and writing sessions.</Text>
          </Animated.View>
        )}

        {/* EMPTY STATE INSTRUCTION */}
        {!selectedSeat && (
          <View style={styles.emptyStateCard}>
            <Feather name="info" size={16} color="#64748B" style={{ marginBottom: 6 }} />
            <Text style={styles.emptyStateTitle}>Choose a seat to continue</Text>
            <Text style={styles.emptyStateDesc}>Tap any available white seat on the floor layout above.</Text>
          </View>
        )}
      </ScrollView>

      {/* GLASSMORPHISM BOTTOM BOOKING SUMMARY */}
      <Animated.View
        style={[
          styles.bottomStickyBar,
          { 
            paddingBottom: Math.max(insets.bottom, 12),
            transform: [{ translateY: bottomBarTranslateY }],
          }
        ]}
      >
        <View style={styles.bottomSummaryContent}>
          {selectedSeatObj && (
            <View style={styles.calculationWrapper}>
              <View style={styles.calcHeaderRow}>
                <Text style={styles.calcTitle}>Booking Summary ({selectedSeat})</Text>
                <Text style={styles.calcSubtitle}>{selectedDate.dayName} • {selectedTime.time} ({selectedDuration.label})</Text>
              </View>
              <View style={styles.calcGrid}>
                <View style={styles.calcItem}>
                  <Text style={styles.calcLabel}>Subtotal</Text>
                  <Text style={styles.calcValue}>₹{basePriceVal}</Text>
                </View>
                <View style={styles.calcItem}>
                  <Text style={styles.calcLabel}>Platform Fee</Text>
                  <Text style={styles.calcValue}>₹{platformFeeVal}</Text>
                </View>
                {discountVal > 0 && (
                  <View style={styles.calcItem}>
                    <Text style={styles.calcLabel}>Discount</Text>
                    <Text style={[styles.calcValue, { color: '#10B981' }]}>- ₹{discountVal}</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          <View style={styles.bottomFooterRow}>
            <View style={styles.totalBlock}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>₹{selectedSeat ? finalTotalVal : 0}</Text>
            </View>
            <TouchableOpacity
              style={[styles.continueBtn, !selectedSeat && styles.continueBtnDisabled]}
              disabled={!selectedSeat}
              activeOpacity={0.85}
              onPress={handleContinue}
            >
              <Text style={styles.continueBtnText}>Continue</Text>
              <Feather name="arrow-right" size={15} color="#FFFFFF" style={{ marginLeft: 6 }} />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

    </View>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { 
    flex: 1, 
    backgroundColor: '#FFFFFF',
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 16, 
    paddingBottom: 14, 
    backgroundColor: '#FFFFFF',
    zIndex: 10,
  },
  headerSticky: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(226, 232, 240, 0.8)',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 3,
  },
  backBtn: { 
    width: 40, 
    height: 40, 
    borderRadius: 14, 
    backgroundColor: '#FFFFFF', 
    alignItems: 'center', 
    justifyContent: 'center', 
    borderWidth: 1, 
    borderColor: '#E2E8F0',
  },
  headerTitle: { 
    fontFamily: FONTS.bold, 
    fontSize: 18, 
    color: '#0F172A',
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  scrollBody: { 
    paddingHorizontal: 16, 
    paddingBottom: 220, 
  },
  
  // Premium Study Space Card
  spaceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
  },
  spaceCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spaceThumb: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#E2E8F0',
  },
  spaceInfoMain: {
    flex: 1,
    marginLeft: 12,
  },
  spaceName: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: '#0F172A',
    marginBottom: 4,
  },
  spaceMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spaceMetaText: {
    fontFamily: FONTS.medium,
    fontSize: 11,
    color: '#64748B',
  },
  spacePriceWrap: {
    alignItems: 'flex-end',
  },
  spacePriceText: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: '#5B4CF5',
  },
  spacePriceUnit: {
    fontFamily: FONTS.medium,
    fontSize: 11,
    color: '#64748B',
    marginTop: -2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  spaceFeaturesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  featureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  featureBadgeText: {
    fontFamily: FONTS.medium,
    fontSize: 10,
    color: '#475569',
  },

  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 22,
    marginBottom: 10,
  },
  sectionTitle: { 
    fontFamily: FONTS.bold, 
    fontSize: 15, 
    color: '#0F172A',
  },
  clearFilterText: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: '#5B4CF5',
  },

  // Date selection
  dateList: { 
    paddingBottom: 2,
  },
  datePill: { 
    width: 60, 
    height: 72, 
    borderRadius: 18, 
    backgroundColor: '#FFFFFF', 
    borderWidth: 1, 
    borderColor: '#E2E8F0', 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginRight: 8,
    position: 'relative',
  },
  datePillActive: { 
    backgroundColor: '#5B4CF5', 
    borderColor: '#5B4CF5',
    shadowColor: '#5B4CF5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  datePillWeekend: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  datePillDisabled: {
    backgroundColor: '#F8FAFC',
    borderColor: '#F1F5F9',
    opacity: 0.35,
  },
  todayBadge: {
    position: 'absolute',
    top: 6,
    backgroundColor: 'rgba(91, 76, 245, 0.08)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  todayBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  todayBadgeText: {
    fontFamily: FONTS.bold,
    fontSize: 7,
    color: '#5B4CF5',
  },
  todayBadgeTextActive: {
    color: '#FFFFFF',
  },
  dateDayText: { 
    fontFamily: FONTS.medium, 
    fontSize: 11, 
    color: '#64748B', 
    marginBottom: 4,
  },
  dateDayTextActive: { 
    color: 'rgba(255,255,255,0.75)',
  },
  dateNumText: { 
    fontFamily: FONTS.bold, 
    fontSize: 16, 
    color: '#0F172A',
  },
  dateNumTextActive: { 
    color: '#FFFFFF',
  },
  dateTextWeekend: {
    color: '#94A3B8',
  },
  dateTextDisabled: {
    color: '#CBD5E1',
  },

  // Time selection
  timeList: { 
    paddingBottom: 2,
  },
  timeChip: { 
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 12,
    paddingRight: 8,
    height: 44,
    borderRadius: 14, 
    backgroundColor: '#FFFFFF', 
    borderWidth: 1, 
    borderColor: '#E2E8F0', 
    marginRight: 8,
  },
  timeChipActive: { 
    backgroundColor: '#5B4CF5', 
    borderColor: '#5B4CF5',
  },
  timeChipDisabled: { 
    backgroundColor: '#F8FAFC', 
    borderColor: '#F1F5F9',
    opacity: 0.4,
  },
  timeChipText: { 
    fontFamily: FONTS.medium, 
    fontSize: 13, 
    color: '#475569',
  },
  timeChipTextActive: { 
    color: '#FFFFFF', 
    fontFamily: FONTS.bold,
  },
  timeChipTextDisabled: { 
    color: '#94A3B8',
  },
  timeTag: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    marginLeft: 6,
  },
  timeTagActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  timeTagText: {
    fontFamily: FONTS.bold,
    fontSize: 9,
  },
  timeTagTextActive: {
    color: '#FFFFFF',
  },

  // Duration selection
  durationScrollList: {
    paddingBottom: 2,
  },
  durationChip: { 
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 14,
    paddingRight: 8,
    height: 42,
    borderRadius: 14, 
    backgroundColor: '#FFFFFF', 
    borderWidth: 1, 
    borderColor: '#E2E8F0', 
    marginRight: 8,
  },
  durationChipActive: { 
    backgroundColor: '#5B4CF5', 
    borderColor: '#5B4CF5',
  },
  durationText: { 
    fontFamily: FONTS.medium, 
    fontSize: 13, 
    color: '#475569',
  },
  durationTextActive: { 
    color: '#FFFFFF', 
    fontFamily: FONTS.bold,
  },
  recommendedBadge: {
    backgroundColor: '#E0E7FF',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    marginLeft: 6,
  },
  recommendedBadgeActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  recommendedBadgeText: {
    fontFamily: FONTS.bold,
    fontSize: 9,
    color: '#5B4CF5',
  },
  recommendedBadgeTextActive: {
    color: '#FFFFFF',
  },

  // Filter chips row
  filterScrollList: {
    paddingBottom: 2,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#5B4CF5',
    borderColor: '#5B4CF5',
  },
  filterChipText: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: '#4B5563',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontFamily: FONTS.bold,
  },

  // Legend styles
  legendContainer: { 
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC', 
    borderRadius: 16, 
    padding: 12, 
    borderWidth: 1, 
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  legendItem: { 
    flexDirection: 'row', 
    alignItems: 'center',
  },
  legendBox: { 
    width: 14, 
    height: 14, 
    borderRadius: 4, 
    marginRight: 6,
  },
  legendText: { 
    fontFamily: FONTS.medium, 
    fontSize: 11, 
    color: '#64748B',
  },

  // Floor plan wrapper
  floorPlanWrap: { 
    backgroundColor: '#FFFFFF', 
    borderRadius: 24, 
    padding: 16, 
    borderWidth: 1, 
    borderColor: '#F1F5F9', 
    shadowColor: '#0F172A', 
    shadowOffset: { width: 0, height: 8 }, 
    shadowOpacity: 0.04, 
    shadowRadius: 16, 
    elevation: 2,
    marginBottom: 16,
  },
  liveIndicatorBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingVertical: 6,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  liveGreenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  liveText: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    color: '#475569',
  },
  liveDivider: {
    width: 1,
    height: 10,
    backgroundColor: '#CBD5E1',
    marginHorizontal: 8,
  },
  entranceBar: { 
    width: '100%', 
    paddingVertical: 8, 
    backgroundColor: '#F8FAFC', 
    borderRadius: 8, 
    alignItems: 'center', 
    marginBottom: 18, 
    borderStyle: 'dashed', 
    borderWidth: 1, 
    borderColor: '#CBD5E1',
  },
  entranceText: { 
    fontFamily: FONTS.bold, 
    fontSize: 9, 
    color: '#94A3B8', 
    letterSpacing: 0.5,
  },
  seatsScrollWrap: { 
    paddingBottom: 4,
  },
  seatsGridContainer: { 
    gap: 10,
  },
  seatRowWrap: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8,
  },
  rowLabelBox: { 
    width: 24, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginRight: 4,
  },
  rowLabelText: { 
    fontFamily: FONTS.bold, 
    fontSize: 14, 
    color: '#94A3B8',
  },
  seatCell: { 
    width: 36, 
    height: 36, 
    borderRadius: 10, 
    borderWidth: 1.5, 
    alignItems: 'center', 
    justifyContent: 'center', 
    position: 'relative',
    backgroundColor: '#FFFFFF',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  seatText: { 
    fontFamily: FONTS.bold, 
    fontSize: 12,
  },
  walkwaySpacer: { 
    width: 20,
  },
  featureIconIndicator: { 
    position: 'absolute', 
    bottom: 2, 
    right: 2, 
    width: 8, 
    height: 8, 
    alignItems: 'center', 
    justifyContent: 'center',
  },
  premiumStarBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#FEF3C7',
    width: 10,
    height: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumStarText: {
    fontSize: 7,
    color: '#D97706',
    fontWeight: 'bold',
    lineHeight: 8,
  },

  // Floating Seat info card
  seatDetailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    marginBottom: 20,
  },
  seatDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  seatDetailTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seatPill: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 6,
  },
  seatPillText: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: '#5B4CF5',
  },
  premiumBadgeLabel: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  premiumBadgeLabelText: {
    fontFamily: FONTS.bold,
    fontSize: 8,
    color: '#B45309',
  },
  seatZoneText: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    color: '#6B7280',
    textTransform: 'uppercase',
  },
  seatDetailDesc: {
    fontFamily: FONTS.medium,
    fontSize: 12.5,
    color: '#4B5563',
    lineHeight: 18,
    marginBottom: 12,
  },
  seatFeaturesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  seatFeatureCell: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  seatFeatureText: {
    fontFamily: FONTS.bold,
    fontSize: 10.5,
    color: '#0F172A',
  },
  seatTipText: {
    fontFamily: FONTS.medium,
    fontSize: 11,
    color: '#5B4CF5',
  },

  // Empty state instruction
  emptyStateCard: { 
    backgroundColor: '#F8FAFC', 
    borderRadius: 16, 
    padding: 16, 
    alignItems: 'center', 
    justifyContent: 'center', 
    borderStyle: 'dashed', 
    borderWidth: 1, 
    borderColor: '#CBD5E1',
    marginBottom: 20,
  },
  emptyStateTitle: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: '#475569',
    marginBottom: 2,
  },
  emptyStateDesc: { 
    fontFamily: FONTS.medium, 
    fontSize: 11, 
    color: '#94A3B8', 
    textAlign: 'center',
  },

  // Glassmorphic bottom bar
  bottomStickyBar: { 
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0, 
    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
    borderTopWidth: 1, 
    borderTopColor: 'rgba(226, 232, 240, 0.8)', 
    shadowColor: '#0F172A', 
    shadowOffset: { width: 0, height: -8 }, 
    shadowOpacity: 0.06, 
    shadowRadius: 16, 
    elevation: 10,
    zIndex: 100,
  },
  bottomSummaryContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  calculationWrapper: {
    marginBottom: 12,
  },
  calcHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  calcTitle: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: '#0F172A',
  },
  calcSubtitle: {
    fontFamily: FONTS.medium,
    fontSize: 11,
    color: '#64748B',
  },
  calcGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  calcItem: {
    flex: 1,
    alignItems: 'center',
  },
  calcLabel: {
    fontFamily: FONTS.medium,
    fontSize: 9,
    color: '#64748B',
    marginBottom: 2,
  },
  calcValue: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: '#0F172A',
  },
  bottomFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalBlock: { 
    justifyContent: 'center',
  },
  totalLabel: { 
    fontFamily: FONTS.medium, 
    fontSize: 10, 
    color: '#64748B', 
    marginBottom: 2,
  },
  totalValue: { 
    fontFamily: FONTS.bold, 
    fontSize: 22, 
    color: '#0F172A',
  },
  continueBtn: { 
    flexDirection: 'row',
    backgroundColor: '#5B4CF5', 
    borderRadius: 14, 
    paddingHorizontal: 28, 
    height: 48, 
    justifyContent: 'center', 
    alignItems: 'center', 
    shadowColor: '#5B4CF5', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.2, 
    shadowRadius: 8, 
    elevation: 3,
  },
  continueBtnDisabled: { 
    backgroundColor: '#E2E8F0', 
    shadowOpacity: 0, 
    elevation: 0,
  },
  continueBtnText: { 
    fontFamily: FONTS.bold, 
    fontSize: 14, 
    color: '#FFFFFF',
  },
});
