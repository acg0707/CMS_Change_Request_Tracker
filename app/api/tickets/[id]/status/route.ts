import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { TICKET_STATUSES } from '@/lib/constants';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  if (!profile || profile.role !== 'internal') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const { status } = body;

  if (!status || !TICKET_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const { data: ticketBefore } = await supabase
    .from('tickets')
    .select('clinic_id')
    .eq('ticket_id', id)
    .single();

  const { data, error } = await supabase
    .from('tickets')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('ticket_id', id)
    .select('ticket_id, status')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (ticketBefore?.clinic_id) {
    const service = createServiceClient();
    await service.from('notifications').insert({
      clinic_id: ticketBefore.clinic_id,
      ticket_id: id,
      recipient_role: 'clinic',
      recipient_clinic_id: ticketBefore.clinic_id,
      actor_user_id: user.id,
      actor_label: 'Support Team',
      type: 'status_changed',
      message: `Status updated to ${status}`,
    });
  }

  return NextResponse.json(data);
}
