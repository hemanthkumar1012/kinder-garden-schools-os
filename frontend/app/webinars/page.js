'use client';
import { useEffect, useState } from 'react';
import AuthGuard from '../../components/AuthGuard';
import { api, getCompany } from '../../lib/api';

const TOPICS = ['parenting', 'child-development', 'nutrition', 'admission-info', 'activity-demo'];

export default function WebinarsPage() {
  const company = getCompany();
  const [list, setList] = useState([]);
  const [regs, setRegs] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({
    title: '', topic: 'parenting', description: '', speakerName: '', speakerBio: '',
    eventDate: '', slot: '10:00-11:00', durationMins: 60, meetingLink: '', maxParticipants: 100, thumbnail: null,
  });
  const [loading, setLoading] = useState(false);

  const load = () => {
    if (!company?.id) return;
    api.listWebinars({ companyId: company.id }).then(setList).catch(console.error);
  };
  useEffect(() => { load(); }, []);

  const handle = (e) => {
    const { name, value, files } = e.target;
    if (files) setForm({ ...form, thumbnail: files[0] });
    else setForm({ ...form, [name]: value });
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== null && v !== '') fd.append(k, v);
      });
      await api.createWebinar(fd);
      setForm({ title: '', topic: 'parenting', description: '', speakerName: '', speakerBio: '', eventDate: '', slot: '10:00-11:00', durationMins: 60, meetingLink: '', maxParticipants: 100, thumbnail: null });
      load();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const setStatus = async (webinarId, status) => {
    await api.updateWebinarStatus({ webinarId, status });
    load();
  };

  const showRegs = async (w) => {
    setSelected(w);
    const r = await api.webinarRegistrations(w._id);
    setRegs(r);
  };

  return (
    <AuthGuard>
      <h1 className="text-2xl font-bold mb-6">Webinars</h1>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="card">
          <h2 className="font-semibold mb-4">Create Webinar</h2>
          <form onSubmit={submit} className="space-y-3">
            <div>
              <label className="label">Title *</label>
              <input className="input" name="title" value={form.title} onChange={handle} required />
            </div>
            <div>
              <label className="label">Topic</label>
              <select className="input" name="topic" value={form.topic} onChange={handle}>
                {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Description</label>
              <textarea className="input" name="description" value={form.description} onChange={handle} rows={2} />
            </div>
            <div>
              <label className="label">Speaker Name</label>
              <input className="input" name="speakerName" value={form.speakerName} onChange={handle} />
            </div>
            <div>
              <label className="label">Speaker Bio</label>
              <input className="input" name="speakerBio" value={form.speakerBio} onChange={handle} />
            </div>
            <div>
              <label className="label">Event Date *</label>
              <input className="input" type="date" name="eventDate" value={form.eventDate} onChange={handle} required />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="label">Slot</label>
                <input className="input" name="slot" value={form.slot} onChange={handle} />
              </div>
              <div>
                <label className="label">Duration (mins)</label>
                <input className="input" type="number" name="durationMins" value={form.durationMins} onChange={handle} />
              </div>
            </div>
            <div>
              <label className="label">Meeting Link</label>
              <input className="input" name="meetingLink" value={form.meetingLink} onChange={handle} placeholder="https://zoom.us/..." />
            </div>
            <div>
              <label className="label">Max Participants</label>
              <input className="input" type="number" name="maxParticipants" value={form.maxParticipants} onChange={handle} />
            </div>
            <div>
              <label className="label">Thumbnail</label>
              <input className="input" type="file" name="thumbnail" accept="image/*" onChange={handle} />
            </div>
            <button type="submit" className="btn btn-primary w-full" disabled={loading}>Create Webinar</button>
          </form>
        </div>
        <div className="lg:col-span-2 space-y-4">
          <div className="card">
            <h2 className="font-semibold mb-4">All Webinars</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500 border-b">
                    <th className="pb-2">Title</th>
                    <th className="pb-2">Date / Slot</th>
                    <th className="pb-2">Speaker</th>
                    <th className="pb-2">Reg</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((w) => (
                    <tr key={w._id} className="border-b border-slate-100">
                      <td className="py-2">
                        <div className="font-medium">{w.title}</div>
                        <span className="badge badge-blue text-xs">{w.topic}</span>
                      </td>
                      <td className="py-2">{w.eventDate ? new Date(w.eventDate).toLocaleDateString() : ''}<br/><span className="text-xs">{w.slot}</span></td>
                      <td className="py-2">{w.speakerName || '-'}</td>
                      <td className="py-2">{w.registeredCount}/{w.maxParticipants}</td>
                      <td className="py-2">
                        <span className={`badge ${
                          w.status === 'upcoming' ? 'badge-blue' :
                          w.status === 'live' ? 'badge-green' :
                          w.status === 'completed' ? 'badge-gray' : 'badge-red'
                        }`}>{w.status}</span>
                      </td>
                      <td className="py-2 space-x-1">
                        <button className="btn btn-secondary text-xs py-1 px-2" onClick={() => showRegs(w)}>Regs</button>
                        {w.status === 'upcoming' && <button className="btn btn-success text-xs py-1 px-2" onClick={() => setStatus(w._id, 'live')}>Go Live</button>}
                        {w.status === 'live' && <button className="btn btn-secondary text-xs py-1 px-2" onClick={() => setStatus(w._id, 'completed')}>Complete</button>}
                      </td>
                    </tr>
                  ))}
                  {list.length === 0 && <tr><td colSpan={6} className="py-6 text-center text-slate-400">No webinars</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
          {selected && (
            <div className="card">
              <h3 className="font-semibold mb-2">Registrations — {selected.title}</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500 border-b">
                    <th className="pb-2">Parent</th>
                    <th className="pb-2">Phone</th>
                    <th className="pb-2">Child</th>
                    <th className="pb-2">Email</th>
                  </tr>
                </thead>
                <tbody>
                  {regs.map((r) => (
                    <tr key={r._id} className="border-b border-slate-50">
                      <td className="py-1">{r.parentName}</td>
                      <td className="py-1">{r.parentPhone}</td>
                      <td className="py-1">{r.childName} ({r.childAge})</td>
                      <td className="py-1">{r.email}</td>
                    </tr>
                  ))}
                  {regs.length === 0 && <tr><td colSpan={4} className="py-3 text-slate-400">No registrations</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
