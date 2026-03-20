'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export type InternalUser = { user_id: string; full_name: string };

type AssignmentTableSelectProps = {
  ticketId: string;
  assignedTo: string | null;
  assigneeFullName: string | null;
  internalUsers: InternalUser[];
};

export function AssignmentPill({
  assigneeFullName,
}: {
  assigneeFullName: string | null;
}) {
  const label = assigneeFullName || 'Unassigned';
  const hasAssignee = !!assigneeFullName;
  return (
    <span
      className={`inline-flex max-w-full items-center justify-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium leading-snug ${
        hasAssignee
          ? 'bg-slate-100 text-slate-800 border-slate-200'
          : 'bg-gray-100 text-gray-600 border-gray-200'
      }`}
      title={label}
    >
      {label}
    </span>
  );
}

export default function AssignmentTableSelect({
  ticketId,
  assignedTo,
  assigneeFullName,
  internalUsers,
}: AssignmentTableSelectProps) {
  const [value, setValue] = useState(assignedTo ?? '');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleChange(newValue: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/tickets/${ticketId}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assigned_to: newValue || null }),
      });
      if (res.ok) {
        setValue(newValue);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  const displayLabel = value
    ? internalUsers.find((u) => u.user_id === value)?.full_name ?? assigneeFullName ?? 'Unknown'
    : 'Unassigned';

  const pillBase =
    'inline-flex max-w-full items-center justify-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium leading-snug';
  const pillStyle = value
    ? 'bg-slate-100 text-slate-800 border-slate-200'
    : 'bg-gray-100 text-gray-600 border-gray-200';

  return (
    <select
      value={value}
      onChange={(e) => handleChange(e.target.value)}
      disabled={loading}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
      className={`${pillBase} ${pillStyle} cursor-pointer appearance-none bg-[length:12px] bg-[right_6px_center] bg-no-repeat pr-7 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 disabled:cursor-not-allowed`}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
      }}
      title={displayLabel}
    >
      <option value="">Unassigned</option>
      {internalUsers.map((u) => (
        <option key={u.user_id} value={u.user_id}>
          {u.full_name}
        </option>
      ))}
    </select>
  );
}
