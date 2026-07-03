/**
 * Zyvo Route Constants
 * Centralised typed route map for all Expo Router paths.
 */
export const ROUTES = {
  // Auth
  splash: '/',
  onboarding: '/(auth)/onboarding',
  login: '/(auth)/login',
  register: '/(auth)/register',
  otp: '/(auth)/otp',
  forgotPassword: '/(auth)/forgot-password',
  locationPermission: '/(auth)/location-permission',
  notificationPermission: '/(auth)/notification-permission',

  // Tabs
  home: '/(tabs)/home',
  discover: '/(tabs)/discover',
  bookings: '/(tabs)/bookings',
  profile: '/(tabs)/profile',

  // Search
  search: '/search',

  // Space
  spaceDetail: '/space/[id]',

  // Booking Flow
  booking: '/booking',
  bookingSeats: '/booking/seats',
  bookingSummary: '/booking/summary',
  bookingPayment: '/booking/payment',
  bookingSuccess: '/booking/success',
  bookingDetail: '/booking/[id]',
  bookingCheckin: '/booking/checkin',

  // Session
  sessionActive: '/session/active',

  // Misc
  favorites: '/favorites/index',
  settings: '/settings/index',
} as const;
