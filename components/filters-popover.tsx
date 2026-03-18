'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PAGES, TICKET_STATUSES, PAGE_LABELS } from '@/lib/constants';

type FiltersPopoverProps = {
  clinics: { clinic_id: string; clinic_name: string }[];
  assignees: string[];
  hasActiveFilters: boolean;
};

export default function FiltersPopover({ clinics, assignees, hasActiveFilters }: FiltersPopoverProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const pageFilter = searchParams.get('page') ?? '';
  const clinicFilter = searchParams.get('clinic_id') ?? '';
  const statusFilter = searchParams.get('status') ?? '';
  const assigneeFilter = searchParams.get('assigned_to') ?? '';

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/internal/tickets?${params.toString()}`);
  }

  const pageOptions = [...PAGES, 'about'] as const;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
          hasActiveFilters
            ? 'border border-[#1e3a5f] bg-[#1e3a5f] text-white hover:bg-[#2a4a6f]'
            : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
        }`}
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        Filter
        {hasActiveFilters && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-xs">
            !
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-10 mt-2 w-80 rounded-lg border border-gray-200 bg-white p-4 shadow-lg">
          <h3 className="mb-3 text-sm font-semibold text-gray-900">Filters</h3>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Page</label>
              <select
                value={pageFilter}
                onChange={(e) => updateFilter('page', e.target.value)}
                className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm text-gray-900"
              >
                <option value="">All</option>
                {pageOptions.map((p) => (
                  <option key={p} value={p}>
                    {PAGE_LABELS[p] ?? p}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Clinic</label>
              <select
                value={clinicFilter}
                onChange={(e) => updateFilter('clinic_id', e.target.value)}
                className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm text-gray-900"
              >
                <option value="">All</option>
                {clinics.map((c) => (
                  <option key={c.clinic_id} value={c.clinic_id}>
                    {c.clinic_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => updateFilter('status', e.target.value)}
                className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm text-gray-900"
              >
                <option value="">All</option>
                {TICKET_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Assigned to</label>
              <select
                value={assigneeFilter}
                onChange={(e) => updateFilter('assigned_to', e.target.value)}
                className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm text-gray-900"
              >
                <option value="">All</option>
                {assignees.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                const params = new URLSearchParams(searchParams);
                params.delete('page');
                params.delete('clinic_id');
                params.delete('status');
                params.delete('assigned_to');
                router.push(`/internal/tickets?${params.toString()}`);
                setOpen(false);
              }}
              className="mt-4 w-full rounded border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
