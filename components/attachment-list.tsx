type AttachmentItem = {
  attachment_id: string;
  file_name: string;
  signed_url: string;
};

type AttachmentListProps = {
  attachments: AttachmentItem[];
};

export default function AttachmentList({ attachments }: AttachmentListProps) {
  if (!attachments.length) return null;

  return (
    <div className="space-y-2">
      <h3 className="font-medium">Attachments</h3>
      <ul className="space-y-1">
        {attachments.map((a) => (
          <li key={a.attachment_id}>
            <a
              href={a.signed_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[#1e3a5f] hover:underline"
            >
              {a.file_name}
            </a>
            <span className="ml-2 text-xs text-gray-500">(opens in new tab)</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
