'use client';

import { useAuth } from '@/contexts/AuthContext';
import { isAdmin } from '@/lib/admin-auth';
import { AdminOverview } from '@/components/admin/AdminOverview';
import { CreatorOverview } from '@/components/creator/CreatorOverview';
import { InnovatorOverview } from '@/components/innovator/InnovatorOverview';
import { VisionaryOverview } from '@/components/visionary/VisionaryOverview';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function DashboardOverview() {
  const { profile, loading } = useAuth();
  
  // Show loading state while profile is being fetched
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Handle missing profile
  if (!profile) {
    return (
      <div className="flex items-center justify-center h-96">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Profile Not Found</AlertTitle>
          <AlertDescription>
            Unable to load your profile. Please try refreshing the page or contact support if the issue persists.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  // Route admin users to AdminOverview
  if (isAdmin(profile) || profile.role === 'admin') {
    return <AdminOverview />;
  }

  // Route creators to CreatorOverview (Tier 1)
  if (profile.role === 'creator') {
    return <CreatorOverview />;
  }

  // Route innovators to InnovatorOverview (Tier 2)
  if (profile.role === 'innovator') {
    return <InnovatorOverview />;
  }

  // Route visionaries to VisionaryOverview (Tier 3)
  if (profile.role === 'visionary') {
    return <VisionaryOverview />;
  }

  // Route company users to VisionaryOverview (company tier)
  if (profile.role === 'company') {
    return <VisionaryOverview />;
  }

  // Fallback for unknown role
  return (
    <div className="flex items-center justify-center h-96">
      <Alert variant="destructive" className="max-w-md">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Invalid User Role</AlertTitle>
        <AlertDescription>
          Your account role ({profile.role || 'unknown'}) is not recognized. Please contact support to resolve this issue.
        </AlertDescription>
      </Alert>
    </div>
  );
}
