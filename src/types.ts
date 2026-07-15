export interface JunkItem {
  id: string;
  name: string;
  category: 'furniture' | 'appliances' | 'electronics' | 'yard' | 'household' | 'debris';
  volumePercent: number; // percent of truck volume per single item (e.g. 10 = 10%)
  basePrice: number;
  iconName: string;
}

export type BookingStatus =
  | 'confirmed'
  | 'dispatched'
  | 'en_route'
  | 'arrived'
  | 'loading'
  | 'completed';

export interface StatusMilestone {
  status: BookingStatus;
  label: string;
  description: string;
  timestamp?: string;
  isCompleted: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'driver' | 'customer';
  text: string;
  timestamp: string;
}

export interface Booking {
  id: string;
  customerName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  preferredDate: string;
  preferredTimeSlot: string;
  items: { itemId: string; count: number }[];
  estimatedLoadSize: number; // percentage of truck (e.g. 25, 50, 75, 100)
  estimatedPrice: number;
  notes?: string;
  status: BookingStatus;
  trackingProgress: number; // 0 to 100 representing path progress
  etaMinutes: number;
  chatHistory: ChatMessage[];
  createdAt: string;
}

export interface CustomerReview {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
  tag: string; // e.g. "Residential Sofa removal"
}
