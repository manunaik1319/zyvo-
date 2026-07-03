import { useBookingStore } from '../store/bookingStore';

export function useBookings() {
  const { bookings, setBookings } = useBookingStore();
  return { bookings, setBookings };
}
