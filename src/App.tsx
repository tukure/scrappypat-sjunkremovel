import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import BeforeAfterGallery from './components/BeforeAfterGallery';
import BookingSystem from './components/BookingSystem';
import TrackingSystem from './components/TrackingSystem';
import Reviews from './components/Reviews';
import AdminPortal from './components/AdminPortal';
import { Booking, BookingStatus, CustomerReview, ChatMessage } from './types';
import { INITIAL_REVIEWS, MOCK_ACTIVE_BOOKING } from './utils/mockData';
import { ShieldAlert, Trash2, ShieldCheck, Mail, Phone, MapPin, Sparkles, Lock } from 'lucide-react';
import { 
  testSupabaseConnection, 
  fetchBookingsFromSupabase, 
  upsertBookingInSupabase, 
  deleteBookingFromSupabase, 
  fetchReviewsFromSupabase, 
  insertReviewIntoSupabase 
} from './utils/supabaseClient';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'book' | 'track' | 'reviews' | 'admin'>('home');
  const [dbConnected, setDbConnected] = useState<boolean | null>(null);
  const [dbError, setDbError] = useState<string | null>(null);

  // Load bookings from local storage or set initial mock
  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem('scrappypats_bookings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error loading saved bookings", e);
      }
    }
    return [MOCK_ACTIVE_BOOKING];
  });

  // Track the current selected booking ID for the live tracker
  const [activeBookingId, setActiveBookingId] = useState<string | null>(() => {
    return bookings[0]?.id || MOCK_ACTIVE_BOOKING.id;
  });

  // Load reviews from local storage or initial
  const [reviews, setReviews] = useState<CustomerReview[]>(() => {
    const saved = localStorage.getItem('scrappypats_reviews');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error loading saved reviews", e);
      }
    }
    return INITIAL_REVIEWS;
  });

  // Selected preload truck size (used for Hero -> Booking quick link)
  const [preloadSizePercent, setPreloadSizePercent] = useState<number | null>(null);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('scrappypats_bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('scrappypats_reviews', JSON.stringify(reviews));
  }, [reviews]);

  // Sync with Supabase on mount and during explicit re-verifies
  const syncFromSupabase = async () => {
    try {
      const connResult = await testSupabaseConnection();
      if (!connResult.success) {
        setDbConnected(false);
        setDbError(connResult.error || "Supabase connection established, but tables ('bookings' or 'reviews') do not exist yet. Please run the setup SQL.");
        return;
      }

      setDbConnected(true);
      setDbError(null);

      // 1. Fetch & Sync Reviews
      try {
        const fetchedReviews = await fetchReviewsFromSupabase();
        if (fetchedReviews && fetchedReviews.length > 0) {
          setReviews(fetchedReviews);
        } else {
          // If table exists but is empty, let's seed initial reviews so page isn't blank
          for (const rev of INITIAL_REVIEWS) {
            await insertReviewIntoSupabase(rev);
          }
          setReviews(INITIAL_REVIEWS);
        }
      } catch (e: any) {
        console.error("Error syncing reviews from Supabase:", e);
      }

      // 2. Fetch & Sync Bookings
      try {
        const fetchedBookings = await fetchBookingsFromSupabase();
        if (fetchedBookings && fetchedBookings.length > 0) {
          setBookings(fetchedBookings);
          const firstActive = fetchedBookings.find(b => b.status !== 'completed');
          if (firstActive) {
            setActiveBookingId(firstActive.id);
          } else if (fetchedBookings[0]) {
            setActiveBookingId(fetchedBookings[0].id);
          }
        } else {
          // Seed the active mock booking so they have an ongoing active journey to track right away!
          await upsertBookingInSupabase(MOCK_ACTIVE_BOOKING);
          setBookings([MOCK_ACTIVE_BOOKING]);
          setActiveBookingId(MOCK_ACTIVE_BOOKING.id);
        }
      } catch (e: any) {
        console.error("Error syncing bookings from Supabase:", e);
      }

    } catch (e: any) {
      setDbConnected(false);
      setDbError(e.message || "Failed to reach Supabase API.");
      console.error("Supabase sync failed:", e);
    }
  };

  useEffect(() => {
    syncFromSupabase();
  }, []);

  // Handle addition of a new user-created booking
  const handleBookingCreated = async (newBooking: Booking) => {
    setBookings(prev => [newBooking, ...prev]);
    setActiveBookingId(newBooking.id);

    try {
      await upsertBookingInSupabase(newBooking);
    } catch (err) {
      console.error("Failed to persist booking to Supabase, local-only saved:", err);
    }
  };

  // Update status/telemetry of a specific booking (used by simulation driver panel)
  const handleUpdateBookingStatus = async (
    bookingId: string, 
    status: BookingStatus, 
    progress: number, 
    eta: number,
    newMsg?: ChatMessage
  ) => {
    let updatedBooking: Booking | null = null;

    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        const updatedChat = newMsg ? [...b.chatHistory, newMsg] : b.chatHistory;
        updatedBooking = {
          ...b,
          status,
          trackingProgress: progress,
          etaMinutes: eta,
          chatHistory: updatedChat
        };
        return updatedBooking;
      }
      return b;
    }));

    if (updatedBooking) {
      try {
        await upsertBookingInSupabase(updatedBooking);
      } catch (err) {
        console.error("Failed to update booking in Supabase:", err);
      }
    }
  };

  // Add custom message to a booking's chat history
  const handleSendChatMessage = async (bookingId: string, message: ChatMessage) => {
    let updatedBooking: Booking | null = null;

    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        updatedBooking = {
          ...b,
          chatHistory: [...b.chatHistory, message]
        };
        return updatedBooking;
      }
      return b;
    }));

    if (updatedBooking) {
      try {
        await upsertBookingInSupabase(updatedBooking);
      } catch (err) {
        console.error("Failed to sync chat message to Supabase:", err);
      }
    }
  };

  // Reset demo bookings to clean state
  const resetDemoData = async () => {
    if (confirm("Reset the demo tracking session back to its original state? This will restore Scrappy Pat's default Ottawa journey in Supabase and local storage.")) {
      localStorage.removeItem('scrappypats_bookings');
      localStorage.removeItem('scrappypats_reviews');

      if (dbConnected) {
        try {
          // Clear current bookings
          for (const b of bookings) {
            await deleteBookingFromSupabase(b.id);
          }
          await upsertBookingInSupabase(MOCK_ACTIVE_BOOKING);
        } catch (e) {
          console.error("Failed to reset Supabase tables:", e);
        }
      }

      setBookings([MOCK_ACTIVE_BOOKING]);
      setReviews(INITIAL_REVIEWS);
      setActiveBookingId(MOCK_ACTIVE_BOOKING.id);
      setCurrentPage('home');

      if (dbConnected) {
        await syncFromSupabase();
      }
    }
  };

  const handleAddReview = async (newRev: CustomerReview) => {
    setReviews(prev => [newRev, ...prev]);
    try {
      await insertReviewIntoSupabase(newRev);
    } catch (err) {
      console.error("Failed to sync review to Supabase:", err);
    }
  };

  const hasActiveBooking = bookings.some(b => b.status !== 'completed');


  if (currentPage === 'admin') {
    return (
      <AdminPortal
        bookings={bookings}
        reviews={reviews}
        onUpdateBookingStatus={handleUpdateBookingStatus}
        onSendChatMessage={handleSendChatMessage}
        onBookingCreated={handleBookingCreated}
        onBackToSite={() => setCurrentPage('home')}
      />
    );
  }

  return (
    <div className="bg-cream min-h-screen text-ink flex flex-col justify-between">
      <div>
        {/* Navigation Bar */}
        <Navbar 
          currentPage={currentPage} 
          setCurrentPage={setCurrentPage} 
          hasActiveBooking={hasActiveBooking} 
        />

        {/* Dynamic Page Render */}
        <main>
          {currentPage === 'home' && (
            <>
              <Hero 
                setCurrentPage={setCurrentPage} 
                setSelectedPreloadSize={setPreloadSizePercent} 
              />
              <BeforeAfterGallery 
                setCurrentPage={setCurrentPage}
              />
            </>
          )}

          {currentPage === 'book' && (
            <BookingSystem 
              preloadSizePercent={preloadSizePercent}
              clearPreloadSize={() => setPreloadSizePercent(null)}
              onBookingCreated={handleBookingCreated}
              setCurrentPage={setCurrentPage}
            />
          )}

          {currentPage === 'track' && (
            <TrackingSystem 
              bookings={bookings}
              activeBookingId={activeBookingId}
              onUpdateBookingStatus={handleUpdateBookingStatus}
              onSendChatMessage={handleSendChatMessage}
            />
          )}

          {currentPage === 'reviews' && (
            <Reviews 
              reviews={reviews}
              onAddReview={handleAddReview}
            />
          )}
        </main>
      </div>

      {/* Modern High-Impact Footer */}
      <footer className="bg-stone/5 border-t border-olive/10 text-stone py-12 px-4 sm:px-6 lg:px-8 mt-auto mb-16 md:mb-0">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Logo & Slogan */}
          <div className="space-y-3 col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2">
              <span className="font-display font-extrabold text-olive text-lg tracking-tight">
                SCRAPPY PAT'S JUNK REMOVAL<span className="font-serif italic font-normal">.</span>
              </span>
            </div>
            <p className="text-xs text-stone/90 max-w-sm leading-relaxed">
              Ottawa's friendly, offline-first junk haulers. We back up our trucks, sort through recyclables, sweep clean, and provide transparent tracking links so you know exactly when we arrive.
            </p>
            <div className="flex items-center space-x-2 text-[10px] font-mono text-stone/80">
              <ShieldCheck className="h-4 w-4 text-olive" />
              <span>94% average local recycling / charity donation rate</span>
            </div>
          </div>

          {/* Quick Contact info */}
          <div className="space-y-2">
            <h5 className="font-sans font-semibold text-ink text-sm">Contact Crew</h5>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center space-x-2">
                <Phone className="h-3.5 w-3.5 text-olive" />
                <span>343-204-4625</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-3.5 w-3.5 text-olive" />
                <span>scrappypat'sjunkremoval@gmail.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-3.5 w-3.5 text-olive" />
                <span>Pine St Depot, Ottawa ON</span>
              </div>
            </div>
          </div>

          {/* Demo Admin resets */}
          <div className="space-y-3">
            <h5 className="font-sans font-semibold text-ink text-sm">Demo Dashboard</h5>
            <p className="text-[10px] text-stone/80 leading-normal">
              Need to test the live-driving truck tracking map or simulate different states again? Click reset below.
            </p>
            <button
              onClick={resetDemoData}
              className="px-3 py-1.5 bg-cream hover:bg-red-500/10 hover:text-red-600 border border-stone/20 hover:border-red-500/30 rounded-lg text-[10px] font-mono font-bold transition-all flex items-center space-x-1 cursor-pointer text-stone"
            >
              <Trash2 className="h-3 w-3" />
              <span>Reset Tracking Simulation</span>
            </button>
          </div>

        </div>

        <div className="max-w-7xl mx-auto border-t border-stone/10 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-stone/70 font-mono">
          <span>© 2026 Scrappy Pat's Junk Removal. All Rights Reserved.</span>
          <div className="flex space-x-4 mt-2 sm:mt-0">
            <span>Ottawa, ON License: SCRAP*PJ829LK</span>
            <span>•</span>
            <span className="flex items-center space-x-1">
              <Sparkles className="h-3 w-3 text-olive" />
              <span>Eco-Certified</span>
            </span>
          </div>
        </div>
      </footer>

      {/* Floating Bottom-Right Crew Access Link */}
      <div className="fixed bottom-4 right-4 z-50">
        <button
          id="crew-portal-trigger"
          onClick={() => setCurrentPage('admin')}
          className="bg-stone-900/95 hover:bg-stone-950 border border-olive/35 hover:border-olive/60 text-cream px-3 py-2 rounded-xl text-[11px] font-mono font-bold transition-all flex items-center space-x-1.5 shadow-xl backdrop-blur-sm cursor-pointer group"
          title="Scrappy Pat's Operations Portal"
        >
          <Lock className="h-3.5 w-3.5 text-olive group-hover:rotate-12 transition-transform duration-300" />
          <span>Crew Portal</span>
        </button>
      </div>
    </div>
  );
}

