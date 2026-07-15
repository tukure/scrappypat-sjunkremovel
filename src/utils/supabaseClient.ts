import { createClient } from '@supabase/supabase-js';
import { Booking, CustomerReview, BookingStatus, ChatMessage } from '../types';

// Use environment variables if present, otherwise fallback to the user's provided credentials
const env = (import.meta as any).env || {};
const SUPABASE_URL = env.VITE_SUPABASE_URL || 'https://yxjhmobstnqnjgkrogbk.supabase.co';
const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4amhtb2JzdG5xbmpna3JvZ2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM5OTE1MTYsImV4cCI6MjA5OTU2NzUxNn0.bfWPD1Qjxs3GCCulW3Om26kJcR8ch0IKXmbTc8uuq1g';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper to check if Supabase is fully configured and reachable
export async function testSupabaseConnection(): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await supabase.from('reviews').select('id').limit(1);
    if (error) {
      console.warn('Supabase test select error (table might not exist yet):', error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    console.error('Supabase connection failed:', err);
    return { success: false, error: err?.message || String(err) };
  }
}

// Map database row to app Booking type
function mapDbToBooking(row: any): Booking {
  return {
    id: row.id,
    customerName: row.customer_name || row.customerName || '',
    phone: row.phone || '',
    email: row.email || '',
    address: row.address || '',
    city: row.city || '',
    preferredDate: row.preferred_date || row.preferredDate || '',
    preferredTimeSlot: row.preferred_time_slot || row.preferredTimeSlot || '',
    items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items || [],
    estimatedLoadSize: Number(row.estimated_load_size !== undefined ? row.estimated_load_size : (row.estimatedLoadSize || 0)),
    estimatedPrice: Number(row.estimated_price !== undefined ? row.estimated_price : (row.estimatedPrice || 0)),
    notes: row.notes || undefined,
    status: (row.status as BookingStatus) || 'confirmed',
    trackingProgress: Number(row.tracking_progress !== undefined ? row.tracking_progress : (row.trackingProgress || 0)),
    etaMinutes: Number(row.eta_minutes !== undefined ? row.eta_minutes : (row.etaMinutes || 0)),
    chatHistory: typeof row.chat_history === 'string' ? JSON.parse(row.chat_history) : row.chat_history || row.chatHistory || [],
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
  };
}

// Map app Booking type to database row
function mapBookingToDb(booking: Booking) {
  return {
    id: booking.id,
    customer_name: booking.customerName,
    phone: booking.phone,
    email: booking.email,
    address: booking.address,
    city: booking.city,
    preferred_date: booking.preferredDate,
    preferred_time_slot: booking.preferredTimeSlot,
    items: JSON.stringify(booking.items),
    estimated_load_size: booking.estimatedLoadSize,
    estimated_price: booking.estimatedPrice,
    notes: booking.notes || '',
    status: booking.status,
    tracking_progress: booking.trackingProgress,
    eta_minutes: booking.etaMinutes,
    chat_history: JSON.stringify(booking.chatHistory),
  };
}

// Fetch all bookings sorted by created_at desc
export async function fetchBookingsFromSupabase(): Promise<Booking[]> {
  const { data, error } = await supabase
    .from('Bookings')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data || []).map(mapDbToBooking);
}

// Upsert a booking (Insert or Update)
export async function upsertBookingInSupabase(booking: Booking): Promise<void> {
  const dbData = mapBookingToDb(booking);
  const { error } = await supabase
    .from('Bookings')
    .upsert(dbData, { onConflict: 'id' });

  if (error) {
    throw error;
  }
}

// Delete a booking
export async function deleteBookingFromSupabase(id: string): Promise<void> {
  const { error } = await supabase
    .from('Bookings')
    .delete()
    .eq('id', id);

  if (error) {
    throw error;
  }
}

// Fetch all reviews
export async function fetchReviewsFromSupabase(): Promise<CustomerReview[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .order('date', { ascending: false });

  if (error) {
    throw error;
  }

  return (data || []).map(row => ({
    id: row.id,
    author: row.author,
    rating: Number(row.rating),
    text: row.text,
    date: row.date,
    tag: row.tag,
  }));
}

// Insert a review
export async function insertReviewIntoSupabase(review: CustomerReview): Promise<void> {
  const { error } = await supabase
    .from('reviews')
    .insert({
      id: review.id,
      author: review.author,
      rating: review.rating,
      text: review.text,
      date: review.date,
      tag: review.tag,
    });

  if (error) {
    throw error;
  }
}

// SQL code to setup the database
export const SETUP_SQL = `-- OPTIONAL RESET: Uncomment the following lines if you want to wipe the tables and start fully clean:
-- drop table if exists "Bookings";
-- drop table if exists reviews;

-- Create Bookings table
create table if not exists "Bookings" (
  id text primary key,
  customer_name text not null,
  phone text not null,
  email text not null,
  address text not null,
  city text not null,
  preferred_date text not null,
  preferred_time_slot text not null,
  items text not null default '[]',
  estimated_load_size integer not null default 0,
  estimated_price numeric not null default 0,
  notes text,
  status text not null,
  tracking_progress integer not null default 0,
  eta_minutes integer not null default 0,
  chat_history text not null default '[]',
  created_at timestamptz not null default now()
);

-- Enable Row Level Security (RLS)
alter table "Bookings" enable row level security;

-- Drop policies if they exist to prevent "policy already exists" errors
drop policy if exists "Allow public read on Bookings" on "Bookings";
drop policy if exists "Allow public insert on Bookings" on "Bookings";
drop policy if exists "Allow public update on Bookings" on "Bookings";
drop policy if exists "Allow public delete on Bookings" on "Bookings";

-- Create policies to allow all actions for anonymous/public users (easy prototyping/admin)
create policy "Allow public read on Bookings" on "Bookings" for select using (true);
create policy "Allow public insert on Bookings" on "Bookings" for insert with check (true);
create policy "Allow public update on Bookings" on "Bookings" for update using (true);
create policy "Allow public delete on Bookings" on "Bookings" for delete using (true);

-- Create reviews table
create table if not exists reviews (
  id text primary key,
  author text not null,
  rating integer not null,
  text text not null,
  date text not null,
  tag text not null,
  created_at timestamptz not null default now()
);

-- Enable Row Level Security (RLS)
alter table reviews enable row level security;

-- Drop policies if they exist to prevent "policy already exists" errors
drop policy if exists "Allow public read on reviews" on reviews;
drop policy if exists "Allow public insert on reviews" on reviews;

-- Create policies to allow all actions for anonymous/public users
create policy "Allow public read on reviews" on reviews for select using (true);
create policy "Allow public insert on reviews" on reviews for insert with check (true);
`;
