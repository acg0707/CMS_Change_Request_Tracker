import { Suspense } from 'react';
import { requireInternal, canAssignTickets } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import TicketListContent from '@/components/ticket-list-content';
import TicketViews from '@/components/ticket-views';
import FiltersPopover from '@/components/filters-popover';
import { resolveAssigneeDisplayMap } from '@/lib/assignee-display';

type SortKey = 'date' | 'page' | 'issue' | 'status' | 'clinic' | 'assignee';

export default async function InternalTicketsPage({
  searchParams,
}: {
  searchParams: Promise<{
    view?: string;
    sort?: string;
    order?: string;
    page?: string;
    clinic_id?: string;
    status?: string;
    assigned_to?: string;
  }>;
}) {
  const user = await requireInternal();
  const supabase = await createClient();
  const params = await searchParams;

  const view = params.view ?? 'open';
  const sort = (params.sort ?? 'date') as SortKey;
  const order = params.order === 'asc' ? 'asc' : 'desc';

  let query = supabase
    .from('tickets')
    .select('ticket_id, clinic_id, page, issue, status, assigned_to, created_at, clinics(clinic_name)');

  const viewToStatus: Record<string, string> = {
    pending: 'Pending',
    in_progress: 'In progress',
    needs_dev_change: 'Needs dev change',
    client_review: 'Client review',
    follow_up_needed: 'Follow up needed',
    resolved: 'Resolved',
  };
  if (params.status) {
    query = query.eq('status', params.status);
  } else if (view === 'open') {
    query = query.neq('status', 'Resolved');
  } else if (view === 'resolved') {
    query = query.eq('status', 'Resolved');
  } else if (view !== 'all' && viewToStatus[view]) {
    query = query.eq('status', viewToStatus[view]);
  }

  if (params.page) query = query.eq('page', params.page);
  if (params.clinic_id) query = query.eq('clinic_id', params.clinic_id);
  if (params.assigned_to) {
    if (params.assigned_to === '__unassigned__') {
      query = query.is('assigned_to', null);
    } else {
      query = query.eq('assigned_to', params.assigned_to);
    }
  }

  const sortColumn =
    sort === 'date'
      ? 'created_at'
      : sort === 'page'
        ? 'page'
        : sort === 'issue'
          ? 'issue'
          : sort === 'status'
            ? 'status'
            : 'created_at';
  if (sort !== 'clinic' && sort !== 'assignee') {
    query = query.order(sortColumn, { ascending: order === 'asc' });
  } else {
    query = query.order('created_at', { ascending: false }); // fallback for client-side sort
  }

  const { data: rawTickets, error } = await query;

  const assigneeMap = await resolveAssigneeDisplayMap(
    (rawTickets || []).map((t) => (t as { assigned_to?: string | null }).assigned_to)
  );

  const ticketsWithAssignees = (rawTickets || []).map((t) => {
    const row = t as Record<string, unknown> & { assigned_to?: string | null };
    return {
      ...row,
      assignee_full_name: row.assigned_to ? assigneeMap.get(row.assigned_to) ?? 'Unknown' : null,
    };
  }) as {
    ticket_id: string;
    clinic_id: string;
    page: string;
    issue: string | null;
    status: string;
    created_at: string;
    clinics: { clinic_name?: string } | null;
    assigned_to?: string | null;
    assignee_full_name: string | null;
  }[];

  let tickets = ticketsWithAssignees;
  if (tickets && sort === 'clinic') {
    tickets = [...tickets].sort((a, b) => {
      const an = ((a as { clinics?: { clinic_name?: string } }).clinics?.clinic_name ?? '').toLowerCase();
      const bn = ((b as { clinics?: { clinic_name?: string } }).clinics?.clinic_name ?? '').toLowerCase();
      const cmp = an.localeCompare(bn);
      return order === 'asc' ? cmp : -cmp;
    });
  } else if (tickets && sort === 'assignee') {
    tickets = [...tickets].sort((a, b) => {
      const an = ((a as { assignee_full_name?: string }).assignee_full_name ?? '').toLowerCase();
      const bn = ((b as { assignee_full_name?: string }).assignee_full_name ?? '').toLowerCase();
      const cmp = an.localeCompare(bn);
      return order === 'asc' ? cmp : -cmp;
    });
  }

  let countQuery = supabase.from('tickets').select('status');
  if (params.page) countQuery = countQuery.eq('page', params.page);
  if (params.clinic_id) countQuery = countQuery.eq('clinic_id', params.clinic_id);
  if (params.assigned_to) {
    if (params.assigned_to === '__unassigned__') {
      countQuery = countQuery.is('assigned_to', null);
    } else {
      countQuery = countQuery.eq('assigned_to', params.assigned_to);
    }
  }
  const { data: countTickets } = await countQuery;
  const counts = { open: 0, pending: 0, in_progress: 0, needs_dev_change: 0, client_review: 0, follow_up_needed: 0, resolved: 0, all: 0 };
  for (const t of countTickets || []) {
    counts.all++;
    if (t.status === 'Resolved') counts.resolved++;
    else counts.open++;
    if (t.status === 'Pending') counts.pending++;
    if (t.status === 'In progress') counts.in_progress++;
    if (t.status === 'Needs dev change') counts.needs_dev_change++;
    if (t.status === 'Client review') counts.client_review++;
    if (t.status === 'Follow up needed') counts.follow_up_needed++;
  }

  const { data: clinics } = await supabase
    .from('clinics')
    .select('clinic_id, clinic_name')
    .order('clinic_name');

  const service = createServiceClient();
  const { data: internalProfiles } = await service
    .from('profiles')
    .select('user_id, full_name')
    .eq('role', 'internal')
    .order('full_name');

  const assignees = (internalProfiles || []).map((p) => ({
    user_id: p.user_id,
    full_name: p.full_name?.trim() || 'Unknown',
  }));

  if (error) {
    return (
      <div className="p-8">
        <p className="text-red-600">Error loading tickets: {error.message}</p>
      </div>
    );
  }

  const hasActiveFilters = !!(
    params.page ||
    params.clinic_id ||
    params.status ||
    params.assigned_to
  );

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="mx-auto flex w-full max-w-6xl shrink-0 flex-col gap-6 px-8 pt-8 pb-2">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-xl font-semibold text-gray-900">All Change Requests</h1>
          <div className="flex items-center gap-3">
            <Suspense fallback={null}>
              <FiltersPopover
                clinics={clinics || []}
                assignees={assignees}
                hasActiveFilters={hasActiveFilters}
              />
            </Suspense>
          </div>
        </div>
      </div>
      <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 gap-6 px-8 pb-8 pt-4">
        <div className="w-48 shrink-0">
          <Suspense fallback={<div className="h-48 animate-pulse rounded bg-gray-100" />}>
            <TicketViews
              basePath="/internal/tickets"
              currentView={view}
              counts={counts}
            />
          </Suspense>
        </div>
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          {!tickets?.length ? (
            <div className="flex flex-1 items-center justify-center rounded-lg border border-gray-200 bg-white">
              <p className="text-gray-500">No tickets match your filters.</p>
            </div>
          ) : (
            <Suspense fallback={<div className="h-64 flex-1 animate-pulse rounded bg-gray-100" />}>
              <TicketListContent
                tickets={tickets}
                isInternal={true}
                basePath="/internal/tickets"
                sort={sort}
                order={order}
                assignees={assignees}
                canAssign={canAssignTickets(user.profile)}
              />
            </Suspense>
          )}
        </div>
      </div>
    </div>
  );
}
