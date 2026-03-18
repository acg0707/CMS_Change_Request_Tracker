'use client';

import { useCallback, useEffect, useState } from 'react';
import { NOTIFICATIONS_UPDATED_EVENT } from '@/lib/constants';

export function useHasUnreadNotifications() {
  const [hasUnread, setHasUnread] = useState(false);

  const refetch = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications');
      if (!res.ok) return;
      const data = (await res.json()) as { hasUnread?: boolean };
      if (typeof data.hasUnread === 'boolean') setHasUnread(data.hasUnread);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => void refetch());
    const onUpdate = () => void refetch();
    window.addEventListener(NOTIFICATIONS_UPDATED_EVENT, onUpdate);
    return () => window.removeEventListener(NOTIFICATIONS_UPDATED_EVENT, onUpdate);
  }, [refetch]);

  return hasUnread;
}
