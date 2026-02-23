'use client';

import { ChevronRight } from 'lucide-react';

const categories = [
  { name: 'Instagram Posts', count: '12.5K', icon: '📸', color: 'from-pink-500 to-purple-600' },
  { name: 'YouTube Videos', count: '8.2K', icon: '🎥', color: 'from-red-500 to-orange-600' },
  { name: 'TikTok Content', count: '15.8K', icon: '🎵', color: 'from-cyan-500 to-blue-600' },
  { name: 'Blog Posts', count: '6.3K', icon: '✍️', color: 'from-green-500 to-teal-600' },
  { name: 'Product Reviews', count: '9.1K', icon: '⭐', color: 'from-yellow-500 to-orange-600' },
  { name: 'Brand Collabs', count: '5.7K', icon: '🤝', color: 'from-indigo-500 to-purple-600' }
];

export function Categories() {
  return (
    <section className="py-24 px-6 relative" id="categories">
      <div className="container mx-auto flex justify-center">
        <div className="w-full max-w-6xl bg-gradient-to-b from-[#8fb622] to-[#7a9e1d] rounded-3xl p-8 sm:p-12 shadow-xl">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4">
              Browse by Category
            </h2>
            <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto">
              Thousands of opportunities across every platform and niche
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {categories.map((category, idx) => (
              <div
                key={idx}
                className="group bg-white rounded-2xl p-6 border border-white/20 hover:shadow-lg transition-shadow duration-200 cursor-pointer"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`text-4xl sm:text-5xl bg-gradient-to-br ${category.color} p-3 sm:p-4 rounded-2xl shadow-lg`}>
                    {category.icon}
                  </div>
                  <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-[#A7D129] transition-colors duration-200" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{category.name}</h3>
                <p className="text-gray-600 font-semibold">{category.count} active gigs</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
