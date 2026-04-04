'use client';

import { Sparkles, Star } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';

export function Hero() {
  const { user, profile, loading } = useAuth();
  const isLoggedIn = !loading && !!user && !!profile;

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

          {/* Left Content */}
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


            {/* App Store Buttons — only for logged-out visitors */}
            {!isLoggedIn && (
              <div
                className="flex items-center gap-4 flex-wrap animate-fade-in"
                style={{ animationDelay: '0.35s' }}
              >
                <a
                  href="#"
                  aria-label="Download Zariel & Co on the Apple App Store"
                  className="flex items-center gap-3 bg-black hover:bg-gray-900 text-white px-5 py-3 rounded-xl transition-all hover:scale-105 shadow-lg"
                >
                  <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white flex-shrink-0" aria-hidden="true">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                  </svg>
                  <div className="text-left">
                    <p className="text-[10px] leading-none text-gray-400">Download on the</p>
                    <p className="text-sm font-bold leading-tight">App Store</p>
                  </div>
                </a>

                <a
                  href="#"
                  aria-label="Get Zariel & Co on Google Play"
                  className="flex items-center gap-3 bg-black hover:bg-gray-900 text-white px-5 py-3 rounded-xl transition-all hover:scale-105 shadow-lg"
                >
                  <svg viewBox="0 0 24 24" className="w-6 h-6 flex-shrink-0" aria-hidden="true">
                    <path fill="#EA4335" d="M1.22 0C.92.3.75.8.75 1.43v21.14c0 .63.17 1.13.47 1.43l.07.07L12.9 12.9v-.3L1.3-.07z" />
                    <path fill="#FBBC04" d="M16.85 17.02l-3.95-3.96v-.3l3.95-3.96.09.05 4.68 2.66c1.34.76 1.34 2 0 2.77l-4.68 2.66z" />
                    <path fill="#34A853" d="M16.94 16.97L12.9 12.9 1.22 24.58c.44.47 1.17.52 2 .06z" />
                    <path fill="#4285F4" d="M16.94 7.03L2.22-.58c-.83-.46-1.56-.41-2 .06L12.9 11.1z" />
                  </svg>
                  <div className="text-left">
                    <p className="text-[10px] leading-none text-gray-400">Get it on</p>
                    <p className="text-sm font-bold leading-tight">Google Play</p>
                  </div>
                </a>
              </div>
            )}

            {/* Trust Indicators */}
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

          {/* Right Visual — hand holding phone mockup, desktop only */}
          <div className="relative lg:flex hidden items-center justify-center min-h-[750px]">
            {/* Glow */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[480px] h-[480px] bg-[#A7D129]/15 blur-3xl rounded-full" />
            </div>

            <div
              className="relative z-10 animate-fade-in"
              style={{
                animationDelay: '0.3s',
                filter: 'drop-shadow(0 40px 80px rgba(0,0,0,0.2))',
              }}
            >
              <Image
                src="/assets/mockups/hands.png"
                alt="Hand holding a phone displaying the Zariel & Co Creator Marketplace app"
                width={520}
                height={700}
                className="w-[520px] h-auto object-contain"
                priority
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
