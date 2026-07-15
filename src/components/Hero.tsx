import { ShieldCheck, Truck, RefreshCw, Star, ArrowRight, CheckCircle, Navigation, MapPin } from 'lucide-react';
import { motion } from 'motion/react';

interface HeroProps {
  setCurrentPage: (page: 'home' | 'book' | 'track' | 'reviews') => void;
  setSelectedPreloadSize?: (percent: number) => void;
}

export default function Hero({ setCurrentPage, setSelectedPreloadSize }: HeroProps) {
  const handleSelectSize = (percent: number) => {
    if (setSelectedPreloadSize) {
      setSelectedPreloadSize(percent);
    }
    setCurrentPage('book');
  };

  return (
    <div className="bg-cream text-ink min-h-screen pb-24">
      {/* Banner/Hero Section */}
      <div className="relative overflow-hidden bg-cream pt-16 pb-20 sm:pt-24 sm:pb-28 border-b border-olive/5">
        <div className="absolute inset-y-0 right-0 w-1/2 bg-radial from-olive/5 to-transparent pointer-events-none rounded-full blur-3xl"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 bg-olive/10 border border-olive/20 rounded-full px-3 py-1.5 text-xs font-bold text-olive font-mono tracking-wide uppercase">
                <span className="flex h-2 w-2 rounded-full bg-olive animate-pulse"></span>
                <span>Ottawa's Eco-Friendly Haulers</span>
              </div>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-ink tracking-tight leading-none">
                We haul the heavy <br />
                <span className="font-serif italic font-normal text-olive">
                  stuff, so you don't.
                </span>
              </h1>
              <p className="text-stone text-lg sm:text-xl max-w-2xl mx-auto lg:mx-0 font-sans font-normal leading-relaxed">
                Meet Scrappy Pat. We lift, haul, recycle, and donate your unwanted items. Fill in your details, get an instant pricing estimate, and watch our truck head straight to your door in real-time.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                <button
                  id="hero-book-btn"
                  onClick={() => handleSelectSize(0)}
                  className="w-full sm:w-auto px-8 py-4 bg-olive hover:bg-olive/90 text-white font-sans font-bold rounded-full text-base shadow-sm transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <span>Book Your Pickup</span>
                  <ArrowRight className="h-5 w-5 stroke-[2.5]" />
                </button>
                <button
                  id="hero-track-btn"
                  onClick={() => setCurrentPage('track')}
                  className="w-full sm:w-auto px-8 py-4 bg-white border border-stone/20 hover:bg-stone/5 text-ink font-sans font-bold rounded-full text-base transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Navigation className="h-5 w-5 text-olive" />
                  <span>Track Active Demo</span>
                </button>
              </div>

              {/* Badges / Rating */}
              <div className="pt-6 flex flex-wrap justify-center lg:justify-start items-center gap-6 text-sm text-stone">
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="font-semibold text-ink ml-2">4.9/5</span>
                  <span className="text-xs text-stone/80">(180+ Local Reviews)</span>
                </div>
                <div className="h-4 w-px bg-stone/20 hidden sm:block"></div>
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="h-4 w-4 text-olive" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-stone font-mono">Fully Insured & Bonded</span>
                </div>
              </div>
            </div>

            {/* Right Visual (Interactive Load Estimator Preview) */}
            <div className="lg:col-span-5 relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-olive/5 via-stone/5 to-transparent rounded-3xl blur-2xl"></div>
              <div className="relative bg-white border border-stone/10 rounded-3xl p-6 sm:p-8 shadow-sm">
                <div className="flex items-center justify-between border-b border-stone/10 pb-4 mb-6">
                  <div>
                    <h3 className="font-sans font-bold text-lg text-ink">Upfront Price Tiers</h3>
                    <p className="text-xs text-stone">Select a tier to begin booking</p>
                  </div>
                  <div className="bg-olive/10 text-olive text-xs font-mono font-semibold px-2 py-1 rounded-md border border-olive/20">
                    No Hidden Fees
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    { label: 'Quarter Truck Load', percent: 25, price: '$149', desc: 'Sofa, dresser, or multiple small appliances.', color: 'from-blue-500 to-indigo-500' },
                    { label: 'Half Truck Load', percent: 50, price: '$269', desc: 'Perfect for a full room clearout or light renovation trash.', color: 'from-emerald-500 to-teal-500' },
                    { label: 'Full Truck Load', percent: 100, price: '$489', desc: 'Massive volume. Whole garage, yard, or move-out cleanouts.', color: 'from-amber-500 to-orange-500' }
                  ].map((tier) => (
                    <div 
                      key={tier.percent}
                      onClick={() => handleSelectSize(tier.percent)}
                      className="group p-4 bg-cream hover:bg-clay/20 border border-stone/10 hover:border-olive/30 rounded-2xl transition-all duration-200 cursor-pointer flex justify-between items-center"
                    >
                      <div className="space-y-1 pr-4">
                        <div className="flex items-center space-x-2">
                          <div className="text-sm font-semibold text-ink group-hover:text-olive transition-colors">
                            {tier.label}
                          </div>
                          <span className="text-[10px] font-mono text-stone bg-white border border-stone/20 px-1.5 py-0.5 rounded-sm">
                            {tier.percent}% Vol
                          </span>
                        </div>
                        <p className="text-xs text-stone leading-normal">{tier.desc}</p>
                      </div>
                      <div className="text-right flex flex-col items-end">
                        <span className="font-sans font-bold text-lg text-olive group-hover:scale-105 transition-transform">
                          {tier.price}
                        </span>
                        <span className="text-[10px] text-stone">all-inclusive</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 pt-4 border-t border-stone/10 text-center text-xs text-stone flex items-center justify-center space-x-2">
                  <RefreshCw className="h-3 w-3 text-olive animate-spin" style={{ animationDuration: '6s' }} />
                  <span>Estimates include 2 crew members, loading, sweeping & disposal fees.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust & Eco-recycling Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="bg-clay/10 border border-olive/10 rounded-3xl p-8 sm:p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-olive/5 via-transparent to-transparent pointer-events-none"></div>
          
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="font-display text-3xl font-bold text-ink tracking-tight">
              Why Ottawa Chooses <span className="font-serif italic font-normal text-olive">Scrappy Pat</span>
            </h2>
            <p className="text-stone text-sm sm:text-base mt-2">
              We aren't your typical dump-and-run haulers. We care about our planet and your schedule.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-3xl border border-stone/10 shadow-sm space-y-4">
              <div className="bg-olive/10 text-olive p-3 rounded-xl w-12 h-12 flex items-center justify-center">
                <RefreshCw className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-ink font-sans">94% Recycled & Donated</h3>
              <p className="text-xs sm:text-sm text-stone/90 leading-relaxed">
                If it can be reused, we salvage it. Furniture goes to local charities, metal gets scrap-sorted, and appliances are responsibly recycled.
              </p>
              <ul className="text-xs text-stone space-y-1.5 font-mono">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-3 w-3 text-olive" />
                  <span>Charity partnerships</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-3 w-3 text-olive" />
                  <span>Zero-landfill metal salvage</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-stone/10 shadow-sm space-y-4">
              <div className="bg-olive/10 text-olive p-3 rounded-xl w-12 h-12 flex items-center justify-center">
                <Navigation className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-ink font-sans">Real-Time Truck Tracker</h3>
              <p className="text-xs sm:text-sm text-stone/90 leading-relaxed">
                No more waiting around in vague 4-hour windows. When Scrappy Pat is en route, track his precise location, ETA, and chat with him on our live dashboard.
              </p>
              <ul className="text-xs text-stone space-y-1.5 font-mono">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-3 w-3 text-olive" />
                  <span>Live SVG path animation</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-3 w-3 text-olive" />
                  <span>Direct crew messaging</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-stone/10 shadow-sm space-y-4">
              <div className="bg-olive/10 text-olive p-3 rounded-xl w-12 h-12 flex items-center justify-center">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-ink font-sans">Scrappy Crew, Heavy Work</h3>
              <p className="text-xs sm:text-sm text-stone/90 leading-relaxed">
                We handle the heavy lifting from anywhere in your home—basement, attic, yard. Sweeping up before leaving is Scrappy Pat's personal guarantee.
              </p>
              <ul className="text-xs text-stone space-y-1.5 font-mono">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-3 w-3 text-olive" />
                  <span>2-person crew included</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-3 w-3 text-olive" />
                  <span>Broom-swept clean guarantee</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Simple Stats Belt */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        {[
          { label: 'Tons Hauled & Recycled', val: '450+' },
          { label: 'Active Service Zip Codes', val: '24' },
          { label: 'Average Arrival Accuracy', val: '98.4%' },
          { label: 'Eco-Sorting Facility', val: 'Local' }
        ].map((stat, idx) => (
          <div key={idx} className="bg-white border border-stone/10 p-4 rounded-3xl shadow-sm">
            <div className="text-2xl sm:text-3xl font-extrabold font-sans text-olive">{stat.val}</div>
            <div className="text-xs text-stone mt-1 uppercase tracking-wider font-mono">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
