import { STATUS_COLORS } from '@/lib/constants';

type StatusChipProps = {
  status: string;
};

export default function StatusChip({ status }: StatusChipProps) {
  const colorClass = STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-800 border-gray-200';
  return (
    <span
      className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${colorClass}`}
    >
      {status}
    </span>
  );
}
