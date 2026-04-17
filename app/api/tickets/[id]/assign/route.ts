import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { canAssignTickets } from '@/lib/auth';

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
    .select('role, position')
    .eq('user_id', user.id)
    .single();

  if (!profile || !canAssignTickets(profile)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const { assigned_to } = body;

  if (assigned_to !== null && assigned_to !== undefined) {
    if (typeof assigned_to !== 'string' || !assigned_to.trim()) {
      return NextResponse.json({ error: 'Invalid assigned_to' }, { status: 400 });
    }
    const service = createServiceClient();
    const { data: assigneeProfile } = await service
      .from('profiles')
      .select('user_id, role')
      .eq('user_id', assigned_to.trim())
      .single();

    if (!assigneeProfile || assigneeProfile.role !== 'internal') {
      return NextResponse.json({ error: 'Assignee must be an internal user' }, { status: 400 });
    }
  }

  const value = assigned_to === null || assigned_to === '' ? null : assigned_to;

  const { data, error } = await supabase
    .from('tickets')
    .update({ assigned_to: value })
    .eq('ticket_id', id)
    .select('ticket_id, assigned_to')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
