'use client';

import { Navigation } from './Navigation';
import { Hero } from './Hero';
import { StatsBar } from './StatsBar';
import { Categories } from './Categories';
import { HowItWorks } from './HowItWorks';
import { Testimonials } from './Testimonials';
import { Pricing } from './Pricing';
import { FinalCTA } from './FinalCTA';
import { Contact } from './Contact';
import { Footer } from './Footer';

export function LandingPage() {
  return (
    <div className="relative min-h-screen bg-white">
      {/* Static background decorations (top of page only) */}
      <div className="absolute inset-x-0 top-0 h-[720px] overflow-hidden pointer-events-none z-0">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-[#A7D129]/15 via-[#A7D129]/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-32 right-20 w-[500px] h-[500px] bg-gradient-to-br from-[#6A7B92]/10 via-[#6A7B92]/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-gradient-to-br from-[#A7D129]/10 via-[#6A7B92]/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(106, 123, 146) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      </div>

      <Navigation />
      <Hero />
      <StatsBar />
      <HowItWorks />
      <Categories />
      <Testimonials />
      <Pricing />
      <FinalCTA />
      <Contact />
      <Footer />
    </div>
  );
}
