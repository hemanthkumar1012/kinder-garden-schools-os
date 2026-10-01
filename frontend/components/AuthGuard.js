'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getCompany, getToken } from '../lib/api';
import Sidebar from './Sidebar';

const pageNames = {
  '/dashboard': 'Dashboard',
  '/admissions': 'Admissions',
  '/classes': 'Classes',
  '/gallery': 'Gallery',
  '/feedback': 'Feedback',
  '/webinars': 'Webinars',
  '/fees': 'Fees',
};

export default function AuthGuard({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const company = getCompany();
  const pageName = pageNames[pathname] || 'School workspace';

  useEffect(() => {
    if (!getToken()) {
      router.replace('/login');
    } else {
      setReady(true);
    }
  }, [router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6faf8]">
        <div className="rounded-2xl border border-[#dcebe2] bg-white px-6 py-5 text-sm text-[#71847a] shadow-[0_16px_40px_rgba(24,55,42,0.08)]">
          Loading school workspace...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Sidebar />

      <main className="app-main ml-72">
        <header className="sticky top-0 z-30 px-6 pt-5 md:px-8">
          <div className="mx-auto flex max-w-[1600px] items-center justify-between rounded-2xl border border-[#dcebe2]/80 bg-white/80 px-4 py-3 shadow-[0_10px_30px_rgba(24,55,42,0.05)] backdrop-blur-xl">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#82a094]">Kinder Garden OS</p>
              <div className="mt-0.5 flex items-center gap-2">
                <h2 className="truncate text-sm font-semibold text-[#193c2e]">{pageName}</h2>
                {company?.location && (
                  <>
                    <span className="text-[#b1c3ba]">·</span>
                    <span className="truncate text-xs text-[#7c8f87]">{company.location}</span>
                  </>
                )}
              </div>
            </div>

            <div className="hidden items-center gap-2 rounded-full border border-[#dcebe2] bg-[#f5fbf7] px-3 py-1.5 text-xs font-medium text-[#507267] sm:flex">
              <span className="h-2 w-2 rounded-full bg-[#2aa86f] shadow-[0_0_0_4px_rgba(42,168,111,0.12)]" />
              School workspace
            </div>
          </div>
        </header>

        <div className="px-6 pb-10 pt-5 md:px-8">
          <div className="page-shell mx-auto max-w-[1600px]">{children}</div>
        </div>
      </main>
    </div>
  );
}