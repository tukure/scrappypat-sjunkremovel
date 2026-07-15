import { useState, useEffect, FormEvent } from 'react';
import { 
  Armchair, Bed, Tv, Monitor, Grid, Bike, Leaf, HardHat, Package, IceCream, 
  Plus, Minus, Calendar, Clock, MapPin, User, Phone, Mail, FileText, 
  Truck, ArrowRight, ShieldCheck, CheckCircle2, Sparkles 
} from 'lucide-react';
import { JunkItem, Booking } from '../types';
import { JUNK_ITEMS } from '../utils/mockData';

interface BookingSystemProps {
  preloadSizePercent: number | null;
  clearPreloadSize: () => void;
  onBookingCreated: (booking: Booking) => void;
  setCurrentPage: (page: 'home' | 'book' | 'track' | 'reviews') => void;
}

export default function BookingSystem({ 
  preloadSizePercent, 
  clearPreloadSize, 
  onBookingCreated, 
  setCurrentPage 
}: BookingSystemProps) {
  // Items quantity state
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  
  // Tab category selection
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Contact & details form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: 'Ottawa',
    preferredDate: '',
    preferredTimeSlot: '10:00 AM - 12:00 PM',
    notes: '',
  });

  // Booking result/success state
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);

  // Apply preload size if coming from Hero quick-tier
  useEffect(() => {
    if (preloadSizePercent !== null && preloadSizePercent > 0) {
      // Clear current list and pre-add some dummy boxes/items to match the approximate size requested
      const newQuantities: Record<string, number> = {};
      if (preloadSizePercent === 25) {
        newQuantities['sofa'] = 1;
        newQuantities['boxes'] = 1;
      } else if (preloadSizePercent === 50) {
        newQuantities['fridge'] = 1;
        newQuantities['table'] = 1;
        newQuantities['tv'] = 1;
      } else if (preloadSizePercent === 100) {
        newQuantities['fridge'] = 2;
        newQuantities['sofa'] = 2;
        newQuantities['table'] = 1;
        newQuantities['construction'] = 2;
      }
      setQuantities(newQuantities);
      clearPreloadSize();
    }
  }, [preloadSizePercent]);

  // Utility to map string to lucide icons
  const getIcon = (name: string) => {
    switch (name) {
      case 'Armchair': return <Armchair className="h-5 w-5" />;
      case 'Bed': return <Bed className="h-5 w-5" />;
      case 'IceCream': return <IceCream className="h-5 w-5" />;
      case 'Tv': return <Tv className="h-5 w-5" />;
      case 'Monitor': return <Monitor className="h-5 w-5" />;
      case 'Grid': return <Grid className="h-5 w-5" />;
      case 'Bike': return <Bike className="h-5 w-5" />;
      case 'Leaf': return <Leaf className="h-5 w-5" />;
      case 'HardHat': return <HardHat className="h-5 w-5" />;
      case 'Package': return <Package className="h-5 w-5" />;
      default: return <Package className="h-5 w-5" />;
    }
  };

  // Categories list
  const categories = [
    { id: 'all', label: 'All Items' },
    { id: 'furniture', label: 'Furniture' },
    { id: 'appliances', label: 'Appliances' },
    { id: 'yard', label: 'Yard & Sports' },
    { id: 'debris', label: 'Debris & Rubble' },
    { id: 'household', label: 'Boxes/Misc' },
  ];

  const filteredItems = activeCategory === 'all' 
    ? JUNK_ITEMS 
    : JUNK_ITEMS.filter(item => item.category === activeCategory);

  const updateQuantity = (id: string, change: number) => {
    setQuantities(prev => {
      const current = prev[id] || 0;
      const updated = Math.max(0, current + change);
      const newQuant = { ...prev };
      if (updated === 0) {
        delete newQuant[id];
      } else {
        newQuant[id] = updated;
      }
      return newQuant;
    });
  };

  // Math calculations
  const totalVolumePercent = Object.keys(quantities).reduce((acc, itemId) => {
    const count = quantities[itemId] || 0;
    const item = JUNK_ITEMS.find(i => i.id === itemId);
    if (item) {
      return acc + (item.volumePercent * count);
    }
    return acc;
  }, 0);

  // Price tier mapping
  const calculateEstimate = (volume: number): { price: number; description: string; truckCount: number; cleanVolume: number } => {
    if (volume === 0) return { price: 0, description: 'No items selected', truckCount: 0, cleanVolume: 0 };
    
    const truckCount = Math.ceil(volume / 100);
    const cleanVolume = volume % 100 === 0 ? 100 : volume % 100;
    
    let basePriceForRemainder = 0;
    let desc = '';
    
    if (cleanVolume <= 15) {
      basePriceForRemainder = 95; // single item / minimal
      desc = 'Single Item / Minimal pickup';
    } else if (cleanVolume <= 35) {
      basePriceForRemainder = 149; // Quarter Truck
      desc = 'Quarter Truck Load';
    } else if (cleanVolume <= 65) {
      basePriceForRemainder = 269; // Half Truck
      desc = 'Half Truck Load';
    } else if (cleanVolume <= 85) {
      basePriceForRemainder = 389; // 3/4 Truck
      desc = 'Three-Quarter Truck Load';
    } else {
      basePriceForRemainder = 489; // Full Truck
      desc = 'Full Truck Load';
    }

    // Multiply full trucks if there is overflow
    const totalPrice = ((truckCount - 1) * 489) + basePriceForRemainder;
    
    return {
      price: totalPrice,
      description: truckCount > 1 ? `${truckCount - 1} Full Truck(s) + ${desc}` : desc,
      truckCount,
      cleanVolume
    };
  };

  const estimate = calculateEstimate(totalVolumePercent);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (totalVolumePercent === 0) {
      alert('Please add at least one item to calculate your junk pickup load.');
      return;
    }

    if (!formData.name || !formData.phone || !formData.address || !formData.preferredDate) {
      alert('Please fill out all required fields to register your booking.');
      return;
    }

    // Generate custom booking
    const randId = Math.floor(1000 + Math.random() * 9000);
    const trackingId = `PAT-${randId}-TRACK`;
    
    const newBooking: Booking = {
      id: trackingId,
      customerName: formData.name,
      phone: formData.phone,
      email: formData.email || 'customer@example.com',
      address: formData.address,
      city: formData.city,
      preferredDate: formData.preferredDate,
      preferredTimeSlot: formData.preferredTimeSlot,
      items: Object.keys(quantities).map((itemId) => ({ itemId, count: quantities[itemId] || 0 })),
      estimatedLoadSize: totalVolumePercent,
      estimatedPrice: estimate.price,
      notes: formData.notes,
      status: 'confirmed', // starting state
      trackingProgress: 0,
      etaMinutes: 25, // initial ETA
      chatHistory: [
        {
          id: 'sys-1',
          sender: 'driver',
          text: `Hey ${formData.name}! Scrappy Pat here. We received your booking. We'll head your way shortly! Keep this tracking screen open to watch us drive!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ],
      createdAt: new Date().toISOString()
    };

    onBookingCreated(newBooking);
    setCreatedBooking(newBooking);
  };

  // If successfully booked, render the high-impact receipt + tracking gateway
  if (createdBooking) {
    return (
      <div className="bg-cream text-ink min-h-screen pt-12 pb-24 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
        <div className="max-w-xl w-full bg-white border border-olive/10 rounded-3xl p-8 text-center relative overflow-hidden shadow-sm">
          <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-olive to-clay"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-olive/5 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="mx-auto bg-olive/10 text-olive w-16 h-16 rounded-full flex items-center justify-center mb-6 border border-olive/20">
            <CheckCircle2 className="h-10 w-10 animate-pulse" />
          </div>

          <span className="font-mono text-xs text-stone uppercase tracking-widest block mb-1">
            Pickup Registered Successfully
          </span>
          <h2 className="font-display font-bold text-3xl text-ink mb-2">
            You're Booked with Pat!
          </h2>
          <p className="text-stone text-sm mb-6 max-w-sm mx-auto">
            Your pickup schedule has been finalized. Scrappy Pat is preparing the truck and eco-sorting bins.
          </p>

          {/* Ticket Information */}
          <div className="bg-cream border border-stone/10 rounded-2xl p-5 mb-8 text-left space-y-4 font-sans">
            <div className="flex justify-between items-center border-b border-stone/10 pb-3">
              <span className="text-xs font-mono text-stone uppercase">Live Tracking Code</span>
              <span className="text-sm font-mono font-bold text-stone bg-clay/20 border border-clay/30 px-2.5 py-1 rounded-md">
                {createdBooking.id}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-y-3 text-xs text-stone">
              <div>
                <span className="text-stone/70 block">Customer</span>
                <span className="text-ink font-semibold">{createdBooking.customerName}</span>
              </div>
              <div>
                <span className="text-stone/70 block">Phone</span>
                <span className="text-ink font-semibold">{createdBooking.phone}</span>
              </div>
              <div className="col-span-2">
                <span className="text-stone/70 block">Location</span>
                <span className="text-ink font-semibold">{createdBooking.address}, {createdBooking.city}</span>
              </div>
              <div>
                <span className="text-stone/70 block">Appointment</span>
                <span className="text-olive font-semibold">{createdBooking.preferredDate}</span>
              </div>
              <div>
                <span className="text-stone/70 block">Time Slot</span>
                <span className="text-ink font-semibold">{createdBooking.preferredTimeSlot}</span>
              </div>
              <div>
                <span className="text-stone/70 block">Estimated Size</span>
                <span className="text-ink font-semibold">{createdBooking.estimatedLoadSize}% of Truck</span>
              </div>
              <div>
                <span className="text-stone/70 block">Pricing Estimate</span>
                <span className="text-olive font-semibold font-display text-base">${createdBooking.estimatedPrice}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              id="confirm-track-btn"
              onClick={() => setCurrentPage('track')}
              className="w-full bg-olive hover:bg-olive/90 text-white font-sans font-bold py-4 px-6 rounded-full transition-all duration-200 flex items-center justify-center space-x-2 shadow-sm cursor-pointer"
            >
              <Truck className="h-5 w-5 text-white" />
              <span>Enter Real-Time Tracking Screen</span>
              <ArrowRight className="h-5 w-5 text-white" />
            </button>
            <button
              id="confirm-home-btn"
              onClick={() => setCurrentPage('home')}
              className="w-full bg-transparent hover:bg-stone/5 border border-stone/20 hover:border-stone/30 text-stone hover:text-ink font-medium py-3 rounded-full text-sm transition-colors cursor-pointer"
            >
              Back to Home page
            </button>
          </div>
          
          <p className="text-[10px] text-stone mt-6 flex items-center justify-center space-x-1 font-mono">
            <Sparkles className="h-3 w-3 text-olive" />
            <span>Our truck automatically starts moving down Pine St in Ottawa!</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-cream text-ink min-h-screen pb-24 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        
        {/* Section Header */}
        <div className="border-b border-stone/10 pb-8 mb-10 text-center md:text-left">
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-ink tracking-tight">
            Schedule a Junk Pickup
          </h2>
          <p className="text-stone mt-2 text-sm sm:text-base max-w-xl">
            Select standard residential items to dynamically measure truck size and calculate an upfront cost. No hidden surcharges, guaranteed.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Item List & Selector (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Category Slider Tabs */}
            <div className="flex overflow-x-auto pb-2 scrollbar-none gap-2 border-b border-stone/10">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-2 text-xs font-semibold rounded-full font-mono uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
                    activeCategory === cat.id
                      ? 'bg-olive text-cream shadow-sm'
                      : 'bg-white text-stone hover:text-olive border border-stone/20'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Items Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredItems.map((item) => {
                const qty = quantities[item.id] || 0;
                return (
                  <div 
                    key={item.id}
                    id={`item-card-${item.id}`}
                    className={`p-4 rounded-3xl border transition-all flex flex-col justify-between h-36 ${
                      qty > 0 
                        ? 'bg-white border-olive shadow-sm' 
                        : 'bg-white border-stone/10 hover:border-stone/30'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2.5 rounded-xl border ${qty > 0 ? 'bg-olive/15 border-olive/30 text-olive' : 'bg-cream border-stone/10 text-stone'}`}>
                          {getIcon(item.iconName)}
                        </div>
                        <div>
                          <h4 className="font-sans font-bold text-sm text-ink transition-colors">
                            {item.name}
                          </h4>
                          <span className="text-[10px] font-mono text-stone uppercase">
                            {item.category}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-stone/10 pt-3">
                      <div>
                        <div className="text-xs text-stone font-mono">
                          Vol: <span className="text-olive font-bold">~{item.volumePercent}%</span>
                        </div>
                        <div className="text-[10px] text-stone">
                          Est: ${item.basePrice}
                        </div>
                      </div>

                      {/* Add/Sub controls */}
                      <div className="flex items-center space-x-2.5 bg-cream border border-stone/10 px-2 py-1 rounded-lg">
                        <button
                          type="button"
                          id={`sub-btn-${item.id}`}
                          onClick={() => updateQuantity(item.id, -1)}
                          className={`p-1.5 rounded hover:bg-stone/10 text-stone hover:text-ink transition-colors ${qty === 0 ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
                          disabled={qty === 0}
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="text-sm font-mono font-bold text-ink w-4 text-center">
                          {qty}
                        </span>
                        <button
                          type="button"
                          id={`add-btn-${item.id}`}
                          onClick={() => updateQuantity(item.id, 1)}
                          className="p-1.5 rounded hover:bg-stone/10 text-stone hover:text-ink transition-colors cursor-pointer"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Added Items Summary list */}
            {Object.keys(quantities).length > 0 && (
              <div className="bg-white border border-stone/10 rounded-3xl p-5 shadow-sm">
                <h4 className="font-sans font-semibold text-sm text-stone mb-3 uppercase tracking-wider font-mono">Selected Payload Items</h4>
                <div className="space-y-2 max-h-36 overflow-y-auto pr-2 scrollbar-thin">
                  {Object.keys(quantities).map((id) => {
                    const count = quantities[id] || 0;
                    const item = JUNK_ITEMS.find(i => i.id === id);
                    if (!item) return null;
                    return (
                      <div key={id} className="flex justify-between text-xs py-1.5 border-b border-stone/10 last:border-0 text-stone">
                        <span className="text-ink font-semibold">{item.name} <span className="text-stone font-normal">x{count}</span></span>
                        <span className="font-mono text-stone">+{item.volumePercent * count}% load</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Live Visual Estimator & Form (5 Cols) */}
          <div className="lg:col-span-5 space-y-6 sticky top-20">
            
            {/* Truck Space Visualizer Card */}
            <div className="bg-white border border-stone/10 rounded-3xl p-6 shadow-sm relative overflow-hidden">
              <h3 className="font-sans font-bold text-lg text-ink mb-4 flex items-center space-x-2">
                <Truck className="h-5 w-5 text-olive" />
                <span>Pat's Flatbed Load Gauge</span>
              </h3>

              {/* Dynamic Simulated Flatbed Container */}
              <div className="relative w-full h-28 bg-cream border border-stone/10 rounded-2xl flex overflow-hidden">
                {/* Truck Cabin block on left or right */}
                <div className="w-1/4 bg-white border-r border-stone/10 flex flex-col justify-center items-center text-center p-2 font-mono">
                  <div className="text-[10px] text-stone uppercase tracking-widest font-bold">Cabin</div>
                  <span className="text-olive text-[11px] font-bold mt-1">SCRAPPY1</span>
                </div>

                {/* Flatbed Bed on right */}
                <div className="w-3/4 relative flex items-end p-2 bg-white">
                  {/* Grid Lines */}
                  <div className="absolute inset-0 grid grid-cols-4 gap-px opacity-5 pointer-events-none">
                    <div className="border-r border-dashed border-stone"></div>
                    <div className="border-r border-dashed border-stone"></div>
                    <div className="border-r border-dashed border-stone"></div>
                    <div className="border-r border-dashed border-stone"></div>
                  </div>

                  {/* Empty state label */}
                  {totalVolumePercent === 0 ? (
                    <div className="absolute inset-0 flex items-center justify-center text-stone/60 text-xs text-center p-3 font-mono">
                      Flatbed is empty. Add residential items to load the truck bed.
                    </div>
                  ) : (
                    /* The Fill Level Indicator bar */
                    <div 
                      className={`h-full rounded-lg relative flex items-center justify-center font-mono font-bold transition-all duration-500 ease-out text-xs text-white ${
                        totalVolumePercent <= 30 ? 'bg-olive/70' :
                        totalVolumePercent <= 65 ? 'bg-olive' :
                        totalVolumePercent <= 100 ? 'bg-stone' :
                        'bg-clay animate-pulse'
                      }`}
                      style={{ width: `${Math.min(100, estimate.cleanVolume)}%` }}
                    >
                      <span className="bg-ink text-white px-2 py-0.5 rounded-md text-[10px] border border-white/10">
                        {totalVolumePercent}% Filled
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Estimate Outputs */}
              {totalVolumePercent > 0 && (
                <div className="mt-5 space-y-3 pt-4 border-t border-stone/10">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-stone font-mono">Required Space</span>
                    <span className="text-xs font-bold font-mono text-ink">
                      {totalVolumePercent}% of Single Truck
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-stone font-mono">Load Designation</span>
                    <span className="text-xs font-bold text-olive uppercase font-mono">
                      {estimate.description}
                    </span>
                  </div>
                  {estimate.truckCount > 1 && (
                    <div className="bg-clay/10 border border-clay/30 text-stone text-[11px] p-2 rounded-lg font-mono">
                      ⚠️ Note: Payload exceeds 100% capacity. This will be scheduled across {estimate.truckCount} sequential truck runs!
                    </div>
                  )}
                  <div className="flex justify-between items-end border-t border-dashed border-stone/20 pt-3">
                    <span className="text-xs text-stone font-mono">Guaranteed Cost</span>
                    <span className="font-sans font-bold text-2xl text-olive">
                      ${estimate.price}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Customer Information Details Form */}
            <form onSubmit={handleSubmit} className="bg-white border border-stone/10 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="font-sans font-bold text-lg text-ink border-b border-stone/10 pb-3 flex items-center space-x-2">
                <User className="h-5 w-5 text-olive" />
                <span>Contact & Pickup Details</span>
              </h3>

              {/* Customer Name */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-stone uppercase tracking-wider font-mono">Your Name *</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 h-4 w-4 text-stone" />
                  <input
                    type="text"
                    required
                    id="form-name"
                    placeholder="e.g. Alex Mercer"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-cream border border-stone/20 rounded-2xl pl-11 pr-4 py-2.5 text-sm text-ink focus:outline-none focus:border-olive transition-colors"
                  />
                </div>
              </div>

              {/* Phone & Email Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-stone uppercase tracking-wider font-mono">Phone Number *</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-stone" />
                    <input
                      type="tel"
                      required
                      id="form-phone"
                      placeholder="e.g. (343) 204-4625"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full bg-cream border border-stone/20 rounded-2xl pl-11 pr-4 py-2.5 text-sm text-ink focus:outline-none focus:border-olive transition-colors"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-stone uppercase tracking-wider font-mono">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-stone" />
                    <input
                      type="email"
                      id="form-email"
                      placeholder="e.g. alex@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full bg-cream border border-stone/20 rounded-2xl pl-11 pr-4 py-2.5 text-sm text-ink focus:outline-none focus:border-olive transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Street Address & City Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1">
                  <label className="block text-xs font-semibold text-stone uppercase tracking-wider font-mono">Street Address *</label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-stone" />
                    <input
                      type="text"
                      required
                      id="form-address"
                      placeholder="e.g. 1420 Pine St"
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full bg-cream border border-stone/20 rounded-2xl pl-11 pr-4 py-2.5 text-sm text-ink focus:outline-none focus:border-olive transition-colors"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-stone uppercase tracking-wider font-mono">City *</label>
                  <select
                    value={formData.city}
                    id="form-city"
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full bg-cream border border-stone/20 rounded-2xl px-4 py-2.5 text-sm text-ink focus:outline-none focus:border-olive transition-colors"
                  >
                    <option value="Ottawa">Ottawa</option>
                    <option value="Kanata">Kanata</option>
                    <option value="Nepean">Nepean</option>
                    <option value="Orleans">Orleans</option>
                    <option value="Gatineau">Gatineau</option>
                  </select>
                </div>
              </div>

              {/* Preferred Date & Time Slot Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-stone uppercase tracking-wider font-mono">Preferred Date *</label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-3.5 h-4 w-4 text-stone" />
                    <input
                      type="date"
                      required
                      id="form-date"
                      value={formData.preferredDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, preferredDate: e.target.value }))}
                      className="w-full bg-cream border border-stone/20 rounded-2xl pl-11 pr-4 py-2.5 text-sm text-ink focus:outline-none focus:border-olive transition-colors"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-stone uppercase tracking-wider font-mono">Arrival Window *</label>
                  <div className="relative">
                    <Clock className="absolute left-3.5 top-3.5 h-4 w-4 text-stone" />
                    <select
                      value={formData.preferredTimeSlot}
                      id="form-timeslot"
                      onChange={(e) => setFormData(prev => ({ ...prev, preferredTimeSlot: e.target.value }))}
                      className="w-full bg-cream border border-stone/20 rounded-2xl pl-11 pr-4 py-2.5 text-sm text-ink focus:outline-none focus:border-olive transition-colors"
                    >
                      <option value="08:00 AM - 10:00 AM">08:00 AM - 10:00 AM</option>
                      <option value="10:00 AM - 12:00 PM">10:00 AM - 12:00 PM</option>
                      <option value="12:00 PM - 02:00 PM">12:00 PM - 02:00 PM</option>
                      <option value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-stone uppercase tracking-wider font-mono">Special Instructions</label>
                <div className="relative">
                  <FileText className="absolute left-3.5 top-3.5 h-4 w-4 text-stone" />
                  <textarea
                    id="form-notes"
                    placeholder="e.g. Fridge is heavy, gate code is #4312..."
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full bg-cream border border-stone/20 rounded-2xl pl-11 pr-4 py-2.5 text-sm text-ink focus:outline-none focus:border-olive transition-colors animate-none"
                  ></textarea>
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                id="submit-booking-btn"
                disabled={totalVolumePercent === 0}
                className={`w-full font-sans font-bold py-4 px-6 rounded-full text-base transition-all flex items-center justify-center space-x-2 border shadow-sm ${
                  totalVolumePercent > 0
                    ? 'bg-olive hover:bg-olive/90 text-white border-olive cursor-pointer hover:-translate-y-0.5 active:translate-y-0'
                    : 'bg-white text-stone border-stone/10 cursor-not-allowed opacity-60'
                }`}
              >
                <CheckCircle2 className="h-5 w-5" />
                <span>Confirm Pickup Appointment</span>
              </button>

              <div className="flex items-center justify-center space-x-2 text-[10px] text-stone font-mono">
                <ShieldCheck className="h-3.5 w-3.5 text-olive" />
                <span>By submitting, you lock in our upfront local pricing rate.</span>
              </div>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
