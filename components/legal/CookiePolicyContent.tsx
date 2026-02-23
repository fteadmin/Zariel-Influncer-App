'use client';

import { Cookie, Settings, Eye, Target, BarChart, Shield } from 'lucide-react';

export default function CookiePolicyContent() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#6A7B92] to-[#5a6b82] py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-[#A7D129] rounded-2xl flex items-center justify-center">
              <Cookie className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-black text-white">Cookie Policy</h1>
              <p className="text-white/80 text-lg mt-2">Last updated: February 23, 2026</p>
            </div>
          </div>
          <p className="text-xl text-white/90 max-w-3xl">
            Learn about how we use cookies and similar technologies to improve your experience on Zariel & Co.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-16 max-w-5xl">
        
        {/* Quick Overview */}
        <div className="bg-gradient-to-br from-[#A7D129]/10 to-[#A7D129]/5 border-2 border-[#A7D129]/30 rounded-2xl p-8 mb-12">
          <h3 className="text-2xl font-black text-gray-900 mb-4">What Are Cookies?</h3>
          <p className="text-gray-700 leading-relaxed text-lg">
            Cookies are small text files placed on your device when you visit our website. They help us remember your preferences, keep you logged in, and understand how you use our platform to provide a better experience.
          </p>
        </div>

        <div className="space-y-12">
          <section className="border-l-4 border-[#A7D129] pl-6">
            <h2 className="text-3xl font-black text-gray-900 mb-6">Types of Cookies We Use</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white border-2 border-[#A7D129]/30 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-[#A7D129] rounded-xl flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-3">Essential Cookies</h3>
                <p className="text-sm text-gray-700 mb-3">
                  Required for the website to function properly. Cannot be disabled.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-[#A7D129] font-bold">•</span>
                    <span className="text-gray-700">Authentication & login sessions</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[#A7D129] font-bold">•</span>
                    <span className="text-gray-700">Security & fraud prevention</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[#A7D129] font-bold">•</span>
                    <span className="text-gray-700">Load balancing</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border-2 border-[#6A7B92]/30 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-[#6A7B92] rounded-xl flex items-center justify-center mb-4">
                  <Settings className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-3">Preference Cookies</h3>
                <p className="text-sm text-gray-700 mb-3">
                  Remember your settings and preferences for a personalized experience.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-[#6A7B92] font-bold">•</span>
                    <span className="text-gray-700">Language preferences</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[#6A7B92] font-bold">•</span>
                    <span className="text-gray-700">Display settings & themes</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[#6A7B92] font-bold">•</span>
                    <span className="text-gray-700">User interface preferences</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border-2 border-[#A7D129]/30 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-[#A7D129] rounded-xl flex items-center justify-center mb-4">
                  <BarChart className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-3">Analytics Cookies</h3>
                <p className="text-sm text-gray-700 mb-3">
                  Help us understand how visitors interact with our website.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-[#A7D129] font-bold">•</span>
                    <span className="text-gray-700">Page views & navigation paths</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[#A7D129] font-bold">•</span>
                    <span className="text-gray-700">Time spent on pages</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[#A7D129] font-bold">•</span>
                    <span className="text-gray-700">Error tracking & debugging</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border-2 border-[#6A7B92]/30 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-[#6A7B92] rounded-xl flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-3">Marketing Cookies</h3>
                <p className="text-sm text-gray-700 mb-3">
                  Used to deliver relevant advertisements and track campaign effectiveness.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-[#6A7B92] font-bold">•</span>
                    <span className="text-gray-700">Ad personalization</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[#6A7B92] font-bold">•</span>
                    <span className="text-gray-700">Campaign performance</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[#6A7B92] font-bold">•</span>
                    <span className="text-gray-700">Social media integration</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
