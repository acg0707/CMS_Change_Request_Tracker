'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function UserNav({ onOpenMobileMenu }: { onOpenMobileMenu?: () => void }) {
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setEmail(session?.user?.email ?? null);
    });
  }, []);

  async function handleLogout() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <header className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-gray-50 px-6 py-3">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="inline-flex rounded-md border border-gray-300 bg-white p-2 text-gray-700 hover:bg-gray-50 md:hidden"
          aria-label="Open navigation menu"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span className="text-base font-semibold text-[#1e3a5f]">CMS Change Request Tracker</span>
      </div>
      <div className="flex items-center gap-3">
        {email && (
          <span className="text-sm text-gray-600" title={email}>
            {email}
          </span>
        )}
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1e3a5f]/10 text-[#1e3a5f]"
          aria-hidden
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          disabled={loading}
          className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          {loading ? 'Signing out...' : 'Logout'}
        </button>
      </div>
    </header>
  );
}
