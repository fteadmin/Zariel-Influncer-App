'use client';

import { Profile } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Calendar, Shield, Globe } from 'lucide-react';

interface ProfileCardProps {
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

function getRoleBadgeColor(role: string): string {
  switch (role) {
    case 'member':
      return 'bg-[#A7D129]/15 text-[#7a9a1e] border-[#A7D129]/30';
    case 'admin':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'superadmin':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    default:
      return 'bg-gray-50 text-gray-600 border-gray-200';
  }
}

export function ProfileCard({ profile }: ProfileCardProps) {
  const initials = getInitials(profile.display_name);
  const joinDate = new Date(profile.created_at).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });

  return (
    <Link href={`/profiles/${profile.id}`}>
      <div className="group bg-white rounded-2xl border border-gray-200 p-6 hover:border-[#A7D129]/50 hover:shadow-lg hover:shadow-[#A7D129]/5 transition-all duration-300 cursor-pointer">
        <div className="flex items-start gap-4">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.display_name || 'Profile'}
              className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#A7D129] to-[#6A7B92] flex items-center justify-center flex-shrink-0">
              <span className="text-lg font-black text-white">{initials}</span>
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-gray-900 truncate group-hover:text-[#A7D129] transition-colors">
              {profile.display_name || 'Unnamed User'}
            </h3>

            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span
                className={cn(
                  'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wide border',
                  getRoleBadgeColor(profile.role)
                )}
              >
                {(profile.role === 'admin' || profile.role === 'superadmin') && <Shield className="w-3 h-3" />}
                {profile.role}
              </span>
              {profile.user_type && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold text-gray-500 bg-gray-100 border border-gray-200">
                  {profile.user_type}
                </span>
              )}
              {profile.tier !== 'free' && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 capitalize">
                  {profile.tier}
                </span>
              )}
            </div>

            {profile.bio && (
              <p className="text-sm text-gray-500 mt-2 line-clamp-2 leading-relaxed">
                {profile.bio}
              </p>
            )}

            <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Joined {joinDate}
              </span>
              {profile.website && (
                <span className="flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  Website
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
