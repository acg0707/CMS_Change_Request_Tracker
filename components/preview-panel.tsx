'use client';

import { useState } from 'react';

type PreviewMode = 'mobile' | 'desktop';

type PreviewPanelProps = {
  fullUrl: string | null;
  mode: PreviewMode;
};

const MOBILE_VIEWPORT_WIDTH = 390;
const MOBILE_VIEWPORT_HEIGHT = 640;
const DESKTOP_VIEWPORT_WIDTH = 1280;
const DESKTOP_VIEWPORT_HEIGHT = 900;
const DESKTOP_SCALE = 0.68;

export default function PreviewPanel({ fullUrl, mode }: PreviewPanelProps) {
  const [iframeBlocked, setIframeBlocked] = useState(false);

  const containerClasses =
    mode === 'mobile'
      ? 'flex h-full min-h-[640px] items-center justify-center'
      : 'flex h-full min-h-[400px] items-center justify-center';

  if (!fullUrl || !fullUrl.startsWith('http')) {
    return (
      <div className="flex h-full min-h-[400px] flex-col items-center justify-center rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
        <p className="text-sm text-gray-500">Preview loads when clinic base URL is configured.</p>
      </div>
    );
  }

  if (iframeBlocked) {
    return (
      <div className="flex h-full min-h-[400px] flex-col items-center justify-center gap-4 rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
        <p className="text-sm text-gray-500">Preview unavailable (iframe blocked)</p>
        <a
          href={fullUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-md bg-[#1e3a5f] px-4 py-2 text-sm font-medium text-white hover:bg-[#2a4a6f]"
        >
          Open in new tab
        </a>
      </div>
    );
  }

  const isMobile = mode === 'mobile';

  const outerWidth = isMobile
    ? MOBILE_VIEWPORT_WIDTH
    : DESKTOP_VIEWPORT_WIDTH * DESKTOP_SCALE;
  const outerHeight = isMobile ? MOBILE_VIEWPORT_HEIGHT : 740;

  return (
    <div className={containerClasses}>
      <div
        className="relative overflow-x-hidden overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-md"
        style={{
          width: outerWidth,
          height: outerHeight,
        }}
      >
        <div
          style={{
            width: isMobile ? MOBILE_VIEWPORT_WIDTH : DESKTOP_VIEWPORT_WIDTH,
            height: isMobile ? MOBILE_VIEWPORT_HEIGHT : DESKTOP_VIEWPORT_HEIGHT,
            transform: isMobile ? 'none' : `scale(${DESKTOP_SCALE})`,
            transformOrigin: 'top left',
          }}
        >
          <iframe
            key={fullUrl}
            src={fullUrl}
            title="Page preview"
            className="h-full w-full"
            sandbox="allow-same-origin allow-scripts allow-popups"
            onError={() => setIframeBlocked(true)}
          />
        </div>
        <a
          href={fullUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-1 text-xs text-white hover:bg-black/90"
        >
          Open in new tab
        </a>
      </div>
    </div>
  );
}
