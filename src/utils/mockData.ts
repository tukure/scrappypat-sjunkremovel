import { JunkItem, CustomerReview, Booking } from '../types';

export const JUNK_ITEMS: JunkItem[] = [
  { id: 'sofa', name: 'Sofa / Couch', category: 'furniture', volumePercent: 15, basePrice: 140, iconName: 'Armchair' },
  { id: 'mattress', name: 'Mattress & Box Spring', category: 'furniture', volumePercent: 15, basePrice: 140, iconName: 'Bed' },
  { id: 'fridge', name: 'Refrigerator / Freezer', category: 'appliances', volumePercent: 20, basePrice: 125, iconName: 'IceCream' },
  { id: 'washer', name: 'Washer / Dryer', category: 'appliances', volumePercent: 15, basePrice: 110, iconName: 'Tv' },
  { id: 'tv', name: 'Old TV / Monitor', category: 'electronics', volumePercent: 8, basePrice: 45, iconName: 'Monitor' },
  { id: 'table', name: 'Dining Table & Chairs', category: 'furniture', volumePercent: 18, basePrice: 100, iconName: 'Grid' },
  { id: 'bicycle', name: 'Old Bicycle', category: 'yard', volumePercent: 8, basePrice: 40, iconName: 'Bike' },
  { id: 'yard_waste', name: 'Yard Waste (Large Bag)', category: 'yard', volumePercent: 5, basePrice: 25, iconName: 'Leaf' },
  { id: 'construction', name: 'Construction Debris (Box)', category: 'debris', volumePercent: 8, basePrice: 50, iconName: 'HardHat' },
  { id: 'boxes', name: 'Cardboard Boxes (Stack)', category: 'household', volumePercent: 6, basePrice: 30, iconName: 'Package' },
  { id: 'old_car', name: 'Old Car / Vehicle Tow-Away', category: 'debris', volumePercent: 75, basePrice: 350, iconName: 'Truck' },
  { id: 'heavy_machinery', name: 'Heavy Machinery / Equipment', category: 'debris', volumePercent: 60, basePrice: 290, iconName: 'HardHat' },
];

export const INITIAL_REVIEWS: CustomerReview[] = [
  {
    id: 'rev-1',
    author: 'Sarah Jenkins',
    rating: 5,
    text: 'Scrappy Pat and Jaxson were incredible! They cleared my entire garage in less than an hour. The tracking link was super helpful—I knew exactly when they were arriving. Highly recommend!',
    date: '2026-06-25',
    tag: 'Garage Cleanout',
  },
  {
    id: 'rev-2',
    author: 'Marcus Vance',
    rating: 5,
    text: 'Very straightforward booking and honest, transparent pricing. I checked the live truck progress map and they arrived right on the dot. Def recycling everything they could too.',
    date: '2026-06-22',
    tag: 'Appliance Recycling',
  },
  {
    id: 'rev-3',
    author: 'Debra Goldstein',
    rating: 5,
    text: 'We had an old bulky sofa and several boxes of yard trash. Pat loaded it up, swept the driveway afterward, and was super friendly. The price matched the online estimate perfectly.',
    date: '2026-06-18',
    tag: 'Sofa & Yard Debris',
  },
];

export const MOCK_ACTIVE_BOOKING: Booking = {
  id: 'PAT-8392-TRACK',
  customerName: 'Alex Mercer',
  phone: '(206) 555-0143',
  email: 'alex.mercer@example.com',
  address: '1420 Pine St',
  city: 'Ottawa',
  preferredDate: 'Today',
  preferredTimeSlot: '10:00 AM - 12:00 PM',
  items: [
    { itemId: 'sofa', count: 1 },
    { itemId: 'fridge', count: 1 },
    { itemId: 'boxes', count: 3 },
  ],
  estimatedLoadSize: 45, // ~45% of a full truck
  estimatedPrice: 285,
  notes: 'Fridge is in the garage, sofa is on the ground floor patio.',
  status: 'en_route',
  trackingProgress: 35, // starting progress
  etaMinutes: 12,
  chatHistory: [
    { id: 'm-1', sender: 'driver', text: 'Hey Alex! This is Pat. We are packing up our previous job and heading your way in about 15 minutes!', timestamp: '10:05 AM' },
    { id: 'm-2', sender: 'customer', text: 'Perfect, thank you! I will open the garage doors.', timestamp: '10:08 AM' },
    { id: 'm-3', sender: 'driver', text: 'Awesome. Jaxson is with me, we will back the truck right up to the driveway when we arrive.', timestamp: '10:10 AM' },
  ],
  createdAt: '2026-06-29T09:00:00Z',
};
