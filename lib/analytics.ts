import { createServiceClient } from '@/lib/supabase/service';
import { TICKET_STATUSES } from '@/lib/constants';

export type AnalyticsRangeKey = '28d' | '3m' | '6m' | '12m';
export type AnalyticsGroupBy = 'week' | 'month';

/** Row for stacked bar chart: label + one numeric field per status. */
export type TicketTimeBucket = {
  bucketLabel: string;
  bucketStart: string;
} & Record<(typeof TICKET_STATUSES)[number], number>;

export type TicketStatusSlice = {
  status: string;
  count: number;
};

export type TicketKPI = {
  allTickets: number;
  resolved: number;
  ongoing: number;
};

export type TicketAnalyticsResult = {
  kpi: TicketKPI;
  timeBuckets: TicketTimeBucket[];
  statusDistribution: TicketStatusSlice[];
};

export type TicketAnalyticsFilters = {
  clinicId?: string;
  startDate: string;
  endDate: string;
  groupBy: AnalyticsGroupBy;
  ticketStatus?: string;
  /** When true (28d range), chart always uses 4 fixed weekly buckets. */
  rangeKey?: AnalyticsRangeKey;
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function computeDateRange(range: AnalyticsRangeKey): {
  startDate: string;
  endDate: string;
  groupBy: AnalyticsGroupBy;
} {
  const now = new Date();
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));

  if (range === '28d') {
    const start = new Date(end.getTime() - 27 * MS_PER_DAY);
    return {
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      groupBy: 'week',
    };
  }

  const monthsBack = range === '3m' ? 3 : range === '6m' ? 6 : 12;
  const start = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth() - monthsBack + 1, 1, 0, 0, 0, 0));
  return {
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    groupBy: 'month',
  };
}

/** Returns status distribution for the given clinic (or all clinics). */
export async function getTicketStatusDistribution(clinicId?: string): Promise<TicketStatusSlice[]> {
  const client = createServiceClient();
  const base = client.from('tickets').select('status');
  const query = clinicId ? base.eq('clinic_id', clinicId) : base;
  const { data: tickets, error } = await query;
  if (error) throw error;

  const statusCounts: Record<string, number> = {};
  for (const status of TICKET_STATUSES) {
    statusCounts[status] = 0;
  }
  for (const t of tickets || []) {
    const s = t.status as string;
    statusCounts[s] = (statusCounts[s] ?? 0) + 1;
  }

  return Object.entries(statusCounts)
    .filter(([, count]) => (count as number) > 0)
    .map(([status, count]) => ({ status, count: count as number }));
}

function emptyCounts(): Record<string, number> {
  const o: Record<string, number> = {};
  for (const s of TICKET_STATUSES) o[s] = 0;
  return o;
}

function is28DayRange(startDate: string, endDate: string): boolean {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const days = (end - start) / MS_PER_DAY;
  return days >= 27 && days <= 29;
}

function formatShortMonthDay(date: Date): string {
  const month = date.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' });
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${month} ${day}`;
}

function formatMonthYear(date: Date): string {
  const month = date.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' });
  const year = date.getUTCFullYear();
  return `${month} ${year}`;
}

function startOfMonthUtc(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function listMonthsInRange(startIso: string, endIso: string): { key: string; label: string }[] {
  const start = new Date(startIso);
  const end = new Date(endIso);
  let y = start.getUTCFullYear();
  let m = start.getUTCMonth();
  const endY = end.getUTCFullYear();
  const endM = end.getUTCMonth();
  const out: { key: string; label: string }[] = [];
  while (y < endY || (y === endY && m <= endM)) {
    const key = new Date(Date.UTC(y, m, 1)).toISOString();
    out.push({ key, label: formatMonthYear(new Date(key)) });
    m += 1;
    if (m > 11) {
      m = 0;
      y += 1;
    }
  }
  return out;
}

function rowFromCounts(label: string, startIso: string, counts: Record<string, number>): TicketTimeBucket {
  const row = {
    bucketLabel: label,
    bucketStart: startIso,
  } as TicketTimeBucket;
  for (const s of TICKET_STATUSES) {
    (row as unknown as Record<string, number>)[s] = counts[s] ?? 0;
  }
  return row;
}

export async function getTicketAnalytics(filters: TicketAnalyticsFilters): Promise<TicketAnalyticsResult> {
  const client = createServiceClient();

  const base = client
    .from('tickets')
    .select('ticket_id, status, created_at')
    .gte('created_at', filters.startDate)
    .lte('created_at', filters.endDate);

  const filtered = filters.clinicId ? base.eq('clinic_id', filters.clinicId) : base;
  const query = filters.ticketStatus && filters.ticketStatus !== 'All' ? filtered.eq('status', filters.ticketStatus) : filtered;

  const { data: tickets, error } = await query;
  if (error) {
    throw error;
  }

  const kpi: TicketKPI = {
    allTickets: 0,
    resolved: 0,
    ongoing: 0,
  };

  const statusCountsGlobal: Record<string, number> = {};
  for (const status of TICKET_STATUSES) {
    statusCountsGlobal[status] = 0;
  }

  const rk = filters.rangeKey;
  const useFourWeeks = rk === '28d' || (rk == null && is28DayRange(filters.startDate, filters.endDate));
  const useMonthlyChart = rk === '3m' || rk === '6m' || rk === '12m';

  const rangeStartMs = useFourWeeks ? new Date(filters.startDate).getTime() : 0;

  type Bucket = { label: string; startIso: string; counts: Record<string, number> };
  const bucketMap = new Map<string, Bucket>();

  if (useFourWeeks) {
    for (let i = 1; i <= 4; i++) {
      const weekStart = new Date(rangeStartMs + (i - 1) * 7 * MS_PER_DAY);
      const label = `Week of ${formatShortMonthDay(weekStart)}`;
      bucketMap.set(`w${i}`, {
        label,
        startIso: weekStart.toISOString(),
        counts: emptyCounts(),
      });
    }
  } else if (useMonthlyChart) {
    const months = listMonthsInRange(filters.startDate, filters.endDate);
    for (const { key, label } of months) {
      bucketMap.set(key, { label, startIso: key, counts: emptyCounts() });
    }
  } else {
    const months = listMonthsInRange(filters.startDate, filters.endDate);
    for (const { key, label } of months) {
      bucketMap.set(key, { label, startIso: key, counts: emptyCounts() });
    }
  }

  for (const t of tickets || []) {
    const status = t.status as string;
    kpi.allTickets++;
    if (status === 'Resolved') {
      kpi.resolved++;
    }
    statusCountsGlobal[status] = (statusCountsGlobal[status] ?? 0) + 1;

    const created = new Date(t.created_at as string);

    if (useFourWeeks) {
      const dayOffset = (created.getTime() - rangeStartMs) / MS_PER_DAY;
      const weekIndex = Math.min(3, Math.max(0, Math.floor(dayOffset / 7)));
      const b = bucketMap.get(`w${weekIndex + 1}`)!;
      b.counts[status] = (b.counts[status] ?? 0) + 1;
    } else {
      const mk = startOfMonthUtc(created).toISOString();
      let b = bucketMap.get(mk);
      if (!b) {
        b = {
          label: formatMonthYear(startOfMonthUtc(created)),
          startIso: mk,
          counts: emptyCounts(),
        };
        bucketMap.set(mk, b);
      }
      b.counts[status] = (b.counts[status] ?? 0) + 1;
    }
  }

  kpi.ongoing = kpi.allTickets - kpi.resolved;

  let timeBuckets: TicketTimeBucket[];

  if (useFourWeeks) {
    timeBuckets = [1, 2, 3, 4].map((i) => {
      const b = bucketMap.get(`w${i}`)!;
      return rowFromCounts(b.label, b.startIso, b.counts);
    });
  } else {
    const months = listMonthsInRange(filters.startDate, filters.endDate);
    timeBuckets = months.map(({ key, label }) => {
      const b = bucketMap.get(key) ?? { label, startIso: key, counts: emptyCounts() };
      return rowFromCounts(b.label, b.startIso, b.counts);
    });
  }

  const statusDistribution: TicketStatusSlice[] = Object.entries(statusCountsGlobal)
    .filter(([, count]) => (count as number) > 0)
    .map(([st, count]) => ({
      status: st,
      count: count as number,
    }));

  return {
    kpi,
    timeBuckets,
    statusDistribution,
  };
}
