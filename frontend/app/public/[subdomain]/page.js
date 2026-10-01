'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '../../../lib/api';

const API_HOST = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';

const galleryCategories = [
  'classroom',
  'activity',
  'event',
  'festival',
  'annual-day',
  'sports',
];

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
    childName: '',
    age: '',
    parentName: '',
    parentPhone: '',
    classId: '',
    message: '',
    photo: null,
  });

  const [regForm, setRegForm] = useState({
    webinarId: '',
    parentName: '',
    parentPhone: '',
    childName: '',
    childAge: '',
    email: '',
  });

  const [fbForm, setFbForm] = useState({
    parentName: '',
    parentPhone: '',
    childName: '',
    classId: '',
    rating: 5,
    message: '',
  });

  useEffect(() => {
    if (!subdomain) return;

    api.publicClasses(subdomain)
      .then((data) => {
        setCompany(data.company);
        setCompanyId(data.company?._id || '');
        setClasses(data.classes || []);
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

      Object.entries(admForm).forEach(([key, value]) => {
        if (value) fd.append(key, value);
      });

      fd.append('source', 'Website');

      const res = await api.createAdmission(fd);
      setMsg('Admission submitted! No: ' + res.admissionNo);

      setAdmForm({
        childName: '',
        age: '',
        parentName: '',
        parentPhone: '',
        classId: '',
        message: '',
        photo: null,
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
        webinarId: '',
        parentName: '',
        parentPhone: '',
        childName: '',
        childAge: '',
        email: '',
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

      setFbForm({
        parentName: '',
        parentPhone: '',
        childName: '',
        classId: '',
        rating: 5,
        message: '',
      });
    } catch (err) {
      setMsg(err.message);
    }
  };

  if (company === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6faf8] text-sm text-[#71847a]">
        School not found
      </div>
    );
  }

  if (!company) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6faf8] text-sm text-[#71847a]">
        Loading school...
      </div>
    );
  }

  const upcoming = webinars.filter((webinar) => webinar.status === 'upcoming' || webinar.status === 'live');

  return (
    <div className="min-h-screen bg-[#f6faf8] text-[#18372a]">
      <header className="sticky top-0 z-40 border-b border-[#dcebe2]/90 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-5 py-4 lg:px-8">
          <a href="#top" className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#1fa774] text-lg font-bold text-white shadow-[0_10px_22px_rgba(31,167,116,0.22)]">
              K
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-[#193c2e]">{company.name}</p>
              <p className="truncate text-xs text-[#7b8f86]">{company.location || company.schoolType}</p>
            </div>
          </a>

          <nav className="hidden items-center gap-5 text-sm font-medium text-[#587068] lg:flex">
            <a href="#classes" className="transition hover:text-[#16845c]">Classes</a>
            <a href="#gallery" className="transition hover:text-[#16845c]">Gallery</a>
            <a href="#feedback" className="transition hover:text-[#16845c]">Feedback</a>
            <a href="#webinars" className="transition hover:text-[#16845c]">Webinars</a>
          </nav>

          <a href="#admission" className="btn btn-primary shrink-0 px-4 py-2.5 text-sm">
            Admission Inquiry
          </a>
        </div>
      </header>

      <main id="top">
        <section className="relative overflow-hidden border-b border-[#dcebe2] bg-white">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#e8f7ef]" />
          <div className="absolute -bottom-36 -left-20 h-80 w-80 rounded-full bg-[#eff9f3]" />

          <div className="relative mx-auto grid max-w-7xl gap-10 px-5 py-16 md:py-20 lg:grid-cols-[1.25fr_0.75fr] lg:px-8">
            <div className="float-in max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#6c9b87]">Kinder Garden School</p>
              <h1 className="mt-4 text-4xl font-bold leading-tight tracking-[-0.04em] text-[#17382b] md:text-6xl">
                {company.name}
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-[#6b7f76]">
                Explore classes, school activities, parent feedback and upcoming webinars, then send an admission inquiry directly to the school.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#classes" className="btn btn-primary">Explore Classes</a>
                <a href="#gallery" className="btn btn-secondary">View Gallery</a>
              </div>

              <div className="mt-8 flex flex-wrap gap-2">
                <span className="badge badge-green">Classes</span>
                <span className="badge badge-green">Gallery</span>
                <span className="badge badge-green">Feedback</span>
                <span className="badge badge-green">Webinars</span>
                <span className="badge badge-green">Admissions</span>
              </div>
            </div>

            <div className="card float-in self-end bg-[#eff9f3]">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#739a89]">School details</p>

              <div className="mt-5 space-y-4">
                <div>
                  <p className="text-xs text-[#82948d]">Location</p>
                  <p className="mt-1 text-sm font-semibold text-[#234b3a]">{company.location || '-'}</p>
                </div>

                <div>
                  <p className="text-xs text-[#82948d]">School Type</p>
                  <p className="mt-1 text-sm font-semibold capitalize text-[#234b3a]">
                    {(company.schoolType || '').replace('-', ' ')}
                  </p>
                </div>

                {company.upiId && (
                  <div>
                    <p className="text-xs text-[#82948d]">UPI Fee</p>
                    <p className="mt-1 break-all text-sm font-semibold text-[#234b3a]">{company.upiId}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {msg && (
          <div className="mx-auto max-w-7xl px-5 pt-6 lg:px-8">
            <div className="rounded-2xl border border-[#bfe4cf] bg-[#eaf8f0] px-4 py-3 text-sm font-medium text-[#19734b] shadow-[0_10px_30px_rgba(31,167,116,0.06)]">
              {msg}
            </div>
          </div>
        )}

        <section id="classes" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-16 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#74a08f]">Classes</p>
            <h2 className="mt-2 text-3xl font-bold tracking-[-0.03em] text-[#193c2e]">Learning groups and capacity</h2>
            <p className="mt-3 text-sm leading-6 text-[#71847a]">
              Browse the classes configured by the school with age group, capacity and annual fee information.
            </p>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {classes.map((item) => {
              const full = item.studentsCount >= item.capacity;

              return (
                <div key={item._id} className="card group">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-lg font-semibold text-[#234b3a]">{item.name}</p>
                      <p className="mt-1 text-sm text-[#7b8f86]">{item.ageGroup}</p>
                    </div>

                    <span className={full ? 'badge badge-red' : 'badge badge-green'}>
                      {full ? 'Full' : 'Available'}
                    </span>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-[#f7fbf8] p-4">
                      <p className="text-xs text-[#82948d]">Capacity</p>
                      <p className="mt-1 text-sm font-semibold text-[#234b3a]">
                        {item.studentsCount}/{item.capacity}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-[#f7fbf8] p-4">
                      <p className="text-xs text-[#82948d]">Annual Fees</p>
                      <p className="mt-1 text-sm font-semibold text-[#234b3a]">
                        ₹{item.feesAnnual?.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}

            {classes.length === 0 && (
              <p className="text-sm text-[#8a9b93]">No public classes available.</p>
            )}
          </div>
        </section>

        <section id="gallery" className="scroll-mt-24 border-y border-[#dcebe2] bg-white">
          <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="max-w-2xl">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#74a08f]">Gallery</p>
                <h2 className="mt-2 text-3xl font-bold tracking-[-0.03em] text-[#193c2e]">School moments and activities</h2>
                <p className="mt-3 text-sm leading-6 text-[#71847a]">
                  Public gallery albums can be filtered by the categories configured in the school workspace.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  className={!cat ? 'btn btn-primary text-xs' : 'btn btn-secondary text-xs'}
                  onClick={() => setCat('')}
                >
                  All
                </button>
                {galleryCategories.map((category) => (
                  <button
                    key={category}
                    className={cat === category ? 'btn btn-primary text-xs' : 'btn btn-secondary text-xs'}
                    onClick={() => setCat(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8 grid gap-5 md:grid-cols-2">
              {gallery.map((album) => (
                <article key={album._id} className="card">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="truncate text-lg font-semibold text-[#234b3a]">{album.title}</h3>
                      <p className="mt-1 text-xs uppercase tracking-[0.08em] text-[#82948d]">
                        {album.category}
                        {album.eventDate ? ' · ' + new Date(album.eventDate).toLocaleDateString() : ''}
                      </p>
                    </div>

                    <span className="badge badge-gray">{album.images?.length || 0} images</span>
                  </div>

                  {album.description && (
                    <p className="mt-4 text-sm leading-6 text-[#6f8279]">{album.description}</p>
                  )}

                  <div className="mt-5 grid grid-cols-4 gap-2">
                    {(album.images || []).slice(0, 4).map((image, index) => (
                      <div key={index} className="aspect-square overflow-hidden rounded-xl bg-[#eef6f1]">
                        <img
                          src={API_HOST + image}
                          alt={album.title}
                          className="h-full w-full object-cover transition duration-300 hover:scale-105"
                        />
                      </div>
                    ))}
                  </div>

                  {(album.images || []).length > 4 && (
                    <p className="mt-3 text-xs font-medium text-[#71847a]">
                      +{album.images.length - 4} more
                    </p>
                  )}
                </article>
              ))}

              {gallery.length === 0 && (
                <p className="text-sm text-[#8a9b93]">No public albums available.</p>
              )}
            </div>
          </div>
        </section>

        <section id="feedback" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-16 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#74a08f]">Feedback</p>
              <h2 className="mt-2 text-3xl font-bold tracking-[-0.03em] text-[#193c2e]">Parent feedback</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#71847a]">
                Approved public feedback helps families understand the school experience.
              </p>

              <div className="mt-8 grid gap-4 md:grid-cols-2">
                {feedback.map((item) => (
                  <article key={item._id} className="card">
                    <div className="text-lg tracking-[0.1em] text-[#d99d2d]">
                      {'★'.repeat(item.rating)}
                      {'☆'.repeat(5 - item.rating)}
                    </div>
                    <p className="mt-4 text-sm leading-6 text-[#4e655b]">{item.message}</p>
                    <p className="mt-4 text-xs text-[#83948c]">
                      — {item.parentName}
                      {item.childName ? ' (' + item.childName + ')' : ''}
                    </p>
                  </article>
                ))}

                {feedback.length === 0 && (
                  <p className="text-sm text-[#8a9b93]">No public feedback yet.</p>
                )}
              </div>
            </div>

            <div className="card h-fit bg-[#eff9f3]">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#739a89]">Share feedback</p>
              <h3 className="mt-2 text-xl font-semibold text-[#234b3a]">Tell the school about your experience</h3>

              <form onSubmit={submitFb} className="mt-6 space-y-3">
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
                  value={fbForm.classId}
                  onChange={(e) => setFbForm({ ...fbForm, classId: e.target.value })}
                >
                  <option value="">Class</option>
                  {classes.map((item) => (
                    <option key={item._id} value={item._id}>{item.name}</option>
                  ))}
                </select>
                <select
                  className="input"
                  value={fbForm.rating}
                  onChange={(e) => setFbForm({ ...fbForm, rating: e.target.value })}
                >
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <option key={rating} value={rating}>{rating} Stars</option>
                  ))}
                </select>
                <textarea
                  className="input"
                  placeholder="Message"
                  value={fbForm.message}
                  onChange={(e) => setFbForm({ ...fbForm, message: e.target.value })}
                  rows={4}
                />
                <button type="submit" className="btn btn-primary w-full">
                  Submit Feedback
                </button>
              </form>
            </div>
          </div>
        </section>

        <section id="webinars" className="scroll-mt-24 border-y border-[#dcebe2] bg-white">
          <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#74a08f]">Webinars</p>
              <h2 className="mt-2 text-3xl font-bold tracking-[-0.03em] text-[#193c2e]">Upcoming sessions</h2>
              <p className="mt-3 text-sm leading-6 text-[#71847a]">
                Browse upcoming parenting, child-development, nutrition, admission and activity sessions.
              </p>
            </div>

            <div className="mt-8 space-y-4">
              {upcoming.map((item) => (
                <article key={item._id} className="card flex flex-col gap-5 md:flex-row md:items-center">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={item.status === 'live' ? 'badge badge-green' : 'badge badge-blue'}>
                        {item.status}
                      </span>
                      <span className="text-xs text-[#83948c]">{item.topic}</span>
                    </div>

                    <h3 className="mt-3 text-xl font-semibold text-[#234b3a]">{item.title}</h3>

                    <p className="mt-2 text-sm text-[#70837a]">
                      {item.eventDate ? new Date(item.eventDate).toLocaleDateString() : ''}
                      {' · '}
                      {item.slot}
                      {' · '}
                      {item.durationMins} mins
                    </p>

                    {item.description && (
                      <p className="mt-3 text-sm leading-6 text-[#6d8178]">{item.description}</p>
                    )}

                    <p className="mt-3 text-xs text-[#80928a]">
                      Speaker: {item.speakerName} · {item.registeredCount}/{item.maxParticipants} registered
                    </p>
                  </div>

                  <button
                    className="btn btn-primary self-start md:self-center"
                    onClick={() => setRegForm({ ...regForm, webinarId: item._id })}
                  >
                    Register
                  </button>
                </article>
              ))}

              {upcoming.length === 0 && (
                <p className="text-sm text-[#8a9b93]">No upcoming webinars.</p>
              )}
            </div>

            {regForm.webinarId && (
              <div className="mt-6 max-w-md">
                <div className="card bg-[#eff9f3]">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#739a89]">Webinar Registration</p>
                  <form onSubmit={submitReg} className="mt-5 space-y-3">
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
                    <button type="submit" className="btn btn-primary w-full">Register</button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </section>

        <section id="admission" className="scroll-mt-24 mx-auto max-w-7xl px-5 py-16 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#74a08f]">Admissions</p>
              <h2 className="mt-2 text-3xl font-bold tracking-[-0.03em] text-[#193c2e]">Send an admission inquiry</h2>
              <p className="mt-4 max-w-xl text-sm leading-6 text-[#71847a]">
                Share the child and parent details requested by the school. The inquiry will enter the school admission workflow.
              </p>

              <div className="mt-8 rounded-3xl border border-[#dcebe2] bg-[#eff9f3] p-6">
                <p className="text-sm font-semibold text-[#234b3a]">Interested class</p>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {classes.map((item) => (
                    <button
                      key={item._id}
                      type="button"
                      className={admForm.classId === item._id ? 'btn btn-primary justify-start' : 'btn btn-secondary justify-start'}
                      onClick={() => setAdmForm({ ...admForm, classId: item._id })}
                    >
                      {item.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="card">
              <form onSubmit={submitAdmission} className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">Child Name *</label>
                  <input
                    className="input"
                    value={admForm.childName}
                    onChange={(e) => setAdmForm({ ...admForm, childName: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="label">Age</label>
                  <input
                    className="input"
                    type="number"
                    value={admForm.age}
                    onChange={(e) => setAdmForm({ ...admForm, age: e.target.value })}
                  />
                </div>

                <div>
                  <label className="label">Parent Name *</label>
                  <input
                    className="input"
                    value={admForm.parentName}
                    onChange={(e) => setAdmForm({ ...admForm, parentName: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="label">Parent Phone *</label>
                  <input
                    className="input"
                    value={admForm.parentPhone}
                    onChange={(e) => setAdmForm({ ...admForm, parentPhone: e.target.value })}
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="label">Class</label>
                  <select
                    className="input"
                    value={admForm.classId}
                    onChange={(e) => setAdmForm({ ...admForm, classId: e.target.value })}
                  >
                    <option value="">Interested Class</option>
                    {classes.map((item) => (
                      <option key={item._id} value={item._id}>{item.name}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="label">Message / Special Needs</label>
                  <textarea
                    className="input"
                    rows={4}
                    value={admForm.message}
                    onChange={(e) => setAdmForm({ ...admForm, message: e.target.value })}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="label">Photo</label>
                  <input
                    className="input"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setAdmForm({ ...admForm, photo: e.target.files[0] })}
                  />
                </div>

                <button type="submit" className="btn btn-primary sm:col-span-2">
                  Submit Admission Inquiry
                </button>
              </form>

              {company.upiId && (
                <div className="mt-4 rounded-2xl bg-[#f5fbf7] px-4 py-3 text-xs text-[#71847a]">
                  UPI Fee: <span className="font-semibold text-[#416055]">{company.upiId}</span>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#dcebe2] bg-[#17382b] py-8 text-center text-sm text-[#b8cec3]">
        Powered by Kinder Garden Schools OS
      </footer>
    </div>
  );
}