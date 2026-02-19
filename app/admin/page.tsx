'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { isAdmin } from '@/lib/admin-auth';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { Loader2, AlertCircle, Shield } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export default function AdminPage() {
  const { user, profile, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-white mx-auto mb-4" />
          <p className="text-white">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  // Show access denied if not logged in
  if (!user || !profile) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
        <div className="max-w-md w-full">
          <Alert className="mb-4 border-yellow-500 bg-yellow-50">
            <Shield className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-900">
              Please sign in with your @futuretrendsent.info account to access the admin panel.
            </AlertDescription>
          </Alert>
          <Button 
            onClick={() => window.location.href = '/'} 
            className="w-full"
          >
            Go to Sign In
          </Button>
        </div>
      </div>
    );
  }

  // Show access denied if not admin
  if (!isAdmin(profile)) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
        <div className="max-w-md w-full">
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Access denied. Only @futuretrendsent.info accounts have admin access.
            </AlertDescription>
          </Alert>
          <Button 
            onClick={() => window.location.href = '/'} 
            className="w-full"
            variant="outline"
          >
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  // Show admin dashboard if authenticated and authorized
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modern Admin Top Navigation */}
      <div className="border-b border-gray-200 bg-white shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Logo and Title */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#A7D129] to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-[#A7D129]/20">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-black text-gray-900 leading-none">
                    ZARIEL & Co
                  </h1>
                  <p className="text-[10px] font-black text-[#A7D129] uppercase tracking-wider leading-none mt-0.5">
                    Admin Portal
                  </p>
                </div>
              </div>
              
              {/* Divider */}
              <div className="hidden md:block w-px h-8 bg-gray-200" />
              
              {/* Admin Badge */}
              <div className="hidden md:flex items-center gap-2 bg-gradient-to-r from-[#A7D129]/10 to-green-600/10 px-3 py-1.5 rounded-lg border border-[#A7D129]/20">
                <div className="w-2 h-2 bg-[#A7D129] rounded-full animate-pulse" />
                <span className="text-xs font-black text-[#6A7B92] uppercase tracking-wider">
                  System Access
                </span>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/'}
                className="font-bold border-gray-200 hover:border-[#A7D129] hover:bg-[#A7D129]/5 transition-all"
              >
                Back to Main App
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <AdminDashboard />
      </div>
    </div>
  );
}
