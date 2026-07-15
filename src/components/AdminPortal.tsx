import { useState, FormEvent, useEffect, useRef } from 'react';
import { 
  Lock, Key, Users, Calendar, DollarSign, Truck, Send, Trash2, 
  ArrowLeft, CheckCircle2, MessageSquare, Plus, Check, MapPin, 
  Phone, AlertCircle, Clock, ShieldCheck, Activity, ChevronRight, Sliders, ExternalLink 
} from 'lucide-react';
import { Booking, BookingStatus, ChatMessage, CustomerReview } from '../types';

interface AdminPortalProps {
  bookings: Booking[];
  reviews: CustomerReview[];
  onUpdateBookingStatus: (bookingId: string, status: BookingStatus, progress: number, eta: number, newMsg?: ChatMessage) => void;
  onSendChatMessage: (bookingId: string, message: ChatMessage) => void;
  onBookingCreated: (newBooking: Booking) => void;
  onBackToSite: () => void;
}

export default function AdminPortal({
  bookings,
  reviews,
  onUpdateBookingStatus,
  onSendChatMessage,
  onBookingCreated,
  onBackToSite
}: AdminPortalProps) {
  // Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('scrappypats_admin_auth') === 'true';
  });
  const [loggedInUser, setLoggedInUser] = useState<string>(() => {
    return localStorage.getItem('scrappypats_admin_user') || 'admin';
  });
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Portal states
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all');
  const [adminChatInput, setAdminChatInput] = useState('');
  
  // Create New booking form states (phone/in-person booking)
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');
  const [newCustCity, setNewCustCity] = useState('Ottawa');
  const [newCustDate, setNewCustDate] = useState('');
  const [newCustTimeSlot, setNewCustTimeSlot] = useState('08:00 AM - 11:00 AM');
  const [newCustPrice, setNewCustPrice] = useState('120');
  const [newCustLoadSize, setNewCustLoadSize] = useState('25');
  const [newCustNotes, setNewCustNotes] = useState('');

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-select first booking if none selected
  useEffect(() => {
    if (!selectedBookingId && bookings.length > 0) {
      setSelectedBookingId(bookings[0].id);
    }
  }, [bookings, selectedBookingId]);

  // Scroll chat to bottom when chat messages update
  const selectedBooking = bookings.find(b => b.id === selectedBookingId);
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedBooking?.chatHistory, selectedBookingId]);

  // Handle Login
  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    const normalizedUsername = username.trim().toLowerCase();
    if (normalizedUsername === 'admin' && password === 'scrappypat') {
      setIsAuthenticated(true);
      setLoggedInUser('admin');
      localStorage.setItem('scrappypats_admin_auth', 'true');
      localStorage.setItem('scrappypats_admin_user', 'admin');
      setAuthError('');
    } else if (normalizedUsername === 'mattews' && password === 'kunamadeda') {
      setIsAuthenticated(true);
      setLoggedInUser('Mattews');
      localStorage.setItem('scrappypats_admin_auth', 'true');
      localStorage.setItem('scrappypats_admin_user', 'Mattews');
      setAuthError('');
    } else {
      setAuthError('Invalid username or password. (Check hints below)');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setLoggedInUser('admin');
    localStorage.removeItem('scrappypats_admin_auth');
    localStorage.removeItem('scrappypats_admin_user');
  };

  // Quick Chat Update Templates
  const handleSendTemplateMsg = (text: string) => {
    if (!selectedBookingId) return;
    const newMsg: ChatMessage = {
      id: `crew-${Date.now()}`,
      sender: 'driver',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    onSendChatMessage(selectedBookingId, newMsg);
  };

  // Custom text msg from admin
  const handleSendAdminChat = (e: FormEvent) => {
    e.preventDefault();
    if (!adminChatInput.trim() || !selectedBookingId) return;

    const newMsg: ChatMessage = {
      id: `crew-${Date.now()}`,
      sender: 'driver',
      text: adminChatInput.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    onSendChatMessage(selectedBookingId, newMsg);
    setAdminChatInput('');
  };

  // Manual update of fields
  const handleStatusChange = (status: BookingStatus) => {
    if (!selectedBooking) return;
    let nextProgress = selectedBooking.trackingProgress;
    let nextEta = selectedBooking.etaMinutes;

    // Smart-fill progress & eta on status transitions
    if (status === 'confirmed') {
      nextProgress = 0;
      nextEta = 30;
    } else if (status === 'dispatched') {
      nextProgress = 10;
      nextEta = 25;
    } else if (status === 'en_route') {
      nextProgress = 40;
      nextEta = 15;
    } else if (status === 'arrived') {
      nextProgress = 95;
      nextEta = 0;
    } else if (status === 'loading') {
      nextProgress = 98;
      nextEta = 0;
    } else if (status === 'completed') {
      nextProgress = 100;
      nextEta = 0;
    }

    onUpdateBookingStatus(selectedBooking.id, status, nextProgress, nextEta);
  };

  // Handle addition of simulated job
  const handleCreateManualBooking = (e: FormEvent) => {
    e.preventDefault();
    if (!newCustName || !newCustPhone || !newCustAddress) return;

    const newBooking: Booking = {
      id: `SP-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: newCustName,
      phone: newCustPhone,
      email: newCustEmail || 'phone-in@scrappypats.com',
      address: newCustAddress,
      city: newCustCity,
      preferredDate: newCustDate || new Date().toISOString().split('T')[0],
      preferredTimeSlot: newCustTimeSlot,
      items: [{ itemId: 'phone_booking', count: 1 }],
      estimatedLoadSize: Number(newCustLoadSize),
      estimatedPrice: Number(newCustPrice),
      notes: newCustNotes || 'Manually created by admin panel.',
      status: 'confirmed',
      trackingProgress: 0,
      etaMinutes: 30,
      chatHistory: [
        {
          id: `sys-${Date.now()}`,
          sender: 'driver',
          text: `Booking created and confirmed! We will update you once dispatched.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ],
      createdAt: new Date().toISOString()
    };

    onBookingCreated(newBooking);
    setSelectedBookingId(newBooking.id);
    setShowAddForm(false);
    
    // Reset Form
    setNewCustName('');
    setNewCustPhone('');
    setNewCustEmail('');
    setNewCustAddress('');
    setNewCustNotes('');
  };

  // Stats calculation
  const totalBookings = bookings.length;
  const activeBookingsCount = bookings.filter(b => b.status !== 'completed').length;
  const completedBookingsCount = bookings.filter(b => b.status === 'completed').length;
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.estimatedPrice || 0), 0);

  // Filter Bookings list
  const filteredBookings = bookings.filter(b => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'active') return b.status !== 'completed';
    if (filterStatus === 'completed') return b.status === 'completed';
    return true;
  });

  return (
    <div className="bg-ink min-h-screen text-cream/90 font-sans pb-16">
      
      {/* Header bar */}
      <header className="bg-stone-900 border-b border-olive/30 sticky top-0 z-40 px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center space-x-3">
          <button 
            onClick={onBackToSite}
            className="flex items-center space-x-1 px-3 py-1.5 bg-olive/20 hover:bg-olive/40 border border-olive/30 rounded-xl text-xs text-cream transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Public Site</span>
          </button>
          <div className="hidden sm:block text-stone-400">|</div>
          <div className="flex items-center space-x-2">
            <Truck className="h-6 w-6 text-olive" />
            <span className="font-display font-extrabold text-sm sm:text-lg tracking-wider text-cream">
              SCRAPPY PAT'S <span className="text-olive">CREW TERMINAL</span>
            </span>
          </div>
        </div>

        {isAuthenticated && (
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-1.5 text-xs text-stone-400 font-mono">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
              <span>Crew Member Active: <strong>{loggedInUser}</strong></span>
            </div>
            <button
              onClick={handleLogout}
              className="text-xs font-mono font-bold hover:text-red-400 underline cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        )}
      </header>

      {/* Lock screen / login form */}
      {!isAuthenticated ? (
        <div className="max-w-md mx-auto mt-24 px-4">
          <div className="bg-stone-900 border-2 border-olive/30 rounded-3xl p-8 shadow-2xl space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center bg-olive/10 border border-olive/30 text-olive p-4 rounded-full">
                <Lock className="h-8 w-8" />
              </div>
              <h2 className="font-display font-bold text-2xl text-cream tracking-tight">
                Secure Crew Sign-In
              </h2>
              <p className="text-xs text-stone-400 max-w-xs mx-auto">
                Authorized Ottawa operations team & drivers only.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-stone-300">Username</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-stone-950 border border-olive/20 rounded-xl px-4 py-3 text-sm text-cream focus:outline-none focus:border-olive font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-stone-300">Password</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    placeholder="e.g. scrappypat"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-stone-950 border border-olive/20 rounded-xl pl-4 pr-10 py-3 text-sm text-cream focus:outline-none focus:border-olive font-mono"
                  />
                  <Key className="absolute right-3.5 top-3.5 h-4 w-4 text-stone-500" />
                </div>
              </div>

              {authError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3.5 rounded-xl flex items-start space-x-2 font-mono">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-olive hover:bg-olive-dark text-cream font-bold py-3 px-4 rounded-xl transition-all shadow-md font-sans text-sm cursor-pointer"
              >
                Unlock Operations Console
              </button>
            </form>

            <div className="border-t border-olive/10 pt-4 text-center">
              <p className="text-[10px] text-stone-400 leading-relaxed space-y-1">
                <span>Authorized Crew Credentials:</span><br/>
                <code className="font-mono bg-stone-950 px-1.5 py-0.5 rounded text-amber-400">admin</code> / <code className="font-mono bg-stone-950 px-1.5 py-0.5 rounded text-amber-400 font-bold">scrappypat</code> <br/>
                <code className="font-mono bg-stone-950 px-1.5 py-0.5 rounded text-emerald-400">Mattews</code> / <code className="font-mono bg-stone-950 px-1.5 py-0.5 rounded text-emerald-400 font-bold">kunamadeda</code>
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Authenticated Admin Dashboard Grid */
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
          
          {/* Operations Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-stone-900 border border-olive/20 p-5 rounded-2xl flex items-center space-x-4 shadow">
              <div className="p-3 bg-olive/10 text-olive rounded-xl">
                <Truck className="h-6 w-6" />
              </div>
              <div>
                <div className="text-[10px] font-mono text-stone-400 uppercase tracking-widest">Active Jobs</div>
                <div className="text-2xl font-bold font-mono text-cream">{activeBookingsCount}</div>
              </div>
            </div>

            <div className="bg-stone-900 border border-olive/20 p-5 rounded-2xl flex items-center space-x-4 shadow">
              <div className="p-3 bg-green-500/10 text-green-400 rounded-xl">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <div className="text-[10px] font-mono text-stone-400 uppercase tracking-widest">Completed Jobs</div>
                <div className="text-2xl font-bold font-mono text-cream">{completedBookingsCount}</div>
              </div>
            </div>

            <div className="bg-stone-900 border border-olive/20 p-5 rounded-2xl flex items-center space-x-4 shadow">
              <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
                <DollarSign className="h-6 w-6" />
              </div>
              <div>
                <div className="text-[10px] font-mono text-stone-400 uppercase tracking-widest">Total Booked Value</div>
                <div className="text-2xl font-bold font-mono text-cream">${totalRevenue}</div>
              </div>
            </div>

            <div className="bg-stone-900 border border-olive/20 p-5 rounded-2xl flex items-center space-x-4 shadow">
              <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <div className="text-[10px] font-mono text-stone-400 uppercase tracking-widest">Client Reviews</div>
                <div className="text-2xl font-bold font-mono text-cream">{reviews.length}</div>
              </div>
            </div>
          </div>

          {/* Core Interface Workspace Splitter */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left side: Bookings list (span 5) */}
            <div className="lg:col-span-5 bg-stone-900 border border-olive/20 rounded-3xl overflow-hidden shadow flex flex-col h-[700px]">
              <div className="p-4 border-b border-olive/10 bg-stone-950 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-olive animate-pulse" />
                  <h3 className="font-sans font-bold text-sm text-cream uppercase tracking-wide">Pickup Log</h3>
                </div>

                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="px-2.5 py-1 bg-olive hover:bg-olive-dark text-cream font-bold text-[10px] rounded-lg transition-colors flex items-center space-x-1 cursor-pointer"
                >
                  <Plus className="h-3 w-3" />
                  <span>Phone Intake</span>
                </button>
              </div>

              {/* Status Filter Tab row */}
              <div className="px-4 py-2 bg-stone-950/40 border-b border-olive/10 flex items-center space-x-2 text-xs">
                <span className="text-[10px] font-mono text-stone-400 uppercase">Filter:</span>
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`px-2 py-0.5 rounded font-mono ${filterStatus === 'all' ? 'bg-olive text-cream' : 'text-stone-400 hover:text-cream'}`}
                >
                  All ({totalBookings})
                </button>
                <button
                  onClick={() => setFilterStatus('active')}
                  className={`px-2 py-0.5 rounded font-mono ${filterStatus === 'active' ? 'bg-olive text-cream' : 'text-stone-400 hover:text-cream'}`}
                >
                  Active ({activeBookingsCount})
                </button>
                <button
                  onClick={() => setFilterStatus('completed')}
                  className={`px-2 py-0.5 rounded font-mono ${filterStatus === 'completed' ? 'bg-olive text-cream' : 'text-stone-400 hover:text-cream'}`}
                >
                  Done ({completedBookingsCount})
                </button>
              </div>

              {/* Booking entries list */}
              <div className="flex-1 overflow-y-auto divide-y divide-olive/5">
                {filteredBookings.length === 0 ? (
                  <div className="p-8 text-center text-stone-500 font-mono text-xs">
                    No matching pickup jobs found.
                  </div>
                ) : (
                  filteredBookings.map((b) => {
                    const isSelected = b.id === selectedBookingId;
                    const itemsText = typeof b.items === 'string' ? 'JSON items' : `${b.items.length} unique items`;
                    
                    // Status Badge coloring helper
                    const getStatusColor = (s: BookingStatus) => {
                      switch (s) {
                        case 'confirmed': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
                        case 'dispatched': return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
                        case 'en_route': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
                        case 'arrived': return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
                        case 'loading': return 'text-pink-400 bg-pink-500/10 border-pink-500/20';
                        case 'completed': return 'text-green-400 bg-green-500/10 border-green-500/20';
                      }
                    };

                    return (
                      <div
                        key={b.id}
                        onClick={() => {
                          setSelectedBookingId(b.id);
                          setShowAddForm(false);
                        }}
                        className={`p-4 text-left cursor-pointer transition-all ${
                          isSelected ? 'bg-olive/10 border-l-4 border-olive' : 'hover:bg-stone-800/40'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-amber-500">{b.id}</span>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${getStatusColor(b.status)}`}>
                            {b.status.toUpperCase()}
                          </span>
                        </div>

                        <h4 className="font-sans font-bold text-xs text-cream mt-1">{b.customerName}</h4>
                        <p className="text-[10px] text-stone-400 truncate flex items-center space-x-1 mt-0.5">
                          <MapPin className="h-2.5 w-2.5 text-stone-500" />
                          <span>{b.address}, {b.city}</span>
                        </p>

                        <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-olive/5 text-[10px] font-mono text-stone-500">
                          <span>{b.preferredDate} ({b.preferredTimeSlot.split(' - ')[0]})</span>
                          <span className="font-bold text-stone-300">${b.estimatedPrice}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right side: Control deck / form intake (span 7) */}
            <div className="lg:col-span-7 bg-stone-900 border border-olive/20 rounded-3xl overflow-hidden shadow flex flex-col h-[700px]">
              
              {showAddForm ? (
                /* Phone intake manual booking screen */
                <div className="flex flex-col h-full bg-stone-950/40 p-6 overflow-y-auto space-y-4">
                  <div className="flex items-center justify-between border-b border-olive/10 pb-3">
                    <h3 className="font-display font-bold text-cream flex items-center space-x-2">
                      <Plus className="h-5 w-5 text-olive" />
                      <span>Log Phone Intake Call</span>
                    </h3>
                    <button
                      onClick={() => setShowAddForm(false)}
                      className="text-xs text-stone-400 hover:text-cream underline cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>

                  <form onSubmit={handleCreateManualBooking} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase tracking-wider text-stone-400">Customer Name *</label>
                        <input
                          type="text"
                          required
                          value={newCustName}
                          onChange={(e) => setNewCustName(e.target.value)}
                          className="w-full bg-stone-900 border border-olive/20 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-olive"
                          placeholder="e.g. Eleanor Vance"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase tracking-wider text-stone-400">Customer Phone *</label>
                        <input
                          type="tel"
                          required
                          value={newCustPhone}
                          onChange={(e) => setNewCustPhone(e.target.value)}
                          className="w-full bg-stone-900 border border-olive/20 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-olive"
                          placeholder="e.g. (613) 555-0182"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase tracking-wider text-stone-400">Email Address (Optional)</label>
                        <input
                          type="email"
                          value={newCustEmail}
                          onChange={(e) => setNewCustEmail(e.target.value)}
                          className="w-full bg-stone-900 border border-olive/20 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-olive"
                          placeholder="e.g. customer@example.com"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase tracking-wider text-stone-400">City</label>
                        <select
                          value={newCustCity}
                          onChange={(e) => setNewCustCity(e.target.value)}
                          className="w-full bg-stone-900 border border-olive/20 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-olive text-cream"
                        >
                          <option value="Ottawa">Ottawa</option>
                          <option value="Nepean">Nepean</option>
                          <option value="Kanata">Kanata</option>
                          <option value="Orleans">Orleans</option>
                          <option value="Gatineau">Gatineau</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-stone-400">Street Address *</label>
                      <input
                        type="text"
                        required
                        value={newCustAddress}
                        onChange={(e) => setNewCustAddress(e.target.value)}
                        className="w-full bg-stone-900 border border-olive/20 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-olive"
                        placeholder="e.g. 742 Woodridge Cres"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase tracking-wider text-stone-400">Preferred Date *</label>
                        <input
                          type="date"
                          required
                          value={newCustDate}
                          onChange={(e) => setNewCustDate(e.target.value)}
                          className="w-full bg-stone-900 border border-olive/20 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-olive text-cream"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase tracking-wider text-stone-400">Time Window</label>
                        <select
                          value={newCustTimeSlot}
                          onChange={(e) => setNewCustTimeSlot(e.target.value)}
                          className="w-full bg-stone-900 border border-olive/20 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-olive text-cream"
                        >
                          <option value="08:00 AM - 11:00 AM">Morning: 08:00 AM - 11:00 AM</option>
                          <option value="11:00 AM - 02:00 PM">Midday: 11:00 AM - 02:00 PM</option>
                          <option value="02:00 PM - 05:00 PM">Afternoon: 02:00 PM - 05:00 PM</option>
                          <option value="05:00 PM - 08:00 PM">Evening: 05:00 PM - 08:00 PM</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase tracking-wider text-stone-400">Estimated Price ($)</label>
                        <input
                          type="number"
                          value={newCustPrice}
                          onChange={(e) => setNewCustPrice(e.target.value)}
                          className="w-full bg-stone-900 border border-olive/20 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-olive"
                          placeholder="e.g. 120"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase tracking-wider text-stone-400">Simulated Truck Load Size (%)</label>
                        <select
                          value={newCustLoadSize}
                          onChange={(e) => setNewCustLoadSize(e.target.value)}
                          className="w-full bg-stone-900 border border-olive/20 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-olive text-cream"
                        >
                          <option value="10">Minimal: 10% (single item)</option>
                          <option value="25">Quarter Load: 25% (Sofa / bed)</option>
                          <option value="50">Half Load: 50% (Room suite)</option>
                          <option value="75">Three-Quarter Load: 75% (Office scrap)</option>
                          <option value="100">Full Truckload: 100% (Complete cleanout)</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-stone-400">Special Crew Dispatch Notes</label>
                      <textarea
                        rows={2}
                        value={newCustNotes}
                        onChange={(e) => setNewCustNotes(e.target.value)}
                        className="w-full bg-stone-900 border border-olive/20 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-olive"
                        placeholder="e.g. Gate passcode is #4421. Leave items in the side driveway."
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-olive hover:bg-olive-dark text-cream font-bold py-2 px-4 rounded-xl text-xs transition-all flex items-center justify-center space-x-2 shadow cursor-pointer mt-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Confirm & Book Intake Call</span>
                    </button>
                  </form>
                </div>
              ) : selectedBooking ? (
                /* Main Admin Control deck for selected booking */
                <div className="flex flex-col h-full">
                  
                  {/* Selected Booking Info Header */}
                  <div className="p-5 border-b border-olive/10 bg-stone-950 flex flex-wrap justify-between items-center gap-4">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-display font-extrabold text-cream text-base">{selectedBooking.customerName}</h3>
                        <span className="font-mono text-[10px] font-bold bg-amber-500/15 text-amber-500 px-1.5 py-0.5 rounded">
                          {selectedBooking.id}
                        </span>
                      </div>
                      <p className="text-xs text-stone-400 mt-1 flex items-center space-x-1">
                        <MapPin className="h-3 w-3 text-olive" />
                        <span>{selectedBooking.address}, {selectedBooking.city}</span>
                      </p>
                    </div>

                    <div className="flex items-center space-x-2 text-xs text-stone-400">
                      <Phone className="h-3.5 w-3.5 text-olive" />
                      <span>{selectedBooking.phone}</span>
                    </div>
                  </div>

                  {/* Split Dashboard layout for control & chat */}
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
                    
                    {/* Column 1: Controls & Parameters Adjustment (span 6) */}
                    <div className="md:col-span-6 p-5 border-b md:border-b-0 md:border-r border-olive/10 overflow-y-auto space-y-6">
                      
                      {/* Booking telemetry adjust panel */}
                      <div className="space-y-3">
                        <h4 className="font-mono text-[10px] uppercase font-bold text-stone-400 flex items-center space-x-1.5">
                          <Sliders className="h-3 w-3 text-olive" />
                          <span>Dispatch Operations</span>
                        </h4>

                        <div className="space-y-2 pt-1">
                          <label className="text-[10px] text-stone-400 font-mono">Job Stage Status</label>
                          <div className="grid grid-cols-2 gap-1.5">
                            {(['confirmed', 'dispatched', 'en_route', 'arrived', 'loading', 'completed'] as BookingStatus[]).map((st) => {
                              const isActive = selectedBooking.status === st;
                              return (
                                <button
                                  key={st}
                                  onClick={() => handleStatusChange(st)}
                                  className={`px-2 py-1.5 text-[9px] font-bold rounded-lg border transition-all text-center uppercase cursor-pointer ${
                                    isActive 
                                      ? 'bg-olive text-cream border-olive shadow' 
                                      : 'bg-stone-950/40 text-stone-400 border-stone-800 hover:text-cream'
                                  }`}
                                >
                                  {st.replace('_', ' ')}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Manual sliders for live map demo driving */}
                      <div className="space-y-4 pt-4 border-t border-olive/10">
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center text-[10px] font-mono text-stone-400">
                            <span>Truck Driving Progress:</span>
                            <strong className="text-cream">{selectedBooking.trackingProgress}%</strong>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            step="5"
                            value={selectedBooking.trackingProgress}
                            onChange={(e) => {
                              onUpdateBookingStatus(
                                selectedBooking.id, 
                                selectedBooking.status, 
                                Number(e.target.value), 
                                selectedBooking.etaMinutes
                              );
                            }}
                            className="w-full accent-olive bg-stone-950 h-1.5 rounded-lg cursor-pointer"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center text-[10px] font-mono text-stone-400">
                            <span>Driver Estimated ETA:</span>
                            <strong className="text-cream">{selectedBooking.etaMinutes} mins</strong>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="60"
                            step="1"
                            value={selectedBooking.etaMinutes}
                            onChange={(e) => {
                              onUpdateBookingStatus(
                                selectedBooking.id, 
                                selectedBooking.status, 
                                selectedBooking.trackingProgress, 
                                Number(e.target.value)
                              );
                            }}
                            className="w-full accent-olive bg-stone-950 h-1.5 rounded-lg cursor-pointer"
                          />
                        </div>
                      </div>

                      {/* Selected job items dump */}
                      <div className="pt-4 border-t border-olive/10 space-y-2">
                        <h5 className="text-[10px] font-mono text-stone-400 uppercase">Load details</h5>
                        <div className="bg-stone-950/60 rounded-xl p-3 text-xs space-y-1.5 font-mono">
                          <div className="flex justify-between text-stone-400">
                            <span>Simulated Load Size:</span>
                            <span className="text-cream font-bold">{selectedBooking.estimatedLoadSize}% truck</span>
                          </div>
                          <div className="flex justify-between text-stone-400">
                            <span>Client Price Estimate:</span>
                            <span className="text-green-400 font-bold">${selectedBooking.estimatedPrice}</span>
                          </div>
                          {selectedBooking.notes && (
                            <div className="text-[10px] text-stone-400 border-t border-stone-900 pt-2 mt-2 leading-relaxed italic">
                              " {selectedBooking.notes} "
                            </div>
                          )}
                        </div>
                      </div>

                    </div>

                    {/* Column 2: Customer Live Chat (span 6) */}
                    <div className="md:col-span-6 flex flex-col h-full bg-stone-950/30 overflow-hidden">
                      <div className="p-3 border-b border-olive/10 bg-stone-950/40 flex items-center justify-between">
                        <div className="flex items-center space-x-1.5 text-[10px] font-mono uppercase tracking-wider text-stone-400">
                          <MessageSquare className="h-3.5 w-3.5 text-olive" />
                          <span>Client Active Chat</span>
                        </div>
                        <span className="text-[9px] font-mono text-stone-500 bg-stone-950 px-1.5 py-0.5 rounded">
                          {selectedBooking.chatHistory?.length || 0} msgs
                        </span>
                      </div>

                      {/* Chat scroll content */}
                      <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {(!selectedBooking.chatHistory || selectedBooking.chatHistory.length === 0) ? (
                          <div className="text-center text-stone-500 font-mono text-[10px] pt-12">
                            No chat messages with this customer yet.
                          </div>
                        ) : (
                          selectedBooking.chatHistory.map((m) => {
                            const isCrew = m.sender === 'driver';
                            return (
                              <div
                                key={m.id}
                                className={`flex flex-col max-w-[85%] ${isCrew ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                              >
                                <span className="text-[9px] font-mono text-stone-500 mb-0.5">
                                  {isCrew ? "Crew (Pat)" : selectedBooking.customerName} • {m.timestamp}
                                </span>
                                <div className={`p-2.5 rounded-2xl text-xs leading-relaxed ${
                                  isCrew 
                                    ? 'bg-olive text-cream rounded-tr-none' 
                                    : 'bg-stone-800 text-cream/95 rounded-tl-none'
                                }`}>
                                  {m.text}
                                </div>
                              </div>
                            );
                          })
                        )}
                        <div ref={chatEndRef} />
                      </div>

                      {/* Quick Response Presets bar */}
                      <div className="px-3 py-1.5 bg-stone-950/70 border-t border-olive/5 flex flex-nowrap overflow-x-auto gap-1.5 scrollbar-thin">
                        <button
                          onClick={() => handleSendTemplateMsg("Almost there! We are on Pine St and backing up shortly.")}
                          className="px-2 py-1 bg-stone-900 hover:bg-stone-850 rounded text-[9px] font-mono text-stone-300 hover:text-cream whitespace-nowrap cursor-pointer"
                        >
                          "Almost there"
                        </button>
                        <button
                          onClick={() => handleSendTemplateMsg("We have arrived at your street address! Backing up now.")}
                          className="px-2 py-1 bg-stone-900 hover:bg-stone-850 rounded text-[9px] font-mono text-stone-300 hover:text-cream whitespace-nowrap cursor-pointer"
                        >
                          "Arrived"
                        </button>
                        <button
                          onClick={() => handleSendTemplateMsg("Job completed! Bins swept. Have an incredible rest of your day!")}
                          className="px-2 py-1 bg-stone-900 hover:bg-stone-850 rounded text-[9px] font-mono text-stone-300 hover:text-cream whitespace-nowrap cursor-pointer"
                        >
                          "Finished Sweep"
                        </button>
                      </div>

                      {/* Custom Message send form */}
                      <form onSubmit={handleSendAdminChat} className="p-3 bg-stone-950 border-t border-olive/10 flex items-center space-x-2">
                        <input
                          type="text"
                          value={adminChatInput}
                          onChange={(e) => setAdminChatInput(e.target.value)}
                          placeholder="Type response as Crew..."
                          className="flex-1 bg-stone-900 border border-olive/20 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-olive text-cream"
                        />
                        <button
                          type="submit"
                          className="p-2 bg-olive hover:bg-olive-dark text-cream rounded-xl transition-colors cursor-pointer"
                          title="Send Crew Message"
                        >
                          <Send className="h-3.5 w-3.5" />
                        </button>
                      </form>

                    </div>

                  </div>
                </div>
              ) : (
                <div className="p-12 text-center text-stone-500 font-mono text-xs flex flex-col items-center justify-center h-full space-y-2">
                  <Truck className="h-10 w-10 text-stone-600 animate-bounce" />
                  <span>Select a pickup job on the left to review operational controls or respond to chat messages!</span>
                </div>
              )}

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
