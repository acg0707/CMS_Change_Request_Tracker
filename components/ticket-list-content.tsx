'use client';

import { useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PAGE_LABELS, ISSUE_LABELS } from '@/lib/constants';
import TicketTable from './ticket-table';

type SortKey = 'date' | 'page' | 'issue' | 'status' | 'clinic';

type ClinicTicket = {
  ticket_id: string;
  page: string;
  issue: string | null;
  status: string;
  created_at: string;
};

type InternalTicket = ClinicTicket & {
  clinic_id: string;
  clinics: { clinic_name?: string } | null;
};

type TicketListContentProps = {
  tickets: ClinicTicket[] | InternalTicket[];
  isInternal: boolean;
  basePath: string;
  sort: SortKey;
  order: 'asc' | 'desc';
};

function matchesSearch(ticket: ClinicTicket | InternalTicket, q: string, isInternal: boolean): boolean {
  if (!q.trim()) return true;
  const lower = q.toLowerCase().trim();
  const pageLabel = (PAGE_LABELS[(ticket as ClinicTicket).page] ?? (ticket as ClinicTicket).page).toLowerCase();
  const issueLabel = (ISSUE_LABELS[(ticket as ClinicTicket).issue ?? ''] ?? (ticket as ClinicTicket).issue ?? '').toLowerCase();
  if (pageLabel.includes(lower) || issueLabel.includes(lower)) return true;
  if (isInternal) {
    const t = ticket as InternalTicket;
    const clinicName = (t.clinics?.clinic_name ?? '').toLowerCase();
    if (clinicName.includes(lower)) return true;
  }
  return false;
}

export default function TicketListContent({
  tickets,
  isInternal,
  basePath,
  sort,
  order,
}: TicketListContentProps) {
  const [search, setSearch] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  const filtered = useMemo(
    () => tickets.filter((t) => matchesSearch(t, search, isInternal)),
    [tickets, search, isInternal]
  );

  function onSort(newSort: SortKey, newOrder: 'asc' | 'desc') {
    const params = new URLSearchParams(searchParams);
    params.set('sort', newSort);
    params.set('order', newOrder);
    router.push(`${basePath}?${params.toString()}`);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-5 shrink-0">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="search"
            placeholder="Search tickets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2 pl-9 pr-4 text-sm text-gray-900 placeholder-gray-500"
          />
        </div>
      </div>
      {filtered.length === 0 ? (
        <div className="flex flex-1 items-center justify-center rounded-lg border border-gray-200 bg-white text-sm text-gray-500">
          {search ? 'No tickets match your search.' : 'No tickets to display.'}
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col">
          <TicketTable
            tickets={filtered}
            isInternal={isInternal}
            basePath={basePath}
            sort={sort}
            order={order}
            onSort={onSort}
          />
        </div>
      )}
    </div>
  );
}
