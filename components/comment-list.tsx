'use client';

import { useState } from 'react';
import { formatDate } from '@/lib/date';

type Comment = {
  comment_id: string;
  body: string;
  visibility: string;
  created_at: string;
  author_label?: string;
};

type CommentListProps = {
  ticketId: string;
  initialComments: Comment[];
  isInternal: boolean;
};

export default function CommentList({ ticketId, initialComments, isInternal }: CommentListProps) {
  const [comments, setComments] = useState(initialComments);
  const [body, setBody] = useState('');
  const [visibility, setVisibility] = useState<'clinic_visible' | 'internal'>('clinic_visible');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticket_id: ticketId,
          body: body.trim(),
          visibility: isInternal ? visibility : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to add comment');
      }

      setComments((prev) => [...prev, data]);
      setBody('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="font-medium">Comments</h3>

      <div className="space-y-3">
        {comments.map((c) => (
          <div
            key={c.comment_id}
            className="rounded-lg border border-gray-200 bg-gray-50 p-4"
          >
            <div className="mb-1 flex flex-wrap items-center gap-2">
              {c.author_label && (
                <span className="rounded bg-gray-200 px-1.5 py-0.5 text-xs font-medium text-gray-700">
                  {c.author_label}
                </span>
              )}
              {isInternal && (
                <span className="rounded bg-gray-200 px-1.5 py-0.5 text-xs text-gray-700">
                  {c.visibility}
                </span>
              )}
              <span className="text-xs text-gray-500">
                {formatDate(c.created_at)}
              </span>
            </div>
            <p className="whitespace-pre-wrap text-sm">{c.body}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {isInternal && (
          <div>
            <label className="mb-1 block text-sm">Visibility</label>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as 'clinic_visible' | 'internal')}
              className="rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-900"
            >
              <option value="clinic_visible">Clinic visible</option>
              <option value="internal">Internal only</option>
            </select>
          </div>
        )}
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          placeholder="Add a comment..."
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={submitting || !body.trim()}
          className="rounded-md bg-[#1e3a5f] px-4 py-2 text-sm font-medium text-white hover:bg-[#2a4a6f] disabled:opacity-50"
        >
          {submitting ? 'Sending...' : 'Add comment'}
        </button>
      </form>
    </div>
  );
}
