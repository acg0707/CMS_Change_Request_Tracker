import Link from 'next/link';
import { Suspense } from 'react';
import { requireInternal } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

export default async function InternalClinicsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; state?: string }>;
}) {
  await requireInternal();
  const supabase = await createClient();
  const params = await searchParams;

  let query = supabase
    .from('clinics')
    .select('clinic_id, clinic_name, city, state')
    .order('clinic_name');

  if (params.state) {
    query = query.eq('state', params.state);
  }
  if (params.q?.trim()) {
    query = query.ilike('clinic_name', `%${params.q.trim()}%`);
  }

  const { data: clinics, error } = await query;

  const { data: stateRows } = await supabase
    .from('clinics')
    .select('state')
    .not('state', 'is', null);
  const states = [...new Set((stateRows || []).map((r) => r.state).filter(Boolean))].sort() as string[];

  if (error) {
    return (
      <div className="p-8">
        <p className="text-red-600">Error loading clinics: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-8 text-2xl font-semibold text-gray-900">Clients</h1>

        <Suspense fallback={<div className="mb-6 h-16 animate-pulse rounded bg-gray-200" />}>
          <ClinicsFilters states={states} initialQ={params.q} initialState={params.state} />
        </Suspense>

        {!clinics?.length ? (
          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
            <p className="text-gray-500">No clients match your filters.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {clinics.map((clinic) => (
              <Link
                key={clinic.clinic_id}
                href={`/internal/clinics/${clinic.clinic_id}`}
                className="block rounded-lg border border-gray-200 bg-white p-4 transition hover:border-gray-300 hover:shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-gray-900">{clinic.clinic_name}</span>
                    {clinic.city && (
                      <span className="ml-2 text-sm text-gray-500">{clinic.city}</span>
                    )}
                    {clinic.state && (
                      <span className="ml-2 text-sm text-gray-500">· {clinic.state}</span>
                    )}
                  </div>
                  <span className="text-sm text-gray-400">View →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ClinicsFilters({
  states,
  initialQ,
  initialState,
}: {
  states: string[];
  initialQ?: string;
  initialState?: string;
}) {
  return (
    <form method="get" className="mb-6 flex flex-wrap gap-4 rounded-lg border border-gray-200 bg-white p-4">
      <div>
        <label htmlFor="q" className="mb-1 block text-xs font-medium text-gray-500">
          Search by name
        </label>
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={initialQ}
          placeholder="Client name..."
          className="rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-900"
        />
      </div>
      <div>
        <label htmlFor="state" className="mb-1 block text-xs font-medium text-gray-500">
          State
        </label>
        <select
          id="state"
          name="state"
          defaultValue={initialState ?? ''}
          className="rounded border border-gray-300 px-2 py-1.5 text-sm text-gray-900"
        >
          <option value="">All</option>
          {states.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-end">
        <button
          type="submit"
          className="rounded-md bg-brand px-4 py-1.5 text-sm font-medium text-white hover:bg-brand-hover"
        >
          Filter
        </button>
      </div>
    </form>
  );
}
