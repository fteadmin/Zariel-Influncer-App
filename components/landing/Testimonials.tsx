'use client';

import { Star, TrendingUp } from 'lucide-react';

const testimonials = [
  {
    name: 'Jessica Martinez',
    role: 'Lifestyle Influencer',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
    content: "Zariel & Co changed everything for me. I've tripled my income in just 3 months!",
    rating: 5,
    earnings: '$12,450'
  },
  {
    name: 'Marcus Chen',
    role: 'Tech Reviewer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
    content: 'The bidding system means I always get fair rates. No more underpricing my work.',
    rating: 5,
    earnings: '$18,200'
  },
  {
    name: 'Aisha Patel',
    role: 'Fashion Creator',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
    content: 'Best platform for authentic brand partnerships. The community is incredibly supportive!',
    rating: 5,
    earnings: '$9,800'
  }
];

export function Testimonials() {
  return (
    <section className="py-24 px-6 bg-gradient-to-b from-[#6A7B92]/10 to-[#6A7B92]/5 relative" id="testimonials">
      <div className="container mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 mb-4">
            Success Stories
          </h2>
          <p className="text-lg sm:text-xl text-gray-600">Real creators, real results</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 hover:border-[#A7D129] hover:shadow-lg transition-shadow duration-200 group"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <img 
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover ring-4 ring-gray-100"
                    loading="lazy"
                  />
                  <div>
                    <h4 className="font-bold text-gray-900 text-base sm:text-lg">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
              </div>

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-gray-700 leading-relaxed mb-6 italic">"{testimonial.content}"</p>

              {/* Earnings Badge */}
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 px-4 py-2 rounded-xl">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="font-bold text-green-700">{testimonial.earnings} earned</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
