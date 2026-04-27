import Link from 'next/link';
import { requireClinic } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import TicketForm from '@/components/ticket-form';

export default async function NewTicketPage() {
  const user = await requireClinic();
  const supabase = await createClient();

  const { data: clinic } = await supabase
    .from('clinics')
    .select('base_url, clinic_name')
    .eq('clinic_id', user.profile.clinic_id!)
    .single();

  const baseUrl = clinic?.base_url || '';

  return (
    <div className="bg-gray-50 px-6 py-6 md:px-8 md:py-8">
      <div className="mx-auto w-full max-w-[90rem]">
        <Link
          href="/clinic/tickets"
          className="mb-6 inline-block text-sm text-gray-600 hover:underline"
        >
          ← Back to tickets
        </Link>

        <h1 className="mb-8 text-2xl font-semibold text-gray-900">New Change Request</h1>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <TicketForm
            baseUrl={baseUrl}
            clinicId={user.profile.clinic_id!}
          />
        </div>
      </div>
    </div>
  );
}
