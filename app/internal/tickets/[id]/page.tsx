import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireInternal } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { formatDate } from '@/lib/date';
import { PAGE_LABELS, ISSUE_LABELS } from '@/lib/constants';
import CommentList from '@/components/comment-list';
import AttachmentList from '@/components/attachment-list';
import StatusUpdate from '@/components/status-update';
import StatusChip from '@/components/status-chip';
import { signedAttachmentsForTicket, withCommentAuthorLabels } from '@/lib/ticket-detail-helpers';

export default async function InternalTicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireInternal();
  const supabase = await createClient();

  const [{ data: ticket, error }, { data: commentsRaw }, { data: attachmentsRaw }] = await Promise.all([
    supabase.from('tickets').select('*, clinics(clinic_name, base_url)').eq('ticket_id', id).single(),
    supabase
      .from('comments')
      .select('comment_id, body, visibility, created_at, author_user_id')
      .eq('ticket_id', id)
      .order('created_at', { ascending: true }),
    supabase.from('attachments').select('attachment_id, file_name, file_url').eq('ticket_id', id),
  ]);

  const comments = await withCommentAuthorLabels(commentsRaw);
  const attachments = await signedAttachmentsForTicket(supabase, attachmentsRaw);

  if (error || !ticket) {
    notFound();
  }

  const clinic = ticket.clinics as { clinic_name?: string; base_url?: string } | null;

  return (
    <div className="p-8">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/internal/tickets"
          className="mb-6 inline-block text-sm text-gray-600 hover:underline"
        >
          ← Back to tickets
        </Link>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {PAGE_LABELS[ticket.page] ?? ticket.page} · {ISSUE_LABELS[ticket.issue ?? ''] ?? ticket.issue}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                {clinic?.clinic_name} · Created {formatDate(ticket.created_at)}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <StatusChip status={ticket.status} />
              <StatusUpdate ticketId={ticket.ticket_id} currentStatus={ticket.status} />
            </div>
          </div>

          <dl className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Page</dt>
              <dd className="mt-1 text-gray-900">{PAGE_LABELS[ticket.page] ?? ticket.page}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Issue</dt>
              <dd className="mt-1 text-gray-900">{ISSUE_LABELS[ticket.issue ?? ''] ?? ticket.issue}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Description</dt>
              <dd className="mt-1 whitespace-pre-wrap text-gray-900">{ticket.description || '—'}</dd>
            </div>
            {ticket.page_url && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Page URL</dt>
                <dd className="mt-1">
                  <a
                    href={ticket.page_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#1e3a5f] hover:underline"
                  >
                    {ticket.page_url}
                  </a>
                  <a
                    href={ticket.page_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-4 inline-block rounded-md bg-[#1e3a5f] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#2a4a6f]"
                  >
                    Open Page
                  </a>
                </dd>
              </div>
            )}
          </dl>

          {attachments.length > 0 && (
            <div className="mt-6">
              <AttachmentList attachments={attachments} />
            </div>
          )}

          <div className="mt-8 border-t border-gray-200 pt-6">
            <CommentList
              ticketId={ticket.ticket_id}
              initialComments={comments || []}
              isInternal={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
