'use client';

import { useRouter } from 'next/navigation';
import { formatDateOnly } from '@/lib/date';
import { PAGE_LABELS, ISSUE_LABELS } from '@/lib/constants';
import StatusChip from '@/components/status-chip';
import AssignmentTableSelect, { AssignmentPill } from '@/components/assignment-table-select';

type SortKey = 'date' | 'page' | 'issue' | 'status' | 'clinic' | 'assignee';

type ClinicTicket = {
  ticket_id: string;
  page: string;
  issue: string | null;
  status: string;
  created_at: string;
};

type InternalUser = { user_id: string; full_name: string };

type InternalTicket = ClinicTicket & {
  clinic_id: string;
  clinics: { clinic_name?: string } | null;
  assigned_to?: string | null;
  assignee_full_name?: string | null;
};

type TicketTableProps = {
  tickets: ClinicTicket[] | InternalTicket[];
  isInternal: boolean;
  basePath: string;
  sort: SortKey;
  order: 'asc' | 'desc';
  onSort: (sort: SortKey, order: 'asc' | 'desc') => void;
  assignees?: InternalUser[];
  canAssign?: boolean;
};

function SortIcon({ direction }: { direction: 'asc' | 'desc' | null }) {
  if (!direction) {
    return (
      <span className="ml-1 inline-block text-gray-400">
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      </span>
    );
  }
  return (
    <span className="ml-1 inline-block text-brand">
      {direction === 'asc' ? (
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      ) : (
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      )}
    </span>
  );
}

function SortableHead({
  label,
  sortKey,
  currentSort,
  currentOrder,
  onSort,
}: {
  label: string;
  sortKey: SortKey;
  currentSort: SortKey;
  currentOrder: 'asc' | 'desc';
  onSort: (sort: SortKey, order: 'asc' | 'desc') => void;
}) {
  const isActive = currentSort === sortKey;
  const direction = isActive ? currentOrder : null;
  return (
    <th className="px-4 py-3 text-left">
      <button
        type="button"
        onClick={() => onSort(sortKey, isActive && currentOrder === 'asc' ? 'desc' : 'asc')}
        className="flex items-center font-medium text-gray-700 hover:text-brand"
      >
        {label}
        <SortIcon direction={direction} />
      </button>
    </th>
  );
}

export default function TicketTable({
  tickets,
  isInternal,
  basePath,
  sort,
  order,
  onSort,
  assignees = [],
  canAssign = false,
}: TicketTableProps) {
  const router = useRouter();

  if (!tickets.length) {
    return null;
  }

  const colClasses = 'px-4 py-3';

  return (
    <div className="min-h-0 flex-1 overflow-auto rounded-lg border border-gray-200">
      <table className="min-w-full table-fixed">
        <colgroup>
          {isInternal && <col className="w-[14%]" />}
          {isInternal && <col className="w-[14%]" />}
          <col className={isInternal ? 'w-[18%]' : 'w-[24%]'} />
          <col className={isInternal ? 'w-[20%]' : 'w-[26%]'} />
          <col className={isInternal ? 'w-[16%]' : 'w-[24%]'} />
          <col className={isInternal ? 'w-[18%]' : 'w-[26%]'} />
        </colgroup>
        <thead className="sticky top-0 z-10 border-b border-gray-200 bg-gray-50">
          <tr>
            {isInternal && (
              <SortableHead
                label="Clinic"
                sortKey="clinic"
                currentSort={sort}
                currentOrder={order}
                onSort={onSort}
              />
            )}
            <SortableHead label="Page" sortKey="page" currentSort={sort} currentOrder={order} onSort={onSort} />
            <SortableHead label="Issue" sortKey="issue" currentSort={sort} currentOrder={order} onSort={onSort} />
            {isInternal && (
              <th className="whitespace-nowrap px-4 py-3 text-left">
                <button
                  type="button"
                  onClick={() => onSort('assignee', sort === 'assignee' && order === 'asc' ? 'desc' : 'asc')}
                  className="flex items-center font-medium text-gray-700 hover:text-brand"
                >
                  Assign
                  <span className="ml-1 inline-block text-brand">
                    {sort === 'assignee' ? (
                      order === 'asc' ? (
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      ) : (
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      )
                    ) : (
                      <svg className="h-3.5 w-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                    )}
                  </span>
                </button>
              </th>
            )}
            <SortableHead label="Status" sortKey="status" currentSort={sort} currentOrder={order} onSort={onSort} />
            <SortableHead label="Date" sortKey="date" currentSort={sort} currentOrder={order} onSort={onSort} />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
            {tickets.map((ticket) => {
              const t = ticket as InternalTicket;
              const clinicName = t.clinics?.clinic_name ?? '';
              return (
                <tr
                  key={ticket.ticket_id}
                  role="button"
                  tabIndex={0}
                  onClick={() => router.push(`${basePath}/${ticket.ticket_id}`)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      router.push(`${basePath}/${ticket.ticket_id}`);
                    }
                  }}
                  className="cursor-pointer transition hover:bg-gray-50"
                >
                  {isInternal && (
                    <td className={`${colClasses} text-sm text-gray-600`}>{clinicName || '—'}</td>
                  )}
                  <td className={`${colClasses} text-sm text-gray-900`}>
                    {PAGE_LABELS[ticket.page] ?? ticket.page}
                  </td>
                  <td className={`${colClasses} text-sm text-gray-600`}>
                    {ISSUE_LABELS[ticket.issue ?? ''] ?? ticket.issue ?? '—'}
                  </td>
                  {isInternal && (
                    <td
                      className={`${colClasses} align-top`}
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                    >
                      {canAssign ? (
                        <AssignmentTableSelect
                          ticketId={ticket.ticket_id}
                          assignedTo={t.assigned_to ?? null}
                          assigneeFullName={t.assignee_full_name ?? null}
                          internalUsers={assignees}
                        />
                      ) : (
                        <AssignmentPill assigneeFullName={t.assignee_full_name ?? null} />
                      )}
                    </td>
                  )}
                  <td className={`${colClasses} align-top`}>
                    <StatusChip status={ticket.status} />
                  </td>
                  <td className={`${colClasses} text-sm text-gray-500`}>
                    {formatDateOnly(ticket.created_at)}
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
}
