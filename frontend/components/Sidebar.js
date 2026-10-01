'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { clearAuth, getCompany } from '../lib/api';

const links = [
  { href: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { href: '/admissions', label: 'Admissions', icon: 'admissions' },
  { href: '/classes', label: 'Classes', icon: 'classes' },
  { href: '/gallery', label: 'Gallery', icon: 'gallery' },
  { href: '/feedback', label: 'Feedback', icon: 'feedback' },
  { href: '/webinars', label: 'Webinars', icon: 'webinars' },
  { href: '/fees', label: 'Fees', icon: 'fees' },
  { href: '/settings', label: 'Settings', icon: 'settings' },
];

function Icon({ name }) {
  const common = {
    width: 19,
    height: 19,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '1.8',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  };

  const paths = {
    dashboard: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
    admissions: <><path d="M4 5.5h16v13H4z" /><path d="M8 3v5M16 3v5M7 11h4M7 15h6" /></>,
    classes: <><path d="M3 10.5 12 4l9 6.5" /><path d="M5 10v10h14V10" /><path d="M9 20v-5h6v5" /></>,
    gallery: <><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="8.5" cy="9" r="1.5" /><path d="m4 17 5-5 3.5 3 2.5-2.5L20 17" /></>,
    feedback: <><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.2l1.1-6.2L3 9.6l6.2-.9z" /></>,
    webinars: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m10 9 5 3-5 3z" /></>,
    fees: <><rect x="4" y="6" width="16" height="12" rx="2" /><path d="M7 10h10M7 14h5" /></>,
    settings: <><path d="M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M3 12h2M19 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" /><circle cx="12" cy="12" r="5" /></>,
  };

  return <svg {...common}>{paths[name]}</svg>;
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const company = getCompany();

  const logout = () => {
    clearAuth();
    router.push('/login');
  };

  return (
    <aside className="sidebar-shell fixed left-0 top-0 z-40 flex min-h-screen w-72 p-4">
      <div className="flex min-h-full w-full flex-col overflow-hidden rounded-[24px] border border-[#d9ebe1] bg-[#eff9f3] shadow-[0_22px_60px_rgba(24,55,42,0.10)]">
        <div className="border-b border-[#d9ebe1] p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-[#1fa774] text-lg font-bold text-white shadow-[0_10px_20px_rgba(31,167,116,0.22)]">
              {company?.logoUrl ? (
                <img
                  src={(process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000') + company.logoUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                'K'
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6e877b]">School OS</p>
              <h1 className="truncate text-base font-bold text-[#17382b]">Kinder Garden</h1>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-white/80 bg-white/75 p-3">
            <p className="truncate text-sm font-semibold text-[#234b3a]">{company?.name || 'School'}</p>
            <p className="mt-1 truncate text-xs text-[#789087]">
              {company?.location || 'School location'}
            </p>
          </div>
        </div>

        <nav className="sidebar-nav flex-1 p-3">
          <p className="px-3 pb-2 pt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#86a095]">
            Workspace
          </p>

          <div className="space-y-1">
            {links.map((link) => {
              const active = pathname === link.href || pathname.startsWith(link.href + '/');

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={[
                    'sidebar-link flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200',
                    active
                      ? 'sidebar-link-active bg-white text-[#16845c] shadow-[0_8px_20px_rgba(31,167,116,0.10)]'
                      : 'text-[#587068] hover:-translate-y-px hover:bg-white/70 hover:text-[#1f7655]',
                  ].join(' ')}
                >
                  <span className={active ? 'text-[#1fa774]' : 'text-[#789087]'}>
                    <Icon name={link.icon} />
                  </span>
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-[#d9ebe1] p-3">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-[#687d74] transition hover:bg-white/70 hover:text-[#b04747]"
          >
            <svg
              width="19"
              height="19"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M10 5H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4" />
              <path d="M14 8l4 4-4 4M18 12H9" />
            </svg>
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}