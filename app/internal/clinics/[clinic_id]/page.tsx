import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireInternal } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import ProfileSummaryCard from '@/components/profile-summary-card';
import ProfileInfoSection from '@/components/profile-info-section';
import ClinicTicketsTable from '@/components/clinic-tickets-table';
import TicketStatusDonut from '@/components/ticket-status-donut';
import { computeDateRange, getTicketAnalytics } from '@/lib/analytics';

export default async function InternalClinicDetailPage({
  params,
}: {
  params: Promise<{ clinic_id: string }>;
}) {
  const { clinic_id } = await params;
  await requireInternal();
  const supabase = await createClient();

  const { data: clinic, error } = await supabase
    .from('clinics')
    .select('clinic_id, clinic_name, base_url, address_line1, city, state, zip, phone, public_email')
    .eq('clinic_id', clinic_id)
    .single();

  if (error || !clinic) {
    notFound();
  }

  const { data: contacts } = await supabase
    .from('profiles')
    .select('full_name, position')
    .eq('clinic_id', clinic_id)
    .eq('role', 'clinic')
    .order('full_name');

  const { data: tickets } = await supabase
    .from('tickets')
    .select('ticket_id, page, issue, status, created_at')
    .eq('clinic_id', clinic_id)
    .order('created_at', { ascending: false })
    .limit(5);

  const lastYearRange = computeDateRange('12m');
  const clinicAnalytics = await getTicketAnalytics({
    clinicId: clinic_id,
    startDate: lastYearRange.startDate,
    endDate: lastYearRange.endDate,
    groupBy: lastYearRange.groupBy,
    rangeKey: '12m',
  });

  const addressParts = [
    clinic.address_line1,
    [clinic.city, clinic.state, clinic.zip].filter(Boolean).join(', '),
  ].filter(Boolean);

  const addressMultiline = addressParts.join('\n');
  const cityState =
    clinic.city && clinic.state
      ? `${clinic.city}, ${clinic.state}`
      : clinic.city || clinic.state || '';

  return (
    <div className="p-8">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/internal/clinics"
          className="mb-6 inline-block text-sm text-gray-600 hover:underline"
        >
          ← Back to clients
        </Link>

        <div className="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <ProfileSummaryCard
            title={clinic.clinic_name || 'Client'}
            subtitle={cityState || undefined}
            secondarySubtitle={clinic.base_url ?? undefined}
            email={clinic.public_email ?? undefined}
            meta={clinic.phone ?? undefined}
          />

          <div className="space-y-4">
            <ProfileInfoSection
              title="Point of contact"
              rows={
                contacts?.length
                  ? contacts.map((c) => ({ label: c.position || 'Contact', value: c.full_name }))
                  : [{ label: 'Contact', value: null }]
              }
            />
            <ProfileInfoSection
              title="Location"
              rows={[
                { label: 'Address', value: addressMultiline, multiline: true },
                { label: 'City', value: clinic.city },
                { label: 'State', value: clinic.state },
                { label: 'ZIP', value: clinic.zip },
              ]}
            />
          </div>
        </div>

        <div className="mt-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent tickets</h2>
            <Link
              href={`/internal/tickets?clinic_id=${clinic_id}`}
              className="text-sm font-medium text-brand hover:underline"
            >
              View all tickets for {clinic.clinic_name}
            </Link>
          </div>

          {!tickets?.length ? (
            <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
              <p className="text-gray-500">No tickets yet.</p>
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <ClinicTicketsTable tickets={tickets} />
            </div>
          )}
        </div>

        <div className="mt-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Ticket status distribution</h2>
            <span className="text-xs text-gray-500">Last 12 months</span>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <TicketStatusDonut data={clinicAnalytics.statusDistribution} />
          </div>
        </div>
      </div>
    </div>
  );
}
