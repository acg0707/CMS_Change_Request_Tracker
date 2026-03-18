import { requireClinic } from '@/lib/auth';
import AppShell from '@/components/app-shell';

export default async function ClinicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireClinic(); // Redirects to /internal/tickets if not clinic
  return (
    <AppShell variant="clinic">
      {children}
    </AppShell>
  );
}
