'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TICKET_STATUSES } from '@/lib/constants';

type StatusUpdateProps = {
  ticketId: string;
  currentStatus: string;
};

export default function StatusUpdate({ ticketId, currentStatus }: StatusUpdateProps) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleChange(newStatus: string) {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/tickets/${ticketId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setStatus(newStatus);
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        setError((data as { error?: string }).error || 'Status update failed');
      }
    } catch {
      setError('Status update failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <label htmlFor="status" className="text-sm font-medium">
          Status:
        </label>
        <select
          id="status"
          value={status}
          onChange={(e) => handleChange(e.target.value)}
          disabled={loading}
          className="rounded border border-gray-300 px-2 py-1 text-sm text-gray-900"
        >
          {TICKET_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        {loading && <span className="text-xs text-gray-500">Updating...</span>}
      </div>
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
