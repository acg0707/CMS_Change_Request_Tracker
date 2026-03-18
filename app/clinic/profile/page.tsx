import Link from 'next/link';
import { requireClinic } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import type { Clinic } from '@/lib/types';
import ProfileSummaryCard from '@/components/profile-summary-card';
import ProfileInfoSection from '@/components/profile-info-section';

function formatAddress(clinic: Clinic): string | null {
  const parts: string[] = [];
  if (clinic.address_line1?.trim()) parts.push(clinic.address_line1.trim());
  const cityStateZip: string[] = [];
  if (clinic.city?.trim()) cityStateZip.push(clinic.city.trim());
  if (clinic.state?.trim()) cityStateZip.push(clinic.state.trim());
  if (clinic.zip?.trim()) cityStateZip.push(clinic.zip.trim());
  if (cityStateZip.length) parts.push(cityStateZip.join(', '));
  return parts.length ? parts.join('\n') : null;
}

export default async function ClinicProfilePage() {
  const user = await requireClinic();
  const supabase = await createClient();

  let clinic: Clinic | null = null;
  if (user.profile.clinic_id) {
    const { data } = await supabase
      .from('clinics')
      .select('clinic_id, clinic_name, base_url, address_line1, city, state, zip, phone, public_email')
      .eq('clinic_id', user.profile.clinic_id)
      .single();
    clinic = data as Clinic | null;
  }

  const address = clinic ? formatAddress(clinic) : null;

  const hasAnyProfileInfo =
    !!user.profile.full_name?.trim() ||
    !!user.profile.position?.trim() ||
    !!user.email ||
    !!clinic?.clinic_name ||
    !!address ||
    !!clinic?.phone?.trim() ||
    !!clinic?.public_email?.trim();

  const summaryTitle =
    user.profile.full_name?.trim() ||
    user.email?.trim() ||
    clinic?.clinic_name?.trim() ||
    'Profile';

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="mx-auto w-full max-w-4xl px-8 py-8">
        <h1 className="text-2xl font-semibold text-gray-900">Profile</h1>

        {!hasAnyProfileInfo ? (
          <div className="mt-6 rounded-lg border border-dashed border-gray-200 bg-white p-6 text-sm text-gray-500">
            No profile information available yet.
          </div>
        ) : (
          <div className="mt-6 grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
            <ProfileSummaryCard
              title={summaryTitle}
              subtitle={user.profile.position ?? undefined}
              secondarySubtitle={clinic?.clinic_name ?? undefined}
              email={user.email ?? undefined}
              meta={clinic?.base_url ?? undefined}
            />

            <div className="space-y-4">
              <ProfileInfoSection
                title="Profile details"
                rows={[
                  { label: 'Full name', value: user.profile.full_name },
                  { label: 'Position', value: user.profile.position },
                ]}
              />
              <ProfileInfoSection
                title="Clinic information"
                rows={[
                  { label: 'Clinic', value: clinic?.clinic_name },
                  { label: 'Website', value: clinic?.base_url },
                  { label: 'Address', value: address, multiline: true },
                ]}
              />
              <ProfileInfoSection
                title="Contact"
                rows={[
                  { label: 'Email', value: user.email },
                  { label: 'Clinic phone', value: clinic?.phone },
                  { label: 'Clinic email', value: clinic?.public_email },
                ]}
              />
            </div>
          </div>
        )}

        <Link
          href="/clinic/tickets"
          className="mt-8 inline-block text-sm text-gray-600 hover:underline"
        >
          ← Back to tickets
        </Link>
      </div>
    </div>
  );
}
