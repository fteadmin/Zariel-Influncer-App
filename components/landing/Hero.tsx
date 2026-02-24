'use client';

import { Button } from '@/components/ui/button';
import { Sparkles, Search, ArrowRight, Star, DollarSign, Target } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export function Hero() {
  return (
    <section className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden bg-white">
      {/* Static decorative lines */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.07]" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" aria-hidden="true">
        <path d="M 0 300 Q 400 100 800 300 T 1600 300" stroke="url(#gradient1)" strokeWidth="2" fill="none" />
        <path d="M 0 500 Q 400 700 800 500 T 1600 500" stroke="url(#gradient2)" strokeWidth="2" fill="none" />
        <path d="M 200 0 Q 400 400 200 800" stroke="url(#gradient3)" strokeWidth="2" fill="none" />
        <defs>
          <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#A7D129" />
            <stop offset="100%" stopColor="#6A7B92" />
          </linearGradient>
          <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6A7B92" />
            <stop offset="100%" stopColor="#A7D129" />
          </linearGradient>
          <linearGradient id="gradient3" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#A7D129" />
            <stop offset="100%" stopColor="#6A7B92" />
          </linearGradient>
        </defs>
      </svg>
      <div className="container mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content — CSS animations instead of framer-motion for faster LCP */}
          <div className="space-y-8 z-10 relative">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#A7D129]/10 to-[#6A7B92]/10 border border-[#A7D129]/30 px-5 py-2.5 rounded-full animate-fade-in">
              <Sparkles className="w-4 h-4 text-[#A7D129]" />
              <span className="text-sm font-bold text-gray-700">50,000+ creators earning daily</span>
            </div>

            <h1
              className="text-5xl sm:text-6xl lg:text-7xl font-black text-gray-900 leading-tight animate-fade-in"
              style={{ animationDelay: '0.1s' }}
            >
              Turn Your Content Into
              <span className="block mt-2 bg-gradient-to-r from-[#A7D129] via-[#6A7B92] to-[#A7D129] bg-clip-text text-transparent">
                Cash Flow
              </span>
            </h1>

            <p
              className="text-xl text-gray-600 leading-relaxed max-w-xl animate-fade-in"
              style={{ animationDelay: '0.2s' }}
            >
              Join the marketplace where creators meet brands. List your services, get competitive bids, and build your creative empire—all in one place.
            </p>

            {/* Search Box */}
            <div
              className="bg-white rounded-2xl shadow-2xl p-3 border border-gray-200 max-w-2xl animate-fade-in"
              style={{ animationDelay: '0.3s' }}
            >
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="What service can you offer?"
                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 focus:border-[#A7D129] focus:ring-2 focus:ring-[#A7D129]/20 outline-none text-gray-700 font-medium"
                  />
                </div>
                <Link href="/auth/signup">
                  <Button className="bg-gradient-to-r from-[#A7D129] to-[#95c51f] hover:from-[#95c51f] hover:to-[#A7D129] text-white font-bold px-8 py-4 rounded-xl h-auto text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 whitespace-nowrap">
                    Start Earning
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Trust Indicators — use properly sized images */}
            <div
              className="flex items-center gap-6 flex-wrap animate-fade-in"
              style={{ animationDelay: '0.4s' }}
            >
              <div className="flex -space-x-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="w-12 h-12 rounded-full border-4 border-white shadow-md overflow-hidden bg-gray-200">
                    <Image
                      src={`https://i.pravatar.cc/96?img=${i}`}
                      alt="Creator"
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
              <div>
                <div className="flex gap-1 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-gray-600 font-semibold">Rated 4.9/5 by 10,000+ creators</p>
              </div>
            </div>
          </div>

          {/* Right Visual — desktop only, lazy loaded */}
          <div className="relative lg:block hidden">
            <div className="relative z-10 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              {/* Main Image */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-500">
                <Image
                  src="https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=800&h=1000&fit=crop"
                  alt="Creator working on content"
                  width={800}
                  height={1000}
                  className="w-full h-[600px] object-cover"
                  loading="lazy"
                  sizes="(max-width: 1024px) 0px, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </div>

              {/* Stat Cards */}
              <div
                className="absolute -left-8 top-20 bg-white rounded-2xl p-4 shadow-2xl border border-gray-100 animate-slide-in-left"
                style={{ animationDelay: '0.5s' }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-gray-900">$2,450</p>
                    <p className="text-xs text-gray-500 font-semibold">Earned this week</p>
                  </div>
                </div>
              </div>

              <div
                className="absolute -right-8 bottom-32 bg-white rounded-2xl p-4 shadow-2xl border border-gray-100 animate-slide-in-right"
                style={{ animationDelay: '0.6s' }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-gray-900">24</p>
                    <p className="text-xs text-gray-500 font-semibold">New offers today</p>
                  </div>
                </div>
              </div>

              <div
                className="absolute -left-12 bottom-20 bg-white rounded-2xl p-3 shadow-2xl border border-gray-100 animate-slide-up"
                style={{ animationDelay: '0.7s' }}
              >
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-gray-200">
                        <Image
                          src={`https://i.pravatar.cc/64?img=${i + 10}`}
                          alt=""
                          width={32}
                          height={32}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-sm font-bold text-gray-700">+127 joined today</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
