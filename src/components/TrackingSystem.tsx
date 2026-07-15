import { useState, useEffect, useRef, FormEvent } from 'react';
import { 
  Truck, MapPin, Navigation, Clock, User, MessageSquare, Send, 
  Play, Pause, RefreshCw, CheckCircle, Flame, Calendar, Map, CheckCircle2, ShieldCheck
} from 'lucide-react';
import { Booking, BookingStatus, ChatMessage } from '../types';

interface TrackingSystemProps {
  bookings: Booking[];
  activeBookingId: string | null;
  onUpdateBookingStatus: (bookingId: string, status: BookingStatus, progress: number, eta: number, newMsg?: ChatMessage) => void;
  onSendChatMessage: (bookingId: string, message: ChatMessage) => void;
}

export default function TrackingSystem({ 
  bookings, 
  activeBookingId, 
  onUpdateBookingStatus,
  onSendChatMessage
}: TrackingSystemProps) {
  // Find current active booking
  const selectedBooking = bookings.find(b => b.id === activeBookingId) || bookings[0];
  
  const [chatInput, setChatInput] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState<'normal' | 'fast'>('normal');

  // SVG grid size: 500x300
  const mapPoints = [
    { p: 0, x: 50, y: 230, label: "Scrappy Pat's Depot" },
    { p: 20, x: 140, y: 190, label: "Ottawa Parkway" },
    { p: 40, x: 200, y: 90, label: "Queen Anne Blvd" },
    { p: 65, x: 320, y: 150, label: "Broadway Ave" },
    { p: 85, x: 400, y: 100, label: "Pine St Cross" },
    { p: 100, x: 450, y: 50, label: "Customer House" }
  ];

  // Helper to interpolate coordinates on SVG map based on progress percent
  const getTruckCoords = (progress: number) => {
    let startPoint = mapPoints[0];
    let endPoint = mapPoints[mapPoints.length - 1];

    for (let i = 0; i < mapPoints.length - 1; i++) {
      if (progress >= mapPoints[i].p && progress <= mapPoints[i+1].p) {
        startPoint = mapPoints[i];
        endPoint = mapPoints[i+1];
        break;
      }
    }

    const segmentRange = endPoint.p - startPoint.p;
    const segmentFactor = segmentRange === 0 ? 0 : (progress - startPoint.p) / segmentRange;

    const x = startPoint.x + (endPoint.x - startPoint.x) * segmentFactor;
    const y = startPoint.y + (endPoint.y - startPoint.y) * segmentFactor;

    return { x, y };
  };

  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedBooking?.chatHistory]);

  // Interval hook for active truck driving simulation
  useEffect(() => {
    if (!isSimulating || !selectedBooking) return;

    const intervalTime = simulationSpeed === 'fast' ? 800 : 2500;

    const simInterval = setInterval(() => {
      const currStatus = selectedBooking.status;
      let nextStatus = currStatus;
      let nextProgress = selectedBooking.trackingProgress;
      let nextEta = selectedBooking.etaMinutes;
      let newMsg: ChatMessage | undefined = undefined;

      if (currStatus === 'confirmed') {
        nextStatus = 'dispatched';
        nextProgress = 5;
        nextEta = 22;
        newMsg = {
          id: `sys-${Date.now()}`,
          sender: 'driver',
          text: 'Truck is fully prepped! Keys in ignition. Jaxson is sorting the scrap bins and we are starting the engine.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
      } else if (currStatus === 'dispatched') {
        nextStatus = 'en_route';
        nextProgress = 10;
        nextEta = 20;
        newMsg = {
          id: `sys-${Date.now()}`,
          sender: 'driver',
          text: 'We are rolling! Heading onto Ottawa Parkway. Keep an eye on our truck indicator!',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
      } else if (currStatus === 'en_route') {
        const increment = simulationSpeed === 'fast' ? 12 : 5;
        nextProgress = Math.min(95, selectedBooking.trackingProgress + increment);
        nextEta = Math.max(2, Math.ceil((100 - nextProgress) * 0.22));

        if (nextProgress >= 95) {
          nextStatus = 'arrived';
          nextProgress = 95;
          nextEta = 0;
          newMsg = {
            id: `sys-${Date.now()}`,
            sender: 'driver',
            text: `We have officially arrived outside ${selectedBooking.address}! Backing the truck up your driveway right now.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
        }
      } else if (currStatus === 'arrived') {
        nextStatus = 'loading';
        nextProgress = 98;
        nextEta = 0;
        newMsg = {
          id: `sys-${Date.now()}`,
          sender: 'driver',
          text: 'Jaxson and I are inspecting the load items. We are starting to load the couch and sorting wood recycling. It will take us about 10-15 mins!',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
      } else if (currStatus === 'loading') {
        nextStatus = 'completed';
        nextProgress = 100;
        nextEta = 0;
        newMsg = {
          id: `sys-${Date.now()}`,
          sender: 'driver',
          text: 'All done! Items are packed tight, flatbed sweep complete, and we are headed back to the sorting center. Thanks for using Scrappy Pat\'s!',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setIsSimulating(false);
      }

      onUpdateBookingStatus(selectedBooking.id, nextStatus, nextProgress, nextEta, newMsg);

    }, intervalTime);

    return () => clearInterval(simInterval);
  }, [isSimulating, selectedBooking, simulationSpeed]);

  if (!selectedBooking) {
    return (
      <div className="bg-cream text-ink min-h-screen py-24 px-4 text-center">
        <h3 className="font-sans font-bold text-xl text-stone">No pickup appointments registered yet.</h3>
        <p className="text-stone/70 text-sm mt-2">Go to "Book a Pickup" tab first to trigger a tracking profile!</p>
      </div>
    );
  }

  // Handle active customer text submission
  const handleSendText = (e: FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'customer',
      text: chatInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    onSendChatMessage(selectedBooking.id, userMsg);
    setChatInput('');

    // Simulated quick auto-reply from Pat after 1.5 seconds
    setTimeout(() => {
      let replyText = "Copy that! We'll make sure to note that instruction.";
      if (chatInput.toLowerCase().includes('gate') || chatInput.toLowerCase().includes('code')) {
        replyText = "Perfect, received the gate code! That makes finding your driveway much easier.";
      } else if (chatInput.toLowerCase().includes('parking') || chatInput.toLowerCase().includes('street')) {
        replyText = "Understood. Jaxson will guide me while backing in so we don't block the street neighbors.";
      } else if (chatInput.toLowerCase().includes('thank') || chatInput.toLowerCase().includes('thanks')) {
        replyText = "You got it! Helping folks reclaim their space is why we are in business.";
      }

      const patReply: ChatMessage = {
        id: `drv-${Date.now()}`,
        sender: 'driver',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      onSendChatMessage(selectedBooking.id, patReply);
    }, 1500);
  };

  const truckCoords = getTruckCoords(selectedBooking.trackingProgress);

  // Quick driver debug helpers
  const triggerManualStatus = (status: BookingStatus) => {
    let progress = 0;
    let eta = 20;
    let text = "";

    if (status === 'confirmed') {
      progress = 0;
      eta = 25;
      text = "Appointment secured! Preparing tools.";
    } else if (status === 'dispatched') {
      progress = 5;
      eta = 22;
      text = "Truck is prepped, sorting boxes are tied down, and we are starting up.";
    } else if (status === 'en_route') {
      progress = 35;
      eta = 12;
      text = "Driving through Ottawa. Excellent street traffic today!";
    } else if (status === 'arrived') {
      progress = 95;
      eta = 0;
      text = `We have arrived at ${selectedBooking.address}! Ready to load.`;
    } else if (status === 'loading') {
      progress = 98;
      eta = 0;
      text = "We are backing onto the driveway and loading the bulky items.";
    } else if (status === 'completed') {
      progress = 100;
      eta = 0;
      text = "Pickup finished! Swept clean. Thanks for choosing Scrappy Pat.";
    }

    const dbgMsg: ChatMessage = {
      id: `sys-${Date.now()}`,
      sender: 'driver',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    onUpdateBookingStatus(selectedBooking.id, status, progress, eta, dbgMsg);
  };

  return (
    <div className="bg-cream text-ink min-h-screen pb-24 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">

        {/* Header section with booking selectors */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-stone/10 pb-6 mb-8 gap-4">
          <div>
            <span className="font-mono text-xs uppercase text-stone tracking-wider">Residential Service Center</span>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-ink">
              Real-Time Truck Tracker
            </h2>
          </div>
          
          {/* Active Job Dropdown selection */}
          <div className="flex items-center space-x-2.5">
            <span className="text-xs text-stone font-mono">Select Booking:</span>
            <select
              value={selectedBooking.id}
              onChange={() => {}} // Controlled by App state but select provides visual verification
              className="bg-white border border-stone/10 rounded-2xl px-4 py-2.5 text-sm font-semibold text-olive focus:outline-none"
            >
              {bookings.map(b => (
                <option key={b.id} value={b.id}>
                  {b.customerName} ({b.id})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Step Timeline Indicator */}
        <div className="bg-white border border-stone/10 rounded-3xl p-5 mb-8 shadow-sm">
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-4 text-center">
            {[
              { id: 'confirmed', label: 'Confirmed', desc: 'Schedules locked in' },
              { id: 'dispatched', label: 'Dispatched', desc: 'Crew assembling' },
              { id: 'en_route', label: 'En Route', desc: 'Moving down streets' },
              { id: 'arrived', label: 'Arrived', desc: 'Parked in driveway' },
              { id: 'loading', label: 'Loading Up', desc: 'Packing flatbed' },
              { id: 'completed', label: 'Completed', desc: 'Swept & Recycle bound' },
            ].map((step, idx) => {
              const order = ['confirmed', 'dispatched', 'en_route', 'arrived', 'loading', 'completed'];
              const currentIdx = order.indexOf(selectedBooking.status);
              const isActive = step.id === selectedBooking.status;
              const isPast = order.indexOf(step.id) < currentIdx;

              return (
                <div 
                  key={step.id} 
                  className={`p-3 rounded-2xl border flex flex-col items-center justify-center space-y-1 transition-all ${
                    isActive 
                      ? 'bg-olive/10 border-olive text-ink' 
                      : isPast 
                      ? 'bg-cream/40 border-stone/10 text-olive' 
                      : 'bg-cream/10 border-stone/5 text-stone/40'
                  }`}
                >
                  <span className="font-mono text-[9px] font-bold uppercase tracking-widest block opacity-70">
                    Step 0{idx + 1}
                  </span>
                  <span className="text-xs font-bold leading-tight">{step.label}</span>
                  <span className="text-[9px] text-stone/70 leading-none block hidden sm:block">{step.desc}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main tracking dashboard grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: SVG Animated Street Map (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white border border-stone/10 rounded-3xl p-4 sm:p-5 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-2">
                  <Map className="h-5 w-5 text-olive" />
                  <h3 className="font-sans font-bold text-sm text-ink">Ottawa Neighborhood Transit Radar</h3>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-clay opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-clay"></span>
                  </span>
                  <span className="text-[10px] font-mono text-stone font-semibold uppercase">Simulated Live GPS</span>
                </div>
              </div>

              {/* The SVG Map Canvas */}
              <div className="relative w-full aspect-[5/3] bg-cream rounded-2xl overflow-hidden border border-stone/10">
                <svg viewBox="0 0 500 300" className="w-full h-full select-none">
                  {/* Waterways / Puget Sound (Subtle styling) */}
                  <path d="M 0 0 Q 30 100 10 300 L 0 300 Z" fill="#dbeafe" opacity="0.25" />
                  <path d="M 120 140 Q 180 160 160 210 Q 150 240 170 300" fill="none" stroke="#dbeafe" strokeWidth="40" strokeLinecap="round" opacity="0.12" />
                  
                  {/* Street Grids Lines */}
                  {/* Hwy 99 */}
                  <line x1="70" y1="300" x2="110" y2="0" stroke="#e2e8f0" strokeWidth="6" strokeLinecap="round" opacity="0.5" />
                  <line x1="70" y1="300" x2="110" y2="0" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="5,5" strokeLinecap="round" opacity="0.7" />
                  
                  {/* Interstate 5 */}
                  <path d="M 280 300 C 270 200, 310 100, 290 0" stroke="#e2e8f0" strokeWidth="8" strokeLinecap="round" opacity="0.5" />
                  <path d="M 280 300 C 270 200, 310 100, 290 0" stroke="#7c9070" strokeWidth="1" strokeDasharray="6,4" opacity="0.15" />

                  {/* Surface Streets */}
                  <line x1="30" y1="80" x2="470" y2="80" stroke="#e2e8f0" strokeWidth="3" opacity="0.5" />
                  <line x1="30" y1="140" x2="470" y2="140" stroke="#e2e8f0" strokeWidth="3" opacity="0.5" />
                  <line x1="30" y1="210" x2="470" y2="210" stroke="#e2e8f0" strokeWidth="3" opacity="0.5" />
                  <line x1="120" y1="20" x2="120" y2="280" stroke="#e2e8f0" strokeWidth="3" opacity="0.5" />
                  <line x1="220" y1="20" x2="220" y2="280" stroke="#e2e8f0" strokeWidth="3" opacity="0.5" />
                  <line x1="380" y1="20" x2="380" y2="280" stroke="#e2e8f0" strokeWidth="3" opacity="0.5" />

                  {/* Winding Driving route for Pat's Truck */}
                  <path 
                    d="M 50 230 Q 110 210 140 190 T 200 90 T 320 150 T 400 100 L 450 50" 
                    stroke="#cbd5e1" 
                    strokeWidth="4" 
                    fill="none" 
                    strokeLinecap="round" 
                    opacity="0.4"
                  />
                  {/* Active highlighted green route behind truck */}
                  <path 
                    d="M 50 230 Q 110 210 140 190 T 200 90 T 320 150 T 400 100 L 450 50" 
                    stroke="#7c9070" 
                    strokeWidth="2.5" 
                    fill="none" 
                    strokeLinecap="round" 
                    strokeDasharray="500"
                    strokeDashoffset={500 - (500 * selectedBooking.trackingProgress) / 100}
                    className="transition-all duration-300"
                    opacity="0.8"
                  />

                  {/* LANDMARKS */}
                  {/* Depot */}
                  <circle cx="50" cy="230" r="7" fill="#c17c74" className="animate-pulse" />
                  <text x="50" y="247" fill="#8c7a6b" fontSize="9" textAnchor="middle" fontWeight="bold" fontFamily="monospace">DEPOT</text>

                  {/* ByWard Market (Landmark) */}
                  <circle cx="180" cy="50" r="4" fill="#a3a3a3" />
                  <text x="180" y="42" fill="#8c7a6b" fontSize="8" textAnchor="middle" fontFamily="sans-serif">ByWard Market</text>

                  {/* Peace Tower (Landmark) */}
                  <circle cx="210" cy="180" r="4" fill="#a3a3a3" />
                  <text x="210" y="172" fill="#8c7a6b" fontSize="8" textAnchor="middle" fontFamily="sans-serif">Peace Tower</text>

                  {/* Rideau Canal Bridge */}
                  <rect x="260" y="125" width="40" height="8" rx="2" fill="#8c7a6b" opacity="0.3" />
                  <text x="280" y="120" fill="#8c7a6b" fontSize="7" textAnchor="middle" fontWeight="bold" fontFamily="monospace">BRIDGE</text>

                  {/* Broadway Ave Junction */}
                  <circle cx="320" cy="150" r="4" fill="#cbd5e1" />
                  <text x="325" y="162" fill="#8c7a6b" fontSize="8" fontFamily="sans-serif">Broadway</text>

                  {/* Customer's House Icon Pin */}
                  <circle cx="450" cy="50" r="10" fill="#7c9070" fillOpacity="0.2" className="animate-ping" />
                  <circle cx="450" cy="50" r="6" fill="#7c9070" />
                  <text x="450" y="36" fill="#7c9070" fontSize="9" textAnchor="middle" fontWeight="bold" fontFamily="monospace">HOME (PINE ST)</text>

                  {/* TRUCK SVG RENDERED DYNAMICALLY ALONG INTERPOLATED COORDS */}
                  {selectedBooking.trackingProgress > 0 && selectedBooking.trackingProgress < 100 && (
                    <g transform={`translate(${truckCoords.x - 12}, ${truckCoords.y - 12})`} className="transition-all duration-300">
                      {/* Truck outer halo glow */}
                      <circle cx="12" cy="12" r="16" fill="#7c9070" fillOpacity="0.12" className="animate-pulse" />
                      {/* Truck body shape */}
                      <rect x="2" y="5" width="16" height="12" rx="2" fill="#7c9070" />
                      <rect x="15" y="8" width="6" height="9" rx="1.5" fill="#7c9070" />
                      <circle cx="6" cy="18" r="3" fill="#2d3748" />
                      <circle cx="15" cy="18" r="3" fill="#2d3748" />
                      <rect x="18" y="10" width="3" height="4" fill="#2d3748" opacity="0.5" />
                    </g>
                  )}
                </svg>

                {/* Legend overlay overlaying top left */}
                <div className="absolute bottom-3 left-3 bg-white/95 border border-stone/10 rounded-xl p-2.5 space-y-1.5 text-[10px] font-mono shadow-sm">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-clay inline-block"></span>
                    <span className="text-stone">Pat's Sorting Center</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-olive inline-block"></span>
                    <span className="text-stone">Scrappy Flatbed Truck</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-olive inline-block animate-pulse"></span>
                    <span className="text-stone">Destination (Residential)</span>
                  </div>
                </div>
              </div>

              {/* Dynamic stats bar under map */}
              <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-stone/10 text-center font-mono text-xs text-stone">
                <div className="space-y-0.5 border-r border-stone/10">
                  <span className="text-[10px] uppercase text-stone/70 block">CURRENT SPEED</span>
                  <span className="text-sm font-bold text-ink">
                    {selectedBooking.status === 'en_route' ? '32 Mph' : '0 Mph'}
                  </span>
                </div>
                <div className="space-y-0.5 border-r border-stone/10">
                  <span className="text-[10px] uppercase text-stone/70 block">GPS COORDINATES</span>
                  <span className="text-[10px] text-olive font-bold block leading-relaxed">
                    {selectedBooking.status === 'en_route' 
                      ? `47.618, -122.${130 + Math.ceil(selectedBooking.trackingProgress * 2.1)}` 
                      : 'Parked'}
                  </span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase text-stone/70 block">TRAFFIC INDEX</span>
                  <span className="text-xs font-bold text-ink">Optimal (92%)</span>
                </div>
              </div>
            </div>

            {/* Quick-Stats Cards Info Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white border border-stone/10 rounded-2xl p-4 flex items-center space-x-3 shadow-sm">
                <Clock className="h-5 w-5 text-olive shrink-0" />
                <div>
                  <span className="text-[10px] text-stone uppercase block font-mono">Estimated ETA</span>
                  <span className="text-sm font-bold text-ink">
                    {selectedBooking.status === 'completed' ? 'Arrived' : `${selectedBooking.etaMinutes} Mins`}
                  </span>
                </div>
              </div>

              <div className="bg-white border border-stone/10 rounded-2xl p-4 flex items-center space-x-3 shadow-sm">
                <User className="h-5 w-5 text-olive shrink-0" />
                <div>
                  <span className="text-[10px] text-stone uppercase block font-mono">Crew Assigned</span>
                  <span className="text-sm font-bold text-ink">Pat & Jaxson</span>
                </div>
              </div>

              <div className="bg-white border border-stone/10 rounded-2xl p-4 flex items-center space-x-3 shadow-sm">
                <MapPin className="h-5 w-5 text-olive shrink-0" />
                <div>
                  <span className="text-[10px] text-stone uppercase block font-mono">Address</span>
                  <span className="text-xs font-bold text-ink truncate max-w-[120px] block">
                    {selectedBooking.address}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Direct Driver debug panel (HUD) */}
            <div className="bg-white/60 border border-stone/10 rounded-3xl p-6 relative overflow-hidden shadow-sm">
              <div className="absolute top-0 right-0 bg-olive/10 text-olive text-[10px] font-mono px-3 py-1 rounded-bl-2xl border-l border-b border-stone/5">
                Simulation Lab
              </div>
              
              <h3 className="font-sans font-bold text-base text-ink mb-2 flex items-center space-x-2">
                <RefreshCw className="h-4.5 w-4.5 text-olive" />
                <span>Live Action Simulation Controls</span>
              </h3>
              <p className="text-stone text-xs mb-4">
                Normally, Pat updates his tablet client during his Ottawa transit. Use this control panel to simulate his status updates in real-time.
              </p>

              {/* Automatic Simulation Drive Toggle */}
              <div className="flex flex-wrap items-center gap-3 border-b border-stone/10 pb-4 mb-4">
                <button
                  onClick={() => setIsSimulating(!isSimulating)}
                  className={`px-5 py-2 rounded-full text-xs font-sans font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                    isSimulating 
                      ? 'bg-clay hover:bg-clay/95 text-white' 
                      : 'bg-olive hover:bg-olive/95 text-white'
                  }`}
                >
                  {isSimulating ? (
                    <>
                      <Pause className="h-3.5 w-3.5 stroke-[2.5]" />
                      <span>Pause Driving Sim</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-3.5 w-3.5 stroke-[2.5]" />
                      <span>Start Auto-Drive Sim</span>
                    </>
                  )}
                </button>

                <div className="flex items-center bg-cream border border-stone/10 rounded-full p-1 text-xs">
                  <button
                    onClick={() => setSimulationSpeed('normal')}
                    className={`px-3 py-1 rounded-full font-mono ${simulationSpeed === 'normal' ? 'bg-white text-ink shadow-sm font-bold' : 'text-stone'}`}
                  >
                    1x Rate
                  </button>
                  <button
                    onClick={() => setSimulationSpeed('fast')}
                    className={`px-3 py-1 rounded-full font-mono ${simulationSpeed === 'fast' ? 'bg-clay text-white font-bold' : 'text-stone'}`}
                  >
                    Fast (5x)
                  </button>
                </div>
              </div>

              {/* Step Jumping */}
              <div>
                <span className="block text-[10px] font-mono uppercase text-stone mb-2">Simulate Specific Milestones:</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                  {[
                    { id: 'confirmed', label: '1. Confirmed' },
                    { id: 'dispatched', label: '2. Dispatch' },
                    { id: 'en_route', label: '3. En Route' },
                    { id: 'arrived', label: '4. Arrived' },
                    { id: 'loading', label: '5. Loading' },
                    { id: 'completed', label: '6. Finish' },
                  ].map((btn) => (
                    <button
                      key={btn.id}
                      onClick={() => triggerManualStatus(btn.id as BookingStatus)}
                      className={`py-2 px-1 rounded-xl text-[11px] font-mono border transition-colors cursor-pointer ${
                        selectedBooking.status === btn.id
                          ? 'bg-olive/10 border-olive text-olive font-bold'
                          : 'bg-cream hover:bg-cream/80 border-stone/10 text-stone'
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT: Crew Profile & Live Chat Interface (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Crew Profile card */}
            <div className="bg-white border border-stone/10 rounded-3xl p-5 shadow-sm">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  {/* Driver avatar circle */}
                  <div className="w-14 h-14 bg-gradient-to-tr from-olive to-clay rounded-2xl flex items-center justify-center font-sans font-extrabold text-white text-xl border border-stone/5 shadow-sm">
                    SP
                  </div>
                  <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-olive opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-olive"></span>
                  </span>
                </div>
                
                <div>
                  <h4 className="font-sans font-bold text-base text-ink">Scrappy Pat</h4>
                  <p className="text-xs text-stone">Head Hauler & Green-Sort Lead</p>
                  <div className="flex items-center space-x-2 mt-1.5 font-mono text-[10px] text-stone">
                    <span className="bg-cream border border-stone/15 px-1.5 py-0.5 rounded text-clay font-bold">SCRAPPY1</span>
                    <span>•</span>
                    <span className="text-olive">Insured Crew</span>
                  </div>
                </div>
              </div>

              {/* Booking receipt reference details inside drawer */}
              <div className="bg-cream border border-stone/10 rounded-2xl p-4 mt-5 space-y-2.5 font-mono text-xs">
                <div className="flex justify-between border-b border-stone/5 pb-2 text-[10px] text-stone uppercase">
                  <span>Pickup Details Summary</span>
                  <span>{selectedBooking.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone">Client</span>
                  <span className="text-ink font-sans font-semibold">{selectedBooking.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone">Address</span>
                  <span className="text-ink font-sans">{selectedBooking.address}, {selectedBooking.city}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone">Timing</span>
                  <span className="text-olive font-sans">{selectedBooking.preferredTimeSlot}</span>
                </div>
                <div className="flex justify-between border-t border-stone/5 pt-2 text-[11px]">
                  <span className="text-stone">Estimated Cost</span>
                  <span className="text-olive font-bold font-sans">${selectedBooking.estimatedPrice}</span>
                </div>
              </div>
            </div>

            {/* Chat Box Panel */}
            <div className="bg-white border border-stone/10 rounded-3xl p-5 shadow-sm h-[420px] flex flex-col justify-between">
              
              {/* Chat header */}
              <div className="border-b border-stone/10 pb-3 mb-3 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-4.5 w-4.5 text-olive" />
                  <span className="font-sans font-bold text-sm text-ink">Direct Chat with Pat</span>
                </div>
                <span className="text-[10px] font-mono text-olive bg-olive/10 px-2 py-0.5 rounded-full border border-olive/20">
                  Online
                </span>
              </div>

              {/* Messages Body */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
                {selectedBooking.chatHistory.map((msg) => {
                  const isDriver = msg.sender === 'driver';
                  return (
                    <div 
                      key={msg.id}
                      className={`flex flex-col max-w-[85%] ${isDriver ? 'self-start' : 'self-end ml-auto'}`}
                    >
                      <span className="text-[10px] text-stone mb-0.5 font-mono px-1">
                        {isDriver ? 'Scrappy Pat' : 'You'} • {msg.timestamp}
                      </span>
                      <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                        isDriver 
                          ? 'bg-cream border border-stone/10 text-ink rounded-tl-none' 
                          : 'bg-olive text-white rounded-tr-none shadow-sm font-medium'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  );
                })}
                <div ref={chatBottomRef} />
              </div>

              {/* SMS Input Panel */}
              <form onSubmit={handleSendText} className="flex items-center space-x-2 mt-3 pt-3 border-t border-stone/10">
                <input
                  type="text"
                  placeholder="Ask Pat a question..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 bg-cream border border-stone/20 rounded-2xl px-4 py-2.5 text-xs text-ink focus:outline-none focus:border-olive transition-colors"
                />
                <button
                  type="submit"
                  className="bg-olive hover:bg-olive/90 text-white p-2.5 rounded-2xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center cursor-pointer"
                >
                  <Send className="h-4 w-4 stroke-[2.5]" />
                </button>
              </form>

              {/* Simulated chat suggestions for outstanding UX */}
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                <button
                  type="button"
                  onClick={() => setChatInput("The gate code is #4023")}
                  className="text-[9px] bg-cream border border-stone/15 hover:bg-cream/80 px-2 py-1 rounded-lg text-stone hover:text-ink font-mono"
                >
                  🔑 Gate code #
                </button>
                <button
                  type="button"
                  onClick={() => setChatInput("Is street parking open?")}
                  className="text-[9px] bg-cream border border-stone/15 hover:bg-cream/80 px-2 py-1 rounded-lg text-stone hover:text-ink font-mono"
                >
                  🚚 Street Parking?
                </button>
                <button
                  type="button"
                  onClick={() => setChatInput("Thank you so much!")}
                  className="text-[9px] bg-cream border border-stone/15 hover:bg-cream/80 px-2 py-1 rounded-lg text-stone hover:text-ink font-mono"
                >
                  🙏 Thanks!
                </button>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
