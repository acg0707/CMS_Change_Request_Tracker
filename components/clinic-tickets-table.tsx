'use client';

import { useMemo, useState } from 'react';
import TicketTable from '@/components/ticket-table';
import { PAGE_LABELS, ISSUE_LABELS } from '@/lib/constants';

type SortKey = 'date' | 'page' | 'issue' | 'status' | 'clinic' | 'assignee';

type ClinicTicket = {
  ticket_id: string;
  page: string;
  issue: string | null;
  status: string;
  created_at: string;
};

type ClinicTicketsTableProps = {
  tickets: ClinicTicket[];
};

export default function ClinicTicketsTable({ tickets }: ClinicTicketsTableProps) {
  const [sort, setSort] = useState<SortKey>('date');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');

  const sorted = useMemo(() => {
    const arr = [...tickets];
    arr.sort((a, b) => {
      if (sort === 'date') {
        const ad = new Date(a.created_at).getTime();
        const bd = new Date(b.created_at).getTime();
        return order === 'asc' ? ad - bd : bd - ad;
      }
      if (sort === 'page') {
        const ap = (PAGE_LABELS[a.page] ?? a.page ?? '').toLowerCase();
        const bp = (PAGE_LABELS[b.page] ?? b.page ?? '').toLowerCase();
        const cmp = ap.localeCompare(bp);
        return order === 'asc' ? cmp : -cmp;
      }
      if (sort === 'issue') {
        const ai = (ISSUE_LABELS[a.issue ?? ''] ?? a.issue ?? '').toLowerCase();
        const bi = (ISSUE_LABELS[b.issue ?? ''] ?? b.issue ?? '').toLowerCase();
        const cmp = ai.localeCompare(bi);
        return order === 'asc' ? cmp : -cmp;
      }
      if (sort === 'status') {
        const as = (a.status ?? '').toLowerCase();
        const bs = (b.status ?? '').toLowerCase();
        const cmp = as.localeCompare(bs);
        return order === 'asc' ? cmp : -cmp;
      }
      // clinic sort is not used for clinic-specific view; fall back to date
      const ad = new Date(a.created_at).getTime();
      const bd = new Date(b.created_at).getTime();
      return order === 'asc' ? ad - bd : bd - ad;
    });
    return arr;
  }, [tickets, sort, order]);

  function handleSort(newSort: SortKey, newOrder: 'asc' | 'desc') {
    setSort(newSort);
    setOrder(newOrder);
  }

  return (
    <TicketTable
      tickets={sorted}
      isInternal={false}
      basePath="/internal/tickets"
      sort={sort}
      order={order}
      onSort={handleSort}
    />
  );
}

