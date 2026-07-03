import React, { useRef, useEffect } from "react";
import { Tabs } from "expo-router";
import {
  Platform,
  StyleSheet,
  Animated,
  Easing,
  Text,
  View,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { FONTS } from "../../constants/fonts";

// ─── Design Tokens ─────────────────────────────────────────────────────────────
const PRIMARY   = "#2563EB";           // Professional Blue brand color
const INACTIVE  = "#9CA3AF";           // Cool grey
const BAR_H     = 64;                  // Tab bar height (excluding safe area)

// ─── Custom Tab Button (Standard Items) ───────────────────────────────────────
function CustomTabButton({ label, iconName, activeIconName, onPress, accessibilityState }: any) {
  const focused = accessibilityState?.selected ?? false;
  
  const scale = useRef(new Animated.Value(focused ? 1.08 : 1)).current;
  const pillOpacity = useRef(new Animated.Value(focused ? 1 : 0)).current;
  const barOpacity = useRef(new Animated.Value(focused ? 1 : 0)).current;
  const contentOpacity = useRef(new Animated.Value(focused ? 1 : 0.7)).current;
  
  const prevFocused = useRef(focused);

  useEffect(() => {
    if (prevFocused.current === focused) return;
    prevFocused.current = focused;

    Animated.parallel([
      Animated.spring(scale, {
        toValue: focused ? 1.08 : 1,
        tension: 300,
        friction: 15,
        useNativeDriver: true,
      }),
      Animated.timing(pillOpacity, {
        toValue: focused ? 1 : 0,
        duration: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(barOpacity, {
        toValue: focused ? 1 : 0,
        duration: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(contentOpacity, {
        toValue: focused ? 1 : 0.7,
        duration: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, [focused]);

  return (
    <Pressable
      onPress={onPress}
      style={S.tabItemContainer}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Animated.View style={[S.contentWrapper, { opacity: contentOpacity }]}>
        {/* Pill background + icon */}
        <View style={S.iconArea}>
          <Animated.View style={[S.pillBg, { opacity: pillOpacity }]} />
          <Animated.View style={{ transform: [{ scale }] }}>
            <Ionicons
              name={focused ? activeIconName : iconName}
              size={20}
              color={focused ? PRIMARY : INACTIVE}
            />
          </Animated.View>
        </View>

        {/* Label */}
        <Text style={[
          S.tabLabel,
          {
            color: focused ? PRIMARY : INACTIVE,
            fontFamily: focused ? FONTS.medium : FONTS.regular,
            fontWeight: focused ? "500" : "400",
          }
        ]}>
          {label}
        </Text>

        {/* Small bar under the name when active */}
        <Animated.View style={[S.bottomActiveBar, { opacity: barOpacity }]} />
      </Animated.View>
    </Pressable>
  );
}

// ─── Custom Book Button (Center CTA) ──────────────────────────────────────────
function BookTabButton({ onPress, accessibilityState }: any) {
  const focused = accessibilityState?.selected ?? false;
  const scale = useRef(new Animated.Value(focused ? 1.05 : 1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.94,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: focused ? 1.05 : 1,
      tension: 300,
      friction: 12,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    Animated.spring(scale, {
      toValue: focused ? 1.05 : 1,
      tension: 260,
      friction: 14,
      useNativeDriver: true,
    }).start();
  }, [focused]);

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={S.bookButtonContainer}
      accessibilityRole="button"
      accessibilityLabel="Book study space"
    >
      <Animated.View style={[
        S.bookCircle,
        focused && S.bookCircleActive,
        { transform: [{ scale }] }
      ]}>
        <MaterialCommunityIcons
          name={'seat'}
          size={22}
          color="#FFFFFF"
        />
      </Animated.View>
    </Pressable>
  );
}

// ─── Tabs Layout ───────────────────────────────────────────────────────────────
export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown:          false,
        tabBarShowLabel:      false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          position: "absolute",
          bottom: Platform.OS === 'ios' ? 24 : 16,
          left: 16,
          right: 16,
          height: BAR_H,
          backgroundColor: "#FFFFFF",
          borderWidth: 1,
          borderColor: "rgba(226, 232, 240, 0.8)",
          borderRadius: 24,
          paddingTop: 0,
          paddingBottom: 0,
          overflow: "visible", // Ensure floating elevated items are not clipped
          // Soft shadow separating bar from main content
          shadowColor: "#0F172A",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.06,
          shadowRadius: 16,
          elevation: 4,
          ...Platform.select({
            web: {
              boxShadow: "0 8px 30px rgba(15, 23, 42, 0.06)",
            } as any,
          }),
        },
        tabBarItemStyle: {
          paddingHorizontal: 0,
        },
        tabBarIconStyle: {
          flex: 1,
          width: "100%" as any,
          height: "100%" as any,
        },
      }}
    >
      {/* 1 — Home */}
      <Tabs.Screen
        name="home"
        options={{
          tabBarButton: (props) => (
            <CustomTabButton
              {...props}
              label="Home"
              iconName="home-outline"
              activeIconName="home"
            />
          ),
        }}
      />

      {/* 2 — Discover */}
      <Tabs.Screen
        name="discover"
        options={{
          tabBarButton: (props) => (
            <CustomTabButton
              {...props}
              label="Discover"
              iconName="compass-outline"
              activeIconName="compass"
            />
          ),
        }}
      />

      {/* 3 — Book (Elevated center button, maps to bookings list screen) */}
      <Tabs.Screen
        name="bookings"
        options={{
          tabBarButton: (props) => (
            <BookTabButton {...props} />
          ),
        }}
      />

      {/* 4 — Favorites */}
      <Tabs.Screen
        name="favorites"
        options={{
          tabBarButton: (props) => (
            <CustomTabButton
              {...props}
              label="Favorites"
              iconName="heart-outline"
              activeIconName="heart"
            />
          ),
        }}
      />

      {/* 5 — Profile */}
      <Tabs.Screen
        name="profile"
        options={{
          tabBarButton: (props) => (
            <CustomTabButton
              {...props}
              label="Profile"
              iconName="person-circle-outline"
              activeIconName="person-circle"
            />
          ),
        }}
      />

      {/* Hide legacy tab routes */}
      <Tabs.Screen name="notifications" options={{ href: null }} />
      <Tabs.Screen name="scan"          options={{ href: null }} />
    </Tabs>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  tabItemContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    height: BAR_H,
    position: "relative",
  },
  bottomActiveBar: {
    width: 12,
    height: 2,
    borderRadius: 1,
    backgroundColor: PRIMARY,
    marginTop: 2,
  },
  contentWrapper: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
    paddingTop: 6,
  },
  iconArea: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    marginBottom: 2,
  },
  pillBg: {
    position: "absolute",
    width: 32,
    height: 32,
    borderRadius: 16, // Perfectly rounded circle
    backgroundColor: "rgba(37, 99, 235, 0.08)", // 8% opacity brand background
  },
  tabLabel: {
    fontSize: 10,
    letterSpacing: 0.1,
    textAlign: "center",
    lineHeight: 12,
    marginTop: 1,
  },
  bookButtonContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: BAR_H,
    position: "relative",
  },
  bookCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: PRIMARY,
    justifyContent: "center",
    alignItems: "center",
    marginTop: -16, // elevated above baseline
    borderWidth: 2, // premium white bezel border
    borderColor: "#FFFFFF",
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, // soft diffuse shadow
    shadowRadius: 8,
    elevation: 4,
  },
  bookCircleActive: {
    backgroundColor: PRIMARY,
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
});
