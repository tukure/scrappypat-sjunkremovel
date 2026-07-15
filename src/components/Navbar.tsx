import { Truck, Navigation, Heart, Star, Calendar } from 'lucide-react';

interface NavbarProps {
  currentPage: 'home' | 'book' | 'track' | 'reviews';
  setCurrentPage: (page: 'home' | 'book' | 'track' | 'reviews') => void;
  hasActiveBooking: boolean;
}

export default function Navbar({ currentPage, setCurrentPage, hasActiveBooking }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-50 bg-cream/90 border-b border-olive/10 backdrop-blur-md text-ink shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div 
            onClick={() => setCurrentPage('home')} 
            className="flex items-center space-x-3 cursor-pointer group"
            id="nav-logo"
          >
            <div className="bg-olive text-cream p-2 rounded-xl group-hover:bg-olive/90 transition-colors duration-300 shadow-sm">
              <Truck className="h-6 w-6 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-display font-bold text-xl sm:text-2xl tracking-tight text-olive">
                SCRAPPY PAT'S<span className="font-serif italic font-normal text-olive">.</span>
              </span>
              <span className="block text-[10px] uppercase tracking-[0.2em] text-stone font-mono">
                Junk Removal Co.
              </span>
            </div>
          </div>

          {/* Nav Links */}
          <div className="hidden md:flex items-center space-x-1">
            <button
              id="nav-home-btn"
              onClick={() => setCurrentPage('home')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                currentPage === 'home' 
                  ? 'text-olive bg-olive/10 font-semibold' 
                  : 'text-stone hover:text-olive hover:bg-stone/10'
              }`}
            >
              Home & pricing
            </button>
            <button
              id="nav-book-btn"
              onClick={() => setCurrentPage('book')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                currentPage === 'book' 
                  ? 'text-olive bg-olive/10 font-semibold' 
                  : 'text-stone hover:text-olive hover:bg-stone/10'
              }`}
            >
              <Calendar className="h-4 w-4" />
              <span>Book a Pickup</span>
            </button>
            <button
              id="nav-track-btn"
              onClick={() => setCurrentPage('track')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center space-x-1.5 relative ${
                currentPage === 'track' 
                  ? 'text-olive bg-olive/10 font-semibold' 
                  : 'text-stone hover:text-olive hover:bg-stone/10'
              }`}
            >
              <Navigation className="h-4 w-4" />
              <span>Live Tracker</span>
              {hasActiveBooking && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
              )}
            </button>
            <button
              id="nav-reviews-btn"
              onClick={() => setCurrentPage('reviews')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                currentPage === 'reviews' 
                  ? 'text-olive bg-olive/10 font-semibold' 
                  : 'text-stone hover:text-olive hover:bg-stone/10'
              }`}
            >
              <Star className="h-4 w-4" />
              <span>Reviews</span>
            </button>
          </div>

          {/* CTA Button */}
          <div className="flex items-center space-x-2">
            <button
              id="nav-cta-btn"
              onClick={() => setCurrentPage('book')}
              className="bg-olive hover:bg-olive/90 text-white font-sans font-semibold px-4 py-2 rounded-full text-sm transition-all duration-200 shadow-sm active:scale-95 flex items-center space-x-1.5 cursor-pointer"
            >
              <Calendar className="h-4 w-4 stroke-[2.5]" />
              <span>Book Now</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation (Sleek tab bar for flawless mobile UX) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-cream/95 border-t border-stone/20 py-2 px-6 flex justify-around items-center z-50 shadow-lg backdrop-blur-md">
        <button
          onClick={() => setCurrentPage('home')}
          className={`flex flex-col items-center space-y-1 ${currentPage === 'home' ? 'text-olive' : 'text-stone'}`}
        >
          <Truck className="h-5 w-5" />
          <span className="text-[10px] font-medium">Home</span>
        </button>
        <button
          onClick={() => setCurrentPage('book')}
          className={`flex flex-col items-center space-y-1 ${currentPage === 'book' ? 'text-olive' : 'text-stone'}`}
        >
          <Calendar className="h-5 w-5" />
          <span className="text-[10px] font-medium">Book</span>
        </button>
        <button
          onClick={() => setCurrentPage('track')}
          className={`flex flex-col items-center space-y-1 relative ${currentPage === 'track' ? 'text-olive' : 'text-stone'}`}
        >
          <Navigation className="h-5 w-5" />
          <span className="text-[10px] font-medium">Track</span>
          {hasActiveBooking && (
            <span className="absolute top-0 right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
          )}
        </button>
        <button
          onClick={() => setCurrentPage('reviews')}
          className={`flex flex-col items-center space-y-1 ${currentPage === 'reviews' ? 'text-olive' : 'text-stone'}`}
        >
          <Star className="h-5 w-5" />
          <span className="text-[10px] font-medium">Reviews</span>
        </button>
      </div>
    </nav>
  );
}
