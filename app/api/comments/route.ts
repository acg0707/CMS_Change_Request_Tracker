import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { commentAuthorLabelFromProfile } from '@/lib/comment-author-label';

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, clinic_id, position, full_name')
    .eq('user_id', session.user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const { ticket_id, body: commentBody, visibility } = body;

  if (!ticket_id || !commentBody?.trim()) {
    return NextResponse.json({ error: 'ticket_id and body required' }, { status: 400 });
  }

  const vis = profile.role === 'clinic' ? 'clinic_visible' : (visibility === 'internal' ? 'internal' : 'clinic_visible');
  const authorLabel = commentAuthorLabelFromProfile(
    profile.role,
    (profile as { position?: string }).position,
    (profile as { full_name?: string }).full_name
  );

  const { data: comment, error } = await supabase
    .from('comments')
    .insert({
      ticket_id,
      author_user_id: session.user.id,
      visibility: vis,
      body: commentBody.trim(),
    })
    .select('comment_id, body, visibility, created_at, author_user_id')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: ticket } = await supabase
    .from('tickets')
    .select('clinic_id')
    .eq('ticket_id', ticket_id)
    .single();

  const service = createServiceClient();
  if (profile.role === 'clinic') {
    await service.from('notifications').insert({
      clinic_id: ticket?.clinic_id ?? undefined,
      ticket_id,
      recipient_role: 'internal',
      recipient_clinic_id: null,
      actor_user_id: session.user.id,
      actor_label: authorLabel,
      type: 'comment_added',
      message: 'New comment on your ticket',
    });
  } else if (vis === 'clinic_visible' && ticket?.clinic_id) {
    await service.from('notifications').insert({
      clinic_id: ticket.clinic_id,
      ticket_id,
      recipient_role: 'clinic',
      recipient_clinic_id: ticket.clinic_id,
      actor_user_id: session.user.id,
      actor_label: authorLabel,
      type: 'comment_added',
      message: 'New comment on your ticket',
    });
  }

  return NextResponse.json({
    ...comment,
    author_label: authorLabel,
  });
}
