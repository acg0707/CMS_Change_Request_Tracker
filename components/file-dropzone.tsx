'use client';

import { useState, useRef } from 'react';

type FileDropzoneProps = {
  files: File[];
  onChange: (files: File[]) => void;
  disabled?: boolean;
};

export default function FileDropzone({ files, onChange, disabled }: FileDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function addFiles(newFiles: FileList | File[]) {
    const arr = Array.from(newFiles);
    const combined = [...files, ...arr];
    onChange(combined);
  }

  function removeFile(index: number) {
    onChange(files.filter((_, i) => i !== index));
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;
    const dropped = e.dataTransfer.files;
    if (dropped?.length) addFiles(dropped);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    setIsDragOver(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Attach files
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            const list = e.target.files;
            if (list?.length) addFiles(list);
            e.target.value = '';
          }}
        />
      </div>

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`min-h-[120px] rounded-lg border-2 border-dashed p-4 transition ${
          isDragOver
            ? 'border-[#1e3a5f] bg-[#1e3a5f]/5'
            : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
        } ${disabled ? 'pointer-events-none opacity-60' : ''}`}
      >
        <p className="text-center text-sm text-gray-500">
          {isDragOver ? 'Drop files here' : 'Drag and drop files here, or click Attach files'}
        </p>
      </div>

      {files.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {files.map((file, i) => (
            <span
              key={`${file.name}-${i}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-sm text-gray-700"
            >
              <span className="truncate max-w-[180px]">{file.name}</span>
              <button
                type="button"
                onClick={() => removeFile(i)}
                disabled={disabled}
                className="ml-1 rounded-full p-0.5 text-gray-500 hover:bg-gray-200 hover:text-gray-700 disabled:opacity-50"
                aria-label={`Remove ${file.name}`}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
