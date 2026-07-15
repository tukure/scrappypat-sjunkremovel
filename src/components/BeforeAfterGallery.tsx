import React, { useState } from 'react';
import { Sparkles, Truck, ShieldCheck, CheckCircle, ArrowRight, Image as ImageIcon } from 'lucide-react';

export default function BeforeAfterGallery({ setCurrentPage }: { setCurrentPage: (page: 'home' | 'book' | 'track' | 'reviews') => void }) {
  const [activeTab, setActiveTab] = useState<'all' | 'vehicles' | 'garages' | 'barns'>('all');

  const galleryItems = [
    {
      id: 1,
      title: 'Unwanted Car & Field Vehicle Tow-Away',
      category: 'vehicles',
      badge: 'Vehicle & Car Towing',
      description: 'We winch, tow, and haul away abandoned or non-running cars, trucks, and farm vehicles sitting in fields, barns, or driveways across Ottawa.',
      beforeText: 'Abandoned sedan & rust in overgrown field',
      afterText: 'Cleared, towed away & graded property',
      stat: 'Full Property Recovery',
      image: 'https://i.ibb.co/whNSD20g/310ef874-d678-4a8d-9d5d-38a544bf5518.jpg'
    },
    {
      id: 2,
      title: 'Barn & Outbuilding Debris Clearance',
      category: 'barns',
      badge: 'Barn & Farm Cleanout',
      description: 'Complete removal of collapsed structural wood, old barrels, scrap metal, and decades of accumulated farm clutter and dumpsters.',
      beforeText: 'Cluttered barn rafters & debris-filled floor',
      afterText: 'Broom-swept clean space ready for reuse',
      stat: '94% Recycled/Scrapped',
      image: 'https://i.ibb.co/rRfW76H8/before2-Copy.jpg'
    },
    {
      id: 3,
      title: 'Heavy Machinery & Equipment Removal',
      category: 'vehicles',
      badge: 'Heavy Machinery',
      description: 'Got broken-down lawn tractors, heavy generators, campers, or old industrial machinery? Our heavy-duty winch truck lifts and hauls it.',
      beforeText: 'Dead machinery & hazard scrap on site',
      afterText: 'Safe, clear space with zero environmental waste',
      stat: 'Professional Winch Rig',
      image: 'https://i.ibb.co/21XZ77S5/before.jpg'
    },
    {
      id: 4,
      title: 'Commercial & Residential Garage Cleanout',
      category: 'garages',
      badge: 'Garage & Workshop',
      description: 'Transforming dark, cluttered workshops and garages with old motorcycle frames and auto parts into pristine concrete floors.',
      beforeText: 'Walls of boxes, old tires & bike parts',
      afterText: 'Pristine, swept concrete ready for use',
      stat: 'Completed in 90 Mins',
      image: 'https://i.ibb.co/fzyyK1xn/image.jpg'
    }
  ];

  const filteredItems = activeTab === 'all' 
    ? galleryItems 
    : galleryItems.filter(item => item.category === activeTab);

  return (
    <section className="py-16 bg-cream border-t border-olive/10" id="gallery">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center space-x-2 bg-olive/10 border border-olive/20 rounded-full px-3 py-1.5 text-xs font-bold text-olive font-mono tracking-wide uppercase mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Before & After Transformations</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-ink tracking-tight">
            We Tow Away Cars & Heavy Machinery <br />
            <span className="font-serif italic font-normal text-olive">That Others Leave Behind</span>
          </h2>
          <p className="text-stone text-sm sm:text-base mt-3 leading-relaxed">
            From old non-running cars in overgrown fields to full barn, garage, and heavy machinery cleanouts across Ottawa. Check out our real customer project photos and transformations below.
          </p>

          {/* Filter Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {[
              { id: 'all', label: 'All Projects' },
              { id: 'vehicles', label: 'Cars & Heavy Machinery' },
              { id: 'garages', label: 'Garages & Workshops' },
              { id: 'barns', label: 'Barns & Yards' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-olive text-white shadow-sm'
                    : 'bg-white text-stone border border-stone/20 hover:border-olive/40'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredItems.map(item => (
            <div 
              key={item.id}
              className="bg-white rounded-3xl border border-stone/10 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div className="relative h-64 overflow-hidden bg-stone/10">
                <img 
                  src={item.image} 
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-olive text-white text-[11px] font-mono font-bold px-3 py-1 rounded-full shadow-md">
                    {item.badge}
                  </span>
                </div>
                <div className="absolute top-4 right-4">
                  <span className="bg-black/60 backdrop-blur-md text-white text-[11px] font-mono px-3 py-1 rounded-full flex items-center space-x-1">
                    <ShieldCheck className="h-3 w-3 text-olive" />
                    <span>{item.stat}</span>
                  </span>
                </div>
              </div>

              <div className="p-6 sm:p-8 space-y-4">
                <h3 className="font-display text-xl font-bold text-ink tracking-tight">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-stone leading-relaxed">
                  {item.description}
                </p>

                {/* Before / After comparison visual bars */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="bg-cream/70 border border-stone/15 rounded-2xl p-3.5 space-y-1">
                    <div className="text-[10px] font-mono uppercase font-bold text-red-600 flex items-center space-x-1">
                      <span>BEFORE</span>
                    </div>
                    <p className="text-xs font-medium text-ink">{item.beforeText}</p>
                  </div>
                  <div className="bg-olive/5 border border-olive/20 rounded-2xl p-3.5 space-y-1">
                    <div className="text-[10px] font-mono uppercase font-bold text-olive flex items-center space-x-1">
                      <span>AFTER (SCRAPPY CLEAN)</span>
                    </div>
                    <p className="text-xs font-medium text-ink">{item.afterText}</p>
                  </div>
                </div>
              </div>

              <div className="bg-stone/5 px-6 py-4 border-t border-stone/10 flex items-center justify-between">
                <span className="text-xs text-stone font-mono">Ottawa & Surrounding Townships</span>
                <button
                  onClick={() => setCurrentPage('book')}
                  className="inline-flex items-center space-x-1 text-xs font-bold text-olive hover:text-ink transition-colors cursor-pointer"
                >
                  <span>Book Similar Cleanup</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Callout Banner for Car & Heavy Machinery Towing */}
        <div className="mt-12 bg-olive text-white rounded-3xl p-8 sm:p-10 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent pointer-events-none"></div>
          <div className="space-y-3 relative z-10 max-w-2xl">
            <div className="inline-flex items-center space-x-2 bg-white/10 rounded-full px-3 py-1 text-xs font-mono font-bold text-cream uppercase">
              <Truck className="h-4 w-4" />
              <span>Specialized Fleet & Winch Service</span>
            </div>
            <h3 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
              Have an old car or unwanted heavy machinery?
            </h3>
            <p className="text-cream/90 text-sm leading-relaxed">
              We specialize in towing away scrap vehicles, dead farm equipment, trailers, and heavy machinery across Ottawa. No need to get it running—our winch truck and professional crew handle the heavy pulling.
            </p>
          </div>
          <button
            onClick={() => setCurrentPage('book')}
            className="relative z-10 px-8 py-4 bg-white text-ink hover:bg-cream font-sans font-bold rounded-full text-sm shadow-md transition-all hover:scale-105 active:scale-100 flex items-center space-x-2 shrink-0 cursor-pointer"
          >
            <span>Get Instant Tow Quote</span>
            <ArrowRight className="h-4 w-4 text-olive" />
          </button>
        </div>

      </div>
    </section>
  );
}

