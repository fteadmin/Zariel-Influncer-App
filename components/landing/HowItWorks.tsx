'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Check, Sparkles } from 'lucide-react';
import Link from 'next/link';

const creatorSteps = [
  {
    number: '01',
    icon: '📝',
    title: 'List Your Services',
    description: 'Create your profile and showcase what you do best',
    benefits: ['Portfolio builder', 'Instant verification', 'SEO optimized'],
    color: 'from-blue-500 to-cyan-500'
  },
  {
    number: '02',
    icon: '💰',
    title: 'Get Offers',
    description: 'Brands bid on your services - you pick the best deal',
    benefits: ['Real-time bidding', 'Smart matching', 'Price transparency'],
    color: 'from-purple-500 to-pink-500'
  },
  {
    number: '03',
    icon: '🎯',
    title: 'Deliver & Earn',
    description: 'Complete work, get paid instantly in Zaryo tokens',
    benefits: ['Instant payouts', 'Secure escrow', 'Build reputation'],
    color: 'from-green-500 to-emerald-500'
  }
];

const brandSteps = [
  {
    number: '01',
    icon: '🔍',
    title: 'Find Creators',
    description: 'Browse thousands of verified content creators',
    benefits: ['Advanced filters', 'Verified profiles', 'Portfolio reviews'],
    color: 'from-orange-500 to-red-500'
  },
  {
    number: '02',
    icon: '🤝',
    title: 'Place Bids',
    description: 'Make competitive offers on creator services',
    benefits: ['Flexible pricing', 'Negotiate terms', 'Quick responses'],
    color: 'from-indigo-500 to-purple-500'
  },
  {
    number: '03',
    icon: '📊',
    title: 'Track Results',
    description: 'Monitor campaigns and measure ROI in real-time',
    benefits: ['Analytics dashboard', 'Performance metrics', 'ROI tracking'],
    color: 'from-teal-500 to-green-500'
  }
];

export function HowItWorks() {
  const [activeTab, setActiveTab] = useState<'creators' | 'brands'>('creators');

  const currentSteps = activeTab === 'creators' ? creatorSteps : brandSteps;

  return (
    <section className="py-32 px-6 relative overflow-hidden" id="how-it-works">
      {/* Lightweight static background */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50 via-white to-gray-50">
        {/* Static gradient orbs - no animation */}
        <div className="absolute top-20 -left-40 w-80 h-80 bg-gradient-to-br from-[#A7D129]/20 to-[#95c51f]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 -right-40 w-96 h-96 bg-gradient-to-br from-[#6A7B92]/15 to-[#5a6a7e]/5 rounded-full blur-3xl" />

        {/* Simple grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="h-full w-full" style={{
            backgroundImage: `
              linear-gradient(to right, #6A7B92 1px, transparent 1px),
              linear-gradient(to bottom, #6A7B92 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px'
          }} />
        </div>
      </div>

      <div className="container mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-gray-200 px-5 py-2.5 rounded-full mb-6 shadow-sm">
            <Sparkles className="w-4 h-4 text-[#A7D129]" />
            <span className="text-sm font-bold text-gray-700">3-Step Process</span>
          </div>
          
          <h2 className="text-5xl sm:text-6xl font-black text-gray-900 mb-6">
            How <span className="bg-gradient-to-r from-[#A7D129] to-[#6A7B92] bg-clip-text text-transparent">Zariel & Co</span> Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Simple, transparent, and built for your success. Get started in minutes.
          </p>
        </motion.div>

        {/* Enhanced Tabs */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="flex justify-center mb-20"
        >
          <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl p-2 gap-2 shadow-2xl border border-gray-200">
            {/* Animated Background Slider */}
            <motion.div
              className={`absolute top-2 h-[calc(100%-1rem)] rounded-2xl ${
                activeTab === 'creators' 
                  ? 'bg-gradient-to-r from-[#A7D129] to-[#95c51f]' 
                  : 'bg-gradient-to-r from-[#6A7B92] to-[#5a6a7e]'
              }`}
              initial={false}
              animate={{
                left: activeTab === 'creators' ? '0.5rem' : '50%',
                width: activeTab === 'creators' ? 'calc(50% - 0.75rem)' : 'calc(50% - 0.75rem)'
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
            
            <div className="relative flex gap-2">
              <button
                onClick={() => setActiveTab('creators')}
                className={`relative px-10 py-5 rounded-2xl font-bold text-lg transition-all ${
                  activeTab === 'creators'
                    ? 'text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="flex items-center gap-3">
                  <span className="text-2xl">👤</span>
                  <span>For Creators</span>
                </span>
              </button>
              <button
                onClick={() => setActiveTab('brands')}
                className={`relative px-10 py-5 rounded-2xl font-bold text-lg transition-all ${
                  activeTab === 'brands'
                    ? 'text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="flex items-center gap-3">
                  <span className="text-2xl">🏢</span>
                  <span>For Brands</span>
                </span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Steps - Clean Card Layout */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto"
          >
            {currentSteps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="relative group"
              >
                {/* Connecting Arrow - Desktop Only */}
                {idx < 2 && (
                  <div className="hidden lg:block absolute top-16 -right-4 z-20">
                    <ArrowRight className="w-8 h-8 text-[#A7D129] opacity-30" strokeWidth={3} />
                  </div>
                )}

                <div className="relative h-full bg-white/90 backdrop-blur-sm rounded-3xl overflow-hidden border-2 border-gray-200 hover:border-[#A7D129] shadow-lg hover:shadow-xl transition-all">
                  {/* Top accent bar */}
                  <div className={`h-2 bg-gradient-to-r ${step.color}`} />

                  {/* Content */}
                  <div className="p-8">
                    {/* Step number + Icon */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="text-6xl">{step.icon}</div>
                      <div className={`bg-gradient-to-br ${step.color} bg-clip-text text-transparent text-4xl font-black`}>
                        {step.number}
                      </div>
                    </div>

                    <h3 className="text-2xl font-black text-gray-900 mb-3 group-hover:text-[#A7D129] transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed mb-6">
                      {step.description}
                    </p>

                    {/* Benefits List */}
                    <div className="space-y-3">
                      {step.benefits.map((benefit, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3"
                        >
                          <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${step.color} flex items-center justify-center flex-shrink-0 shadow-md`}>
                            <Check className="w-4 h-4 text-white" strokeWidth={3} />
                          </div>
                          <span className="text-sm font-semibold text-gray-700">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-20"
        >

            <Link href="/auth/signup">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button className="relative group bg-gradient-to-r from-[#A7D129] via-[#95c51f] to-[#A7D129] hover:from-[#95c51f] hover:via-[#A7D129] hover:to-[#95c51f] text-white font-bold px-12 py-7 rounded-2xl text-xl shadow-2xl overflow-hidden">
                  <span className="relative z-10 flex items-center gap-3">
                    {activeTab === 'creators' ? 'Start as a Creator' : 'Post Your First Gig'}
                    <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Button>
              </motion.div>
            </Link>          <p className="mt-6 text-gray-500 font-semibold">
            ✨ No credit card required • Get started in 60 seconds
          </p>
        </motion.div>
      </div>
    </section>
  );
}