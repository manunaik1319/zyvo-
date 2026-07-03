import { create } from 'zustand';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  university: string;
  avatarUrl: string;
  stats: {
    focusHours: number;
    bookingsCount: number;
    savedSpaces: number;
  };
}

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  setUser: (user: UserProfile | null) => void;
  logout: () => void;
  locationPermissionPrompted: boolean;
  notificationPermissionPrompted: boolean;
  setLocationPermissionPrompted: (prompted: boolean) => void;
  setNotificationPermissionPrompted: (prompted: boolean) => void;
}

const DEFAULT_USER: UserProfile = {
  id: 'u1',
  name: 'Sarah Jenkins',
  email: 's.jenkins@stanford.edu',
  university: 'Stanford University',
  avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
  stats: {
    focusHours: 24,
    bookingsCount: 8,
    savedSpaces: 5,
  },
};

export const useAuthStore = create<AuthState>((set) => ({
  user: DEFAULT_USER,
  isAuthenticated: true,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  logout: () => set({ user: null, isAuthenticated: false }),
  locationPermissionPrompted: false,
  notificationPermissionPrompted: false,
  setLocationPermissionPrompted: (prompted) => set({ locationPermissionPrompted: prompted }),
  setNotificationPermissionPrompted: (prompted) => set({ notificationPermissionPrompted: prompted }),
}));

