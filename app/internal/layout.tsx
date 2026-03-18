import { requireInternal } from '@/lib/auth';
import AppShell from '@/components/app-shell';

export default async function InternalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireInternal(); // Redirects to /clinic/tickets if not internal
  return (
    <AppShell variant="internal">
      {children}
    </AppShell>
  );
}
