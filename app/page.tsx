'use client';

import { LandingPage } from '@/components/landing/LandingPage';

export default function Home() {
  // Landing page is always public — authenticated users can still view it.
  // They can navigate to /dashboard from the nav.
  return <LandingPage />;
}
