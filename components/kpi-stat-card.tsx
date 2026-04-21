'use client';

type KPIStatCardProps = {
  title: string;
  value: number | string;
  subtitle?: string;
  variant?: 'default' | 'muted';
};

export default function KPIStatCard({ title, value, subtitle, variant = 'default' }: KPIStatCardProps) {
  const surface =
    variant === 'muted'
      ? 'rounded-2xl border border-gray-200/90 bg-gray-50/90 p-5 shadow-sm'
      : 'rounded-xl border border-gray-200 bg-white p-4 shadow-sm';

  return (
    <div className={`flex flex-col ${surface}`}>
      <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">{title}</span>
      <span className="mt-3 text-3xl font-semibold tabular-nums text-gray-900">{value}</span>
      {subtitle ? <span className="mt-1.5 text-xs text-gray-500">{subtitle}</span> : null}
      <div className="mt-4 h-1 w-12 rounded-full bg-brand" />
    </div>
  );
}

