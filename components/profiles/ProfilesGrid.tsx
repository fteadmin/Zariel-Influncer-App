'use client';

import { useEffect, useState, useMemo } from 'react';
import { supabase, Profile } from '@/lib/supabase';
import { ProfileCard } from './ProfileCard';
import { Search, Loader2, Users, AlertCircle } from 'lucide-react';

export function ProfilesGrid() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchProfiles() {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('banned', false)
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching profiles:', fetchError);
        setError('Failed to load profiles. Please try again.');
      } else {
        setProfiles(data as Profile[]);
      }
      setLoading(false);
    }

    fetchProfiles();
  }, []);

  const filteredProfiles = useMemo(() => {
    if (!searchQuery.trim()) return profiles;
    const query = searchQuery.toLowerCase();
    return profiles.filter(
      (p) =>
        (p.display_name && p.display_name.toLowerCase().includes(query)) ||
        p.role.toLowerCase().includes(query) ||
        (p.bio && p.bio.toLowerCase().includes(query)) ||
        (p.user_type && p.user_type.toLowerCase().includes(query))
    );
  }, [profiles, searchQuery]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-[#A7D129] mx-auto" />
          <p className="text-gray-500 font-medium">Loading profiles...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center space-y-3 max-w-md">
          <AlertCircle className="h-10 w-10 text-red-400 mx-auto" />
          <p className="text-gray-700 font-semibold">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-sm text-[#A7D129] hover:underline font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header + Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#A7D129] to-[#6A7B92] rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900">Profiles</h1>
            <p className="text-sm text-gray-500 font-medium">
              {profiles.length} member{profiles.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, role, or type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#A7D129] focus:ring-2 focus:ring-[#A7D129]/20 outline-none text-sm font-medium text-gray-700 bg-white"
          />
        </div>
      </div>

      {filteredProfiles.length === 0 ? (
        <div className="text-center py-16">
          <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-semibold">
            {searchQuery ? 'No profiles match your search.' : 'No profiles found.'}
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-sm text-[#A7D129] hover:underline font-medium mt-2"
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProfiles.map((profile) => (
            <ProfileCard key={profile.id} profile={profile} />
          ))}
        </div>
      )}
    </div>
  );
}
