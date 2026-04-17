import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';

export async function POST(
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
    .select('role, clinic_id, position')
    .eq('user_id', user.id)
    .single();

  if (!profile || profile.role !== 'clinic' || !profile.clinic_id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { data: ticket } = await supabase
    .from('tickets')
    .select('ticket_id, clinic_id, status')
    .eq('ticket_id', id)
    .eq('clinic_id', profile.clinic_id)
    .single();

  if (!ticket) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  if (ticket.status !== 'Resolved') {
    return NextResponse.json({ error: 'Only resolved tickets can be reopened' }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));
  const commentBody = body?.comment?.trim();

  const service = createServiceClient();

  if (commentBody) {
    const { error: commentError } = await service.from('comments').insert({
      ticket_id: id,
      author_user_id: user.id,
      visibility: 'clinic_visible',
      body: commentBody,
    });
    if (commentError) {
      return NextResponse.json({ error: commentError.message }, { status: 500 });
    }
  }

  const { error: updateError } = await service
    .from('tickets')
    .update({ status: 'Follow up needed', updated_at: new Date().toISOString() })
    .eq('ticket_id', id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  const actorLabel = (profile as { position?: string }).position?.trim() || 'Clinic';
  await service.from('notifications').insert({
    clinic_id: ticket.clinic_id,
    ticket_id: id,
    recipient_role: 'internal',
    recipient_clinic_id: null,
    actor_user_id: user.id,
    actor_label: actorLabel,
    type: 'followup_requested',
    message: 'Follow-up requested for ticket',
  });

  return NextResponse.json({ status: 'Follow up needed' });
}
