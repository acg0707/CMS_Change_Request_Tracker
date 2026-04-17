import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/** GET: Whether the current user has any unread notifications (scoped by role). */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, clinic_id')
    .eq('user_id', user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let query = supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('is_read', false);

  if (profile.role === 'clinic' && profile.clinic_id) {
    query = query.eq('recipient_role', 'clinic').eq('recipient_clinic_id', profile.clinic_id);
  } else if (profile.role === 'internal') {
    query = query.eq('recipient_role', 'internal');
  } else {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { count, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ hasUnread: (count ?? 0) > 0 });
}

/** PATCH: Mark one or all notifications as read */
export async function PATCH(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, clinic_id')
    .eq('user_id', user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const { id, mark_all } = body;

  if (mark_all) {
    let query = supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('is_read', false);

    if (profile.role === 'clinic' && profile.clinic_id) {
      query = query.eq('recipient_role', 'clinic').eq('recipient_clinic_id', profile.clinic_id);
    } else if (profile.role === 'internal') {
      query = query.eq('recipient_role', 'internal');
    } else {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  } else if (id && typeof id === 'string') {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      .eq('is_read', false);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  } else {
    return NextResponse.json({ error: 'id or mark_all required' }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
