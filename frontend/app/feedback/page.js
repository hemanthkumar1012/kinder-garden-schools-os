'use client';

import { useEffect, useState } from 'react';
import AuthGuard from '../../components/AuthGuard';
import { api, getCompany } from '../../lib/api';

function statusClass(status) {
  if (status === 'approved') return 'badge-green';
  if (status === 'pending') return 'badge-yellow';
  return 'badge-red';
}

function statusLabel(status) {
  if (status === 'approved') return 'Approved';
  if (status === 'pending') return 'Pending Approval';
  return 'Rejected';
}

function stars(rating) {
  return '★'.repeat(rating) + '☆'.repeat(5 - rating);
}

export default function FeedbackPage() {
  const company = getCompany();
  const [list, setList] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    avgRating: 0,
  });

  const load = () => {
    if (!company?.id) return;

    api.listFeedback({ companyId: company.id }).then(setList).catch(console.error);
    api.feedbackStats(company.id).then(setStats).catch(console.error);
  };

  useEffect(() => {
    load();
  }, []);

  const update = async (feedbackId, status, isPublic) => {
    try {
      await api.updateFeedbackStatus({
        feedbackId,
        status,
        isPublic,
      });
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <AuthGuard>
      <div>
        <div className="mb-7">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#74a08f]">Parent voice</p>
          <h1 className="page-title mt-2 text-3xl font-bold">Feedback</h1>
          <p className="page-subtitle mt-2 max-w-3xl text-sm">
            Review parent feedback, approve what is ready to publish and control whether approved feedback appears on the public school website.
          </p>
        </div>

        <div className="mb-6 grid gap-4 grid-cols-2 xl:grid-cols-4">
          <div className="card p-5">
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#87988f]">Total Feedbacks</p>
            <p className="mt-3 text-3xl font-bold text-[#234b3a]">{stats.total}</p>
            <p className="mt-1 text-xs text-[#8a9b93]">All feedback received</p>
          </div>

          <div className="card p-5 border-[#cfe8d9] bg-[#f9fdfb]">
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#5c8974]">Approved Public</p>
            <p className="mt-3 text-3xl font-bold text-[#19734b]">{stats.approved}</p>
            <p className="mt-1 text-xs text-[#6f8279]">Visible to website visitors</p>
          </div>

          <div className="card p-5">
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#a17b22]">Pending Approval</p>
            <p className="mt-3 text-3xl font-bold text-[#a77708]">{stats.pending}</p>
            <p className="mt-1 text-xs text-[#8a9b93]">Waiting for review</p>
          </div>

          <div className="card p-5 bg-[#f7fbf8]">
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#6f8279]">Average Rating</p>
            <p className="mt-3 text-3xl font-bold text-[#1f6f52]">{stats.avgRating || 0} ★</p>
            <p className="mt-1 text-xs text-[#8a9b93]">Approved feedback average</p>
          </div>
        </div>

        <div className="card min-w-0">
          <div className="mb-5 flex flex-col gap-3 border-b border-[#e5eee9] pb-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#86a095]">Moderation</p>
              <h2 className="mt-1 text-xl font-semibold text-[#193c2e]">Parent Feedback</h2>
            </div>

            <div className="rounded-full bg-[#f1f7f3] px-3 py-1 text-xs font-medium text-[#587068]">
              {list.length} records
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-sm">
              <thead>
                <tr className="border-b border-[#e5eee9] text-left text-xs uppercase tracking-[0.08em] text-[#86988f]">
                  <th className="pb-3 font-semibold">Parent</th>
                  <th className="pb-3 font-semibold">Child / Class</th>
                  <th className="pb-3 font-semibold">Rating</th>
                  <th className="pb-3 font-semibold">Message</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Public</th>
                  <th className="pb-3 font-semibold">Actions</th>
                </tr>
              </thead>

              <tbody>
                {list.map((feedback) => (
                  <tr key={feedback._id} className="table-row border-b border-[#edf3ef]">
                    <td className="py-4">
                      <p className="font-semibold text-[#34594a]">{feedback.parentName}</p>
                      <p className="mt-1 text-xs text-[#7b8f86]">{feedback.parentPhone}</p>
                    </td>

                    <td className="py-4">
                      <p className="font-medium text-[#456457]">
                        {feedback.childName || 'Child not provided'}
                      </p>
                      <p className="mt-1 text-xs text-[#8a9b93]">
                        {feedback.classId?.name || 'Class not provided'}
                      </p>
                    </td>

                    <td className="py-4">
                      <div className="text-base tracking-[0.08em] text-[#d49a2d]">
                        {stars(feedback.rating)}
                      </div>
                      <p className="mt-1 text-xs text-[#8a9b93]">{feedback.rating}/5</p>
                    </td>

                    <td className="py-4">
                      <p className="max-w-[300px] truncate text-[#52685e]" title={feedback.message}>
                        {feedback.message || 'No message provided'}
                      </p>
                    </td>

                    <td className="py-4">
                      <span className={'badge ' + statusClass(feedback.status)}>
                        {statusLabel(feedback.status)}
                      </span>
                    </td>

                    <td className="py-4">
                      {feedback.isPublic ? (
                        <span className="badge badge-green">Yes</span>
                      ) : (
                        <span className="badge badge-gray">No</span>
                      )}
                    </td>

                    <td className="py-4">
                      <div className="flex max-w-[300px] flex-wrap gap-2">
                        {feedback.status === 'pending' && (
                          <>
                            <button
                              className="btn btn-success px-3 py-1.5 text-xs"
                              onClick={() => update(feedback._id, 'approved', true)}
                            >
                              Approve + Public
                            </button>

                            <button
                              className="btn btn-danger px-3 py-1.5 text-xs"
                              onClick={() => update(feedback._id, 'rejected', false)}
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {feedback.status === 'approved' && feedback.isPublic && (
                          <button
                            className="btn btn-secondary px-3 py-1.5 text-xs"
                            onClick={() => update(feedback._id, 'approved', false)}
                          >
                            Remove from Website
                          </button>
                        )}

                        {feedback.status === 'approved' && !feedback.isPublic && (
                          <button
                            className="btn btn-primary px-3 py-1.5 text-xs"
                            onClick={() => update(feedback._id, 'approved', true)}
                          >
                            Show on Website
                          </button>
                        )}

                        {feedback.status === 'rejected' && (
                          <button
                            className="btn btn-secondary px-3 py-1.5 text-xs"
                            onClick={() => update(feedback._id, 'pending', false)}
                          >
                            Review Again
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {list.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center">
                      <p className="font-medium text-[#587068]">No feedback yet</p>
                      <p className="mt-1 text-xs text-[#8a9b93]">
                        Feedback submitted from the public school page will appear here.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}