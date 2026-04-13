'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserCircle, Save, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export function MyProfileEditor() {
  const { profile, refreshProfile } = useAuth();

  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [website, setWebsite] = useState(profile?.website || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');
  const [saving, setSaving] = useState(false);

  if (!profile) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: displayName.trim() || null,
        bio: bio.trim() || null,
        website: website.trim() || null,
        avatar_url: avatarUrl.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', profile.id);

    if (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to save profile. Please try again.');
    } else {
      toast.success('Profile updated successfully!');
      await refreshProfile();
    }
    setSaving(false);
  };

  const initials = (profile.display_name || '?')[0].toUpperCase();

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-gradient-to-br from-[#A7D129] to-[#6A7B92] rounded-xl flex items-center justify-center">
          <UserCircle className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-gray-900">My Profile</h1>
          <p className="text-sm text-gray-500 font-medium">Update your public profile information</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        {/* Banner */}
        <div className="h-24 bg-gradient-to-r from-[#A7D129]/20 via-[#6A7B92]/10 to-[#A7D129]/20" />

        <div className="px-8 pb-8">
          {/* Avatar preview */}
          <div className="-mt-10 mb-6">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-lg" />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#A7D129] to-[#6A7B92] flex items-center justify-center border-4 border-white shadow-lg">
                <span className="text-2xl font-black text-white">{initials}</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="displayName" className="text-sm font-bold text-gray-700">Display Name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your display name"
                className="h-11 border-2 border-gray-200 focus:border-[#A7D129] focus:ring-2 focus:ring-[#A7D129]/20 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="text-sm font-bold text-gray-700">Bio</Label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell people about yourself..."
                rows={4}
                className="w-full px-3 py-2.5 border-2 border-gray-200 focus:border-[#A7D129] focus:ring-2 focus:ring-[#A7D129]/20 rounded-xl outline-none text-sm resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website" className="text-sm font-bold text-gray-700">Website</Label>
              <Input
                id="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://yourwebsite.com"
                className="h-11 border-2 border-gray-200 focus:border-[#A7D129] focus:ring-2 focus:ring-[#A7D129]/20 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="avatarUrl" className="text-sm font-bold text-gray-700">Avatar URL</Label>
              <Input
                id="avatarUrl"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/your-photo.jpg"
                className="h-11 border-2 border-gray-200 focus:border-[#A7D129] focus:ring-2 focus:ring-[#A7D129]/20 rounded-xl"
              />
              <p className="text-xs text-gray-400">Paste a direct link to your profile photo</p>
            </div>

            {/* Read-only info */}
            <div className="pt-4 border-t border-gray-200">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Account Info</p>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <p className="text-xs text-gray-400 font-bold">Role</p>
                  <p className="text-sm font-semibold text-gray-900 capitalize">{profile.role}</p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <p className="text-xs text-gray-400 font-bold">Tier</p>
                  <p className="text-sm font-semibold text-gray-900 capitalize">{profile.tier}</p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <p className="text-xs text-gray-400 font-bold">Tokens</p>
                  <p className="text-sm font-semibold text-gray-900">{profile.token_balance.toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <p className="text-xs text-gray-400 font-bold">Joined</p>
                  <p className="text-sm font-semibold text-gray-900">{new Date(profile.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={saving}
              className="w-full h-12 text-base font-bold bg-gradient-to-r from-[#A7D129] to-[#95c51f] hover:from-[#95c51f] hover:to-[#A7D129] text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-5 w-5" />
                  Save Profile
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
