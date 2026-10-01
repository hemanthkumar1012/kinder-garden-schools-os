'use client';
import { useEffect, useState } from 'react';
import AuthGuard from '../../components/AuthGuard';
import { api, getCompany } from '../../lib/api';

export default function FeedbackPage() {
  const company = getCompany();
  const [list, setList] = useState([]);
  const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0, avgRating: 0 });

  const load = () => {
    if (!company?.id) return;
    api.listFeedback({ companyId: company.id }).then(setList).catch(console.error);
    api.feedbackStats(company.id).then(setStats).catch(console.error);
  };
  useEffect(() => { load(); }, []);

  const update = async (feedbackId, status, isPublic) => {
    try {
      await api.updateFeedbackStatus({ feedbackId, status, isPublic });
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  const stars = (n) => '★'.repeat(n) + '☆'.repeat(5 - n);

  return (
    <AuthGuard>
      <h1 className="text-2xl font-bold mb-6">Feedback</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="card"><p className="text-sm text-slate-500">Total</p><p className="text-2xl font-bold">{stats.total}</p></div>
        <div className="card border-l-4 border-emerald-400"><p className="text-sm text-slate-500">Approved Public</p><p className="text-2xl font-bold text-emerald-600">{stats.approved}</p></div>
        <div className="card border-l-4 border-amber-400"><p className="text-sm text-slate-500">Pending</p><p className="text-2xl font-bold text-amber-600">{stats.pending}</p></div>
        <div className="card border-l-4 border-teal-400"><p className="text-sm text-slate-500">Avg Rating</p><p className="text-2xl font-bold text-teal-600">{stats.avgRating} ★</p></div>
      </div>
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b">
                <th className="pb-2">Parent</th>
                <th className="pb-2">Child / Class</th>
                <th className="pb-2">Rating</th>
                <th className="pb-2">Message</th>
                <th className="pb-2">Status</th>
                <th className="pb-2">Public</th>
                <th className="pb-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((f) => (
                <tr key={f._id} className="border-b border-slate-100">
                  <td className="py-2">{f.parentName}<br/><span className="text-xs text-slate-400">{f.parentPhone}</span></td>
                  <td className="py-2">{f.childName || '-'}<br/><span className="text-xs">{f.classId?.name}</span></td>
                  <td className="py-2 text-amber-500">{stars(f.rating)}</td>
                  <td className="py-2 max-w-xs truncate">{f.message}</td>
                  <td className="py-2">
                    <span className={`badge ${
                      f.status === 'approved' ? 'badge-green' :
                      f.status === 'pending' ? 'badge-yellow' : 'badge-red'
                    }`}>{f.status}</span>
                  </td>
                  <td className="py-2">{f.isPublic ? 'Yes' : 'No'}</td>
                  <td className="py-2 space-x-1">
                    {f.status === 'pending' && (
                      <>
                        <button className="btn btn-success text-xs py-1 px-2" onClick={() => update(f._id, 'approved', true)}>Approve + Public</button>
                        <button className="btn btn-danger text-xs py-1 px-2" onClick={() => update(f._id, 'rejected')}>Reject</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {list.length === 0 && <tr><td colSpan={7} className="py-6 text-center text-slate-400">No feedback yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </AuthGuard>
  );
}
