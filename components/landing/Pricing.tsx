'use client';

import { Button } from '@/components/ui/button';
import { CheckCircle2, Star, Rocket } from 'lucide-react';
import Link from 'next/link';

export function Pricing() {
  return (
    <section className="py-24 px-6 bg-white relative" id="pricing">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg sm:text-xl text-gray-600">Start free, upgrade as you grow</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
          {/* Free Plan */}
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-6 sm:p-8 border-2 border-gray-200 hover:border-gray-300 transition-colors duration-200">
            <div className="mb-6">
              <h3 className="text-2xl font-black text-gray-900 mb-2">Starter</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-black text-gray-900">Free</span>
                <span className="text-gray-600 font-semibold">forever</span>
              </div>
            </div>

            <ul className="space-y-4 mb-8">
              {[
                'List up to 5 services',
                'Access full marketplace',
                'Basic profile & portfolio',
                'Community forums',
                'Zaryo token payments',
                '15% platform fee'
              ].map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#A7D129] flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 font-medium">{feature}</span>
                </li>
              ))}
            </ul>

            <Link href="/auth/signup">
              <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-6 rounded-2xl text-lg transition-colors duration-200">
                Get Started Free
              </Button>
            </Link>
          </div>

          {/* Pro Plan */}
          <div className="relative bg-gradient-to-br from-[#A7D129] to-[#95c51f] rounded-3xl p-6 sm:p-8 border-2 border-[#A7D129] shadow-xl">
            {/* Popular Badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <div className="bg-white text-[#A7D129] px-6 py-2 rounded-full font-black text-sm shadow-lg flex items-center gap-2">
                <Star className="w-4 h-4 fill-current" />
                MOST POPULAR
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-2xl font-black text-white mb-2">Pro Creator</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-black text-white">$9.99</span>
                <span className="text-white/80 font-semibold">/month</span>
              </div>
            </div>

            <ul className="space-y-4 mb-8">
              {[
                'Unlimited service listings',
                'Featured profile placement',
                'Priority in search results',
                'Advanced analytics',
                'Lower fees (10%)',
                'Priority bidding',
                'Custom portfolio themes'
              ].map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                  <span className="text-white font-medium">{feature}</span>
                </li>
              ))}
            </ul>

            <Link href="/auth/signup">
              <Button className="w-full bg-white hover:bg-gray-100 text-[#A7D129] font-black py-6 rounded-2xl text-lg shadow-lg transition-colors duration-200">
                Start Pro Trial
                <Rocket className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
