'use client';

import { useState, useRef } from 'react';
import { PAGES, PAGE_ISSUE_MAP, PAGE_LABELS, ISSUE_LABELS, type Page } from '@/lib/constants';
import PreviewPanel from './preview-panel';
import FileDropzone from './file-dropzone';
import { createClient } from '@/lib/supabase/client';

type TicketFormProps = {
  baseUrl: string;
  clinicId: string;
  userId: string;
};

type PreviewMode = 'mobile' | 'desktop';

export default function TicketForm({ baseUrl, clinicId, userId }: TicketFormProps) {
  const [page, setPage] = useState<Page>('homepage');
  const [issue, setIssue] = useState(PAGE_ISSUE_MAP.homepage[0]);
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [previewMode, setPreviewMode] = useState<PreviewMode>('mobile');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submittedRef = useRef(false);

  const issues = PAGE_ISSUE_MAP[page];
  const base = baseUrl?.trim();
  const baseWithProtocol = base && !base.startsWith('http') ? `https://${base}` : base;
  const baseNormalized = baseWithProtocol ? baseWithProtocol.replace(/\/$/, '') : null;

  const pagePathMap: Record<Page, string> = {
    homepage: '/',
    team: '/team',
    services: '/services',
    banner: '/',
    other: '/',
  };

  const pathSuffix = pagePathMap[page] ?? '/';
  const fullUrl = baseNormalized
    ? pathSuffix === '/' || pathSuffix === ''
      ? `${baseNormalized}/`
      : `${baseNormalized}${pathSuffix}`
    : null;

  function handlePageChange(newPage: Page) {
    setPage(newPage);
    setIssue(PAGE_ISSUE_MAP[newPage][0]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (submittedRef.current) return;
    submittedRef.current = true;

    setError(null);
    setSubmitting(true);

    const pageUrl = fullUrl ?? baseNormalized ?? baseWithProtocol?.replace(/\/$/, '') ?? baseUrl ?? '';

    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clinic_id: clinicId,
          created_by_user_id: userId,
          page,
          issue,
          description,
          page_url: pageUrl,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        submittedRef.current = false;
        throw new Error(data.error || 'Failed to create ticket');
      }

      const ticketId = (data.ticket_id ?? '').toString().trim();
      const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

      if (files.length) {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          window.location.href = `/clinic/tickets/${ticketId}?upload_failed=1`;
          return;
        }
        if (!UUID_REGEX.test(ticketId)) {
          window.location.href = `/clinic/tickets/${ticketId}?upload_failed=1`;
          return;
        }
        const BUCKET = 'attachments';
        let uploadFailed = false;
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          if (!file || typeof file.size !== 'number' || file.size <= 0) continue;
          const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
          const storagePath = `${ticketId}/${Date.now()}-${safeName}`;
          if (!storagePath.startsWith(`${ticketId}/`)) {
            uploadFailed = true;
            break;
          }
          const { error: uploadError } = await supabase.storage
            .from(BUCKET)
            .upload(storagePath, file, { upsert: false, contentType: file.type || undefined });
          if (uploadError) {
            uploadFailed = true;
            break;
          }
          const { error: insertError } = await supabase.from('attachments').insert({
            ticket_id: ticketId,
            uploaded_by_user_id: session.user.id,
            file_url: storagePath,
            file_name: file.name,
          });
          if (insertError) {
            uploadFailed = true;
            break;
          }
        }
        if (uploadFailed) {
          window.location.href = `/clinic/tickets/${ticketId}?upload_failed=1`;
          return;
        }
      }

      window.location.href = `/clinic/tickets/${ticketId}`;
    } catch (err) {
      submittedRef.current = false;
      setError(err instanceof Error ? err.message : 'Failed to create ticket');
      setSubmitting(false);
    }
  }

  return (
    <div
      className={`grid gap-6 ${
        previewMode === 'desktop'
          ? 'lg:grid-cols-[minmax(0,28rem)_minmax(0,1fr)] xl:grid-cols-[minmax(0,30rem)_minmax(0,1.4fr)]'
          : 'lg:grid-cols-2'
      }`}
    >
      <form onSubmit={handleSubmit} className="min-w-0 space-y-6">
        <div>
          <label htmlFor="page" className="mb-2 block text-sm font-medium text-gray-700">
            Page
          </label>
          <select
            id="page"
            value={page}
            onChange={(e) => handlePageChange(e.target.value as Page)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
          >
            {PAGES.map((p) => (
              <option key={p} value={p}>
                {PAGE_LABELS[p]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="issue" className="mb-2 block text-sm font-medium text-gray-700">
            Issue
          </label>
          <select
            id="issue"
            value={issue}
            onChange={(e) => setIssue(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
          >
            {issues.map((i) => (
              <option key={i} value={i}>
                {ISSUE_LABELS[i] ?? i}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="description" className="mb-2 block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
            placeholder="Describe the change you need..."
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Attachments (optional)
          </label>
          <FileDropzone files={files} onChange={setFiles} disabled={submitting} />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-[#1e3a5f] px-4 py-2 text-sm font-medium text-white hover:bg-[#2a4a6f] disabled:opacity-50"
        >
          {submitting ? 'Submitting...' : 'Create Request'}
        </button>
      </form>
      <div className="min-w-0">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-sm font-medium text-gray-500">Preview</h2>
          <div className="inline-flex rounded-md border border-gray-200 bg-gray-50 p-0.5 text-xs font-medium text-gray-700">
            <button
              type="button"
              onClick={() => setPreviewMode('mobile')}
              className={`flex items-center gap-1 rounded px-2 py-1 ${
                previewMode === 'mobile'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <span className="inline-block h-3 w-2 rounded-sm border border-current" />
              <span>Mobile</span>
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode('desktop')}
              className={`ml-0.5 flex items-center gap-1 rounded px-2 py-1 ${
                previewMode === 'desktop'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <span className="inline-block h-3 w-4 rounded-sm border border-current" />
              <span>Desktop</span>
            </button>
          </div>
        </div>
        <PreviewPanel fullUrl={fullUrl} mode={previewMode} />
      </div>
    </div>
  );
}
