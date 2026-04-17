import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { PAGE_LABELS, ISSUE_LABELS } from '@/lib/constants';

export async function POST(request: Request) {
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

  const body = await request.json();
  const { clinic_id, page, issue, description, page_url } = body;

  if (clinic_id !== profile.clinic_id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { data: ticket, error } = await supabase
    .from('tickets')
    .insert({
      clinic_id,
      created_by_user_id: user.id,
      page,
      issue,
      description: description || null,
      page_url: page_url || null,
      status: 'Pending',
    })
    .select('ticket_id')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const actorLabel = (profile as { position?: string }).position?.trim() || 'Clinic';
  const pageLabel = PAGE_LABELS[page] ?? page;
  const issueLabel = ISSUE_LABELS[issue ?? ''] ?? issue;
  const message = `New ticket: ${pageLabel} - ${issueLabel}`;

  const service = createServiceClient();
  await service.from('notifications').insert({
    clinic_id: clinic_id,
    ticket_id: ticket.ticket_id,
    recipient_role: 'internal',
    recipient_clinic_id: null,
    actor_user_id: user.id,
    actor_label: actorLabel,
    type: 'ticket_created',
    message,
  });

  return NextResponse.json({ ticket_id: ticket.ticket_id });
}
