import { useState, FormEvent } from 'react';
import { Star, MessageSquare, Calendar, Sparkles, ShieldCheck, User } from 'lucide-react';
import { CustomerReview } from '../types';

interface ReviewsProps {
  reviews: CustomerReview[];
  onAddReview: (review: CustomerReview) => void;
}

export default function Reviews({ reviews, onAddReview }: ReviewsProps) {
  const [formData, setFormData] = useState({
    author: '',
    rating: 5,
    tag: 'General Hauling',
    text: '',
  });

  const [formSuccess, setFormSuccess] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.author || !formData.text) {
      alert('Please fill out your name and review comments.');
      return;
    }

    const newReview: CustomerReview = {
      id: `rev-${Date.now()}`,
      author: formData.author,
      rating: formData.rating,
      text: formData.text,
      date: new Date().toISOString().split('T')[0],
      tag: formData.tag,
    };

    onAddReview(newReview);
    setFormData({
      author: '',
      rating: 5,
      tag: 'General Hauling',
      text: '',
    });
    setFormSuccess(true);
    setTimeout(() => setFormSuccess(false), 3000);
  };

  return (
    <div className="bg-cream text-ink min-h-screen pb-24 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        
        {/* Section Header */}
        <div className="border-b border-stone/10 pb-8 mb-10 text-center md:text-left">
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-ink tracking-tight">
            Customer Feedback Board
          </h2>
          <p className="text-stone mt-2 text-sm sm:text-base max-w-xl">
            Read real feedback from residential homeowners in the Greater Ottawa area, and submit your own experience with Pat & the crew.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Reviews Feed (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="font-sans font-bold text-lg text-ink mb-4">Latest Local Reviews</h3>
            
            {reviews.map((rev) => (
              <div 
                key={rev.id} 
                className="bg-white border border-stone/10 rounded-3xl p-6 shadow-sm relative overflow-hidden"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-sans font-bold text-base text-ink">{rev.author}</h4>
                    <span className="text-[10px] text-stone font-mono block">Verified Client • {rev.date}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        className={`h-4 w-4 ${
                          star <= rev.rating 
                            ? 'fill-olive text-olive' 
                            : 'text-stone/20'
                        }`} 
                      />
                    ))}
                  </div>
                </div>

                <p className="text-stone text-sm leading-relaxed mb-4">"{rev.text}"</p>

                <div className="flex justify-between items-center border-t border-stone/10 pt-3 text-[11px]">
                  <span className="font-mono text-olive bg-olive/10 border border-olive/20 px-2 py-0.5 rounded-md">
                    {rev.tag}
                  </span>
                  <span className="text-stone flex items-center space-x-1 font-mono">
                    <ShieldCheck className="h-3.5 w-3.5 text-olive" />
                    <span>Recycling Cleared</span>
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT: Submit Review Module (5 cols) */}
          <div className="lg:col-span-5 sticky top-20">
            <div className="bg-white border border-stone/10 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="font-sans font-bold text-lg text-ink border-b border-stone/10 pb-3 flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-olive" />
                <span>Write a Review</span>
              </h3>

              {formSuccess && (
                <div className="bg-olive/10 border border-olive/20 text-olive text-xs p-3.5 rounded-xl font-mono flex items-center space-x-2 animate-bounce">
                  <Sparkles className="h-4 w-4" />
                  <span>Review added successfully! Thank you for the scrap-love!</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Reviewer Author Name */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-stone uppercase tracking-wider font-mono">Your Name *</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3.5 h-4 w-4 text-stone" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Jenna Thompson"
                      value={formData.author}
                      onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                      className="w-full bg-cream border border-stone/20 rounded-2xl pl-11 pr-4 py-2.5 text-sm text-ink focus:outline-none focus:border-olive transition-colors"
                    />
                  </div>
                </div>

                {/* Rating selection stars */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-stone uppercase tracking-wider font-mono">Rating *</label>
                  <div className="flex items-center space-x-2 bg-cream border border-stone/20 p-2.5 rounded-2xl">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                        className="hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Star 
                          className={`h-6 w-6 ${
                            star <= formData.rating 
                              ? 'fill-olive text-olive' 
                              : 'text-stone/20'
                          }`} 
                        />
                      </button>
                    ))}
                    <span className="text-xs font-semibold font-mono text-stone ml-2">
                      {formData.rating} of 5 Stars
                    </span>
                  </div>
                </div>

                {/* Tag/Category of pickup */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-stone uppercase tracking-wider font-mono">Type of Hauling Pickup *</label>
                  <select
                    value={formData.tag}
                    onChange={(e) => setFormData(prev => ({ ...prev, tag: e.target.value }))}
                    className="w-full bg-cream border border-stone/20 rounded-2xl px-4 py-2.5 text-sm text-ink focus:outline-none focus:border-olive transition-colors"
                  >
                    <option value="Garage Cleanout">Garage Cleanout</option>
                    <option value="Sofa Removal">Sofa Removal</option>
                    <option value="Appliance Recycling">Appliance Recycling</option>
                    <option value="Yard Waste Clearance">Yard Waste Clearance</option>
                    <option value="Construction Rubble Haul">Construction Rubble Haul</option>
                    <option value="Household Sorting">Household Sorting</option>
                  </select>
                </div>

                {/* Review Text Body */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-stone uppercase tracking-wider font-mono">Review Comments *</label>
                  <textarea
                    required
                    placeholder="Tell other Ottawa folks how Pat & crew did..."
                    rows={4}
                    value={formData.text}
                    onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))}
                    className="w-full bg-cream border border-stone/20 rounded-2xl px-4 py-2.5 text-xs text-ink focus:outline-none focus:border-olive transition-colors"
                  ></textarea>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="w-full bg-olive hover:bg-olive/90 text-white font-sans font-bold py-3.5 px-6 rounded-full text-sm transition-all duration-200 cursor-pointer hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center space-x-1.5 shadow-sm"
                >
                  <Sparkles className="h-4.5 w-4.5" />
                  <span>Submit Review</span>
                </button>
              </form>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
