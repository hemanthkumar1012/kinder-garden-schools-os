'use client';
import { useEffect, useState } from 'react';
import AuthGuard from '../../components/AuthGuard';
import { api, getCompany } from '../../lib/api';

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
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="card">
            <p className="text-sm text-slate-500">Total Students</p>
            <p className="text-3xl font-bold text-slate-800">{stats.total}</p>
          </div>
          <div className="card border-l-4 border-amber-400">
            <p className="text-sm text-slate-500">Pending Admissions</p>
            <p className="text-3xl font-bold text-amber-600">{stats.pending}</p>
          </div>
          <div className="card border-l-4 border-emerald-400">
            <p className="text-sm text-slate-500">Admitted</p>
            <p className="text-3xl font-bold text-emerald-600">{stats.admitted}</p>
          </div>
          <div className="card border-l-4 border-blue-400">
            <p className="text-sm text-slate-500">New Inquiries</p>
            <p className="text-3xl font-bold text-blue-600">{stats.inquiries}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="card">
            <h2 className="font-semibold mb-3">Feedback Stats</h2>
            <div className="flex gap-6 text-sm">
              <div><span className="text-slate-500">Total</span><br/><span className="text-xl font-bold">{fbStats.total}</span></div>
              <div><span className="text-slate-500">Approved</span><br/><span className="text-xl font-bold text-emerald-600">{fbStats.approved}</span></div>
              <div><span className="text-slate-500">Pending</span><br/><span className="text-xl font-bold text-amber-600">{fbStats.pending}</span></div>
              <div><span className="text-slate-500">Avg Rating</span><br/><span className="text-xl font-bold text-teal-600">{fbStats.avgRating || 0} ★</span></div>
            </div>
          </div>
          <div className="card">
            <h2 className="font-semibold mb-3">Upcoming Webinars</h2>
            {webinars.length === 0 ? (
              <p className="text-sm text-slate-400">No upcoming webinars</p>
            ) : (
              <ul className="space-y-2">
                {webinars.slice(0, 4).map((w) => (
                  <li key={w._id} className="text-sm flex justify-between">
                    <span className="font-medium">{w.title}</span>
                    <span className="text-slate-500">{w.eventDate ? new Date(w.eventDate).toLocaleDateString() : ''} · {w.registeredCount}/{w.maxParticipants}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="card">
          <h2 className="font-semibold mb-4">Recent Admissions</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b">
                  <th className="pb-2">Admission No</th>
                  <th className="pb-2">Child</th>
                  <th className="pb-2">Class</th>
                  <th className="pb-2">Parent Phone</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((s) => (
                  <tr key={s._id} className="border-b border-slate-100">
                    <td className="py-2 font-mono text-xs">{s.admissionNo}</td>
                    <td className="py-2">{s.name}</td>
                    <td className="py-2">{s.classId?.name || '-'}</td>
                    <td className="py-2">{s.parentPhone}</td>
                    <td className="py-2">
                      <span className={`badge ${
                        s.status === 'admitted' ? 'badge-green' :
                        s.status === 'pending' ? 'badge-yellow' :
                        s.status === 'rejected' ? 'badge-red' : 'badge-gray'
                      }`}>{s.status}</span>
                    </td>
                  </tr>
                ))}
                {recent.length === 0 && (
                  <tr><td colSpan={5} className="py-4 text-center text-slate-400">No admissions yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
