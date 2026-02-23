'use client';

import { FileText, AlertTriangle, CheckCircle, XCircle, Scale, Coins, Shield, Users, Target, ArrowRight } from 'lucide-react';

export default function TermsOfServiceContent() {
  return (
    <div className="min-h-screen bg-white">
      
      {/* Hero Section with Image Background */}
      <div className="relative min-h-[500px] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1920&h=1080&fit=crop"
            alt="Legal agreement"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#6A7B92]/95 via-[#6A7B92]/90 to-[#6A7B92]/70" />
        </div>

        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-[#A7D129]/20 border border-[#A7D129]/40 px-4 py-2 rounded-full mb-6 backdrop-blur-sm">
              <FileText className="h-4 w-4 text-[#A7D129]" />
              <span className="text-sm font-bold text-white uppercase tracking-wider">Legal · Terms</span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight">
              Terms of Service
            </h1>
            <p className="text-xl sm:text-2xl text-white/90 leading-relaxed font-medium mb-4">
              By using Zariel & Co, you agree to these terms. Please read them carefully.
            </p>
            <p className="text-white/70 text-sm font-semibold">Last updated: February 23, 2026</p>
          </div>
        </div>
      </div>

      {/* Important Notice */}
      <div className="bg-amber-50 border-b-4 border-amber-400 py-12">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="flex items-start gap-6 max-w-4xl mx-auto">
            <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="h-8 w-8 text-amber-600" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-amber-900 mb-3">Important Legal Agreement</h3>
              <p className="text-lg text-amber-800 leading-relaxed">
                These Terms of Service constitute a legally binding agreement between you and Zariel & Co (a division of Future Trends Enterprise Inc.). By accessing or using our platform, you accept and agree to be bound by these terms.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-20 max-w-7xl">
        
        {/* About Our Service */}
        <section className="mb-24">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-gray-900 mb-4">About Our Service</h2>
            <div className="h-1 w-24 bg-[#A7D129] mx-auto mb-6" />
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Zariel & Co is a comprehensive marketplace connecting content creators with brands
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl group">
              <div className="absolute inset-0">
                <img
                  src="https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&h=800&fit=crop"
                  alt="For creators"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#A7D129]/95 via-[#A7D129]/80 to-[#A7D129]/60" />
              </div>
              <div className="relative z-10 p-10 min-h-[400px] flex flex-col justify-end">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6">
                  <Users className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-3xl font-black mb-4 text-white">For Creators</h3>
                <ul className="space-y-2 text-white/95">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                    <span>Content monetization tools</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                    <span>Service booking system</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                    <span>Token-based transactions</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                    <span>Brand partnership opportunities</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="relative rounded-2xl overflow-hidden shadow-2xl group">
              <div className="absolute inset-0">
                <img
                  src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=800&fit=crop"
                  alt="For brands"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#6A7B92]/95 via-[#6A7B92]/80 to-[#6A7B92]/60" />
              </div>
              <div className="relative z-10 p-10 min-h-[400px] flex flex-col justify-end">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6">
                  <Target className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-3xl font-black mb-4 text-white">For Brands</h3>
                <ul className="space-y-2 text-white/95">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                    <span>Creator discovery and vetting</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                    <span>Content marketplace access</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                    <span>Campaign management tools</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                    <span>Secure payment processing</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Account Requirements */}
        <section className="mb-24 bg-gray-50 -mx-4 px-4 py-20 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 rounded-3xl">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl font-black text-gray-900 mb-6">Account Requirements</h2>
            <div className="h-1 w-24 bg-[#A7D129] mb-8" />
            <p className="text-lg text-gray-700 leading-relaxed mb-10">
              To use our platform, you must create an account and agree to the following:
            </p>
            
            <div className="grid md:grid-cols-2 gap-5">
              {[
                { num: '1', title: 'Age Requirement', desc: 'You must be at least 18 years old or have parental/guardian consent' },
                { num: '2', title: 'Accurate Information', desc: 'Provide truthful and complete registration information' },
                { num: '3', title: 'Account Security', desc: 'Maintain the confidentiality of your login credentials' },
                { num: '4', title: 'Personal Responsibility', desc: 'You are responsible for all activities under your account' },
                { num: '5', title: 'Single Account', desc: 'One person or entity per account; no account sharing' },
                { num: '6', title: 'Compliance', desc: 'Follow all applicable laws and platform policies' }
              ].map((item) => (
                <div key={item.num} className="flex items-start gap-4 p-6 bg-white rounded-xl border-2 border-gray-100 hover:border-[#A7D129] hover:shadow-lg transition-all">
                  <div className="w-10 h-10 bg-[#A7D129] rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-black">{item.num}</span>
                  </div>
                  <div>
                    <h4 className="font-black text-gray-900 mb-1 text-lg">{item.title}</h4>
                    <p className="text-sm text-gray-600">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Prohibited Conduct */}
        <section className="mb-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1505664194779-8beaceb93744?w=800&h=1000&fit=crop"
                  alt="Security and compliance"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <h2 className="text-4xl font-black text-gray-900 mb-6">Prohibited Conduct</h2>
              <div className="h-1 w-24 bg-[#A7D129] mb-8" />
              
              <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-6 mb-8">
                <div className="flex items-start gap-3">
                  <XCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-black text-red-900 mb-2">Violations Result in Account Termination</h4>
                    <p className="text-sm text-red-800">The following activities are strictly prohibited</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  'Posting illegal or harmful content',
                  'Infringing on intellectual property rights',
                  'Harassment, abuse, or hate speech',
                  'Fraudulent transactions or scams',
                  'Spamming or unauthorized marketing',
                  'Hacking or security breaches'
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Zaryo Token System */}
        <section className="mb-24">
          <div className="relative rounded-3xl overflow-hidden">
            <div className="absolute inset-0">
              <img
                src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1920&h=1080&fit=crop"
                alt="Digital currency"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#A7D129]/95 via-[#A7D129]/90 to-[#A7D129]/80" />
            </div>

            <div className="relative z-10 py-20 px-8">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <Coins className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-4xl font-black text-white">Zaryo Token System</h2>
                    <p className="text-white/90 text-lg mt-1">Our platform's virtual currency</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mt-12">
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
                    <h4 className="font-black text-white mb-2 text-lg">No Cash Value</h4>
                    <p className="text-sm text-white/90">Tokens are virtual currency with no real-world monetary value</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
                    <h4 className="font-black text-white mb-2 text-lg">Non-Refundable</h4>
                    <p className="text-sm text-white/90">All token purchases are final except as required by law</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
                    <h4 className="font-black text-white mb-2 text-lg">Platform Use Only</h4>
                    <p className="text-sm text-white/90">Tokens can only be used within Zariel & Co platform</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Content Ownership */}
        <section className="mb-24 bg-gray-50 -mx-4 px-4 py-20 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 rounded-3xl">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-black text-gray-900 mb-4">Content Ownership & Licensing</h2>
              <div className="h-1 w-24 bg-[#A7D129] mx-auto mb-6" />
              <p className="text-xl text-gray-600">Understanding content rights for creators and brands</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl overflow-hidden shadow-lg border-2 border-gray-100">
                <div className="h-48 bg-gradient-to-br from-[#A7D129] to-[#8fb622] p-8 flex items-center justify-center">
                  <Shield className="h-20 w-20 text-white" />
                </div>
                <div className="p-8">
                  <h4 className="font-black text-gray-900 mb-4 text-2xl">You Keep Ownership</h4>
                  <p className="text-gray-700 mb-6">You retain all ownership rights to content you upload</p>
                  <div className="space-y-3">
                    {[
                      'Your content remains yours',
                      'You control licensing terms',
                      'You can remove content anytime'
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-[#A7D129] flex-shrink-0" />
                        <span className="text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl overflow-hidden shadow-lg border-2 border-gray-100">
                <div className="h-48 bg-gradient-to-br from-[#6A7B92] to-[#5a6b82] p-8 flex items-center justify-center">
                  <FileText className="h-20 w-20 text-white" />
                </div>
                <div className="p-8">
                  <h4 className="font-black text-gray-900 mb-4 text-2xl">Platform License</h4>
                  <p className="text-gray-700 mb-6">You grant us a license to display and distribute your content</p>
                  <div className="space-y-3">
                    {[
                      'Make content available to users',
                      'Use for promotional purposes',
                      'Enable platform functionality'
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-[#6A7B92] flex-shrink-0" />
                        <span className="text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Legal Disclaimer */}
        <section className="bg-gray-900 rounded-3xl overflow-hidden relative">
          <div className="absolute inset-0 opacity-5">
            <img
              src="https://images.unsplash.com/photo-1589391886645-d51941baf7fb?w=1920&h=1080&fit=crop"
              alt="Legal"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="relative z-10 py-16 px-8">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-4 mb-8">
                <Scale className="h-12 w-12 text-[#A7D129]" />
                <h2 className="text-3xl font-black text-white">Limitation of Liability</h2>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
                <p className="text-white/90 leading-relaxed mb-4 text-lg">
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, ZARIEL & CO AND FUTURE TRENDS ENTERPRISE INC. SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES.
                </p>
                <p className="text-white/70 leading-relaxed">
                  The platform is provided "AS IS" without warranties of any kind. We do not guarantee uninterrupted, secure, or error-free service.
                </p>
              </div>

              <div className="mt-12 text-center">
                <h3 className="text-xl font-black text-white mb-4">Questions About These Terms?</h3>
                <a
                  href="mailto:legal@zariel.co"
                  className="inline-flex items-center gap-2 bg-[#A7D129] hover:bg-[#bde83a] text-gray-900 font-black px-8 py-4 rounded-xl text-lg transition-all hover:scale-105 shadow-lg shadow-[#A7D129]/30"
                >
                  Contact Legal Team
                  <ArrowRight className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}