'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type InternalUser = { user_id: string; full_name: string };

type AssignmentSelectProps = {
  ticketId: string;
  assignedTo: string | null;
  internalUsers: InternalUser[];
};

export default function AssignmentSelect({
  ticketId,
  assignedTo,
  internalUsers,
}: AssignmentSelectProps) {
  const [value, setValue] = useState(assignedTo ?? '');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleChange(newValue: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/tickets/${ticketId}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assigned_to: newValue || null,
        }),
      });
      if (res.ok) {
        setValue(newValue);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2 self-end">
      <label htmlFor="assignment" className="text-sm font-medium text-gray-500">
        Assign:
      </label>
      <select
        id="assignment"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        disabled={loading}
        className="rounded border border-gray-300 px-2 py-1 text-sm text-gray-900"
      >
        <option value="">Unassigned</option>
        {internalUsers.map((u) => (
          <option key={u.user_id} value={u.user_id}>
            {u.full_name}
          </option>
        ))}
      </select>
      {loading && <span className="text-xs text-gray-500">Updating...</span>}
    </div>
  );
}
