type ProfileInfoRow = {
  label: string;
  value: string | null | undefined;
  multiline?: boolean;
};

type ProfileInfoSectionProps = {
  title: string;
  rows: ProfileInfoRow[];
};

export default function ProfileInfoSection({ title, rows }: ProfileInfoSectionProps) {
  const visibleRows = rows.filter((row) => row.value && row.value.toString().trim());
  if (!visibleRows.length) return null;

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-6">
      <h2 className="mb-3 text-sm font-semibold text-gray-900">
        {title}
      </h2>
      <div className="space-y-1.5">
        {visibleRows.map((row) => {
          const v = row.value?.toString().trim();
          if (!v) return null;
          return (
            <div key={row.label} className="flex gap-4">
              <span className="w-36 shrink-0 text-sm text-gray-500">
                {row.label}
              </span>
              <span
                className={`text-sm text-gray-900 ${row.multiline ? 'whitespace-pre-line' : 'truncate'}`}
              >
                {v}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

