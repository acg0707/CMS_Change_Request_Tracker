'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

type RetryUploadProps = {
  ticketId: string;
};

export default function RetryUpload({ ticketId }: RetryUploadProps) {
  const [files, setFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  async function handleUpload() {
    if (!files?.length) return;
    setError(null);
    setUploading(true);

    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      setError('Upload failed: Not signed in. Please refresh and try again.');
      setUploading(false);
      return;
    }

    const trimmedTicketId = ticketId?.trim() ?? '';
    if (!UUID_REGEX.test(trimmedTicketId)) {
      setError(`Upload failed: Invalid ticket ID format: ${ticketId}`);
      setUploading(false);
      return;
    }

    const BUCKET = 'attachments';

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file || typeof file.size !== 'number' || file.size <= 0) continue;

      const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storagePath = `${trimmedTicketId}/${Date.now()}-${safeName}`;

      if (!storagePath.startsWith(`${trimmedTicketId}/`)) {
        setError(`Upload failed: Invalid path format. Expected ${trimmedTicketId}/filename`);
        setUploading(false);
        return;
      }

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(storagePath, file, { upsert: false, contentType: file.type || undefined });

      if (uploadError) {
        setError(`Upload failed: ${uploadError.message}`);
        setUploading(false);
        return;
      }

      const { error: insertError } = await supabase.from('attachments').insert({
        ticket_id: trimmedTicketId,
        uploaded_by_user_id: session.user.id,
        file_url: storagePath,
        file_name: file.name,
      });

      if (insertError) {
        setError(`Save failed: ${insertError.message}`);
        setUploading(false);
        return;
      }
    }

    setFiles(null);
    setUploading(false);
    router.refresh();
  }

  return (
    <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
      <h3 className="mb-2 font-medium">Retry upload</h3>
      <p className="mb-3 text-sm text-gray-500">
        If previous uploads failed, select files and try again.
      </p>
      <input
        type="file"
        multiple
        onChange={(e) => setFiles(e.target.files)}
        className="mb-3 text-sm"
      />
      {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
      <button
        type="button"
        onClick={handleUpload}
        disabled={!files?.length || uploading}
        className="rounded-md bg-[#1e3a5f] px-4 py-2 text-sm font-medium text-white hover:bg-[#2a4a6f] disabled:opacity-50"
      >
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
    </div>
  );
}
