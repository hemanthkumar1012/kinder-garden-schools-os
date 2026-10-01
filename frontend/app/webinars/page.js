'use client';

import { useEffect, useMemo, useState } from 'react';
import AuthGuard from '../../components/AuthGuard';
import { api, getCompany } from '../../lib/api';

const TOPICS = [
  { value: 'parenting', label: 'Parenting' },
  { value: 'child-development', label: 'Child Development' },
  { value: 'nutrition', label: 'Nutrition' },
  { value: 'admission-info', label: 'Admission Information' },
  { value: 'activity-demo', label: 'Activity Demo' },
];

const STATUS_LABELS = {
  upcoming: 'Upcoming',
  live: 'Live',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

function statusClass(status) {
  if (status === 'live') return 'badge-green';
  if (status === 'upcoming') return 'badge-blue';
  if (status === 'completed') return 'badge-gray';
  return 'badge-red';
}

function topicLabel(topic) {
  return TOPICS.find((item) => item.value === topic)?.label || topic;
}

export default function WebinarsPage() {
  const company = getCompany();
  const [list, setList] = useState([]);
  const [regs, setRegs] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({
    title: '',
    topic: 'parenting',
    description: '',
    speakerName: '',
    speakerBio: '',
    eventDate: '',
    slot: '10:00-11:00',
    durationMins: 60,
    meetingLink: '',
    maxParticipants: 100,
    thumbnail: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    if (!company?.id) return;
    api.listWebinars({ companyId: company.id }).then(setList).catch(console.error);
  };

  useEffect(() => {
    load();
  }, []);

  const thumbnailPreview = useMemo(
    () => (form.thumbnail ? URL.createObjectURL(form.thumbnail) : ''),
    [form.thumbnail]
  );

  useEffect(() => {
    return () => {
      if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
    };
  }, [thumbnailPreview]);

  const handle = (e) => {
    const { name, value, files } = e.target;

    if (files) {
      setForm({ ...form, thumbnail: files[0] });
      return;
    }

    setForm({ ...form, [name]: value });
    setError('');
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const fd = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        if (value !== null && value !== '') {
          fd.append(key, value);
        }
      });

      await api.createWebinar(fd);

      setForm({
        title: '',
        topic: 'parenting',
        description: '',
        speakerName: '',
        speakerBio: '',
        eventDate: '',
        slot: '10:00-11:00',
        durationMins: 60,
        meetingLink: '',
        maxParticipants: 100,
        thumbnail: null,
      });

      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const setStatus = async (webinarId, status) => {
    try {
      await api.updateWebinarStatus({ webinarId, status });
      load();
      if (selected?._id === webinarId) {
        setSelected({ ...selected, status });
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const showRegs = async (webinar) => {
    setSelected(webinar);

    try {
      const registrations = await api.webinarRegistrations(webinar._id);
      setRegs(registrations);
    } catch (err) {
      alert(err.message);
    }
  };

  const upcomingCount = list.filter((item) => item.status === 'upcoming').length;
  const liveCount = list.filter((item) => item.status === 'live').length;
  const registrationCount = list.reduce(
    (sum, item) => sum + Number(item.registeredCount || 0),
    0
  );

  return (
    <AuthGuard>
      <div>
        <div className="mb-7">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#74a08f]">Parent sessions</p>
          <h1 className="page-title mt-2 text-3xl font-bold">Webinars</h1>
          <p className="page-subtitle mt-2 max-w-3xl text-sm">
            Create school sessions, share the meeting link, track registrations and move each webinar from upcoming to live or completed.
          </p>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
          <div className="card p-4">
            <p className="text-xs text-[#7b8f86]">Total Webinars</p>
            <p className="mt-1 text-2xl font-bold text-[#234b3a]">{list.length}</p>
          </div>

          <div className="card p-4">
            <p className="text-xs text-[#7b8f86]">Upcoming</p>
            <p className="mt-1 text-2xl font-bold text-[#3972a7]">{upcomingCount}</p>
          </div>

          <div className="card p-4">
            <p className="text-xs text-[#7b8f86]">Live Now</p>
            <p className="mt-1 text-2xl font-bold text-[#19734b]">{liveCount}</p>
          </div>

          <div className="card p-4">
            <p className="text-xs text-[#7b8f86]">Registrations</p>
            <p className="mt-1 text-2xl font-bold text-[#1f6f52]">{registrationCount}</p>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[460px_1fr]">
          <div className="card">
            <div className="mb-5">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#86a095]">New session</p>
              <h2 className="mt-1 text-xl font-semibold text-[#193c2e]">Create Webinar</h2>
              <p className="mt-1 text-xs leading-5 text-[#7b8f86]">
                Add the information families will see before registering.
              </p>
            </div>

            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="label">Webinar Title *</label>
                <input
                  className="input"
                  name="title"
                  value={form.title}
                  onChange={handle}
                  required
                  placeholder="Parenting Tips for 3-5 Years"
                />
              </div>

              <div>
                <label className="label">Topic</label>
                <select className="input" name="topic" value={form.topic} onChange={handle}>
                  {TOPICS.map((topic) => (
                    <option key={topic.value} value={topic.value}>
                      {topic.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Description</label>
                <textarea
                  className="input"
                  name="description"
                  value={form.description}
                  onChange={handle}
                  rows={3}
                  placeholder="Explain what parents will learn"
                />
              </div>

              <div className="rounded-2xl border border-[#dcebe2] bg-[#f7fbf8] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#86a095]">
                  Speaker
                </p>

                <div className="mt-3 space-y-3">
                  <div>
                    <label className="label">Speaker Name</label>
                    <input
                      className="input bg-white"
                      name="speakerName"
                      value={form.speakerName}
                      onChange={handle}
                      placeholder="Dr XYZ"
                    />
                  </div>

                  <div>
                    <label className="label">Speaker Bio</label>
                    <textarea
                      className="input bg-white"
                      name="speakerBio"
                      value={form.speakerBio}
                      onChange={handle}
                      rows={2}
                      placeholder="Short speaker introduction"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="label">Event Date *</label>
                <input
                  className="input"
                  type="date"
                  name="eventDate"
                  value={form.eventDate}
                  onChange={handle}
                  required
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="label">Time Slot</label>
                  <input
                    className="input"
                    name="slot"
                    value={form.slot}
                    onChange={handle}
                    placeholder="10:00-11:00"
                  />
                  <p className="mt-1 text-[11px] text-[#8a9b93]">Example: 10:00-11:00</p>
                </div>

                <div>
                  <label className="label">Duration (minutes)</label>
                  <input
                    className="input"
                    type="number"
                    min="1"
                    name="durationMins"
                    value={form.durationMins}
                    onChange={handle}
                  />
                </div>
              </div>

              <div>
                <label className="label">Meeting Link</label>
                <input
                  className="input"
                  name="meetingLink"
                  value={form.meetingLink}
                  onChange={handle}
                  placeholder="Zoom or Google Meet link"
                />
              </div>

              <div>
                <label className="label">Maximum Participants</label>
                <input
                  className="input"
                  type="number"
                  min="1"
                  name="maxParticipants"
                  value={form.maxParticipants}
                  onChange={handle}
                />
                <p className="mt-1 text-[11px] text-[#8a9b93]">
                  Registration closes when this number is reached.
                </p>
              </div>

              <div>
                <label className="label">Thumbnail</label>
                <label className="mt-1 flex cursor-pointer items-center gap-4 rounded-2xl border border-dashed border-[#acd8c0] bg-[#f7fbf8] p-3 transition hover:border-[#71c19b] hover:bg-[#eff9f3]">
                  {thumbnailPreview ? (
                    <img
                      src={thumbnailPreview}
                      alt="Thumbnail preview"
                      className="h-16 w-24 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-24 items-center justify-center rounded-xl bg-[#e6f6ed] text-[#1fa774]">
                      +
                    </div>
                  )}

                  <div>
                    <p className="text-sm font-semibold text-[#34594a]">
                      {form.thumbnail ? form.thumbnail.name : 'Choose a thumbnail'}
                    </p>
                    <p className="mt-1 text-xs text-[#82948d]">
                      This image represents the webinar.
                    </p>
                  </div>

                  <input
                    className="hidden"
                    type="file"
                    name="thumbnail"
                    accept="image/*"
                    onChange={handle}
                  />
                </label>
              </div>

              {error && (
                <div className="rounded-2xl border border-[#f0c9c9] bg-[#fff5f5] px-3 py-2.5 text-sm text-[#a33c3c]">
                  {error}
                </div>
              )}

              <button type="submit" className="btn btn-primary w-full py-3" disabled={loading}>
                {loading ? 'Creating Webinar...' : 'Create Webinar'}
              </button>
            </form>
          </div>

          <div className="space-y-6">
            <div className="card min-w-0">
              <div className="mb-5 flex flex-col gap-3 border-b border-[#e5eee9] pb-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#86a095]">Sessions</p>
                  <h2 className="mt-1 text-xl font-semibold text-[#193c2e]">All Webinars</h2>
                </div>

                <span className="rounded-full bg-[#f1f7f3] px-3 py-1 text-xs font-medium text-[#587068]">
                  {list.length} sessions
                </span>
              </div>

              <div className="space-y-4">
                {list.map((webinar) => {
                  const remaining = Math.max(
                    0,
                    Number(webinar.maxParticipants || 0) - Number(webinar.registeredCount || 0)
                  );

                  return (
                    <article
                      key={webinar._id}
                      className="rounded-2xl border border-[#dcebe2] bg-[#fbfefc] p-5 shadow-[0_8px_24px_rgba(24,55,42,0.04)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(24,55,42,0.08)]"
                    >
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={'badge ' + statusClass(webinar.status)}>
                              {STATUS_LABELS[webinar.status] || webinar.status}
                            </span>
                            <span className="badge badge-gray">
                              {topicLabel(webinar.topic)}
                            </span>
                          </div>

                          <h3 className="mt-3 text-lg font-semibold text-[#234b3a]">
                            {webinar.title}
                          </h3>

                          {webinar.description && (
                            <p className="mt-2 text-sm leading-6 text-[#6f8279]">
                              {webinar.description}
                            </p>
                          )}

                          <div className="mt-4 grid gap-2 text-xs sm:grid-cols-2">
                            <div className="rounded-xl bg-white p-3">
                              <p className="text-[#83948c]">When</p>
                              <p className="mt-1 font-semibold text-[#456457]">
                                {webinar.eventDate
                                  ? new Date(webinar.eventDate).toLocaleDateString()
                                  : 'Date not set'}
                                {' · '}
                                {webinar.slot}
                              </p>
                            </div>

                            <div className="rounded-xl bg-white p-3">
                              <p className="text-[#83948c]">Speaker</p>
                              <p className="mt-1 font-semibold text-[#456457]">
                                {webinar.speakerName || 'Speaker not set'}
                              </p>
                            </div>

                            <div className="rounded-xl bg-white p-3">
                              <p className="text-[#83948c]">Participants</p>
                              <p className="mt-1 font-semibold text-[#456457]">
                                {webinar.registeredCount}/{webinar.maxParticipants}
                              </p>
                            </div>

                            <div className="rounded-xl bg-white p-3">
                              <p className="text-[#83948c]">Seats Remaining</p>
                              <p className="mt-1 font-semibold text-[#456457]">{remaining}</p>
                            </div>
                          </div>

                          {webinar.meetingLink && (
                            <a
                              href={webinar.meetingLink}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-4 inline-flex items-center rounded-xl bg-[#eaf8f0] px-3 py-2 text-xs font-semibold text-[#19734b] transition hover:bg-[#def3e7]"
                            >
                              Open Meeting Link
                            </a>
                          )}
                        </div>

                        <div className="flex shrink-0 flex-wrap gap-2 lg:w-[175px] lg:justify-end">
                          <button
                            className="btn btn-secondary px-3 py-2 text-xs"
                            onClick={() => showRegs(webinar)}
                          >
                            Registrations
                          </button>

                          {webinar.status === 'upcoming' && (
                            <button
                              className="btn btn-success px-3 py-2 text-xs"
                              onClick={() => setStatus(webinar._id, 'live')}
                            >
                              Go Live
                            </button>
                          )}

                          {webinar.status === 'live' && (
                            <button
                              className="btn btn-secondary px-3 py-2 text-xs"
                              onClick={() => setStatus(webinar._id, 'completed')}
                            >
                              Mark Completed
                            </button>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}

                {list.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-[#dcebe2] bg-[#f8fcfa] px-4 py-12 text-center">
                    <p className="font-medium text-[#587068]">No webinars yet</p>
                    <p className="mt-1 text-xs text-[#8a9b93]">
                      Create the first parent session using the form.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {selected && (
              <div className="card">
                <div className="mb-5 flex flex-col gap-2 border-b border-[#e5eee9] pb-4 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#86a095]">Registrations</p>
                    <h3 className="mt-1 text-xl font-semibold text-[#193c2e]">
                      {selected.title}
                    </h3>
                  </div>

                  <span className="rounded-full bg-[#e9f8f0] px-3 py-1 text-xs font-semibold text-[#19734b]">
                    {regs.length} registered
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px] text-sm">
                    <thead>
                      <tr className="border-b border-[#e5eee9] text-left text-xs uppercase tracking-[0.08em] text-[#86988f]">
                        <th className="pb-3 font-semibold">Parent</th>
                        <th className="pb-3 font-semibold">Phone</th>
                        <th className="pb-3 font-semibold">Child</th>
                        <th className="pb-3 font-semibold">Email</th>
                      </tr>
                    </thead>

                    <tbody>
                      {regs.map((registration) => (
                        <tr key={registration._id} className="table-row border-b border-[#edf3ef]">
                          <td className="py-3 font-medium text-[#456457]">{registration.parentName}</td>
                          <td className="py-3 text-[#6f8279]">{registration.parentPhone}</td>
                          <td className="py-3 text-[#456457]">
                            {registration.childName || '-'}
                            {registration.childAge ? ' · ' + registration.childAge + ' yrs' : ''}
                          </td>
                          <td className="py-3 text-[#6f8279]">{registration.email || '-'}</td>
                        </tr>
                      ))}

                      {regs.length === 0 && (
                        <tr>
                          <td colSpan={4} className="py-10 text-center text-[#8a9b93]">
                            No registrations yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}