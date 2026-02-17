'use client';

import { useAuth } from '@/contexts/AuthContext';
import { isAdmin } from '@/lib/admin-auth';
import { AdminSubscription } from '@/components/admin/AdminSubscription';
import { CreatorSubscription } from '@/components/creator/CreatorSubscription';
import { CompanySubscription } from '@/components/company/CompanySubscription';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function SubscriptionPageContent() {
  const { profile, loading } = useAuth();
  
  // Show loading state while profile is being fetched
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading subscription...</p>
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
  
  // Route admin users to AdminSubscription
  if (isAdmin(profile)) {
    return <AdminSubscription />;
  }

  // Route creators to CreatorSubscription
  if (profile.role === 'creator') {
    return <CreatorSubscription />;
  }

  // Route companies to CompanySubscription
  if (profile.role === 'innovator' || profile.role === 'visionary') {
    return <CompanySubscription />;
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
