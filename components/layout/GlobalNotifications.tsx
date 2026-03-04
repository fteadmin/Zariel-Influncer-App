'use client';

import { useGlobalNotifications } from '@/hooks/use-global-notifications';

/**
 * Renders nothing — purely mounts the global notification listeners.
 * Drop this anywhere inside a client-side tree (e.g. DashboardLayout).
 */
export function GlobalNotifications() {
  useGlobalNotifications();
  return null;
}
