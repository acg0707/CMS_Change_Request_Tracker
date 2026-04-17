import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const ticketId = formData.get('ticket_id') as string;
  const files = formData.getAll('files') as File[];

  if (!ticketId || !files.length) {
    return NextResponse.json({ error: 'ticket_id and files required' }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, clinic_id')
    .eq('user_id', user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (profile.role === 'clinic') {
    const { data: ticket } = await supabase
      .from('tickets')
      .select('clinic_id')
      .eq('ticket_id', ticketId)
      .single();

    if (!ticket || ticket.clinic_id !== profile.clinic_id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  const uploaded: { file_name: string; file_url: string }[] = [];

  for (const file of files) {
    if (!file.size) continue;

    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `${ticketId}/${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from('attachments')
      .upload(storagePath, file, { upsert: true });

    if (uploadError) {
      return NextResponse.json(
        { error: `Upload failed: ${uploadError.message}` },
        { status: 500 }
      );
    }

    const { error: insertError } = await supabase.from('attachments').insert({
      ticket_id: ticketId,
      uploaded_by_user_id: user.id,
      file_url: storagePath,
      file_name: file.name,
    });

    if (insertError) {
      return NextResponse.json(
        { error: `Save failed: ${insertError.message}` },
        { status: 500 }
      );
    }

    uploaded.push({ file_name: file.name, file_url: storagePath });
  }

  return NextResponse.json({ uploaded });
}
