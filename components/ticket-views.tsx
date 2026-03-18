'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const VIEWS = [
  { key: 'open', label: 'Open' },
  { key: 'pending', label: 'Pending' },
  { key: 'in_progress', label: 'In progress' },
  { key: 'needs_dev_change', label: 'Needs dev change' },
  { key: 'client_review', label: 'Client review' },
  { key: 'follow_up_needed', label: 'Follow up needed' },
  { key: 'resolved', label: 'Resolved' },
  { key: 'all', label: 'All' },
] as const;

type Counts = {
  open: number;
  pending: number;
  in_progress: number;
  needs_dev_change: number;
  client_review: number;
  follow_up_needed: number;
  resolved: number;
  all: number;
};

type TicketViewsProps = {
  basePath: string;
  currentView: string;
  counts: Counts;
};

export default function TicketViews({ basePath, currentView, counts }: TicketViewsProps) {
  const searchParams = useSearchParams();

  return (
    <div className="space-y-1">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
        Ticket Views
      </h2>
      {VIEWS.map((v) => {
        const count = counts[v.key as keyof Counts] ?? 0;
        const isActive = currentView === v.key;
        const params = new URLSearchParams(searchParams);
        params.set('view', v.key);
        return (
          <Link
            key={v.key}
            href={`${basePath}?${params.toString()}`}
            className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition ${
              isActive
                ? 'bg-[#1e3a5f] font-medium text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <span>{v.label}</span>
            <span className={`tabular-nums ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
              {count}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
