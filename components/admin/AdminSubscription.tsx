'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Info } from 'lucide-react';

export function AdminSubscription() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Admin Subscription</h2>
          <p className="text-gray-600 mt-1">
            Manage subscription settings and policies
          </p>
        </div>
      </div>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Admin Privileges:</strong> As an administrator, you have unlimited access to all platform features without requiring a subscription.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Subscription Overview</CardTitle>
          <CardDescription>Manage platform subscription tiers and pricing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Monthly Plan</h3>
              <p className="text-2xl font-bold mb-2">$9.99/mo</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Upload up to 10 items/month</li>
                <li>• Access to marketplace</li>
                <li>• Token transactions</li>
                <li>• Creator/Company features</li>
              </ul>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Yearly Plan</h3>
              <p className="text-2xl font-bold mb-2">$99.99/yr</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Upload up to 10 items/month</li>
                <li>• 2 months free</li>
                <li>• Priority support</li>
                <li>• All monthly features</li>
              </ul>
            </div>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Admins can view subscription statistics and user subscription status from the Users tab.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Admin Benefits</CardTitle>
          <CardDescription>Your administrative privileges</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <Shield className="h-4 w-4 text-green-600 mt-0.5" />
              <span>Unlimited content uploads without subscription</span>
            </li>
            <li className="flex items-start gap-2">
              <Shield className="h-4 w-4 text-green-600 mt-0.5" />
              <span>Access to all platform content and features</span>
            </li>
            <li className="flex items-start gap-2">
              <Shield className="h-4 w-4 text-green-600 mt-0.5" />
              <span>Content management and pricing control</span>
            </li>
            <li className="flex items-start gap-2">
              <Shield className="h-4 w-4 text-green-600 mt-0.5" />
              <span>User management and platform oversight</span>
            </li>
            <li className="flex items-start gap-2">
              <Shield className="h-4 w-4 text-green-600 mt-0.5" />
              <span>No upload limits or restrictions</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
