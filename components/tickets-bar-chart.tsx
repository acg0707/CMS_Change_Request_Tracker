'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { TicketTimeBucket } from '@/lib/analytics';
import { TICKET_STATUSES, STATUS_COLORS } from '@/lib/constants';

const STATUS_FILL: Record<string, string> = {};
for (const s of TICKET_STATUSES) {
  const c = STATUS_COLORS[s] ?? '';
  if (c.includes('amber')) STATUS_FILL[s] = '#f59e0b';
  else if (c.includes('blue')) STATUS_FILL[s] = '#3b82f6';
  else if (c.includes('purple')) STATUS_FILL[s] = '#a855f7';
  else if (c.includes('orange')) STATUS_FILL[s] = '#f97316';
  else if (c.includes('red')) STATUS_FILL[s] = '#ef4444';
  else if (c.includes('emerald')) STATUS_FILL[s] = '#10b981';
  else STATUS_FILL[s] = '#6b7280';
}

type TicketsBarChartProps = {
  data: TicketTimeBucket[];
};

/** Stacked bottom → top: Pending … Resolved (Resolved on top). */
const STACK_ORDER = [...TICKET_STATUSES] as readonly string[];

export default function TicketsBarChart({ data }: TicketsBarChartProps) {
  return (
    <div className="h-[min(28rem,55vh)] w-full min-h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 12, right: 8, bottom: 8, left: 4 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          <XAxis
            dataKey="bucketLabel"
            tickLine={false}
            tick={{ fill: '#6b7280', fontSize: 12 }}
            interval={0}
            height={48}
          />
          <YAxis allowDecimals={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} width={40} />
          <Tooltip
            contentStyle={{ borderRadius: 8, borderColor: '#e5e7eb' }}
            labelStyle={{ fontWeight: 600 }}
          />
          <Legend wrapperStyle={{ paddingTop: 16 }} />
          {STACK_ORDER.map((status, index) => (
            <Bar
              key={status}
              dataKey={status}
              name={status}
              stackId="status"
              fill={STATUS_FILL[status]}
              radius={index === STACK_ORDER.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
