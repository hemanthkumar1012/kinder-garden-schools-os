'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { clearAuth, getCompany } from '../lib/api';

const links = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/admissions', label: 'Admissions', icon: '📝' },
  { href: '/classes', label: 'Classes', icon: '🏫' },
  { href: '/gallery', label: 'Gallery', icon: '🖼️' },
  { href: '/feedback', label: 'Feedback', icon: '⭐' },
  { href: '/webinars', label: 'Webinars', icon: '🎥' },
  { href: '/fees', label: 'Fees', icon: '💰' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const company = getCompany();

  const logout = () => {
    clearAuth();
    router.push('/login');
  };

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen flex flex-col fixed left-0 top-0">
      <div className="p-5 border-b border-slate-700">
        <h1 className="text-lg font-bold text-teal-400">Kinder Garden OS</h1>
        <p className="text-xs text-slate-400 mt-1 truncate">{company?.name || 'School'}</p>
        <p className="text-xs text-slate-500">{company?.subdomain}.school</p>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
              pathname === l.href ? 'bg-teal-600 text-white' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <span>{l.icon}</span>
            {l.label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-700">
        <button onClick={logout} className="w-full text-left text-sm text-slate-400 hover:text-white">
          Logout
        </button>
      </div>
    </aside>
  );
}
