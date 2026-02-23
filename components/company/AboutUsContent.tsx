'use client';

import { Rocket, Users, Target, Zap, Globe, TrendingUp, Award, Heart, CheckCircle, ArrowRight } from 'lucide-react';
import Image from 'next/image';

export default function AboutUsContent() {
  return (
    <div className="min-h-screen bg-white">
      
      {/* Hero Section with Image */}
      <div className="relative min-h-[600px] flex items-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&h=1080&fit=crop"
            alt="Team collaboration"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#6A7B92]/95 via-[#6A7B92]/85 to-transparent" />
        </div>

        {/* Content */}
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-[#A7D129]/20 border border-[#A7D129]/40 px-4 py-2 rounded-full mb-6 backdrop-blur-sm">
              <Rocket className="h-4 w-4 text-[#A7D129]" />
              <span className="text-sm font-bold text-white uppercase tracking-wider">About Zariel</span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight">
              Empowering the Next Generation of Creators
            </h1>
            <p className="text-xl sm:text-2xl text-white/90 leading-relaxed font-medium">
              We're building the world's most transparent marketplace where creators and brands connect, collaborate, and thrive together.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-[#A7D129] py-16">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-5xl font-black text-gray-900 mb-2">10K+</div>
              <div className="text-gray-800 font-semibold uppercase tracking-wide text-sm">Active Creators</div>
            </div>
            <div>
              <div className="text-5xl font-black text-gray-900 mb-2">500+</div>
              <div className="text-gray-800 font-semibold uppercase tracking-wide text-sm">Brand Partners</div>
            </div>
            <div>
              <div className="text-5xl font-black text-gray-900 mb-2">$5M+</div>
              <div className="text-gray-800 font-semibold uppercase tracking-wide text-sm">Creator Earnings</div>
            </div>
            <div>
              <div className="text-5xl font-black text-gray-900 mb-2">50K+</div>
              <div className="text-gray-800 font-semibold uppercase tracking-wide text-sm">Transactions</div>
            </div>
          </div>
        </div>
      </div>

      {/* Our Story Section with Split Layout */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black text-gray-900 mb-4">Our Story</h2>
            <div className="h-1 w-24 bg-[#A7D129] mx-auto" />
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <p className="text-lg text-gray-700 leading-relaxed">
                Founded in 2024 as a division of <strong className="text-[#6A7B92]">Future Trends Enterprise Inc.</strong>, Zariel & Co was born from a simple observation: the creator economy was broken.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Creators struggled to monetize their content fairly. Brands couldn't find authentic voices. The connection between talent and opportunity was inefficient and opaque.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                We set out to change that by building a platform where creators are empowered, brands find genuine partnerships, and transactions are transparent, fair, and seamless.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Learn more about Zariel & Co and the vision behind it at{' '}
                <a
                  href="https://www.zaniyazariel.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-[#6A7B92] hover:text-[#A7D129] underline decoration-[#A7D129]/60 decoration-2 underline-offset-4 transition-colors"
                >
                  zaniyazariel.com
                </a>
                .
              </p>

              {/* Key highlights */}
              <div className="pt-6 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#A7D129] rounded-xl flex items-center justify-center flex-shrink-0">
                    <Award className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-black text-gray-900 text-lg mb-1">Innovation First</h4>
                    <p className="text-gray-600">Pioneering the token-based creator economy</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#6A7B92] rounded-xl flex items-center justify-center flex-shrink-0">
                    <Heart className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-black text-gray-900 text-lg mb-1">Creator-Centric</h4>
                    <p className="text-gray-600">Built by creators, for creators</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#A7D129] rounded-xl flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-black text-gray-900 text-lg mb-1">Rapid Growth</h4>
                    <p className="text-gray-600">From 0 to 10K+ users in under 2 years</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Image Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="rounded-2xl overflow-hidden shadow-lg h-64">
                  <img
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=800&fit=crop"
                    alt="Creator working"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="rounded-2xl overflow-hidden shadow-lg h-48">
                  <img
                    src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&h=600&fit=crop"
                    alt="Team meeting"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="rounded-2xl overflow-hidden shadow-lg h-48">
                  <img
                    src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&h=600&fit=crop"
                    alt="Brand collaboration"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="rounded-2xl overflow-hidden shadow-lg h-64">
                  <img
                    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=800&fit=crop"
                    alt="Team brainstorming"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision with Images */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-8">
            
            {/* Mission */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl group">
              <div className="absolute inset-0">
                <img
                  src="https://images.unsplash.com/photo-1556761175-b413da4baf72?w=1200&h=800&fit=crop"
                  alt="Our mission"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#A7D129]/95 via-[#A7D129]/75 to-[#A7D129]/50" />
              </div>
              <div className="relative z-10 p-10 min-h-[400px] flex flex-col justify-end">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-4xl font-black mb-4 text-white">Our Mission</h3>
                <p className="text-white/95 text-lg leading-relaxed">
                  To democratize the creator economy by providing a transparent, fair, and efficient marketplace where talent meets opportunity, and where every creator can build a sustainable career.
                </p>
              </div>
            </div>

            {/* Vision */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl group">
              <div className="absolute inset-0">
                <img
                  src="https://images.unsplash.com/photo-1551836022-4c4c79ecde51?w=1200&h=800&fit=crop"
                  alt="Our vision"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#6A7B92]/95 via-[#6A7B92]/75 to-[#6A7B92]/50" />
              </div>
              <div className="relative z-10 p-10 min-h-[400px] flex flex-col justify-end">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-4xl font-black mb-4 text-white">Our Vision</h3>
                <p className="text-white/95 text-lg leading-relaxed">
                  To become the world's leading platform for creator-brand partnerships, setting the standard for authenticity, transparency, and mutual value creation in the digital economy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black text-gray-900 mb-4">Core Values</h2>
            <div className="h-1 w-24 bg-[#A7D129] mx-auto mb-6" />
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">The principles that guide everything we do</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="group bg-white border-2 border-gray-100 hover:border-[#A7D129] rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300">
              <div className="h-48 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop"
                  alt="Creator first"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="p-8">
                <div className="w-14 h-14 bg-[#A7D129] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Users className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-3">Creator First</h3>
                <p className="text-gray-600 leading-relaxed">
                  Every decision we make prioritizes the success and well-being of our creator community. Your growth is our success.
                </p>
              </div>
            </div>

            <div className="group bg-white border-2 border-gray-100 hover:border-[#6A7B92] rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300">
              <div className="h-48 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=600&fit=crop"
                  alt="Innovation"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="p-8">
                <div className="w-14 h-14 bg-[#6A7B92] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Zap className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-3">Innovation</h3>
                <p className="text-gray-600 leading-relaxed">
                  We constantly push boundaries and explore new technologies to create better experiences and opportunities for our community.
                </p>
              </div>
            </div>

            <div className="group bg-white border-2 border-gray-100 hover:border-[#A7D129] rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300">
              <div className="h-48 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop"
                  alt="Transparency"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="p-8">
                <div className="w-14 h-14 bg-[#A7D129] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Globe className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-3">Transparency</h3>
                <p className="text-gray-600 leading-relaxed">
                  We believe in clear communication, fair policies, and honest business practices. No hidden fees, no surprises.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Offer */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black text-gray-900 mb-4">What We Offer</h2>
            <div className="h-1 w-24 bg-[#A7D129] mx-auto" />
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            
            {/* For Creators */}
            <div className="relative rounded-3xl overflow-hidden bg-white border-2 border-gray-100 hover:border-[#A7D129] hover:shadow-2xl transition-all group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#A7D129]/5 rounded-full blur-3xl -z-10" />
              <div className="p-8">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 bg-[#A7D129] rounded-xl flex items-center justify-center">
                    <Users className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-3xl font-black text-gray-900">For Creators</h3>
                </div>
                <ul className="space-y-4">
                  {[
                    'Monetize your content with Zaryo tokens',
                    'Offer services to top brands',
                    'Build your personal brand',
                    'Access exclusive partnership opportunities',
                    'Get paid fairly and quickly',
                    'Connect with like-minded creators'
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-[#A7D129] flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-lg">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* For Brands */}
            <div className="relative rounded-3xl overflow-hidden bg-white border-2 border-gray-100 hover:border-[#6A7B92] hover:shadow-2xl transition-all group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#6A7B92]/5 rounded-full blur-3xl -z-10" />
              <div className="p-8">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 bg-[#6A7B92] rounded-xl flex items-center justify-center">
                    <Target className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-3xl font-black text-gray-900">For Brands</h3>
                </div>
                <ul className="space-y-4">
                  {[
                    'Discover authentic creator partnerships',
                    'Access premium content marketplace',
                    'Streamlined campaign management',
                    'Transparent pricing and metrics',
                    'Secure transaction processing',
                    'ROI tracking and analytics'
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-[#6A7B92] flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-lg">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Parent Company */}
      <section className="py-24 bg-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&h=1080&fit=crop"
            alt="Office"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="container mx-auto px-4 max-w-4xl relative z-10">
          <div className="text-center">
            <div className="w-20 h-20 bg-[#A7D129] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#A7D129]/30">
              <Globe className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-4xl sm:text-5xl font-black mb-6 text-white">Part of Future Trends Enterprise Inc.</h2>
            <p className="text-xl text-white/90 leading-relaxed mb-6">
              Zariel & Co is proudly operated by Future Trends Enterprise Inc., a forward-thinking technology company dedicated to building the next generation of digital platforms and services.
            </p>
            <p className="text-lg text-white/70 mb-8">
              With our parent company's backing, we have the resources and expertise to continuously innovate and grow while maintaining our commitment to creators and brands.
            </p>
            <a
              href="https://www.zaniyazariel.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#A7D129] hover:bg-[#bde83a] text-gray-900 font-black px-8 py-4 rounded-xl text-lg transition-all hover:scale-105 shadow-lg shadow-[#A7D129]/30"
            >
              Learn More
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}