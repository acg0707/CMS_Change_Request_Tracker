'use client';

import type { CSSProperties, ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import UserNav from '@/components/user-nav';
import { SIDEBAR_COLLAPSED_WIDTH_PX, SIDEBAR_EXPANDED_WIDTH_PX, SIDEBAR_STORAGE_KEY } from '@/lib/constants';
import ClinicSidebar from '@/components/clinic-sidebar';
import InternalSidebar from '@/components/internal-sidebar';

export default function AppShell({
  children,
  variant,
}: {
  children: ReactNode;
  variant: 'clinic' | 'internal';
}) {
  const [isExpanded, setIsExpanded] = useState(() => {
    if (typeof window === 'undefined') return true;
    const saved = window.localStorage.getItem(SIDEBAR_STORAGE_KEY);
    return saved === '0' || saved === '1' ? saved === '1' : true;
  });
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    window.localStorage.setItem(SIDEBAR_STORAGE_KEY, isExpanded ? '1' : '0');
  }, [isExpanded]);

  const desktopSidebarWidth = useMemo(
    () => (isExpanded ? SIDEBAR_EXPANDED_WIDTH_PX : SIDEBAR_COLLAPSED_WIDTH_PX),
    [isExpanded]
  );

  return (
    <div
      className="flex h-screen overflow-hidden bg-white"
      style={
        ({
          '--app-sidebar-width':
            typeof window === 'undefined'
              ? 'var(--sidebar-width-initial, 240px)'
              : `${desktopSidebarWidth}px`,
        }) as CSSProperties
      }
    >
      {variant === 'clinic' ? (
        <ClinicSidebar
          isExpanded={isExpanded}
          isMobileOpen={isMobileOpen}
          onToggleExpanded={() => setIsExpanded((prev) => !prev)}
          onCloseMobile={() => setIsMobileOpen(false)}
        />
      ) : (
        <InternalSidebar
          isExpanded={isExpanded}
          isMobileOpen={isMobileOpen}
          onToggleExpanded={() => setIsExpanded((prev) => !prev)}
          onCloseMobile={() => setIsMobileOpen(false)}
        />
      )}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col pl-0 transition-[padding-left] duration-200 md:pl-[var(--app-sidebar-width)]">
        <UserNav onOpenMobileMenu={() => setIsMobileOpen(true)} />
        <main className="min-h-0 flex-1 overflow-auto bg-gray-50">{children}</main>
      </div>
    </div>
  );
}
