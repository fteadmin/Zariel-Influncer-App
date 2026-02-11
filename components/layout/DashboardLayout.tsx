'use client';

import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#A7D129]/5 via-white to-[#A7D129]/8 flex relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#6A7B92]/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-1/3 w-[500px] h-[500px] bg-[#A7D129]/10 rounded-full blur-3xl transform -translate-y-1/3" />
      </div>

      {/* Sidebar - Fixed left */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex-1 flex flex-col ml-0 lg:ml-64 relative z-10">
        {/* Top Navigation - Fixed top */}
        <TopNav />

        {/* Page content with proper padding */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-12 py-8 animate-fade-in animate-slide-up">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
