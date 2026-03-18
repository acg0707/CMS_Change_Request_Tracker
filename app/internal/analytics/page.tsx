import { requireInternal } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import AnalyticsFilters from '@/components/analytics-filters';
import KPIStatCard from '@/components/kpi-stat-card';
import TicketsBarChart from '@/components/tickets-bar-chart';
import {
  computeDateRange,
  getTicketAnalytics,
  type AnalyticsRangeKey,
  type AnalyticsGroupBy,
} from '@/lib/analytics';

type AnalyticsSearchParams = {
  clinic_id?: string;
  range?: string;
  ticket_status?: string;
};

export default async function InternalAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<AnalyticsSearchParams>;
}) {
  await requireInternal();
  const supabase = await createClient();
  const params = await searchParams;

  const rangeKey: AnalyticsRangeKey =
    (params.range as AnalyticsRangeKey) && ['28d', '3m', '6m', '12m'].includes(params.range as string)
      ? (params.range as AnalyticsRangeKey)
      : '28d';

  const baseRange = computeDateRange(rangeKey);
  const groupBy: AnalyticsGroupBy = rangeKey === '28d' ? 'week' : 'month';

  const analytics = await getTicketAnalytics({
    clinicId: params.clinic_id,
    startDate: baseRange.startDate,
    endDate: baseRange.endDate,
    groupBy,
    ticketStatus: params.ticket_status,
    rangeKey,
  });

  const { data: clinics } = await supabase
    .from('clinics')
    .select('clinic_id, clinic_name')
    .order('clinic_name');

  const chartCaption =
    rangeKey === '28d'
      ? 'Weekly breakdown for the last 28 days'
      : 'Monthly breakdown over the selected period';

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-auto bg-gray-50/80">
      <div className="mx-auto w-full max-w-[min(100%,88rem)] px-6 py-8 sm:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
              Analytics dashboard
            </h1>
            <p className="mt-1.5 max-w-2xl text-sm text-gray-600">
              Monitor CMS change requests and team performance.
            </p>
          </div>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <KPIStatCard
            title="All tickets"
            value={analytics.kpi.allTickets}
            subtitle="In selected scope"
            variant="muted"
          />
          <KPIStatCard
            title="Resolved"
            value={analytics.kpi.resolved}
            subtitle="Completed"
            variant="muted"
          />
          <KPIStatCard
            title="Ongoing"
            value={analytics.kpi.ongoing}
            subtitle="Not resolved"
            variant="muted"
          />
        </div>

        <div className="mb-6 rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm">
          <AnalyticsFilters clinics={clinics || []} />
        </div>

        <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Ticket volume over time</h2>
            <p className="mt-1 text-sm text-gray-500">{chartCaption}</p>
          </div>
          <TicketsBarChart data={analytics.timeBuckets} />
        </div>
      </div>
    </div>
  );
}
