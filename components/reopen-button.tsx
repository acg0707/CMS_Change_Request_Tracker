'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type ReopenButtonProps = {
  ticketId: string;
};

export default function ReopenButton({ ticketId }: ReopenButtonProps) {
  const [open, setOpen] = useState(false);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleReopen() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/tickets/${ticketId}/reopen`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setOpen(false);
        setComment('');
        router.refresh();
      } else {
        setError(data.error || 'Failed to reopen');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="rounded-md border border-amber-600 px-4 py-2 text-sm font-medium text-amber-600 hover:bg-amber-50 dark:border-amber-500 dark:text-amber-500 dark:hover:bg-amber-950"
      >
        Request follow-up
      </button>
      {open && (
        <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <p className="mb-2 text-sm text-gray-600">
            Reopen this ticket and add a comment for admin (optional):
          </p>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder="Describe what needs follow-up..."
            className="mb-3 w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900"
          />
          {error && <p className="mb-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleReopen}
              disabled={loading}
              className="rounded-md bg-amber-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
            >
              {loading ? 'Reopening...' : 'Reopen ticket'}
            </button>
            <button
              type="button"
              onClick={() => { setOpen(false); setComment(''); }}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
