'use client';

type ProfileSummaryCardProps = {
  title: string;
  subtitle?: string | null;
  secondarySubtitle?: string | null;
  email?: string | null;
  meta?: string | null;
};

function getInitials(name: string): string {
  const parts = name
    .split(' ')
    .map((p) => p.trim())
    .filter(Boolean);
  if (!parts.length) return '';
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : '';
  return (first + last).toUpperCase();
}

export default function ProfileSummaryCard({
  title,
  subtitle,
  secondarySubtitle,
  email,
  meta,
}: ProfileSummaryCardProps) {
  const safeTitle = title.trim() || (email ?? '').trim() || 'Profile';
  const initials = getInitials(safeTitle);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="flex items-center gap-4">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand/10 text-sm font-semibold text-brand"
          aria-hidden
        >
          {initials || safeTitle[0]?.toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold text-gray-900">
            {safeTitle}
          </p>
          {(subtitle || secondarySubtitle) && (
            <p className="mt-0.5 truncate text-sm text-gray-600">
              {[subtitle, secondarySubtitle].filter((v) => v && v.trim()).join(' · ')}
            </p>
          )}
          {(email || meta) && (
            <p className="mt-1 truncate text-xs text-gray-500">
              {[email, meta].filter((v) => v && v.trim()).join(' · ')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

