'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { TICKET_STATUSES } from '@/lib/constants';

type AnalyticsFiltersProps = {
  clinics: { clinic_id: string; clinic_name: string }[];
};

const RANGE_OPTIONS = [
  { value: '28d', label: 'Last 28 days' },
  { value: '3m', label: 'Last 3 months' },
  { value: '6m', label: 'Last 6 months' },
  { value: '12m', label: 'Last 12 months' },
] as const;

export default function AnalyticsFilters({ clinics }: AnalyticsFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentRange = searchParams.get('range') ?? '28d';
  const currentClinic = searchParams.get('clinic_id') ?? '';
  const currentTicketStatus = searchParams.get('ticket_status') ?? '';

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/internal/analytics?${params.toString()}`);
  }

  function handleRangeChange(value: string) {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set('range', value);
    } else {
      params.delete('range');
    }
    router.push(`/internal/analytics?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-6 xl:flex-row xl:flex-wrap xl:items-end xl:gap-x-6 xl:gap-y-4">
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-gray-600">Clinic</label>
        <select
          value={currentClinic}
          onChange={(e) => updateParam('clinic_id', e.target.value)}
          className="min-w-[12rem] rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
        >
          <option value="">All clinics</option>
          {clinics.map((c) => (
            <option key={c.clinic_id} value={c.clinic_id}>
              {c.clinic_name}
            </option>
          ))}
        </select>
      </div>

      <div className="min-w-0 flex-1 xl:min-w-[20rem]">
        <label className="mb-2 block text-xs font-semibold text-gray-600">Time range</label>
        <div className="flex flex-wrap gap-2">
          {RANGE_OPTIONS.map((option) => {
            const isActive = currentRange === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleRangeChange(option.value)}
                className={`rounded-lg px-3.5 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'bg-brand text-white shadow-sm'
                    : 'border border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300 hover:bg-white'
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-gray-600">Ticket status</label>
        <select
          value={currentTicketStatus}
          onChange={(e) => updateParam('ticket_status', e.target.value)}
          className="min-w-[12rem] rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
        >
          <option value="">All statuses</option>
          {TICKET_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

