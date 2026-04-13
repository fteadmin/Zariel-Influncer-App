'use client';

import { Profile } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { ArrowLeft, Calendar, Globe, Shield, User, Coins, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface ProfileDetailProps {
  profile: Profile;
}

function getInitials(name: string | null): string {
  if (name) {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
  return '?';
}

function getRoleLabel(role: string): string {
  switch (role) {
    case 'member': return 'Member';
    case 'admin': return 'Admin';
    case 'superadmin': return 'Super Admin';
    default: return 'Member';
  }
}

function getRoleBadgeColor(role: string): string {
  switch (role) {
    case 'member': return 'bg-[#A7D129]/15 text-[#7a9a1e] border-[#A7D129]/30';
    case 'admin': return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'superadmin': return 'bg-purple-50 text-purple-700 border-purple-200';
    default: return 'bg-gray-50 text-gray-600 border-gray-200';
  }
}

export function ProfileDetail({ profile }: ProfileDetailProps) {
  const initials = getInitials(profile.display_name);
  const joinDate = new Date(profile.created_at).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="max-w-3xl mx-auto">
      <Link href="/profiles">
        <Button variant="ghost" className="mb-6 text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Profiles
        </Button>
      </Link>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        {/* Banner */}
        <div className="h-32 bg-gradient-to-r from-[#A7D129]/20 via-[#6A7B92]/10 to-[#A7D129]/20 relative">
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(106, 123, 146) 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        </div>

        <div className="px-8 pb-8">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.display_name || 'Profile'} className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-lg" />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#A7D129] to-[#6A7B92] flex items-center justify-center border-4 border-white shadow-lg">
                <span className="text-3xl font-black text-white">{initials}</span>
              </div>
            )}

            <div className="flex-1 pb-1">
              <h1 className="text-2xl font-black text-gray-900">
                {profile.display_name || 'Unnamed User'}
              </h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className={cn('inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide border', getRoleBadgeColor(profile.role))}>
                  {(profile.role === 'admin' || profile.role === 'superadmin') && <Shield className="w-3 h-3" />}
                  {getRoleLabel(profile.role)}
                </span>
                {profile.user_type && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold text-gray-500 bg-gray-100 border border-gray-200">
                    {profile.user_type}
                  </span>
                )}
                {profile.tier !== 'free' && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 capitalize">
                    {profile.tier} tier
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-6">
            {profile.bio && (
              <div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">About</h3>
                <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100">
                <User className="w-5 h-5 text-[#6A7B92]" />
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">Role</p>
                  <p className="text-sm font-semibold text-gray-900">{getRoleLabel(profile.role)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100">
                <Calendar className="w-5 h-5 text-[#6A7B92]" />
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">Joined</p>
                  <p className="text-sm font-semibold text-gray-900">{joinDate}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100">
                <CreditCard className="w-5 h-5 text-[#6A7B92]" />
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">Tier</p>
                  <p className="text-sm font-semibold text-gray-900 capitalize">{profile.tier}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100">
                <Coins className="w-5 h-5 text-[#6A7B92]" />
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">Token Balance</p>
                  <p className="text-sm font-semibold text-gray-900">{profile.token_balance.toLocaleString()}</p>
                </div>
              </div>

              {profile.website && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100 sm:col-span-2">
                  <Globe className="w-5 h-5 text-[#6A7B92]" />
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase">Website</p>
                    <a href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-[#A7D129] hover:underline">
                      {profile.website}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
