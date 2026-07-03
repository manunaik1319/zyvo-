import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  useWindowDimensions,
  Platform,
  Alert,
  Modal,
  Animated,
  Easing,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { FONTS, TYPOGRAPHY } from '../../constants/fonts';
import { useBookingStore } from '../../store/bookingStore';
import { useSpaceStore as useGlobalSpaceStore, StudySpace } from '../../store/spaceStore';
import Button from '../../components/common/Button';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, LinearGradient as SvgLinearGradient, Stop, Circle, Text as SvgText } from 'react-native-svg';

const getNext7Days = () => {
  const days = [];
  const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    days.push({
      id: `day_${i}`,
      dayName: i === 0 ? 'Today' : weekdayNames[d.getDay()],
      dayNum: d.getDate(),
      monthName: monthNames[d.getMonth()],
      formatted: `${monthNames[d.getMonth()]} ${d.getDate()}, 2026`,
      isToday: i === 0,
    });
  }
  return days;
};

const TIME_SLOTS = [
  { time: '09:00 AM - 11:00 AM', status: 'available' },
  { time: '11:30 AM - 01:30 PM', status: 'recommended' },
  { time: '02:00 PM - 04:00 PM', status: 'peak' },
  { time: '04:30 PM - 06:30 PM', status: 'available' },
  { time: '07:00 PM - 09:00 PM', status: 'available' },
];

const INITIAL_SEATS = [
  // Row A - Premium Silent Cabins (6 seats)
  { id: 'A1', type: 'premium', status: 'available' },
  { id: 'A2', type: 'premium', status: 'occupied' },
  { id: 'A3', type: 'premium', status: 'available' },
  { id: 'A4', type: 'premium', status: 'available' },
  { id: 'A5', type: 'premium', status: 'occupied' },
  { id: 'A6', type: 'premium', status: 'available' },
  // Row B - Premium Silent Cabins (6 seats)
  { id: 'B1', type: 'premium', status: 'unavailable' },
  { id: 'B2', type: 'premium', status: 'available' },
  { id: 'B3', type: 'premium', status: 'occupied' },
  { id: 'B4', type: 'premium', status: 'available' },
  { id: 'B5', type: 'premium', status: 'available' },
  { id: 'B6', type: 'premium', status: 'unavailable' },
  // Row C - Standard Focus Desks (8 seats)
  { id: 'C1', type: 'standard', status: 'available' },
  { id: 'C2', type: 'standard', status: 'occupied' },
  { id: 'C3', type: 'standard', status: 'available' },
  { id: 'C4', type: 'standard', status: 'available' },
  { id: 'C5', type: 'standard', status: 'unavailable' },
  { id: 'C6', type: 'standard', status: 'available' },
  { id: 'C7', type: 'standard', status: 'available' },
  { id: 'C8', type: 'standard', status: 'occupied' },
  // Row D - Standard Focus Desks (8 seats)
  { id: 'D1', type: 'standard', status: 'occupied' },
  { id: 'D2', type: 'standard', status: 'available' },
  { id: 'D3', type: 'standard', status: 'occupied' },
  { id: 'D4', type: 'standard', status: 'available' },
  { id: 'D5', type: 'standard', status: 'available' },
  { id: 'D6', type: 'standard', status: 'occupied' },
  { id: 'D7', type: 'standard', status: 'available' },
  { id: 'D8', type: 'standard', status: 'available' },
  // Row E - Standard Focus Desks (8 seats)
  { id: 'E1', type: 'standard', status: 'available' },
  { id: 'E2', type: 'standard', status: 'available' },
  { id: 'E3', type: 'standard', status: 'unavailable' },
  { id: 'E4', type: 'standard', status: 'occupied' },
  { id: 'E5', type: 'standard', status: 'available' },
  { id: 'E6', type: 'standard', status: 'available' },
  { id: 'E7', type: 'standard', status: 'occupied' },
  { id: 'E8', type: 'standard', status: 'available' },
];

const CATEGORIES = [
  { id: 'All', label: 'All Spaces', icon: 'grid', color: '#3B82F6' },
  { id: 'Study Halls', label: 'Study Spaces', icon: 'school', color: '#6366F1' },
  { id: 'Libraries', label: 'Libraries', icon: 'library', color: '#10B981' },
  { id: 'Group Rooms', label: 'Co-work', icon: 'briefcase', color: '#8B5CF6' },
  { id: 'Focus Pods', label: 'Focus Pods', icon: 'cube', color: '#F59E0B' },
  { id: 'Reading Rooms', label: 'Reading', icon: 'reader', color: '#06B6D4' },
];

const FOCUS_MODES = [
  { id: 'exam', label: 'Exam Prep', icon: '📚', rows: ['A', 'B'] },
  { id: 'coding', label: 'Coding', icon: '💻', rows: ['C', 'D'] },
  { id: 'reading', label: 'Reading', icon: '📖', rows: ['E'] },
  { id: 'group', label: 'Group Study', icon: '🤝', rows: ['F'] },
];

const getCardGradientColors = (category: string): [string, string, ...string[]] => {
  switch (category) {
    case 'Libraries':
      return ['#FFFFFF', '#F0FDF4', '#E6F4EA'];
    case 'Study Halls':
      return ['#FFFFFF', '#EEF2FF', '#E0E7FF'];
    case 'Focus Pods':
      return ['#FFFFFF', '#FFFBEB', '#FEF3C7'];
    case 'Group Rooms':
      return ['#FFFFFF', '#F5F3FF', '#EDE9FE'];
    case 'Reading Rooms':
      return ['#FFFFFF', '#ECFEFF', '#D8F8FA'];
    default:
      return ['#FFFFFF', '#F8FAFC', '#F1F5F9'];
  }
};

const getCardBorderColor = (category: string): string => {
  switch (category) {
    case 'Libraries':
      return '#A7F3D0';
    case 'Study Halls':
      return '#C7D2FE';
    case 'Focus Pods':
      return '#FDE68A';
    case 'Group Rooms':
      return '#DDD6FE';
    case 'Reading Rooms':
      return '#A5F3FC';
    default:
      return '#E2E8F0';
  }
};

const getCategoryBackgroundColor = (category: string): string => {
  switch (category) {
    case 'Libraries':
      return '#F4FBF7';
    case 'Study Halls':
      return '#F5F7FF';
    case 'Focus Pods':
      return '#FFFDF5';
    case 'Group Rooms':
      return '#FAF8FF';
    case 'Reading Rooms':
      return '#F4FEFF';
    default:
      return '#F8FAFC';
  }
};

export default function Booking() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const spaces = useGlobalSpaceStore((state) => state.spaces);
  const favoritedIds = useGlobalSpaceStore((state) => state.favoritedIds);
  const toggleFavorite = useGlobalSpaceStore((state) => state.toggleFavorite);
  const addBooking = useBookingStore((state) => state.addBooking);

  const { width } = useWindowDimensions();
  const isLarge = width > 768;

  // Initialize selected space
  const initialSpaceId = params.spaceId as string;
  const initialSpace = spaces.find((s) => s.id === initialSpaceId) || spaces[0];
  const [selectedSpace, setSelectedSpace] = useState<StudySpace>(
    initialSpaceId ? {
      ...initialSpace,
      name: initialSpaceId === '1' ? 'Metro Focus Lounge' : initialSpace.name,
      location: initialSpaceId === '1' ? '88 Commerce St' : initialSpace.location,
    } : initialSpace
  );

  // Favorited state
  const isFavorited = favoritedIds.includes(selectedSpace.id);

  // Manage Steps: 'select_space' or 'select_details'
  const [bookingStep, setBookingStep] = useState<'select_space' | 'select_details'>(
    initialSpaceId ? 'select_details' : 'select_space'
  );

  // Sidebar Category Filter state
  const [selectedCategory, setSelectedCategory] = useState<string>(
    (params.category as string) || 'All'
  );

  // Date and Time selection
  const days = getNext7Days();
  const [selectedDay, setSelectedDay] = useState(days[0]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(TIME_SLOTS[0].time);
  const [isDateTimeCollapsed, setIsDateTimeCollapsed] = useState(false);
  const [calendarModalVisible, setCalendarModalVisible] = useState(false);

  const [activeSubStep, setActiveSubStep] = useState<1 | 2 | 3 | 4>(1);

  // Scroll Refs
  const mainScrollViewRef = useRef<ScrollView>(null);
  const seatScrollRef = useRef<ScrollView>(null);

  // Focus Modes
  const [selectedFocusMode, setSelectedFocusMode] = useState<string | null>(null);

  // Seat selection states
  const [selectedSeat, setSelectedSeat] = useState<string | null>((params.selectedSeat as string) || null);
  const [selectedFloor, setSelectedFloor] = useState<number>(Number(params.selectedFloor) || 1);
  const [hasScrolledSeat, setHasScrolledSeat] = useState(false);

  // Duration active Tab
  const [activeTab, setActiveTab] = useState<'hourly' | 'daily' | 'monthly' | 'long_term'>('hourly');

  // Steppers & Plans selections
  const [hoursCount, setHoursCount] = useState(2);
  const [daysCount, setDaysCount] = useState(1);
  const [selectedMonthlyPlan, setSelectedMonthlyPlan] = useState<'1_month' | '3_months' | '6_months' | '1_year'>('3_months');
  const [selectedLongTermPlan, setSelectedLongTermPlan] = useState<'semester' | 'academic' | 'custom'>('semester');

  // Floor layouts
  const [seatsFloor1] = useState(INITIAL_SEATS);
  const [seatsFloor2] = useState(
    INITIAL_SEATS.map((seat, index) => {
      let status = 'available';
      if (index % 3 === 0) status = 'occupied';
      else if (index % 5 === 0) status = 'unavailable';
      return { ...seat, status };
    })
  );

  const currentFloorSeats = selectedFloor === 1 ? seatsFloor1 : seatsFloor2;
  const activeCategoryObj = CATEGORIES.find((c) => c.id === selectedCategory) || CATEGORIES[0];
  const filteredSpaces = spaces.filter((s) => selectedCategory === 'All' || s.category === selectedCategory);

  // Animations values
  const floatAnim = useRef(new Animated.Value(0)).current;
  const selectScale = useRef(new Animated.Value(1)).current;

  // Background spotlight floating
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 18000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 18000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    ).start();
  }, []);

  // Sync parameters
  useEffect(() => {
    if (params.category) {
      setSelectedCategory(params.category as string);
    }
  }, [params.category]);

  useEffect(() => {
    if (params.spaceId) {
      const space = spaces.find((s) => s.id === (params.spaceId as string));
      if (space) {
        setSelectedSpace({
          ...space,
          name: space.id === '1' ? 'Metro Focus Lounge' : space.name,
          location: space.id === '1' ? '88 Commerce St' : space.location,
        });
        setBookingStep('select_details');
      }
    }
  }, [params.spaceId, spaces]);

  useEffect(() => {
    if (params.selectedSeat) {
      setSelectedSeat(params.selectedSeat as string);
    }
  }, [params.selectedSeat]);

  useEffect(() => {
    if (params.selectedFloor) {
      setSelectedFloor(Number(params.selectedFloor));
    }
  }, [params.selectedFloor]);

  const handleSeatSelect = (seatId: string, status: string) => {
    if (status === 'occupied') {
      Alert.alert('Desk Occupied', `Desk ${seatId} is currently in use. Please select another.`);
      return;
    }
    if (status === 'unavailable') {
      Alert.alert('Desk Unavailable', `Desk ${seatId} is out of order.`);
      return;
    }
    setSelectedSeat(seatId);
    setActiveSubStep(3); // Advance stepper

    // Bounce selection micro-interaction
    Animated.sequence([
      Animated.timing(selectScale, { toValue: 1.16, duration: 120, useNativeDriver: true }),
      Animated.spring(selectScale, { toValue: 1, friction: 4, useNativeDriver: true })
    ]).start();

    // Smooth scroll down to duration container
    setTimeout(() => {
      mainScrollViewRef.current?.scrollTo({ y: 780, animated: true });
    }, 150);
  };

  const getRecommendedRows = () => {
    const activeMode = FOCUS_MODES.find(m => m.label === selectedFocusMode);
    return activeMode ? activeMode.rows : [];
  };

  // Pricing calculations
  const getWorkspaceFee = () => {
    switch (activeTab) {
      case 'hourly':
        return 10 * hoursCount;
      case 'daily':
        return 80 * daysCount;
      case 'monthly':
        if (selectedMonthlyPlan === '1_month') return 1200;
        if (selectedMonthlyPlan === '3_months') return 3000;
        if (selectedMonthlyPlan === '6_months') return 5760;
        if (selectedMonthlyPlan === '1_year') return 9600;
        return 3000;
      case 'long_term':
        if (selectedLongTermPlan === 'semester') return 3500;
        if (selectedLongTermPlan === 'academic') return 7500;
        return 0;
      default:
        return 10 * hoursCount;
    }
  };

  const rentCost = getWorkspaceFee();
  const platformFee = rentCost > 0 ? 1.50 : 0;
  const taxCost = parseFloat((rentCost * 0.08).toFixed(2));
  const totalCost = parseFloat((rentCost + taxCost + platformFee).toFixed(2));

  const getPlanName = () => {
    if (activeTab === 'hourly') return `${hoursCount} hrs`;
    if (activeTab === 'daily') return `${daysCount} days`;
    if (activeTab === 'monthly') {
      if (selectedMonthlyPlan === '1_month') return '1 Month Plan';
      if (selectedMonthlyPlan === '3_months') return '3 Months Plan';
      if (selectedMonthlyPlan === '6_months') return '6 Months Plan';
      if (selectedMonthlyPlan === '1_year') return '1 Year Plan';
    }
    if (activeTab === 'long_term') {
      if (selectedLongTermPlan === 'semester') return 'Semester Pass';
      if (selectedLongTermPlan === 'academic') return 'Academic Pass';
      return 'Custom Plan';
    }
    return '';
  };

  const getRateLabel = () => {
    if (activeTab === 'hourly') return '₹10/hr';
    if (activeTab === 'daily') return '₹80/day';
    if (activeTab === 'monthly') {
      if (selectedMonthlyPlan === '1_month') return '₹1,200/mo';
      if (selectedMonthlyPlan === '3_months') return '₹1,000/mo';
      if (selectedMonthlyPlan === '6_months') return '₹960/mo';
      if (selectedMonthlyPlan === '1_year') return '₹800/mo';
    }
    if (activeTab === 'long_term') {
      if (selectedLongTermPlan === 'semester') return '₹3,500 total';
      if (selectedLongTermPlan === 'academic') return '₹7,500 total';
      return 'Quote Requested';
    }
    return '';
  };

  const getCalculatedEndDate = () => {
    const startDate = new Date(selectedDay.formatted);
    if (activeTab === 'monthly') {
      if (selectedMonthlyPlan === '1_month') startDate.setMonth(startDate.getMonth() + 1);
      else if (selectedMonthlyPlan === '3_months') startDate.setMonth(startDate.getMonth() + 3);
      else if (selectedMonthlyPlan === '6_months') startDate.setMonth(startDate.getMonth() + 6);
      else if (selectedMonthlyPlan === '1_year') startDate.setMonth(startDate.getMonth() + 12);
    } else if (activeTab === 'long_term') {
      if (selectedLongTermPlan === 'semester') startDate.setMonth(startDate.getMonth() + 4);
      else if (selectedLongTermPlan === 'academic') startDate.setMonth(startDate.getMonth() + 10);
      else return 'TBD (Quote requested)';
    } else {
      return '';
    }
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[startDate.getMonth()]} ${startDate.getDate()}, ${startDate.getFullYear()}`;
  };

  const getEstimatedEndTime = () => {
    if (activeTab === 'hourly') {
      const startPart = selectedTimeSlot.split(' - ')[0]; // '09:00 AM'
      const [time, period] = startPart.split(' ');
      const [hr, min] = time.split(':').map(Number);
      let endHr = hr + hoursCount;
      let endPeriod = period;
      if (endHr >= 12) {
        if (endHr > 12) endHr = endHr - 12;
        endPeriod = period === 'AM' ? 'PM' : 'AM';
      }
      const formattedMin = min < 10 ? `0${min}` : min;
      return `${endHr}:${formattedMin} ${endPeriod}`;
    } else if (activeTab === 'daily') {
      return 'End of Day (10:00 PM)';
    } else {
      return getCalculatedEndDate();
    }
  };

  const handleConfirmDateTime = () => {
    setIsDateTimeCollapsed(true);
    setActiveSubStep(2);
    // Smooth scroll down to focus modes & seat selector
    setTimeout(() => {
      mainScrollViewRef.current?.scrollTo({ y: 380, animated: true });
    }, 150);
  };

  const handleCheckout = () => {
    if (!selectedSeat) {
      Alert.alert('Select a Seat', 'Please select a desk from the layout grid to complete your booking.');
      return;
    }

    const bookingId = `b_${Math.floor(Math.random() * 900000) + 100000}`;
    const newBooking = {
      id: bookingId,
      spaceId: selectedSpace.id,
      spaceName: selectedSpace.name,
      spaceImageUrl: selectedSpace.imageUrl,
      category: selectedSpace.category,
      date: selectedDay.formatted,
      timeSlot: selectedTimeSlot,
      hours: getPlanName(),
      totalPrice: totalCost,
      status: 'active' as const,
      location: selectedSpace.location,
      seatId: `${selectedSeat} (Flr ${selectedFloor})`,
    };

    addBooking(newBooking);

    // Redirect to success screen
    router.replace({
      pathname: '/booking/success',
      params: {
        spaceId: selectedSpace.id,
        seatId: selectedSeat,
        floor: selectedFloor.toString(),
        plan: activeTab,
        slot: selectedTimeSlot,
        bookingId: bookingId,
        hoursCount: hoursCount.toString(),
      }
    });
  };

  const renderSeatCell = (seat: typeof INITIAL_SEATS[0]) => {
    const isSeatSelected = selectedSeat === seat.id;
    const recommendedRows = getRecommendedRows();
    const isRecommended = recommendedRows.some(row => seat.id.startsWith(row));

    let bg = '#FFFFFF';
    let border = '#E2E8F0';
    let textCol = '#64748B';

    if (seat.status === 'available') {
      bg = '#FFFFFF';
      border = '#E2E8F0';
      textCol = '#475569';
    } else if (seat.status === 'occupied') {
      bg = '#FEE2E2';
      border = '#FECACA';
      textCol = '#EF4444';
    } else if (seat.status === 'unavailable') {
      bg = '#F1F5F9';
      border = '#CBD5E1';
      textCol = '#94A3B8';
    }

    if (isRecommended && seat.status === 'available') {
      border = '#22C55E';
      bg = '#F0FDF4';
      textCol = '#15803D';
    }

    if (isSeatSelected) {
      bg = '#3B82F6';
      border = '#3B82F6';
      textCol = '#FFFFFF';
    }

    const cellContent = (
      <TouchableOpacity
        key={seat.id}
        style={[
          styles.seatCell,
          { backgroundColor: bg, borderColor: border },
        ]}
        onPress={() => handleSeatSelect(seat.id, seat.status)}
        activeOpacity={0.8}
      >
        <Text style={[styles.seatCellText, { color: textCol, fontWeight: isSeatSelected ? 'bold' : 'normal' }]}>
          {seat.id}
        </Text>
      </TouchableOpacity>
    );

    if (isSeatSelected) {
      return (
        <Animated.View key={seat.id} style={{ transform: [{ scale: selectScale }] }}>
          {cellContent}
        </Animated.View>
      );
    }

    return cellContent;
  };

  const renderLayoutRow = (rowLetter: string, type: 'premium' | 'standard') => {
    const rowSeats = currentFloorSeats.filter(s => s.id.startsWith(rowLetter));
    const midpoint = type === 'premium' ? 3 : 4;

    return (
      <View key={rowLetter} style={styles.seatRow}>
        <Text style={styles.rowLabel}>{rowLetter}</Text>
        <View style={styles.rowSeatsContainer}>
          {rowSeats.slice(0, midpoint).map(renderSeatCell)}
          <View style={styles.aisleSpacer} />
          {rowSeats.slice(midpoint).map(renderSeatCell)}
        </View>
      </View>
    );
  };

  // Interpolate drifting spotlight animations
  const driftX1 = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-40, 50],
  });
  const driftY1 = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-30, 40],
  });
  const driftX2 = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [60, -30],
  });

  return (
    <SafeAreaView style={[styles.container, isLarge && { backgroundColor: '#F8FAFC' }]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Background Animated Blobs */}
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <Animated.View
          style={[
            styles.bgBlob,
            {
              backgroundColor: '#3B82F6',
              opacity: 0.12,
              width: 320,
              height: 320,
              borderRadius: 160,
              top: -60,
              left: -40,
              transform: [{ translateX: driftX1 }, { translateY: driftY1 }],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.bgBlob,
            {
              backgroundColor: '#8B5CF6',
              opacity: 0.10,
              width: 380,
              height: 380,
              borderRadius: 190,
              top: 350,
              right: -60,
              transform: [{ translateX: driftX2 }],
            },
          ]}
        />
      </View>

      {/* Floating Header (Catalog Mode only) */}
      {bookingStep === 'select_space' && (
        <View style={[styles.header, isLarge && styles.largeContainer]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              if (router.canGoBack()) router.back();
              else router.replace('/(tabs)/home');
            }}
            activeOpacity={0.7}
          >
            <Feather name="chevron-left" size={24} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Choose Workspace</Text>
          <View style={styles.headerLocation}>
            <Ionicons name="location" size={12} color="#3B82F6" style={{ marginRight: 2 }} />
            <Text style={styles.headerLocationText}>Stanford, CA</Text>
          </View>
        </View>
      )}

      {bookingStep === 'select_space' ? (
        // STEP 1: Premium Catalog Browser
        <View style={[styles.catalogContainer, isLarge && styles.largeContainer]}>
          {/* Side navigation */}
          <View style={styles.sidebar}>
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.sidebarItem, isActive && styles.sidebarItemActive]}
                  onPress={() => setSelectedCategory(cat.id)}
                  activeOpacity={0.8}
                >
                  <View style={[
                    styles.sidebarIconWrapper,
                    { backgroundColor: isActive ? '#3B82F6' : '#EFF6FF' }
                  ]}>
                    <Ionicons
                      name={isActive ? (cat.icon as any) : `${cat.icon}-outline`}
                      size={18}
                      color={isActive ? '#FFFFFF' : '#3B82F6'}
                    />
                  </View>
                  <Text style={[styles.sidebarLabel, isActive && styles.sidebarLabelActive]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Scrollable list */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={[styles.catalogScroll, { backgroundColor: getCategoryBackgroundColor(selectedCategory) }]}
            contentContainerStyle={{ paddingBottom: 120 }}
          >
            <Text style={styles.catalogHeading}>{activeCategoryObj.label} Available</Text>
            {filteredSpaces.map((item: StudySpace) => (
              <TouchableOpacity
                key={item.id}
                style={styles.catalogCardContainer}
                onPress={() => {
                  setSelectedSpace(item);
                  setBookingStep('select_details');
                  setActiveSubStep(1);
                }}
                activeOpacity={0.95}
              >
                <LinearGradient
                  colors={getCardGradientColors(item.category) as [string, string, ...string[]]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[styles.catalogCard, { borderColor: getCardBorderColor(item.category) }]}
                >
                  <Image source={{ uri: item.imageUrl }} style={styles.catalogCardImg} />
                  <View style={styles.catalogCardBody}>
                    <View style={styles.catalogCardHeader}>
                      <Text style={styles.catalogCardCategory}>{item.category}</Text>
                      <View style={styles.cardHeaderRight}>
                        <Text style={styles.cardDistance}>{item.distance}</Text>
                        <View style={styles.ratingDivider} />
                        <View style={styles.ratingRow}>
                          <Ionicons name="star" size={11} color="#F59E0B" />
                          <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
                        </View>
                      </View>
                    </View>
                    <Text style={styles.catalogCardName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.catalogCardLocation} numberOfLines={1}>📍 {item.location}</Text>
                    <View style={styles.catalogCardFooter}>
                      <Text style={styles.catalogCardPrice}>₹{item.price}<Text style={styles.priceUnit}>/hr</Text></Text>
                      <TouchableOpacity
                        style={{
                          backgroundColor: '#1A73E8',
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          borderRadius: 8,
                          shadowColor: '#1A73E8',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.15,
                          shadowRadius: 4,
                          elevation: 2,
                        }}
                        onPress={(e) => {
                          e.stopPropagation();
                          setSelectedSpace(item);
                          setBookingStep('select_details');
                          setActiveSubStep(1);
                        }}
                        activeOpacity={0.8}
                      >
                        <Text style={{ color: '#FFFFFF', fontFamily: FONTS.bold, fontSize: 10 }}>Book Now</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      ) : (
        // STEP 2: Redesigned Premium Booking Screen
        <View style={styles.flexOne}>
          <ScrollView
            ref={mainScrollViewRef}
            showsVerticalScrollIndicator={false}
            style={{ backgroundColor: '#F8FAFC' }}
            contentContainerStyle={[styles.formScroll, isLarge && styles.largeContainer]}
          >
            {/* Banner Section with Parallax overlay */}
            <View style={styles.coverHeader}>
              <Image source={{ uri: selectedSpace.imageUrl }} style={styles.coverImage} />
              <LinearGradient
                colors={['rgba(15,23,42,0.85)', 'rgba(15,23,42,0.15)', 'transparent'] as [string, string, ...string[]]}
                style={StyleSheet.absoluteFillObject}
                start={{ x: 0, y: 1 }}
                end={{ x: 0, y: 0 }}
              />

              {/* Floating glass header buttons */}
              <View style={styles.glassHeaderRow}>
                <TouchableOpacity
                  style={styles.glassIconBtn}
                  onPress={() => {
                    if (initialSpaceId) {
                      if (router.canGoBack()) router.back();
                      else router.replace('/(tabs)/home');
                    } else {
                      setBookingStep('select_space');
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <Feather name="arrow-left" size={18} color="#0F172A" />
                </TouchableOpacity>

                <View style={{ flexDirection: 'row' }}>
                  <TouchableOpacity
                    style={[styles.glassIconBtn, { marginRight: 8 }]}
                    onPress={() => Alert.alert('Share Workspace', `Sharing ${selectedSpace.name}...`)}
                    activeOpacity={0.7}
                  >
                    <Feather name="share-2" size={18} color="#0F172A" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.glassIconBtn}
                    onPress={() => toggleFavorite(selectedSpace.id)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={isFavorited ? 'heart' : 'heart-outline'}
                      size={20}
                      color={isFavorited ? '#EF4444' : '#0F172A'}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Bottom Cover Text details */}
              <View style={styles.coverInfoContainer}>
                <Text style={styles.coverSpaceName}>{selectedSpace.name}</Text>

                <View style={styles.coverMetaRow}>
                  <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={12} color="#F59E0B" style={{ marginRight: 4 }} />
                    <Text style={styles.ratingBadgeText}>{selectedSpace.rating.toFixed(1)}</Text>
                  </View>
                  <Text style={styles.coverMetaText}>• {selectedSpace.distance || '0.5 mi'} away</Text>
                  <View style={styles.openStatusPill}>
                    <View style={styles.statusDot} />
                    <Text style={styles.openStatusText}>Open Now</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Stepper indicator bar */}
            <View style={styles.wizardIndicatorContainer}>
              <View style={styles.wizardStep}>
                <Text style={[styles.wizardStepNum, activeSubStep >= 1 && styles.wizardStepNumActive]}>①</Text>
                <Text style={[styles.wizardStepLabel, activeSubStep >= 1 && styles.wizardStepLabelActive]}>Date & Time</Text>
              </View>
              <Feather name="chevron-right" size={12} color="#94A3B8" style={styles.wizardArrow} />
              <View style={styles.wizardStep}>
                <Text style={[styles.wizardStepNum, activeSubStep >= 2 && styles.wizardStepNumActive]}>②</Text>
                <Text style={[styles.wizardStepLabel, activeSubStep >= 2 && styles.wizardStepLabelActive]}>Select Seat</Text>
              </View>
              <Feather name="chevron-right" size={12} color="#94A3B8" style={styles.wizardArrow} />
              <View style={styles.wizardStep}>
                <Text style={[styles.wizardStepNum, activeSubStep >= 3 && styles.wizardStepNumActive]}>③</Text>
                <Text style={[styles.wizardStepLabel, activeSubStep >= 3 && styles.wizardStepLabelActive]}>Duration</Text>
              </View>
            </View>

            {/* Collapsible Date and Time Section */}
            <View style={[styles.bookingCard, isDateTimeCollapsed && styles.bookingCardLocked]}>
              <View style={styles.cardHeaderWithAction}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.cardTitleText}>Date & Time</Text>
                  {isDateTimeCollapsed && (
                    <View style={styles.confirmedBadge}>
                      <Ionicons name="checkmark-circle" size={12} color="#22C55E" style={{ marginRight: 4 }} />
                      <Text style={styles.confirmedBadgeText}>Confirmed</Text>
                    </View>
                  )}
                </View>
                {isDateTimeCollapsed && (
                  <TouchableOpacity onPress={() => {
                    setIsDateTimeCollapsed(false);
                    setActiveSubStep(1);
                  }} activeOpacity={0.7}>
                    <Text style={styles.actionEditText}>Edit</Text>
                  </TouchableOpacity>
                )}
              </View>

              {isDateTimeCollapsed ? (
                <View style={styles.collapsedDateTimeRow}>
                  <Feather name="calendar" size={16} color="#3B82F6" style={{ marginRight: 8 }} />
                  <Text style={styles.collapsedDateTimeText}>
                    {selectedDay.dayName}, {selectedDay.monthName} {selectedDay.dayNum}  •  {selectedTimeSlot}
                  </Text>
                </View>
              ) : (
                <View style={styles.expandedDateTimeContainer}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <Text style={styles.subLabel}>Select Date</Text>
                    <TouchableOpacity onPress={() => setCalendarModalVisible(true)} activeOpacity={0.7}>
                      <Text style={styles.viewFullCalText}>View calendar →</Text>
                    </TouchableOpacity>
                  </View>

                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.datesScroll}>
                    {days.map((day) => {
                      const isSelected = selectedDay.id === day.id;
                      return (
                        <TouchableOpacity
                          key={day.id}
                          style={[styles.dateCard, isSelected && styles.dateCardActive]}
                          onPress={() => setSelectedDay(day)}
                          activeOpacity={0.8}
                        >
                          {day.isToday && (
                            <View style={styles.todayBadge}>
                              <Text style={styles.todayBadgeText}>TODAY</Text>
                            </View>
                          )}
                          {isSelected ? (
                            <LinearGradient
                              colors={['#3B82F6', '#6366F1'] as [string, string]}
                              style={StyleSheet.absoluteFillObject}
                              start={{ x: 0, y: 0 }}
                              end={{ x: 1, y: 1 }}
                            />
                          ) : null}
                          <Text style={[styles.dateDayName, isSelected && styles.dateTextActive]}>{day.dayName}</Text>
                          <Text style={[styles.dateDayNum, isSelected && styles.dateTextActive]}>{day.dayNum}</Text>
                          <Text style={[styles.dateMonthName, isSelected && styles.dateTextActive]}>{day.monthName}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>

                  <Text style={[styles.subLabel, { marginTop: 14 }]}>Select Time Slot</Text>
                  <View style={styles.slotsGrid}>
                    {TIME_SLOTS.map((slot) => {
                      const isSelected = selectedTimeSlot === slot.time;
                      return (
                        <TouchableOpacity
                          key={slot.time}
                          style={[styles.slotCard, isSelected && styles.slotCardActive]}
                          onPress={() => setSelectedTimeSlot(slot.time)}
                          activeOpacity={0.8}
                        >
                          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                            <Feather name="clock" size={14} color={isSelected ? '#FFF' : '#64748B'} style={{ marginRight: 6 }} />
                            <Text style={[styles.slotText, isSelected && styles.slotTextActive]} numberOfLines={1}>{slot.time}</Text>
                          </View>
                          {slot.status === 'recommended' && (
                            <View style={[styles.timeStatusTag, { backgroundColor: '#F5F3FF' }]}>
                              <Text style={[styles.timeStatusTagText, { color: '#8B5CF6' }]}>Best Choice</Text>
                            </View>
                          )}
                          {slot.status === 'peak' && (
                            <View style={[styles.timeStatusTag, { backgroundColor: '#FFFBEB' }]}>
                              <Text style={[styles.timeStatusTagText, { color: '#D97706' }]}>Peak Hours</Text>
                            </View>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  <TouchableOpacity
                    style={styles.doneDateTimeBtn}
                    onPress={handleConfirmDateTime}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.doneDateTimeBtnText}>Confirm Date & Time</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Study Environment Grid */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Study Environment</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.metricsContainer}
            >
              {[
                { label: 'Quiet Score', val: '94%', icon: 'volume-x', color: ['#EF4444', '#EC4899'] },
                { label: 'Wi-Fi Speed', val: '350 Mbps', icon: 'wifi', color: ['#3B82F6', '#2563EB'] },
                { label: 'Temperature', val: '22°C', icon: 'thermometer', color: ['#10B981', '#059669'] },
                { label: 'A/C Flow', val: 'Active', icon: 'wind', color: ['#06B6D4', '#0891B2'] },
              ].map((met, idx) => (
                <View key={idx} style={styles.metricCard}>
                  <LinearGradient
                    colors={met.color as [string, string]}
                    style={styles.metricIconBg}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Feather name={met.icon as any} size={15} color="#FFFFFF" />
                  </LinearGradient>
                  <Text style={styles.metricVal}>{met.val}</Text>
                  <Text style={styles.metricLabel}>{met.label}</Text>
                </View>
              ))}
            </ScrollView>

            {/* Focus Mode Selector */}
            <View style={styles.bookingCard}>
              <Text style={styles.cardTitleText}>Focus Mode</Text>
              <Text style={styles.focusModeDesc}>Select a mode to highlight recommended seats.</Text>
              <View style={styles.focusModesContainer}>
                {FOCUS_MODES.map((mode) => {
                  const isActive = selectedFocusMode === mode.label;
                  return (
                    <TouchableOpacity
                      key={mode.id}
                      style={[styles.focusModeChip, isActive && styles.focusModeChipActive]}
                      onPress={() => setSelectedFocusMode(isActive ? null : mode.label)}
                      activeOpacity={0.8}
                    >
                      {isActive ? (
                        <LinearGradient
                          colors={['#3B82F6', '#6366F1'] as [string, string]}
                          style={StyleSheet.absoluteFillObject}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                        />
                      ) : null}
                      <Text style={styles.focusIconText}>{mode.icon}</Text>
                      <Text style={[styles.focusModeText, isActive && styles.focusModeTextActive]}>
                        {mode.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Seat Availability & Occupancy Circular Progress Widget */}
            <View style={styles.weeklyCard}>
              <View style={styles.weeklyLeft}>
                <Text style={styles.weeklyHeader}>Seat Occupancy</Text>
                <View style={styles.goalRow}>
                  <View style={styles.bulletIndicator} />
                  <Text style={styles.goalLabel}>Available: 12 Desks Free</Text>
                </View>
                <View style={styles.goalRow}>
                  <View style={[styles.bulletIndicator, { backgroundColor: '#F59E0B' }]} />
                  <Text style={styles.goalLabel}>Live Status: High Occupancy</Text>
                </View>
                <Text style={styles.motivationText}>
                  Peak hour expected between 12:00 PM - 03:00 PM. Book recommended seats for silent focus. 🤫
                </Text>
              </View>
              <View style={styles.weeklyRight}>
                <Svg width={74} height={74} viewBox="0 0 80 80">
                  <Defs>
                    <SvgLinearGradient id="occupancyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <Stop offset="0%" stopColor="#8B5CF6" />
                      <Stop offset="100%" stopColor="#3B82F6" />
                    </SvgLinearGradient>
                  </Defs>
                  <Circle
                    cx="40"
                    cy="40"
                    r="32"
                    stroke="#F1F5F9"
                    strokeWidth="7"
                    fill="none"
                  />
                  <Circle
                    cx="40"
                    cy="40"
                    r="32"
                    stroke="url(#occupancyGrad)"
                    strokeWidth="7"
                    fill="none"
                    strokeDasharray="201"
                    strokeDashoffset="60" // e.g. 70% occupancy
                    strokeLinecap="round"
                    transform="rotate(-90 40 40)"
                  />
                  <SvgText
                    x="40"
                    y="45"
                    fontSize="11"
                    fontFamily={FONTS.bold}
                    fontWeight="bold"
                    fill="#0F172A"
                    textAnchor="middle"
                  >
                    70%
                  </SvgText>
                </Svg>
              </View>
            </View>

            {/* Interactive Seat Map */}
            <View style={styles.seatsOuterContainer}>
              <View style={styles.premiumMapHeader}>
                <Text style={styles.cardTitleText}>Select Focus Seat</Text>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => router.push({
                    pathname: '/booking/seats',
                    params: {
                      spaceId: selectedSpace.id,
                      selectedSeat: selectedSeat || '',
                      selectedFloor: selectedFloor.toString(),
                      slot: selectedTimeSlot,
                      price: selectedSpace.price.toString()
                    }
                  })}
                  style={styles.premiumMapBtn}
                >
                  <LinearGradient
                    colors={['#6366F1', '#06B6D4']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.premiumMapBtnGradient}
                  >
                    <Ionicons name="map-outline" size={12} color="#FFFFFF" style={{ marginRight: 4 }} />
                    <Text style={styles.premiumMapBtnText}>Premium Map</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
              
              {/* Floor Segmented Controller */}
              <View style={styles.floorSelectorRow}>
                <TouchableOpacity
                  style={[styles.floorTab, selectedFloor === 1 && styles.floorTabActive]}
                  onPress={() => {
                    setSelectedFloor(1);
                    setSelectedSeat(null);
                    setActiveSubStep(2);
                  }}
                  activeOpacity={0.8}
                >
                  {selectedFloor === 1 && (
                    <LinearGradient
                      colors={['#3B82F6', '#6366F1'] as [string, string]}
                      style={StyleSheet.absoluteFillObject}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    />
                  )}
                  <Feather name="layers" size={14} color={selectedFloor === 1 ? '#FFFFFF' : '#64748B'} style={{ marginRight: 6 }} />
                  <Text style={[styles.floorTabText, selectedFloor === 1 && styles.floorTabTextActive]}>Floor 1</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.floorTab, selectedFloor === 2 && styles.floorTabActive]}
                  onPress={() => {
                    setSelectedFloor(2);
                    setSelectedSeat(null);
                    setActiveSubStep(2);
                  }}
                  activeOpacity={0.8}
                >
                  {selectedFloor === 2 && (
                    <LinearGradient
                      colors={['#3B82F6', '#6366F1'] as [string, string]}
                      style={StyleSheet.absoluteFillObject}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    />
                  )}
                  <Feather name="layers" size={14} color={selectedFloor === 2 ? '#FFFFFF' : '#64748B'} style={{ marginRight: 6 }} />
                  <Text style={[styles.floorTabText, selectedFloor === 2 && styles.floorTabTextActive]}>Floor 2</Text>
                </TouchableOpacity>
              </View>

              {/* Grid seat map container */}
              <View style={styles.seatScrollWrapper}>
                <ScrollView
                  ref={seatScrollRef}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  onScroll={(e) => {
                    if (e.nativeEvent.contentOffset.x > 10 && !hasScrolledSeat) {
                      setHasScrolledSeat(true);
                    }
                  }}
                  scrollEventThrottle={16}
                  contentContainerStyle={styles.horizontalSeatScroll}
                >
                  <View style={styles.seatLayoutContainer}>
                    <View style={styles.screenBar}>
                      <LinearGradient
                        colors={['#6366F1', '#3B82F6'] as [string, string]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.screenBarGradient}
                      />
                      <Text style={styles.screenText}>STAGE / WHITEBOARD / SCREEN</Text>
                    </View>

                    <Text style={styles.sectionDividerText}>Premium Soundproof Pods (Rows A-B)</Text>
                    <View style={styles.rowsContainer}>
                      {renderLayoutRow('A', 'premium')}
                      {renderLayoutRow('B', 'premium')}
                    </View>

                    <Text style={styles.sectionDividerText}>Open Study Focus Desks (Rows C-E)</Text>
                    <View style={styles.rowsContainer}>
                      {renderLayoutRow('C', 'standard')}
                      {renderLayoutRow('D', 'standard')}
                      {renderLayoutRow('E', 'standard')}
                    </View>
                  </View>
                </ScrollView>

                {/* Left and Right directional arrows */}
                <TouchableOpacity
                  style={[styles.scrollArrowBtn, { left: 4 }]}
                  onPress={() => seatScrollRef.current?.scrollTo({ x: 0, animated: true })}
                >
                  <Feather name="chevron-left" size={18} color="#0F172A" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.scrollArrowBtn, { right: 4 }]}
                  onPress={() => seatScrollRef.current?.scrollTo({ x: 260, animated: true })}
                >
                  <Feather name="chevron-right" size={18} color="#0F172A" />
                </TouchableOpacity>
              </View>

              {!hasScrolledSeat && (
                <Text style={styles.scrollHintText}>← Swipe horizontally to explore desks →</Text>
              )}

              {/* Map Legend */}
              <View style={styles.legendContainer}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendBox, { backgroundColor: '#3B82F6', borderColor: '#3B82F6' }]} />
                  <Text style={styles.legendText}>Selected</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendBox, { backgroundColor: '#F0FDF4', borderColor: '#22C55E', borderWidth: 1 }]} />
                  <Text style={styles.legendText}>Best Match</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendBox, { backgroundColor: '#FFFFFF', borderColor: '#CBD5E1', borderWidth: 1 }]} />
                  <Text style={styles.legendText}>Available</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendBox, { backgroundColor: '#FEE2E2', borderColor: '#EF4444', borderWidth: 1 }]} />
                  <Text style={styles.legendText}>Occupied</Text>
                </View>
              </View>
            </View>

            {/* Stepper Duration Controls */}
            <View style={styles.bookingCard}>
              <Text style={styles.cardTitleText}>Duration Selector</Text>

              {/* Tab Selector */}
              <View style={styles.durationTabsRow}>
                {[
                  { id: 'hourly', label: 'Hourly' },
                  { id: 'daily', label: 'Daily' },
                  { id: 'monthly', label: 'Monthly' },
                  { id: 'long_term', label: 'Passes' }
                ].map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <TouchableOpacity
                      key={tab.id}
                      style={[styles.durationTab, isActive && styles.durationTabActive]}
                      onPress={() => {
                        setActiveTab(tab.id as any);
                        setActiveSubStep(3);
                      }}
                      activeOpacity={0.8}
                    >
                      {isActive && (
                        <LinearGradient
                          colors={['#3B82F6', '#6366F1'] as [string, string]}
                          style={StyleSheet.absoluteFillObject}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                        />
                      )}
                      <Text style={[styles.durationTabText, isActive && styles.durationTabTextActive]}>
                        {tab.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Hourly Tab Content */}
              {activeTab === 'hourly' && (
                <View style={styles.tabContentContainer}>
                  <Text style={styles.durationLabel}>Select Study Duration</Text>
                  <View style={styles.stepperContainer}>
                    <TouchableOpacity
                      style={[styles.stepperBtn, hoursCount <= 1 && styles.stepperBtnDisabled]}
                      disabled={hoursCount <= 1}
                      onPress={() => setHoursCount(hoursCount - 1)}
                    >
                      <Feather name="minus" size={16} color={hoursCount <= 1 ? '#94A3B8' : '#3B82F6'} />
                    </TouchableOpacity>
                    <Text style={styles.stepperValue}>{hoursCount} hrs</Text>
                    <TouchableOpacity
                      style={[styles.stepperBtn, hoursCount >= 12 && styles.stepperBtnDisabled]}
                      disabled={hoursCount >= 12}
                      onPress={() => setHoursCount(hoursCount + 1)}
                    >
                      <Feather name="plus" size={16} color={hoursCount >= 12 ? '#94A3B8' : '#3B82F6'} />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.pricePreviewText}>Rate: ₹10/hr  •  Subtotal: ₹{10 * hoursCount}</Text>
                </View>
              )}

              {/* Daily Tab Content */}
              {activeTab === 'daily' && (
                <View style={styles.tabContentContainer}>
                  <Text style={styles.durationLabel}>Select Days</Text>
                  <View style={styles.stepperContainer}>
                    <TouchableOpacity
                      style={[styles.stepperBtn, daysCount <= 1 && styles.stepperBtnDisabled]}
                      disabled={daysCount <= 1}
                      onPress={() => setDaysCount(daysCount - 1)}
                    >
                      <Feather name="minus" size={16} color={daysCount <= 1 ? '#94A3B8' : '#3B82F6'} />
                    </TouchableOpacity>
                    <Text style={styles.stepperValue}>{daysCount} {daysCount === 1 ? 'Day' : 'Days'}</Text>
                    <TouchableOpacity
                      style={[styles.stepperBtn, daysCount >= 30 && styles.stepperBtnDisabled]}
                      disabled={daysCount >= 30}
                      onPress={() => setDaysCount(daysCount + 1)}
                    >
                      <Feather name="plus" size={16} color={daysCount >= 30 ? '#94A3B8' : '#3B82F6'} />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.pricePreviewText}>Day pass: ₹80/day  •  Subtotal: ₹{80 * daysCount}</Text>
                </View>
              )}

              {/* Monthly Tab Content */}
              {activeTab === 'monthly' && (
                <View style={styles.tabContentContainer}>
                  <Text style={styles.durationLabel}>Monthly Membership Plans</Text>
                  <View style={styles.monthlyGrid}>
                    {[
                      { id: '1_month', name: '1 Month', rate: '₹1,200/mo', sub: 'Per Month' },
                      { id: '3_months', name: '3 Months', rate: '₹1,000/mo', sub: 'save 17%', badge: 'Popular', badgeType: 'popular' },
                      { id: '6_months', name: '6 Months', rate: '₹960/mo', sub: '₹5,760 total', badge: 'Save 20%', badgeType: 'save' },
                      { id: '1_year', name: '1 Year', rate: '₹800/mo', sub: '₹9,600 total', badge: 'Save 33%', badgeType: 'save' }
                    ].map((plan) => {
                      const isSelected = selectedMonthlyPlan === plan.id;
                      return (
                        <TouchableOpacity
                          key={plan.id}
                          style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                          onPress={() => setSelectedMonthlyPlan(plan.id as any)}
                          activeOpacity={0.8}
                        >
                          {plan.badge && (
                            <View style={[
                              styles.planBadgeOverlay,
                              plan.badgeType === 'popular' ? styles.badgePopular : styles.badgeSave
                            ]}>
                              <Text style={[
                                styles.planBadgeText,
                                plan.badgeType === 'popular' ? styles.badgeTextPopular : styles.badgeTextSave
                              ]}>
                                {plan.badge}
                              </Text>
                            </View>
                          )}
                          <Text style={styles.optionCardName}>{plan.name}</Text>
                          <Text style={styles.optionCardRate}>{plan.rate}</Text>
                          <Text style={styles.optionCardSub}>{plan.sub}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}

              {/* Long-term Tab Content */}
              {activeTab === 'long_term' && (
                <View style={styles.tabContentContainer}>
                  <Text style={styles.durationLabel}>Academic Passes</Text>
                  <View style={styles.longTermList}>
                    {[
                      { id: 'semester', name: 'Semester Pass', duration: '4 months', priceText: '₹3,500', save: 'save 27%' },
                      { id: 'academic', name: 'Academic Year', duration: '10 months', priceText: '₹7,500', save: 'save 38%' },
                      { id: 'custom', name: 'Custom Pass', duration: 'Consulting Desk', priceText: 'Request Quote', arrow: true }
                    ].map((plan) => {
                      const isSelected = selectedLongTermPlan === plan.id;
                      return (
                        <TouchableOpacity
                          key={plan.id}
                          style={[styles.listOptionRow, isSelected && styles.listOptionRowSelected]}
                          onPress={() => setSelectedLongTermPlan(plan.id as any)}
                          activeOpacity={0.8}
                        >
                          <View style={styles.listOptionLeft}>
                            <Text style={styles.listOptionName}>{plan.name}</Text>
                            <Text style={styles.listOptionDuration}>{plan.duration}</Text>
                          </View>
                          <View style={styles.listOptionRight}>
                            <Text style={styles.listOptionPrice}>{plan.priceText}</Text>
                            {plan.save && (
                              <View style={styles.listSaveBadge}>
                                <Text style={styles.listSaveBadgeText}>{plan.save}</Text>
                              </View>
                            )}
                            {plan.arrow && <Feather name="arrow-right" size={14} color="#3B82F6" />}
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}

              {(activeTab === 'monthly' || activeTab === 'long_term') && (
                <View style={styles.dateRangePreviewContainer}>
                  <Feather name="calendar" size={14} color="#3B82F6" style={{ marginRight: 6 }} />
                  <Text style={styles.dateRangePreviewText}>
                    Active Period: <Text style={{ fontFamily: FONTS.bold, fontWeight: 'bold' }}>{selectedDay.formatted}</Text> to <Text style={{ fontFamily: FONTS.bold, fontWeight: 'bold' }}>{getCalculatedEndDate()}</Text>
                  </Text>
                </View>
              )}
            </View>

            {/* Billing breakdown */}
            <View style={styles.bookingCard}>
              <Text style={styles.cardTitleText}>Price Summary</Text>
              <View style={styles.summaryBox}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Seat Reservation ({getPlanName()})</Text>
                  <Text style={styles.summaryValue}>₹{rentCost}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Platform Fee</Text>
                  <Text style={styles.summaryValue}>₹{platformFee.toFixed(2)}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>GST (8%)</Text>
                  <Text style={styles.summaryValue}>₹{taxCost.toFixed(2)}</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryTotalLabel}>Total Amount</Text>
                  <Text style={styles.summaryTotalValue}>₹{totalCost.toFixed(2)}</Text>
                </View>
              </View>
              <Text style={styles.refundCreditsText}>Unused sessions are refundable as wallet credits.</Text>
            </View>

            <View style={{ height: 160 }} />
          </ScrollView>

          {/* Sticky Bottom Glass Booking Bar */}
          <View style={styles.stickyBottomBar}>
            <View style={styles.stickyLeft}>
              {selectedSeat ? (
                <React.Fragment>
                  <Text style={styles.stickySeatLabel}>Desk {selectedSeat} (Flr {selectedFloor})</Text>
                  <Text style={styles.stickyPriceLabel}>
                    Ends: {getEstimatedEndTime()}  •  <Text style={{ fontWeight: 'bold', color: '#0F172A' }}>₹{totalCost.toFixed(2)}</Text>
                  </Text>
                </React.Fragment>
              ) : (
                <Text style={styles.stickyMutedText}>Select a seat to proceed</Text>
              )}
            </View>

            <TouchableOpacity
              style={[
                styles.stickyCTAButton,
                !selectedSeat && styles.stickyCTAButtonDisabled
              ]}
              disabled={!selectedSeat}
              onPress={handleCheckout}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={(!selectedSeat ? ['#CBD5E1', '#94A3B8'] : ['#3B82F6', '#6366F1']) as [string, string]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.ctaGradient}
              >
                <Text style={styles.stickyCTAButtonText}>Book Seat</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Inline Sheet Calendar */}
      {calendarModalVisible && (
        <View style={styles.inlineSheetOverlay}>
          <TouchableOpacity
            style={styles.inlineSheetBackdrop}
            activeOpacity={1}
            onPress={() => setCalendarModalVisible(false)}
          />
          <View style={styles.inlineSheetContent}>
            <View style={styles.bottomSheetHeader}>
              <Text style={styles.bottomSheetSeatName}>Select Start Date</Text>
              <TouchableOpacity onPress={() => setCalendarModalVisible(false)} style={styles.closeSheetBtn} activeOpacity={0.7}>
                <Feather name="x" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.calendarMonthHeader}>June 2026</Text>
            <View style={styles.calendarGrid}>
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((dw, idx) => (
                <Text key={idx} style={styles.calendarDayOfWeek}>{dw}</Text>
              ))}
              {Array.from({ length: 30 }).map((_, idx) => {
                const dateNum = idx + 1;
                const isUnavailable = dateNum === 28 || dateNum === 29;
                const isSelected = selectedDay.dayNum === dateNum;
                return (
                  <TouchableOpacity
                    key={idx}
                    disabled={isUnavailable}
                    style={[
                      styles.calendarDayCell,
                      isSelected && styles.calendarDayCellSelected,
                      isUnavailable && styles.calendarDayCellUnavailable
                    ]}
                    onPress={() => {
                      setSelectedDay({
                        id: `day_cal_${idx}`,
                        dayName: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][(idx + 2) % 7],
                        dayNum: dateNum,
                        monthName: 'Jun',
                        formatted: `Jun ${dateNum}, 2026`,
                        isToday: dateNum === 28, // mock today
                      });
                      setCalendarModalVisible(false);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={[
                      styles.calendarDayText,
                      isSelected && styles.calendarDayTextSelected,
                      isUnavailable && styles.calendarDayTextUnavailable
                    ]}>
                      {dateNum}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  largeContainer: {
    maxWidth: 620,
    width: '100%',
    alignSelf: 'center',
    borderLeftWidth: 1.5,
    borderRightWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  flexOne: {
    flex: 1,
  },
  bgBlob: {
    position: 'absolute',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
    minHeight: Platform.OS === 'ios' ? 120 : 96,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1.5,
    borderBottomColor: '#E2E8F0',
    zIndex: 10,
    marginBottom: 0,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: '#0F172A',
    fontWeight: 'bold',
  },
  headerLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  headerLocationText: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    color: '#3B82F6',
    fontWeight: 'bold',
  },
  catalogContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
  },
  sidebar: {
    width: 84,
    backgroundColor: '#F8FAFC',
    borderRightWidth: 1.5,
    borderRightColor: '#E2E8F0',
    alignItems: 'center',
    paddingTop: 8,
  },
  sidebarItem: {
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
    paddingVertical: 4,
  },
  sidebarItemActive: {
    borderLeftWidth: 3,
    borderLeftColor: '#3B82F6',
  },
  sidebarIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  sidebarLabel: {
    fontFamily: FONTS.medium,
    fontSize: 10,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  sidebarLabelActive: {
    fontFamily: FONTS.bold,
    color: '#3B82F6',
    fontWeight: 'bold',
  },
  catalogScroll: {
    flex: 1,
  },
  catalogHeading: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: '#0F172A',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
    fontWeight: 'bold',
  },
  catalogCardContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.03,
    shadowRadius: 16,
    elevation: 2,
  },
  catalogCard: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1.5,
    flexDirection: 'row',
    padding: 12,
  },
  catalogCardImg: {
    width: 88,
    height: 88,
    borderRadius: 14,
  },
  catalogCardBody: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  catalogCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  catalogCardCategory: {
    fontFamily: FONTS.bold,
    fontSize: 9,
    color: '#3B82F6',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: 'bold',
  },
  cardHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardDistance: {
    fontFamily: FONTS.medium,
    fontSize: 10,
    color: '#64748B',
  },
  ratingDivider: {
    width: 1.5,
    height: 8,
    backgroundColor: '#CBD5E1',
    marginHorizontal: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    color: '#0F172A',
    marginLeft: 2,
    fontWeight: 'bold',
  },
  catalogCardName: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: '#0F172A',
    marginVertical: 4,
    fontWeight: 'bold',
  },
  catalogCardLocation: {
    fontFamily: FONTS.medium,
    fontSize: 11,
    color: '#64748B',
    marginBottom: 6,
  },
  catalogCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  catalogCardPrice: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: '#0F172A',
    fontWeight: 'bold',
  },
  priceUnit: {
    fontFamily: FONTS.medium,
    fontSize: 10,
    color: '#64748B',
  },
  formScroll: {
    paddingBottom: 40,
  },
  coverHeader: {
    height: 220,
    position: 'relative',
    justifyContent: 'flex-end',
    padding: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
  },
  coverImage: {
    ...StyleSheet.absoluteFillObject,
  },
  glassHeaderRow: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 44 : 20,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  glassIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  coverInfoContainer: {
    zIndex: 2,
    marginTop: 60,
  },
  coverSpaceName: {
    fontFamily: FONTS.bold,
    fontSize: 22,
    color: '#FFFFFF',
    marginBottom: 4,
    fontWeight: 'bold',
  },
  coverMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  ratingBadgeText: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  coverMetaText: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: '#E2E8F0',
    marginLeft: 6,
  },
  openStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 8,
    borderWidth: 0.5,
    borderColor: 'rgba(34, 197, 94, 0.4)',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
    marginRight: 4,
  },
  openStatusText: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    color: '#22C55E',
    fontWeight: 'bold',
  },
  wizardIndicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  wizardStep: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  wizardStepNum: {
    fontSize: 14,
    color: '#94A3B8',
    marginRight: 4,
  },
  wizardStepNumActive: {
    color: '#3B82F6',
    fontWeight: 'bold',
  },
  wizardStepLabel: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: '#94A3B8',
  },
  wizardStepLabelActive: {
    color: '#0F172A',
    fontFamily: FONTS.bold,
    fontWeight: 'bold',
  },
  wizardArrow: {
    marginHorizontal: 4,
  },
  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(226, 232, 240, 0.6)',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.03,
    shadowRadius: 20,
    elevation: 3,
    marginHorizontal: 16,
    marginTop: 16,
  },
  bookingCardLocked: {
    opacity: 0.85,
    backgroundColor: '#FAFBFD',
  },
  cardHeaderWithAction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitleText: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: '#0F172A',
    fontWeight: 'bold',
  },
  confirmedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 8,
  },
  confirmedBadgeText: {
    fontFamily: FONTS.bold,
    fontSize: 9,
    color: '#22C55E',
    fontWeight: 'bold',
  },
  actionEditText: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: 'bold',
  },
  collapsedDateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 12,
  },
  collapsedDateTimeText: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: '#1E3A8A',
    fontWeight: 'bold',
  },
  expandedDateTimeContainer: {
    marginTop: 4,
  },
  subLabel: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: '#64748B',
    fontWeight: 'bold',
  },
  viewFullCalText: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    color: '#3B82F6',
  },
  datesScroll: {
    paddingVertical: 6,
  },
  dateCard: {
    width: 64,
    height: 84,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  dateCardActive: {
    borderColor: '#3B82F6',
  },
  todayBadge: {
    position: 'absolute',
    top: 4,
    backgroundColor: '#22C55E',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  todayBadgeText: {
    fontSize: 6,
    fontFamily: FONTS.bold,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  dateDayName: {
    fontFamily: FONTS.medium,
    fontSize: 11,
    color: '#64748B',
    marginBottom: 4,
  },
  dateDayNum: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: '#0F172A',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  dateMonthName: {
    fontFamily: FONTS.regular,
    fontSize: 10,
    color: '#94A3B8',
  },
  dateTextActive: {
    color: '#FFFFFF',
  },
  slotsGrid: {
    marginTop: 6,
  },
  slotCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 12,
    marginBottom: 8,
  },
  slotCardActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  slotText: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: '#334155',
  },
  slotTextActive: {
    color: '#1E3A8A',
    fontFamily: FONTS.bold,
    fontWeight: 'bold',
  },
  timeStatusTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  timeStatusTagText: {
    fontFamily: FONTS.bold,
    fontSize: 8,
    fontWeight: 'bold',
  },
  doneDateTimeBtn: {
    backgroundColor: '#3B82F6',
    borderRadius: 16,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 14,
  },
  doneDateTimeBtnText: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  sectionHeader: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 8,
  },
  sectionTitle: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: '#0F172A',
    fontWeight: 'bold',
  },
  metricsContainer: {
    paddingLeft: 16,
    paddingRight: 6,
    paddingBottom: 4,
  },
  metricCard: {
    width: 106,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 12,
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.6)',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 1,
  },
  metricIconBg: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricVal: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: '#0F172A',
    fontWeight: 'bold',
    marginBottom: 1,
  },
  metricLabel: {
    ...TYPOGRAPHY.caption,
    fontFamily: FONTS.medium,
    color: '#64748B',
  },
  focusModeDesc: {
    ...TYPOGRAPHY.caption,
    color: '#64748B',
    marginBottom: 12,
  },
  focusModesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  focusModeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    margin: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  focusModeChipActive: {
    backgroundColor: '#3B82F6',
  },
  focusIconText: {
    fontSize: 12,
    marginRight: 6,
    zIndex: 2,
  },
  focusModeText: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: '#475569',
    zIndex: 2,
  },
  focusModeTextActive: {
    color: '#FFFFFF',
    fontFamily: FONTS.bold,
    fontWeight: 'bold',
  },
  weeklyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(226, 232, 240, 0.6)',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.03,
    shadowRadius: 20,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 16,
  },
  weeklyLeft: {
    flex: 1,
    paddingRight: 16,
  },
  weeklyHeader: {
    ...TYPOGRAPHY.label,
    fontFamily: FONTS.bold,
    color: '#0F172A',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  bulletIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22C55E',
    marginRight: 8,
  },
  goalLabel: {
    ...TYPOGRAPHY.caption,
    fontFamily: FONTS.medium,
    color: '#475569',
  },
  motivationText: {
    ...TYPOGRAPHY.caption,
    fontFamily: FONTS.regular,
    color: '#64748B',
    marginTop: 8,
    lineHeight: 16,
  },
  weeklyRight: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  seatsOuterContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(226, 232, 240, 0.6)',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.03,
    shadowRadius: 20,
    elevation: 3,
    marginHorizontal: 16,
    marginTop: 16,
  },
  premiumMapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  premiumMapBtn: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  premiumMapBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  premiumMapBtnText: {
    fontFamily: FONTS.semiBold,
    fontSize: 11,
    color: '#FFFFFF',
  },
  floorSelectorRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    padding: 4,
    marginTop: 12,
    marginBottom: 16,
  },
  floorTab: {
    flex: 1,
    flexDirection: 'row',
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    position: 'relative',
    overflow: 'hidden',
  },
  floorTabActive: {},
  floorTabText: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: '#64748B',
    zIndex: 2,
  },
  floorTabTextActive: {
    color: '#FFFFFF',
    fontFamily: FONTS.bold,
    fontWeight: 'bold',
    zIndex: 2,
  },
  seatScrollWrapper: {
    position: 'relative',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    overflow: 'hidden',
  },
  horizontalSeatScroll: {
    padding: 16,
  },
  seatLayoutContainer: {
    alignItems: 'center',
  },
  screenBar: {
    width: 320,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  screenBarGradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 6,
  },
  screenText: {
    fontFamily: FONTS.bold,
    fontSize: 9,
    color: '#FFFFFF',
    letterSpacing: 1.5,
    fontWeight: 'bold',
  },
  sectionDividerText: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    color: '#64748B',
    marginVertical: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: 'bold',
  },
  rowsContainer: {
    alignItems: 'center',
    width: '100%',
  },
  seatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  rowLabel: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: '#94A3B8',
    width: 20,
    textAlign: 'center',
  },
  rowSeatsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seatCell: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  seatCellText: {
    fontFamily: FONTS.bold,
    fontSize: 11,
  },
  aisleSpacer: {
    width: 22,
  },
  scrollArrowBtn: {
    position: 'absolute',
    top: '44%',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  scrollHintText: {
    fontFamily: FONTS.medium,
    fontSize: 10,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 8,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
    marginVertical: 2,
  },
  legendBox: {
    width: 12,
    height: 12,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontFamily: FONTS.medium,
    fontSize: 10,
    color: '#64748B',
  },
  durationTabsRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
  },
  durationTab: {
    flex: 1,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    position: 'relative',
    overflow: 'hidden',
  },
  durationTabActive: {},
  durationTabText: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    color: '#64748B',
    zIndex: 2,
  },
  durationTabTextActive: {
    color: '#FFFFFF',
    fontFamily: FONTS.bold,
    fontWeight: 'bold',
    zIndex: 2,
  },
  tabContentContainer: {
    marginTop: 4,
  },
  durationLabel: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: '#475569',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 8,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  stepperBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  stepperBtnDisabled: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  stepperValue: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: '#0F172A',
    fontWeight: 'bold',
  },
  pricePreviewText: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: '#3B82F6',
    marginTop: 4,
    fontWeight: '600',
  },
  monthlyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  optionCard: {
    width: '46%',
    margin: '2%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    position: 'relative',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.015,
    shadowRadius: 8,
  },
  optionCardSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  optionCardName: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: '#0F172A',
    fontWeight: 'bold',
  },
  optionCardRate: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: '#3B82F6',
    marginVertical: 4,
    fontWeight: 'bold',
  },
  optionCardSub: {
    fontFamily: FONTS.regular,
    fontSize: 10,
    color: '#94A3B8',
  },
  planBadgeOverlay: {
    position: 'absolute',
    top: -8,
    right: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    zIndex: 10,
  },
  badgePopular: {
    backgroundColor: '#F59E0B',
  },
  badgeSave: {
    backgroundColor: '#22C55E',
  },
  planBadgeText: {
    fontFamily: FONTS.bold,
    fontSize: 7,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  badgeTextPopular: {
    color: '#FFFFFF',
  },
  badgeTextSave: {
    color: '#FFFFFF',
  },
  longTermList: {
    width: '100%',
  },
  listOptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.015,
    shadowRadius: 8,
  },
  listOptionRowSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  listOptionLeft: {
    flex: 1,
  },
  listOptionName: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: '#0F172A',
    fontWeight: 'bold',
  },
  listOptionDuration: {
    fontFamily: FONTS.medium,
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  listOptionRight: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  listOptionPrice: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: '#3B82F6',
    fontWeight: 'bold',
  },
  listSaveBadge: {
    backgroundColor: '#22C55E',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  listSaveBadgeText: {
    fontFamily: FONTS.bold,
    fontSize: 8,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  dateRangePreviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 14,
    marginTop: 12,
  },
  dateRangePreviewText: {
    fontFamily: FONTS.medium,
    fontSize: 11,
    color: '#1E3A8A',
  },
  summaryBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: '#64748B',
  },
  summaryValue: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: '#0F172A',
    fontWeight: 'bold',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#CBD5E1',
    marginVertical: 8,
  },
  summaryTotalLabel: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: '#0F172A',
    fontWeight: 'bold',
  },
  summaryTotalValue: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: 'bold',
  },
  refundCreditsText: {
    fontFamily: FONTS.medium,
    fontSize: 10,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 8,
  },
  stickyBottomBar: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 16,
    left: 20,
    right: 20,
    height: 76,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.65)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      } as any,
    }),
  },
  stickyLeft: {
    flex: 1,
  },
  stickySeatLabel: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: '#0F172A',
    fontWeight: 'bold',
  },
  stickyPriceLabel: {
    fontFamily: FONTS.medium,
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  stickyMutedText: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: 'bold',
  },
  stickyCTAButton: {
    width: 120,
    height: 46,
    borderRadius: 14,
    overflow: 'hidden',
  },
  stickyCTAButtonDisabled: {
    opacity: 0.5,
  },
  ctaGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stickyCTAButtonText: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  inlineSheetOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    justifyContent: 'flex-end',
  },
  inlineSheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
  },
  inlineSheetContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 10,
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  bottomSheetSeatName: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: '#0F172A',
    fontWeight: 'bold',
  },
  closeSheetBtn: {
    padding: 4,
  },
  calendarMonthHeader: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: 'bold',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDayOfWeek: {
    width: '14.28%',
    textAlign: 'center',
    fontFamily: FONTS.bold,
    fontSize: 10,
    color: '#94A3B8',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  calendarDayCell: {
    width: '14.28%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    borderRadius: 8,
  },
  calendarDayCellSelected: {
    backgroundColor: '#3B82F6',
  },
  calendarDayCellUnavailable: {
    opacity: 0.3,
  },
  calendarDayText: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: '#334155',
  },
  calendarDayTextSelected: {
    color: '#FFFFFF',
    fontFamily: FONTS.bold,
    fontWeight: 'bold',
  },
  calendarDayTextUnavailable: {
    textDecorationLine: 'line-through',
  },
});
