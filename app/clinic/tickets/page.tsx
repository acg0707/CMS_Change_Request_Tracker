import Link from 'next/link';
import { Suspense } from 'react';
import { requireClinic } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import TicketListContent from '@/components/ticket-list-content';
import TicketViews from '@/components/ticket-views';

type SortKey = 'date' | 'page' | 'issue' | 'status';

export default async function ClinicTicketsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; sort?: string; order?: string }>;
}) {
  const user = await requireClinic();
  const supabase = await createClient();
  const params = await searchParams;

  const view = params.view ?? 'open';
  const sort = (params.sort ?? 'date') as SortKey;
  const order = params.order === 'asc' ? 'asc' : 'desc';

  let query = supabase
    .from('tickets')
    .select('ticket_id, page, issue, status, created_at')
    .eq('clinic_id', user.profile.clinic_id!);

  const viewToStatus: Record<string, string> = {
    pending: 'Pending',
    in_progress: 'In progress',
    needs_dev_change: 'Needs dev change',
    client_review: 'Client review',
    follow_up_needed: 'Follow up needed',
    resolved: 'Resolved',
  };
  if (view === 'open') {
    query = query.neq('status', 'Resolved');
  } else if (view === 'resolved') {
    query = query.eq('status', 'Resolved');
  } else if (view !== 'all' && viewToStatus[view]) {
    query = query.eq('status', viewToStatus[view]);
  }

  const sortColumn =
    sort === 'date' ? 'created_at' : sort === 'page' ? 'page' : sort === 'issue' ? 'issue' : 'status';
  query = query.order(sortColumn, { ascending: order === 'asc' });

  const { data: tickets, error } = await query;

  const { data: allForCounts } = await supabase
    .from('tickets')
    .select('status')
    .eq('clinic_id', user.profile.clinic_id!);

  const counts = { open: 0, pending: 0, in_progress: 0, needs_dev_change: 0, client_review: 0, follow_up_needed: 0, resolved: 0, all: 0 };
  for (const t of allForCounts || []) {
    counts.all++;
    if (t.status === 'Resolved') counts.resolved++;
    else counts.open++;
    if (t.status === 'Pending') counts.pending++;
    if (t.status === 'In progress') counts.in_progress++;
    if (t.status === 'Needs dev change') counts.needs_dev_change++;
    if (t.status === 'Client review') counts.client_review++;
    if (t.status === 'Follow up needed') counts.follow_up_needed++;
  }

  if (error) {
    return (
      <div className="p-8">
        <p className="text-red-600">Error loading tickets: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="mx-auto flex w-full max-w-6xl shrink-0 flex-col gap-6 px-8 pt-8 pb-2">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-xl font-semibold text-gray-900">My Change Requests</h1>
          <Link
            href="/clinic/tickets/new"
            className="shrink-0 rounded-md bg-[#1e3a5f] px-4 py-2 text-sm font-medium text-white hover:bg-[#2a4a6f]"
          >
            New Request
          </Link>
        </div>
      </div>
      <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 gap-6 px-8 pb-8 pt-4">
        <div className="w-48 shrink-0">
          <Suspense fallback={<div className="h-48 animate-pulse rounded bg-gray-100" />}>
            <TicketViews
              basePath="/clinic/tickets"
              currentView={view}
              counts={counts}
            />
          </Suspense>
        </div>
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          {!tickets?.length ? (
            <div className="flex flex-1 items-center justify-center rounded-lg border border-gray-200 bg-white">
              <div className="text-center">
                <p className="text-gray-500">No change requests match this view.</p>
                <Link
                  href="/clinic/tickets/new"
                  className="mt-4 inline-block text-sm font-medium text-[#1e3a5f] hover:underline"
                >
                  Create your first request
                </Link>
              </div>
            </div>
          ) : (
            <Suspense fallback={<div className="h-64 flex-1 animate-pulse rounded bg-gray-100" />}>
              <TicketListContent
                tickets={tickets}
                isInternal={false}
                basePath="/clinic/tickets"
                sort={sort}
                order={order}
              />
            </Suspense>
          )}
        </div>
      </div>
    </div>
  );
}
