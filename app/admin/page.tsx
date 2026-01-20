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
              Please sign in with your @futuretrendsent.com or @futuretrendsent.info account to access the admin panel.
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
              Access denied. Only @futurtrendsent.com and @futurtrendsent.info accounts have admin access.
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
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              ZARIEL & Co Admin
            </h1>
          </div>
          <Button variant="outline" onClick={() => window.location.href = '/'}>
            Back to Main App
          </Button>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        <AdminDashboard />
      </div>
    </div>
  );
}
