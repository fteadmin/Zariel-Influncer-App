'use client';

import { Shield, Lock, Eye, Database, UserCheck, Globe } from 'lucide-react';

export default function PrivacyPolicyContent() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#6A7B92] to-[#5a6b82] py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-[#A7D129] rounded-2xl flex items-center justify-center">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-black text-white">Privacy Policy</h1>
              <p className="text-white/80 text-lg mt-2">Last updated: February 23, 2026</p>
            </div>
          </div>
          <p className="text-xl text-white/90 max-w-3xl">
            Your privacy matters to us. Learn how we collect, use, and protect your personal information.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-16 max-w-5xl">
        
        {/* Quick Overview Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <div className="bg-gradient-to-br from-[#A7D129]/10 to-[#A7D129]/5 border-2 border-[#A7D129]/20 rounded-2xl p-6 hover:shadow-lg transition-shadow">
            <Lock className="h-10 w-10 text-[#A7D129] mb-4" />
            <h3 className="text-lg font-black text-gray-900 mb-2">Data Security</h3>
            <p className="text-sm text-gray-700">We use industry-standard encryption to protect your data</p>
          </div>
          
          <div className="bg-gradient-to-br from-[#6A7B92]/10 to-[#6A7B92]/5 border-2 border-[#6A7B92]/20 rounded-2xl p-6 hover:shadow-lg transition-shadow">
            <Eye className="h-10 w-10 text-[#6A7B92] mb-4" />
            <h3 className="text-lg font-black text-gray-900 mb-2">Transparency</h3>
            <p className="text-sm text-gray-700">Clear communication about how we use your information</p>
          </div>
          
          <div className="bg-gradient-to-br from-[#A7D129]/10 to-[#A7D129]/5 border-2 border-[#A7D129]/20 rounded-2xl p-6 hover:shadow-lg transition-shadow">
            <UserCheck className="h-10 w-10 text-[#A7D129] mb-4" />
            <h3 className="text-lg font-black text-gray-900 mb-2">Your Rights</h3>
            <p className="text-sm text-gray-700">Full control over your personal data and privacy settings</p>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-12">
          <section className="border-l-4 border-[#A7D129] pl-6">
            <h2 className="text-3xl font-black text-gray-900 mb-4">1. Information We Collect</h2>
            <p className="text-gray-700 mb-4 leading-relaxed">
              We collect information that you provide directly to us when you use Zariel & Co:
            </p>
            <div className="bg-gray-50 rounded-xl p-6 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-[#A7D129] rounded-full mt-2" />
                <p className="text-gray-700"><strong className="text-gray-900">Account Information:</strong> Name, email address, password, and profile details</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-[#A7D129] rounded-full mt-2" />
                <p className="text-gray-700"><strong className="text-gray-900">Content Data:</strong> Videos, images, descriptions, and other content you upload</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-[#A7D129] rounded-full mt-2" />
                <p className="text-gray-700"><strong className="text-gray-900">Transaction Information:</strong> Payment methods, billing details, and purchase history</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-[#A7D129] rounded-full mt-2" />
                <p className="text-gray-700"><strong className="text-gray-900">Usage Data:</strong> How you interact with our platform, pages visited, and features used</p>
              </div>
            </div>
          </section>

          <section className="border-l-4 border-[#6A7B92] pl-6">
            <h2 className="text-3xl font-black text-gray-900 mb-4">2. How We Use Your Information</h2>
            <p className="text-gray-700 mb-4 leading-relaxed">
              We use your information to provide, improve, and protect our services:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-[#A7D129]/5 border border-[#A7D129]/20 rounded-xl p-5">
                <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <Database className="h-5 w-5 text-[#A7D129]" />
                  Service Delivery
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Process transactions and payments</li>
                  <li>• Maintain your account and profile</li>
                  <li>• Enable content uploads and sharing</li>
                  <li>• Facilitate creator-brand connections</li>
                </ul>
              </div>
              
              <div className="bg-[#6A7B92]/5 border border-[#6A7B92]/20 rounded-xl p-5">
                <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <Globe className="h-5 w-5 text-[#6A7B92]" />
                  Platform Improvement
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Analyze usage patterns and trends</li>
                  <li>• Develop new features and services</li>
                  <li>• Optimize performance and UX</li>
                  <li>• Provide customer support</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="border-l-4 border-[#A7D129] pl-6">
            <h2 className="text-3xl font-black text-gray-900 mb-4">3. Information Sharing</h2>
            <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6 mb-4">
              <p className="text-amber-900 font-bold text-lg mb-2">🔒 We Never Sell Your Data</p>
              <p className="text-amber-800">Your personal information is never sold to third parties for marketing purposes.</p>
            </div>
            <p className="text-gray-700 mb-4 leading-relaxed">
              We only share your information in these specific circumstances:
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-[#6A7B92] rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">1</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Service Providers</h4>
                  <p className="text-sm text-gray-700">Trusted partners who help operate our platform (payment processors, cloud storage, analytics)</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-[#6A7B92] rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">2</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Public Profile Information</h4>
                  <p className="text-sm text-gray-700">Information you choose to make public is visible to other users and brands</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-[#6A7B92] rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">3</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Legal Requirements</h4>
                  <p className="text-sm text-gray-700">When required by law, court order, or to protect rights and safety</p>
                </div>
              </div>
            </div>
          </section>

          <section className="border-l-4 border-[#6A7B92] pl-6">
            <h2 className="text-3xl font-black text-gray-900 mb-4">4. Your Privacy Rights</h2>
            <p className="text-gray-700 mb-6 leading-relaxed">
              You have complete control over your personal data. You can exercise these rights at any time:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="border-2 border-[#A7D129] rounded-xl p-5 hover:shadow-lg transition-shadow">
                <h3 className="font-black text-gray-900 mb-3 text-lg">Access Your Data</h3>
                <p className="text-sm text-gray-700">Request a copy of all personal information we have about you</p>
              </div>
              <div className="border-2 border-[#A7D129] rounded-xl p-5 hover:shadow-lg transition-shadow">
                <h3 className="font-black text-gray-900 mb-3 text-lg">Correct Information</h3>
                <p className="text-sm text-gray-700">Update or fix any inaccurate or incomplete data</p>
              </div>
              <div className="border-2 border-[#6A7B92] rounded-xl p-5 hover:shadow-lg transition-shadow">
                <h3 className="font-black text-gray-900 mb-3 text-lg">Delete Your Account</h3>
                <p className="text-sm text-gray-700">Request permanent deletion of your account and data</p>
              </div>
              <div className="border-2 border-[#6A7B92] rounded-xl p-5 hover:shadow-lg transition-shadow">
                <h3 className="font-black text-gray-900 mb-3 text-lg">Data Portability</h3>
                <p className="text-sm text-gray-700">Export your data in a machine-readable format</p>
              </div>
            </div>
          </section>

          <section className="border-l-4 border-[#A7D129] pl-6">
            <h2 className="text-3xl font-black text-gray-900 mb-4">5. Data Security</h2>
            <p className="text-gray-700 mb-6 leading-relaxed">
              We implement robust security measures to protect your information:
            </p>
            <div className="bg-gradient-to-br from-[#6A7B92]/10 to-[#6A7B92]/5 border-2 border-[#6A7B92]/20 rounded-2xl p-8">
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="w-16 h-16 bg-[#A7D129] rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Lock className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">Encryption</h4>
                  <p className="text-sm text-gray-700">All data encrypted in transit and at rest</p>
                </div>
                <div>
                  <div className="w-16 h-16 bg-[#6A7B92] rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Shield className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">Access Control</h4>
                  <p className="text-sm text-gray-700">Strict authentication and authorization protocols</p>
                </div>
                <div>
                  <div className="w-16 h-16 bg-[#A7D129] rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Eye className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">Monitoring</h4>
                  <p className="text-sm text-gray-700">24/7 security monitoring and threat detection</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
