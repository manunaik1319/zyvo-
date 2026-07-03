import { create } from 'zustand';

// ─── Session State Machine ────────────────────────────────────────────────────
export type BookingSessionState =
  | 'pending'
  | 'reserved'
  | 'paid'
  | 'confirmed'
  | 'checked_in'
  | 'active'
  | 'checked_out'
  | 'completed'
  | 'cancelled'
  | 'expired'
  | 'refunded';

// ─── Booking Model ────────────────────────────────────────────────────────────
export interface Booking {
  id: string;
  spaceId: string;
  spaceName: string;
  spaceImageUrl: string;
  category: string;
  date: string;
  timeSlot: string;
  hours: number | string;
  totalPrice: number;
  status: 'active' | 'completed' | 'cancelled';
  location: string;
  seatId?: string;
  floor?: string;
  // Payment
  paymentMethod?: string;
  // Check-in / session
  checkInStatus?: 'not_checked_in' | 'checked_in' | 'checked_out';
  sessionState?: BookingSessionState;
  actualStartTime?: string | null;
  actualEndTime?: string | null;
  liveTimerSeconds?: number;
  // Post-session
  reviewSubmitted?: boolean;
  rating?: number;
  studyStreakMultiplier?: number;
  productivityScore?: number;
  // QR
  qrCode?: string;
}

// ─── Store Interface ──────────────────────────────────────────────────────────
interface BookingState {
  bookings: Booking[];
  activeSessionId: string | null;

  setBookings: (bookings: Booking[]) => void;
  addBooking: (booking: Booking) => void;
  updateBooking: (id: string, updates: Partial<Booking>) => void;
  extendBooking: (id: string, extraHours: number, extraPrice: number) => void;
  checkInBooking: (id: string, time: string) => void;
  checkOutBooking: (id: string, time: string, rating: number, notes: string, prodScore: number) => void;
  tickLiveTimer: (id: string) => void;
  setActiveSession: (id: string | null) => void;
  clearActiveSession: () => void;
  submitReview: (id: string, rating: number, productivityScore: number) => void;
  getBookingById: (id: string) => Booking | undefined;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getFormattedDate = (daysOffset: number = 0) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
};

// ─── Seed Data ────────────────────────────────────────────────────────────────
const SEED_BOOKINGS: Booking[] = [
  {
    id: 'ZYV-2026-004500',
    spaceId: '1',
    spaceName: "The Scholar's Haven",
    spaceImageUrl: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=600&auto=format&fit=crop',
    category: 'Libraries',
    date: getFormattedDate(0),
    timeSlot: '4:00 PM – 6:00 PM',
    hours: 2,
    totalPrice: 120,
    status: 'active',
    location: '412 Library Lane, University District',
    seatId: 'A15',
    floor: '1',
    paymentMethod: 'UPI',
    checkInStatus: 'not_checked_in',
    sessionState: 'confirmed',
    reviewSubmitted: false,
    qrCode: 'ZYV-2026-004500',
  },
  {
    id: 'ZYV-2026-003184',
    spaceId: '1',
    spaceName: "The Scholar's Haven",
    spaceImageUrl: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=600&auto=format&fit=crop',
    category: 'Libraries',
    date: 'June 29, 2026',
    timeSlot: '2:00 PM – 6:00 PM',
    hours: 4,
    totalPrice: 315,
    status: 'completed',
    location: '412 Library Lane, University District',
    seatId: 'A12',
    floor: '1',
    paymentMethod: 'UPI',
    checkInStatus: 'checked_out',
    sessionState: 'completed',
    reviewSubmitted: true,
    rating: 5,
    productivityScore: 94,
    qrCode: 'ZYV-2026-003184',
  },
  {
    id: 'ZYV-2026-002910',
    spaceId: '2',
    spaceName: 'Zenith Study Lounge',
    spaceImageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=600&auto=format&fit=crop',
    category: 'Silent Rooms',
    date: 'June 18, 2026',
    timeSlot: '10:00 AM – 2:00 PM',
    hours: 4,
    totalPrice: 280,
    status: 'completed',
    location: '742 Evergreen Terrace',
    seatId: 'B04',
    floor: '2',
    paymentMethod: 'Card',
    checkInStatus: 'checked_out',
    sessionState: 'completed',
    reviewSubmitted: true,
    rating: 5,
    productivityScore: 88,
    qrCode: 'ZYV-2026-002910',
  },
  {
    id: 'ZYV-2026-002415',
    spaceId: '3',
    spaceName: 'Quiet Flow Hub',
    spaceImageUrl: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=600&auto=format&fit=crop',
    category: 'Co-working',
    date: 'June 05, 2026',
    timeSlot: '1:00 PM – 4:00 PM',
    hours: 3,
    totalPrice: 210,
    status: 'cancelled',
    location: '101 Innovation Way',
    seatId: 'C12',
    floor: '1',
    paymentMethod: 'UPI',
    checkInStatus: 'not_checked_in',
    sessionState: 'cancelled',
    reviewSubmitted: false,
    qrCode: 'ZYV-2026-002415',
  },
  {
    id: 'ZYV-2026-001844',
    spaceId: '1',
    spaceName: "The Scholar's Haven",
    spaceImageUrl: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=600&auto=format&fit=crop',
    category: 'Libraries',
    date: 'May 24, 2026',
    timeSlot: '4:00 PM – 8:00 PM',
    hours: 4,
    totalPrice: 315,
    status: 'completed',
    location: '412 Library Lane, University District',
    seatId: 'A08',
    floor: '1',
    paymentMethod: 'UPI',
    checkInStatus: 'checked_out',
    sessionState: 'completed',
    reviewSubmitted: true,
    rating: 5,
    productivityScore: 92,
    qrCode: 'ZYV-2026-001844',
  },
  {
    id: 'ZYV-2026-001402',
    spaceId: '6',
    spaceName: 'Metro Focus Lounge',
    spaceImageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=600&auto=format&fit=crop',
    category: 'Focus Pods',
    date: 'May 12, 2026',
    timeSlot: '02:00 PM – 05:00 PM',
    hours: 3,
    totalPrice: 120,
    status: 'completed',
    location: '88 Commerce Street',
    seatId: 'D02',
    floor: '1',
    checkInStatus: 'checked_out',
    sessionState: 'completed',
    reviewSubmitted: true,
    rating: 4,
    productivityScore: 82,
    qrCode: 'ZYV-2026-001402',
  },
];

// ─── Store ────────────────────────────────────────────────────────────────────
export const useBookingStore = create<BookingState>((set, get) => ({
  bookings: SEED_BOOKINGS,
  activeSessionId: null,

  setBookings: (bookings) => set({ bookings }),

  addBooking: (booking) =>
    set((state) => ({
      bookings: [
        {
          checkInStatus: 'not_checked_in',
          liveTimerSeconds: 0,
          sessionState: 'confirmed',
          reviewSubmitted: false,
          ...booking,
        },
        ...state.bookings,
      ],
    })),

  updateBooking: (id, updates) =>
    set((state) => ({
      bookings: state.bookings.map((b) => (b.id === id ? { ...b, ...updates } : b)),
    })),

  extendBooking: (id, extraHours, extraPrice) =>
    set((state) => ({
      bookings: state.bookings.map((b) => {
        if (b.id !== id) return b;
        const currentHours = typeof b.hours === 'number' ? b.hours : parseInt(b.hours as string) || 0;
        return { ...b, hours: currentHours + extraHours, totalPrice: parseFloat((b.totalPrice + extraPrice).toFixed(2)) };
      }),
    })),

  checkInBooking: (id, time) =>
    set((state) => ({
      bookings: state.bookings.map((b) =>
        b.id === id
          ? { ...b, checkInStatus: 'checked_in', sessionState: 'active', actualStartTime: time, liveTimerSeconds: 0, status: 'active' }
          : b
      ),
      activeSessionId: id,
    })),

  checkOutBooking: (id, time, rating, notes, prodScore) =>
    set((state) => ({
      bookings: state.bookings.map((b) =>
        b.id === id
          ? {
              ...b,
              checkInStatus: 'checked_out',
              sessionState: 'checked_out',
              status: 'completed',
              actualEndTime: time,
              productivityScore: prodScore,
            }
          : b
      ),
      activeSessionId: null,
    })),

  tickLiveTimer: (id) =>
    set((state) => ({
      bookings: state.bookings.map((b) =>
        b.id === id ? { ...b, liveTimerSeconds: (b.liveTimerSeconds || 0) + 1 } : b
      ),
    })),

  setActiveSession: (id) => set({ activeSessionId: id }),
  clearActiveSession: () => set({ activeSessionId: null }),

  submitReview: (id, rating, productivityScore) =>
    set((state) => ({
      bookings: state.bookings.map((b) =>
        b.id === id ? { ...b, reviewSubmitted: true, rating, productivityScore, sessionState: 'completed' } : b
      ),
    })),

  getBookingById: (id) => get().bookings.find((b) => b.id === id),
}));
