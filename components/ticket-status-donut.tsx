'use client';

import { Pie, PieChart, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { TicketStatusSlice } from '@/lib/analytics';
import { STATUS_COLORS } from '@/lib/constants';

type TicketStatusDonutProps = {
  title?: string;
  data: TicketStatusSlice[];
};

const DEFAULT_COLORS = ['#157145', '#0f766e', '#f97316', '#9333ea', '#b91c1c', '#0369a1'];

export default function TicketStatusDonut({ title = 'Tickets by status', data }: TicketStatusDonutProps) {
  const total = data.reduce((sum, slice) => sum + slice.count, 0);

  const slices = data.map((slice, index) => {
    const colorFromStatus = STATUS_COLORS[slice.status];
    let color = DEFAULT_COLORS[index % DEFAULT_COLORS.length];
    if (colorFromStatus?.includes('bg-amber-')) color = '#f59e0b';
    else if (colorFromStatus?.includes('bg-blue-')) color = '#3b82f6';
    else if (colorFromStatus?.includes('bg-purple-')) color = '#a855f7';
    else if (colorFromStatus?.includes('bg-orange-')) color = '#f97316';
    else if (colorFromStatus?.includes('bg-red-')) color = '#ef4444';
    else if (colorFromStatus?.includes('bg-emerald-')) color = '#10b981';

    return { ...slice, color };
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        {total > 0 ? (
          <span className="text-xs text-gray-500">
            Total: <span className="font-medium text-gray-900">{total}</span>
          </span>
        ) : null}
      </div>
      <div className="flex items-center gap-6">
        <div className="h-40 w-40">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                contentStyle={{ borderRadius: 8, borderColor: '#e5e7eb' }}
                labelStyle={{ fontWeight: 500 }}
              />
              <Pie
                data={slices}
                dataKey="count"
                nameKey="status"
                innerRadius="60%"
                outerRadius="90%"
                paddingAngle={2}
              >
                {slices.map((slice) => (
                  <Cell key={slice.status} fill={slice.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 space-y-2">
          {slices.length === 0 ? (
            <p className="text-sm text-gray-500">No tickets in this view yet.</p>
          ) : (
            slices.map((slice) => (
              <div key={slice.status} className="flex items-center justify-between gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: slice.color }}
                  />
                  <span className="text-gray-700">{slice.status}</span>
                </div>
                <span className="font-medium text-gray-900">{slice.count}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

