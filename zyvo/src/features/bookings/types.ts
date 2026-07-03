export interface Booking {
  id: string;
  spaceId: string;
  userId: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
}
