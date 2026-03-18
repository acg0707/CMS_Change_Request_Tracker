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
  const router = useRouter();

  async function handleChange(newStatus: string) {
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
      }
    } finally {
      setLoading(false);
    }
  }

  return (
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
  );
}
