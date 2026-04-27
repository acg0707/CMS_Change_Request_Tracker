'use client';

import { useEffect, useRef, useState } from 'react';

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
// Keep the mobile preview compact so it doesn't waste vertical space and
// doesn't compete with the page scroll at 100% zoom.
const MOBILE_SCALE_CAP = 0.9;

export default function PreviewPanel({ fullUrl, mode }: PreviewPanelProps) {
  const [iframeBlocked, setIframeBlocked] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [panelWidth, setPanelWidth] = useState<number | null>(null);

  const isMobile = mode === 'mobile';
  const wrapperClassName = isMobile ? 'relative mx-auto w-full max-w-[390px]' : 'relative w-full';

  useEffect(() => {
    if (!panelRef.current) return;
    if (typeof ResizeObserver === 'undefined') return;

    const el = panelRef.current;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setPanelWidth(entry.contentRect.width);
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const containerClasses = 'flex w-full items-start justify-center';

  if (!fullUrl || !fullUrl.startsWith('http')) {
    return (
      <div className={`flex w-full min-h-[320px] flex-col items-center justify-center rounded-lg border border-gray-200 bg-gray-50 p-8 text-center ${isMobile ? 'max-w-[390px] mx-auto' : ''}`}>
        <p className="text-sm text-gray-500">Preview loads when clinic base URL is configured.</p>
      </div>
    );
  }

  if (iframeBlocked) {
    return (
      <div className={`flex w-full min-h-[320px] flex-col items-center justify-center gap-4 rounded-lg border border-gray-200 bg-gray-50 p-8 text-center ${isMobile ? 'max-w-[390px] mx-auto' : ''}`}>
        <p className="text-sm text-gray-500">Preview unavailable (iframe blocked)</p>
        <a
          href={fullUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover"
        >
          Open in new tab
        </a>
      </div>
    );
  }

  // Scale the preview to fit the panel width. This avoids awkward clipping when
  // the sidebar is open or the viewport is narrower at 100% zoom.
  const effectiveWidth =
    panelWidth ?? (isMobile ? MOBILE_VIEWPORT_WIDTH : DESKTOP_VIEWPORT_WIDTH * DESKTOP_SCALE);
  const desktopScale = Math.min(DESKTOP_SCALE, effectiveWidth / DESKTOP_VIEWPORT_WIDTH);
  const mobileScale = Math.min(MOBILE_SCALE_CAP, effectiveWidth / MOBILE_VIEWPORT_WIDTH);

  const unscaledHeight = isMobile ? MOBILE_VIEWPORT_HEIGHT : DESKTOP_VIEWPORT_HEIGHT;
  const previewScale = isMobile ? mobileScale : desktopScale;
  const previewHeight = unscaledHeight * previewScale;

  return (
    <div className={containerClasses}>
      <div
        ref={panelRef}
        className={`${wrapperClassName} overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md`}
        style={{ height: previewHeight }}
      >
        <div
          style={{
            width: isMobile ? MOBILE_VIEWPORT_WIDTH : DESKTOP_VIEWPORT_WIDTH,
            height: isMobile ? MOBILE_VIEWPORT_HEIGHT : DESKTOP_VIEWPORT_HEIGHT,
            transform: isMobile
              ? mobileScale === 1
                ? 'none'
                : `scale(${mobileScale})`
              : desktopScale === 1
                ? 'none'
                : `scale(${desktopScale})`,
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
