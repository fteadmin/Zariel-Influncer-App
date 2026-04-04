'use client';

// ============================================================
// SIMPLIFIED: Global notifications disabled for profiles-only webapp.
// The hook is kept as a no-op so DashboardLayout/GlobalNotifications
// still import without errors.
// ============================================================

export function useGlobalNotifications() {
  // No-op — old notification listeners disabled
  return;
}

// ============================================================
// PRESERVED: Old global notification listeners (gigs + direct messages)
// Uncomment and replace the above to re-enable.
// ============================================================
//
// import { useEffect, useRef } from 'react';
// import { usePathname, useRouter } from 'next/navigation';
// import { toast } from 'sonner';
// import { supabase } from '@/lib/supabase';
// import { useAuth } from '@/contexts/AuthContext';
//
// interface GigRow {
//   id: string;
//   title: string;
//   category: string;
//   posted_by: string;
// }
//
// interface MessageRow {
//   id: string;
//   sender_id: string;
//   receiver_id: string;
//   content: string;
//   created_at: string;
// }
//
// const senderCache: Record<string, string> = {};
//
// export function useOldGlobalNotifications() {
//   const { profile } = useAuth();
//   const pathname = usePathname();
//   const router = useRouter();
//
//   const pathnameRef = useRef(pathname);
//   useEffect(() => { pathnameRef.current = pathname; }, [pathname]);
//
//   useEffect(() => {
//     if (!profile) return;
//
//     const isAdmin = profile.is_admin || profile.role === 'admin';
//     const uid = profile.id;
//
//     // 1. New gig posted (non-admins only)
//     const gigChannel = !isAdmin
//       ? supabase
//           .channel(`global-gig-toast-${uid}`)
//           .on(
//             'postgres_changes',
//             { event: 'INSERT', schema: 'public', table: 'gigs' },
//             (payload) => {
//               const gig = payload.new as GigRow;
//               if (!gig) return;
//               toast('New Gig Posted!', {
//                 description: `"${gig.title}" — a new opportunity is available.`,
//                 duration: 7000,
//                 action: { label: 'View Gigs', onClick: () => router.push('/gigs') },
//               });
//               router.prefetch('/gigs');
//             }
//           )
//           .subscribe()
//       : null;
//
//     // 2. New direct message received (when not on /chat)
//     const msgChannel = supabase
//       .channel(`global-msg-toast-${uid}`)
//       .on(
//         'postgres_changes',
//         { event: 'INSERT', schema: 'public', table: 'direct_messages', filter: `receiver_id=eq.${uid}` },
//         async (payload) => {
//           const msg = payload.new as MessageRow;
//           if (!msg) return;
//           if (pathnameRef.current?.startsWith('/chat')) return;
//           let senderName = senderCache[msg.sender_id];
//           if (!senderName) {
//             const { data } = await supabase.from('profiles').select('full_name, email').eq('id', msg.sender_id).single();
//             senderName = data?.full_name || data?.email?.split('@')[0] || 'Someone';
//             senderCache[msg.sender_id] = senderName;
//           }
//           const preview = msg.content.length > 60 ? msg.content.slice(0, 60) + '…' : msg.content;
//           toast(`New message from ${senderName}`, {
//             description: preview,
//             duration: 6000,
//             action: { label: 'Open Chat', onClick: () => router.push('/chat') },
//           });
//         }
//       )
//       .subscribe();
//
//     return () => {
//       if (gigChannel) supabase.removeChannel(gigChannel);
//       supabase.removeChannel(msgChannel);
//     };
//   }, [profile, toast, router]);
// }
