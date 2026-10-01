'use client';

import { useEffect, useState } from 'react';
import AuthGuard from '../../components/AuthGuard';
import { api, getCompany } from '../../lib/api';

const statCards = [
  { key: 'total', label: 'Total Students', tone: 'text-[#1f6f52]', icon: 'students' },
  { key: 'pending', label: 'Pending Admissions', tone: 'text-[#a77708]', icon: 'pending' },
  { key: 'admitted', label: 'Admitted', tone: 'text-[#1b7c50]', icon: 'admitted' },
  { key: 'inquiries', label: 'New Inquiries', tone: 'text-[#397b64]', icon: 'inquiries' },
];

function StatIcon({ type }) {
  const paths = {
    students: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3.5 19c.7-3 2.6-4.5 5.5-4.5s4.8 1.5 5.5 4.5" />
        <path d="M15 7.5a3 3 0 0 1 5.5 1.6A3.8 3.8 0 0 1 23 12" />
      </>
    ),
    pending: (
      <>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    admitted: (
      <>
        <circle cx="12" cy="12" r="8.5" />
        <path d="m8.5 12 2.3 2.3 4.8-5" />
      </>
    ),
    inquiries: (
      <>
        <path d="M5 5h14v11H8l-3 3z" />
        <path d="M8 9h8M8 12h5" />
      </>
    ),
  };

  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e9f8f0] text-[#1fa774]">
      <svg
        width="21"
        height="21"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {paths[type]}
      </svg>
    </div>
  );
}

function StatCard({ item, value }) {
  return (
    <div className="card stat-card">
      <div className="relative z-10 flex items-start justify-between gap-4">
        <div>
          <p className="stat-label">{item.label}</p>
          <p className={'stat-value mt-3 ' + item.tone}>{value}</p>
        </div>
        <StatIcon type={item.icon} />
      </div>

      <div className="relative z-10 mt-5 h-1.5 overflow-hidden rounded-full bg-[#edf4f0]">
        <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-[#2aa86f] to-[#87d7b3]" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState({ total: 0, pending: 0, admitted: 0, inquiries: 0 });
  const [fbStats, setFbStats] = useState({ total: 0, approved: 0, pending: 0, avgRating: 0 });
  const [recent, setRecent] = useState([]);
  const [webinars, setWebinars] = useState([]);
  const company = getCompany();

  useEffect(() => {
    const cid = company?.id;
    if (!cid) return;

    api.admissionsStats(cid).then(setStats).catch(console.error);
    api.feedbackStats(cid).then(setFbStats).catch(console.error);
    api.listAdmissions({ companyId: cid }).then((d) => setRecent(d.slice(0, 8))).catch(console.error);
    api.listWebinars({ companyId: cid, status: 'upcoming' }).then(setWebinars).catch(console.error);
  }, []);

  return (
    <AuthGuard>
      <div>
        <section className="float-in mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#74a08f]">School overview</p>
            <h1 className="page-title mt-2 text-3xl font-bold">Dashboard</h1>
            <p className="page-subtitle mt-2 max-w-2xl text-sm">
              Admissions, parent feedback, students and upcoming webinars in one calm workspace.
            </p>
          </div>

          <div className="rounded-2xl border border-[#dcebe2] bg-white px-4 py-3 text-right shadow-[0_10px_28px_rgba(24,55,42,0.05)]">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#86a095]">School</p>
            <p className="mt-1 max-w-[240px] truncate text-sm font-semibold text-[#234b3a]">
              {company?.name || 'School'}
            </p>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map((item) => (
            <StatCard key={item.key} item={item} value={stats[item.key]} />
          ))}
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-2">
          <div className="card">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#86a095]">Parent trust</p>
                <h2 className="mt-1 text-lg font-semibold text-[#193c2e]">Feedback Stats</h2>
              </div>
              <span className="rounded-full bg-[#e9f8f0] px-3 py-1 text-xs font-semibold text-[#1b7c50]">
                {fbStats.avgRating || 0} ★ average
              </span>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-2xl bg-[#f6faf8] p-4">
                <p className="text-xs text-[#7b8f86]">Total</p>
                <p className="mt-1 text-xl font-bold text-[#234b3a]">{fbStats.total}</p>
              </div>
              <div className="rounded-2xl bg-[#eaf8f0] p-4">
                <p className="text-xs text-[#4d7865]">Approved</p>
                <p className="mt-1 text-xl font-bold text-[#19734b]">{fbStats.approved}</p>
              </div>
              <div className="rounded-2xl bg-[#fff8e5] p-4">
                <p className="text-xs text-[#95701a]">Pending</p>
                <p className="mt-1 text-xl font-bold text-[#a77708]">{fbStats.pending}</p>
              </div>
              <div className="rounded-2xl bg-[#f6faf8] p-4">
                <p className="text-xs text-[#7b8f86]">Avg Rating</p>
                <p className="mt-1 text-xl font-bold text-[#1f6f52]">{fbStats.avgRating || 0} ★</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#86a095]">Upcoming</p>
                <h2 className="mt-1 text-lg font-semibold text-[#193c2e]">Webinars</h2>
              </div>
              <span className="rounded-full bg-[#edf5ff] px-3 py-1 text-xs font-semibold text-[#3972a7]">
                {webinars.length} scheduled
              </span>
            </div>

            <div className="mt-5 space-y-3">
              {webinars.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#dcebe2] bg-[#f8fcfa] px-4 py-6 text-sm text-[#8a9b93]">
                  No upcoming webinars
                </div>
              ) : (
                webinars.slice(0, 4).map((w) => (
                  <div
                    key={w._id}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-[#e4eee8] bg-white p-4 shadow-[0_8px_24px_rgba(24,55,42,0.04)]"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#234b3a]">{w.title}</p>
                      <p className="mt-1 text-xs text-[#7b8f86]">
                        {w.eventDate ? new Date(w.eventDate).toLocaleDateString() : ''} · {w.slot}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-[#e9f8f0] px-2.5 py-1 text-xs font-semibold text-[#19734b]">
                      {w.registeredCount}/{w.maxParticipants}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        <section className="card mt-6 overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-[#e5eee9] pb-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#86a095]">Admissions</p>
              <h2 className="mt-1 text-lg font-semibold text-[#193c2e]">Recent Admissions</h2>
            </div>
            <span className="rounded-full bg-[#f1f7f3] px-3 py-1 text-xs font-medium text-[#587068]">
              Latest 8 records
            </span>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-[#e5eee9] text-left text-xs uppercase tracking-[0.08em] text-[#86988f]">
                  <th className="pb-3 font-semibold">Admission No</th>
                  <th className="pb-3 font-semibold">Child</th>
                  <th className="pb-3 font-semibold">Class</th>
                  <th className="pb-3 font-semibold">Parent Phone</th>
                  <th className="pb-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((s) => (
                  <tr key={s._id} className="table-row border-b border-[#edf3ef]">
                    <td className="py-3 font-mono text-xs text-[#517167]">{s.admissionNo}</td>
                    <td className="py-3">
                      <p className="font-semibold text-[#234b3a]">{s.name}</p>
                    </td>
                    <td className="py-3 text-[#587068]">{s.classId?.name || '-'}</td>
                    <td className="py-3 text-[#587068]">{s.parentPhone}</td>
                    <td className="py-3">
                      <span
                        className={[
                          'badge',
                          s.status === 'admitted'
                            ? 'badge-green'
                            : s.status === 'pending'
                            ? 'badge-yellow'
                            : s.status === 'rejected'
                            ? 'badge-red'
                            : 'badge-gray',
                        ].join(' ')}
                      >
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}

                {recent.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-[#8a9b93]">
                      No admissions yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AuthGuard>
  );
}