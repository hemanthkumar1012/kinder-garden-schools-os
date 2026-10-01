'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '../../../lib/api';

const API_HOST = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';

export default function PublicSchoolPage() {
  const { subdomain } = useParams();
  const [company, setCompany] = useState(null);
  const [companyId, setCompanyId] = useState('');
  const [classes, setClasses] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [webinars, setWebinars] = useState([]);
  const [cat, setCat] = useState('');
  const [msg, setMsg] = useState('');
  const [admForm, setAdmForm] = useState({
    childName: '', age: '', parentName: '', parentPhone: '', classId: '', message: '', photo: null,
  });
  const [regForm, setRegForm] = useState({
    webinarId: '', parentName: '', parentPhone: '', childName: '', childAge: '', email: '',
  });
  const [fbForm, setFbForm] = useState({
    parentName: '', parentPhone: '', childName: '', rating: 5, message: '',
  });

  useEffect(() => {
    if (!subdomain) return;
    api.publicClasses(subdomain)
      .then((d) => {
        setCompany(d.company);
        setCompanyId(d.company?._id || '');
        setClasses(d.classes || []);
      })
      .catch(() => setCompany(null));
    api.publicGallery(subdomain, cat || undefined).then(setGallery).catch(console.error);
    api.publicFeedback(subdomain).then(setFeedback).catch(console.error);
    api.publicWebinars(subdomain).then(setWebinars).catch(console.error);
  }, [subdomain, cat]);

  const submitAdmission = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      const fd = new FormData();
      fd.append('companyId', companyId);
      Object.entries(admForm).forEach(([k, v]) => {
        if (v) fd.append(k, v);
      });
      fd.append('source', 'Website');
      const res = await api.createAdmission(fd);
      setMsg(`Admission submitted! No: ${res.admissionNo}`);
      setAdmForm({
        childName: '', age: '', parentName: '', parentPhone: '', classId: '', message: '', photo: null,
      });
    } catch (err) {
      setMsg(err.message);
    }
  };

  const submitReg = async (e) => {
    e.preventDefault();
    try {
      await api.registerWebinar({ ...regForm, companyId });
      setMsg('Registered! Meeting link sent via WhatsApp.');
      setRegForm({
        webinarId: '', parentName: '', parentPhone: '', childName: '', childAge: '', email: '',
      });
    } catch (err) {
      setMsg(err.message);
    }
  };

  const submitFb = async (e) => {
    e.preventDefault();
    try {
      await api.createFeedback({
        ...fbForm,
        companyId,
        rating: Number(fbForm.rating),
      });
      setMsg('Thank you for your feedback!');
      setFbForm({ parentName: '', parentPhone: '', childName: '', rating: 5, message: '' });
    } catch (err) {
      setMsg(err.message);
    }
  };

  if (company === null) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        School not found
      </div>
    );
  }
  if (!company) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">Loading...</div>
    );
  }

  const upcoming = webinars.filter((w) => w.status === 'upcoming' || w.status === 'live');

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white">
      <header className="bg-teal-700 text-white py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold">{company.name}</h1>
          <p className="text-teal-100 mt-1">
            {company.location} · {company.schoolType}
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-12">
        {msg && <div className="bg-teal-100 text-teal-800 px-4 py-2 rounded-lg">{msg}</div>}

        <section>
          <h2 className="text-xl font-bold mb-4">Our Classes</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {classes.map((c) => (
              <div key={c._id} className="card">
                <h3 className="font-semibold text-teal-700">{c.name}</h3>
                <p className="text-sm text-slate-500">{c.ageGroup}</p>
                <p className="text-sm mt-1">
                  Capacity: {c.studentsCount}/{c.capacity}
                </p>
                <p className="text-sm font-medium">₹{c.feesAnnual?.toLocaleString()}/year</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">Gallery</h2>
          <div className="flex gap-2 mb-4 flex-wrap">
            <button
              className={`btn text-xs ${!cat ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setCat('')}
            >
              All
            </button>
            {['classroom', 'activity', 'event', 'festival'].map((c) => (
              <button
                key={c}
                className={`btn text-xs ${cat === c ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setCat(c)}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {gallery.map((g) => (
              <div key={g._id} className="card">
                <h3 className="font-semibold">{g.title}</h3>
                <p className="text-xs text-slate-500 mb-2">
                  {g.category}
                  {g.eventDate ? ` · ${new Date(g.eventDate).toLocaleDateString()}` : ''}
                </p>
                <div className="flex gap-1 flex-wrap">
                  {(g.images || []).slice(0, 4).map((img, i) => (
                    <img
                      key={i}
                      src={`${API_HOST}${img}`}
                      alt=""
                      className="w-16 h-16 object-cover rounded"
                    />
                  ))}
                </div>
              </div>
            ))}
            {gallery.length === 0 && <p className="text-slate-400">No public albums</p>}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">Parent Feedback</h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            {feedback.map((f) => (
              <div key={f._id} className="card">
                <div className="text-amber-500 text-sm">
                  {'★'.repeat(f.rating)}
                  {'☆'.repeat(5 - f.rating)}
                </div>
                <p className="text-sm mt-1">{f.message}</p>
                <p className="text-xs text-slate-400 mt-2">
                  — {f.parentName}
                  {f.childName ? ` (${f.childName})` : ''}
                </p>
              </div>
            ))}
            {feedback.length === 0 && <p className="text-slate-400">No public feedback yet</p>}
          </div>
          <div className="card max-w-md">
            <h3 className="font-semibold mb-3">Leave Feedback</h3>
            <form onSubmit={submitFb} className="space-y-2">
              <input
                className="input"
                placeholder="Parent Name"
                value={fbForm.parentName}
                onChange={(e) => setFbForm({ ...fbForm, parentName: e.target.value })}
                required
              />
              <input
                className="input"
                placeholder="Phone"
                value={fbForm.parentPhone}
                onChange={(e) => setFbForm({ ...fbForm, parentPhone: e.target.value })}
              />
              <input
                className="input"
                placeholder="Child Name"
                value={fbForm.childName}
                onChange={(e) => setFbForm({ ...fbForm, childName: e.target.value })}
              />
              <select
                className="input"
                value={fbForm.rating}
                onChange={(e) => setFbForm({ ...fbForm, rating: e.target.value })}
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n} Stars
                  </option>
                ))}
              </select>
              <textarea
                className="input"
                placeholder="Message"
                value={fbForm.message}
                onChange={(e) => setFbForm({ ...fbForm, message: e.target.value })}
                rows={2}
              />
              <button type="submit" className="btn btn-primary">
                Submit Feedback
              </button>
            </form>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">Upcoming Webinars</h2>
          <div className="space-y-4 mb-6">
            {upcoming.map((w) => (
              <div key={w._id} className="card flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold">{w.title}</h3>
                  <p className="text-sm text-slate-500">
                    {w.topic} · {w.eventDate ? new Date(w.eventDate).toLocaleDateString() : ''} ·{' '}
                    {w.slot}
                  </p>
                  <p className="text-sm mt-1">{w.description}</p>
                  <p className="text-xs mt-1">
                    Speaker: {w.speakerName} · {w.registeredCount}/{w.maxParticipants} registered
                  </p>
                </div>
                <button
                  className="btn btn-primary self-start"
                  onClick={() => setRegForm({ ...regForm, webinarId: w._id })}
                >
                  Register
                </button>
              </div>
            ))}
            {upcoming.length === 0 && <p className="text-slate-400">No upcoming webinars</p>}
          </div>
          {regForm.webinarId && (
            <div className="card max-w-md">
              <h3 className="font-semibold mb-3">Register for Webinar</h3>
              <form onSubmit={submitReg} className="space-y-2">
                <input
                  className="input"
                  placeholder="Parent Name"
                  value={regForm.parentName}
                  onChange={(e) => setRegForm({ ...regForm, parentName: e.target.value })}
                  required
                />
                <input
                  className="input"
                  placeholder="Phone"
                  value={regForm.parentPhone}
                  onChange={(e) => setRegForm({ ...regForm, parentPhone: e.target.value })}
                  required
                />
                <input
                  className="input"
                  placeholder="Child Name"
                  value={regForm.childName}
                  onChange={(e) => setRegForm({ ...regForm, childName: e.target.value })}
                />
                <input
                  className="input"
                  type="number"
                  placeholder="Child Age"
                  value={regForm.childAge}
                  onChange={(e) => setRegForm({ ...regForm, childAge: e.target.value })}
                />
                <input
                  className="input"
                  type="email"
                  placeholder="Email"
                  value={regForm.email}
                  onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                />
                <button type="submit" className="btn btn-primary">
                  Register
                </button>
              </form>
            </div>
          )}
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">Admission Inquiry</h2>
          <div className="card max-w-md">
            <form onSubmit={submitAdmission} className="space-y-3">
              <input
                className="input"
                placeholder="Child Name *"
                value={admForm.childName}
                onChange={(e) => setAdmForm({ ...admForm, childName: e.target.value })}
                required
              />
              <input
                className="input"
                type="number"
                placeholder="Age"
                value={admForm.age}
                onChange={(e) => setAdmForm({ ...admForm, age: e.target.value })}
              />
              <input
                className="input"
                placeholder="Parent Name *"
                value={admForm.parentName}
                onChange={(e) => setAdmForm({ ...admForm, parentName: e.target.value })}
                required
              />
              <input
                className="input"
                placeholder="Parent Phone *"
                value={admForm.parentPhone}
                onChange={(e) => setAdmForm({ ...admForm, parentPhone: e.target.value })}
                required
              />
              <select
                className="input"
                value={admForm.classId}
                onChange={(e) => setAdmForm({ ...admForm, classId: e.target.value })}
              >
                <option value="">Interested Class</option>
                {classes.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <textarea
                className="input"
                placeholder="Message"
                value={admForm.message}
                onChange={(e) => setAdmForm({ ...admForm, message: e.target.value })}
                rows={2}
              />
              <input
                className="input"
                type="file"
                accept="image/*"
                onChange={(e) => setAdmForm({ ...admForm, photo: e.target.files[0] })}
              />
              <button type="submit" className="btn btn-primary w-full">
                Submit Inquiry
              </button>
            </form>
            {company.upiId && (
              <p className="text-xs text-slate-500 mt-3">UPI Fee: {company.upiId}</p>
            )}
          </div>
        </section>
      </main>

      <footer className="bg-slate-900 text-slate-400 text-center py-6 text-sm">
        Powered by Kinder Garden Schools OS
      </footer>
    </div>
  );
}
