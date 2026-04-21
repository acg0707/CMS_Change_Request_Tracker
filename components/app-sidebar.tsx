'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { SIDEBAR_COLLAPSED_WIDTH_PX, SIDEBAR_EXPANDED_WIDTH_PX } from '@/lib/constants';

type SidebarItem = {
  href: string;
  label: string;
  icon: ReactNode;
  isActive: boolean;
  showUnreadDot?: boolean;
};

export default function AppSidebar({
  items,
  isExpanded,
  isMobileOpen,
  onToggleExpanded,
  onCloseMobile,
}: {
  items: SidebarItem[];
  isExpanded: boolean;
  isMobileOpen: boolean;
  onToggleExpanded: () => void;
  onCloseMobile: () => void;
}) {
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === 'undefined') return true;
    return window.matchMedia('(min-width: 768px)').matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 768px)');
    const updateDesktop = () => setIsDesktop(mediaQuery.matches);

    updateDesktop();
    mediaQuery.addEventListener('change', updateDesktop);

    return () => mediaQuery.removeEventListener('change', updateDesktop);
  }, []);

  const showLabels = isDesktop ? isExpanded : true;
  const sidebarWidth = showLabels ? SIDEBAR_EXPANDED_WIDTH_PX : SIDEBAR_COLLAPSED_WIDTH_PX;

  return (
    <>
      {isMobileOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          className="fixed inset-0 z-30 bg-black/35 md:hidden"
          onClick={onCloseMobile}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-screen flex-col border-r border-white/10 bg-brand transition-[width,transform] duration-200 md:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ width: `${sidebarWidth}px` }}
      >
        <div className="flex h-12 items-center justify-between border-b border-white/10 px-3">
          <span className="overflow-hidden whitespace-nowrap text-sm font-medium text-white">
            {showLabels ? 'Menu' : ''}
          </span>
          <button
            type="button"
            onClick={onToggleExpanded}
            className="hidden rounded p-1 text-white/70 transition hover:bg-white/10 hover:text-white md:inline-flex"
            aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
            title={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isExpanded ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'} />
            </svg>
          </button>
        </div>
        <nav className="flex flex-col gap-1 p-2">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              onClick={() => {
                if (!isDesktop) onCloseMobile();
              }}
              className={`flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                showLabels ? 'gap-3' : 'justify-center'
              } ${
                item.isActive ? 'bg-white/20 text-white' : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className="relative shrink-0">
                {item.icon}
                {item.showUnreadDot ? (
                  <span
                    className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-amber-400 ring-2 ring-brand"
                    aria-hidden
                  />
                ) : null}
              </span>
              {showLabels ? <span className="overflow-hidden whitespace-nowrap">{item.label}</span> : null}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}
