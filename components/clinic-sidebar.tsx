'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import AppSidebar from '@/components/app-sidebar';
import { useHasUnreadNotifications } from '@/lib/use-has-unread-notifications';

const NAV_ITEMS = [
  { href: '/clinic/tickets', label: 'All tickets', icon: 'tickets' },
  { href: '/clinic/profile', label: 'Profile', icon: 'profile' },
  { href: '/clinic/notifications', label: 'Notifications', icon: 'notifications' },
] as const;

function NavIcon({ icon }: { icon: string }) {
  if (icon === 'tickets') {
    return (
      <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    );
  }
  if (icon === 'profile') {
    return (
      <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    );
  }
  if (icon === 'notifications') {
    return (
      <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    );
  }
  return null;
}

export default function ClinicSidebar({
  isExpanded,
  isMobileOpen,
  onToggleExpanded,
  onCloseMobile,
}: {
  isExpanded: boolean;
  isMobileOpen: boolean;
  onToggleExpanded: () => void;
  onCloseMobile: () => void;
}) {
  const pathname = usePathname();
  const hasUnreadNotifications = useHasUnreadNotifications();
  const items: {
    href: string;
    label: string;
    icon: ReactNode;
    isActive: boolean;
    showUnreadDot?: boolean;
  }[] = NAV_ITEMS.map((item) => ({
    href: item.href,
    label: item.label,
    icon: <NavIcon icon={item.icon} />,
    isActive: item.href === '/clinic/tickets' ? pathname.startsWith('/clinic/tickets') : pathname.startsWith(item.href),
    showUnreadDot: item.href === '/clinic/notifications' && hasUnreadNotifications,
  }));

  return (
    <AppSidebar
      items={items}
      isExpanded={isExpanded}
      isMobileOpen={isMobileOpen}
      onToggleExpanded={onToggleExpanded}
      onCloseMobile={onCloseMobile}
    />
  );
}
