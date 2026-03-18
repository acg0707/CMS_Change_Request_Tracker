import { resolveCommentAuthorLabelMap } from '@/lib/comment-author-label';

type RawComment = {
  author_user_id: string | null;
};

type AttachmentRow = {
  attachment_id: string;
  file_name: string;
  file_url: string;
};

export async function withCommentAuthorLabels<T extends RawComment>(
  commentsRaw: T[] | null | undefined
): Promise<(T & { author_label: string })[]> {
  const rows = commentsRaw || [];
  const authorIds = [...new Set(rows.map((c) => c.author_user_id).filter(Boolean))] as string[];
  const authorLabelMap = await resolveCommentAuthorLabelMap(authorIds);

  return rows.map((c) => ({
    ...c,
    author_label: c.author_user_id ? (authorLabelMap.get(c.author_user_id) ?? 'Clinic') : 'Clinic',
  }));
}

export async function signedAttachmentsForTicket(
  supabase: {
    storage: {
      from(bucket: string): {
        createSignedUrl(path: string, expiresIn: number): Promise<{ data: { signedUrl?: string } | null }>;
      };
    };
  },
  attachmentsRaw: AttachmentRow[] | null | undefined
): Promise<{ attachment_id: string; file_name: string; signed_url: string }[]> {
  const out: { attachment_id: string; file_name: string; signed_url: string }[] = [];
  if (!attachmentsRaw?.length) return out;

  for (const a of attachmentsRaw) {
    const { data: signed } = await supabase.storage.from('attachments').createSignedUrl(a.file_url, 3600);
    if (signed?.signedUrl) {
      out.push({ attachment_id: a.attachment_id, file_name: a.file_name, signed_url: signed.signedUrl });
    }
  }

  return out;
}

