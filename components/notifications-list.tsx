'use client';

import { useRouter } from 'next/navigation';
import { formatDate } from '@/lib/date';
import { NOTIFICATIONS_UPDATED_EVENT } from '@/lib/constants';
import type { Notification } from '@/lib/types';

type NotificationsListProps = {
  notifications: Notification[];
  isInternal: boolean;
};

function ticketHref(ticketId: string | null, isInternal: boolean): string | null {
  if (!ticketId) return null;
  return isInternal ? `/internal/tickets/${ticketId}` : `/clinic/tickets/${ticketId}`;
}

function dispatchNotificationsUpdated() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(NOTIFICATIONS_UPDATED_EVENT));
  }
}

export default function NotificationsList({ notifications, isInternal }: NotificationsListProps) {
  const router = useRouter();
  const hasUnread = notifications.some((n) => !n.is_read);

  async function handleMarkAllRead() {
    const res = await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mark_all: true }),
    });
    if (res.ok) {
      dispatchNotificationsUpdated();
      router.refresh();
    }
  }

  async function handleNotificationClick(n: Notification) {
    const href = ticketHref(n.ticket_id, isInternal);
    if (!n.is_read) {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: n.id }),
      });
      dispatchNotificationsUpdated();
    }
    if (href) {
      router.push(href);
    } else {
      router.refresh();
    }
  }

  if (!notifications.length) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
        <p className="text-gray-500">No notifications yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {hasUnread ? (
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <button
            type="button"
            onClick={handleMarkAllRead}
            className="rounded-md bg-[#1e3a5f] px-4 py-2 text-sm font-medium text-white hover:bg-[#2a4a6f]"
          >
            Mark all as read
          </button>
        </div>
      ) : null}
      <div className="space-y-2">
        {notifications.map((n) => (
          <button
            key={n.id}
            type="button"
            onClick={() => void handleNotificationClick(n)}
            className={`w-full rounded-lg border p-4 text-left transition ${
              n.is_read ? 'border-gray-200 bg-white' : 'border-gray-300 bg-blue-50/50'
            }`}
          >
            <div className="flex items-start gap-3">
              {!n.is_read ? (
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-600" aria-hidden />
              ) : null}
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-900">{n.message}</p>
                <p className="mt-1 text-xs text-gray-500">{formatDate(n.created_at)}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
