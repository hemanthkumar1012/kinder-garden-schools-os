'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '../../../lib/api';

const API_HOST =
  process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';

const GALLERY_CATEGORIES = [
  { value: '', label: 'All' },
  { value: 'classroom', label: 'Classroom' },
  { value: 'activity', label: 'Activities' },
  { value: 'event', label: 'Events' },
  { value: 'festival', label: 'Festivals' },
  { value: 'annual-day', label: 'Annual Day' },
  { value: 'sports', label: 'Sports' },
];

const topicLabels = {
  parenting: 'Parenting',
  'child-development': 'Child Development',
  nutrition: 'Nutrition',
  'admission-info': 'Admission Information',
  'activity-demo': 'Activity Demo',
};

export default function PublicSchoolPage() {
  const { subdomain } = useParams();

  const [company, setCompany] = useState(null);
  const [companyId, setCompanyId] = useState('');
  const [classes, setClasses] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [webinars, setWebinars] = useState([]);
  const [galleryCategory, setGalleryCategory] = useState('');
  const [message, setMessage] = useState('');
  const [selectedWebinar, setSelectedWebinar] = useState(null);

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

    api.publicFeedback(subdomain).then(setFeedback).catch(console.error);
    api.publicWebinars(subdomain).then(setWebinars).catch(console.error);
  }, [subdomain]);

  useEffect(() => {
    if (!subdomain) return;

    api
      .publicGallery(subdomain, galleryCategory || undefined)
      .then(setGallery)
      .catch(console.error);
  }, [subdomain, galleryCategory]);

  const upcoming = useMemo(
    () =>
      webinars.filter(
        (item) => item.status === 'upcoming' || item.status === 'live'
      ),
    [webinars]
  );

  const availableClasses = classes.filter(
    (item) => Number(item.studentsCount || 0) < Number(item.capacity || 0)
  );

  const showMessage = (text) => {
    setMessage(text);
    window.setTimeout(() => setMessage(''), 5000);
  };

  const submitAdmission = async (event) => {
    event.preventDefault();

    try {
      const data = new FormData();
      data.append('companyId', companyId);

      Object.entries(admForm).forEach(([key, value]) => {
        if (value) data.append(key, value);
      });

      data.append('source', 'Website');

      const result = await api.createAdmission(data);
      showMessage('Admission inquiry submitted. Reference: ' + result.admissionNo);

      setAdmForm({
        childName: '',
        age: '',
        parentName: '',
        parentPhone: '',
        classId: '',
        message: '',
        photo: null,
      });
    } catch (error) {
      showMessage(error.message);
    }
  };

  const submitRegistration = async (event) => {
    event.preventDefault();

    try {
      await api.registerWebinar({
        ...regForm,
        companyId,
      });

      showMessage('Registration submitted. The meeting link will be shared through WhatsApp.');
      setSelectedWebinar(null);
      setRegForm({
        webinarId: '',
        parentName: '',
        parentPhone: '',
        childName: '',
        childAge: '',
        email: '',
      });
    } catch (error) {
      showMessage(error.message);
    }
  };

  const submitFeedback = async (event) => {
    event.preventDefault();

    try {
      await api.createFeedback({
        ...fbForm,
        companyId,
        rating: Number(fbForm.rating),
      });

      showMessage('Thank you. Your feedback has been submitted for school review.');

      setFbForm({
        parentName: '',
        parentPhone: '',
        childName: '',
        classId: '',
        rating: 5,
        message: '',
      });
    } catch (error) {
      showMessage(error.message);
    }
  };

  if (company === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6faf8] px-5">
        <div className="card max-w-md text-center">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#79a18f]">
            Kinder Garden Schools OS
          </p>
          <h1 className="mt-3 text-2xl font-bold text-[#193c2e]">School not found</h1>
          <p className="mt-2 text-sm text-[#71847a]">
            The school page you requested is not available.
          </p>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6faf8] px-5">
        <div className="text-sm text-[#71847a]">Loading school...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6faf8] text-[#18372a]">
      <header className="sticky top-0 z-50 border-b border-[#dcebe2]/90 bg-white/90 shadow-[0_8px_24px_rgba(24,55,42,0.05)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-5 py-3.5 lg:px-8">
          <a href="#top" className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#1fa774] text-lg font-black text-white shadow-[0_10px_24px_rgba(31,167,116,0.22)]">
              K
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-[#193c2e]">{company.name}</p>
              <p className="truncate text-xs text-[#7b8f86]">
                {company.location || company.schoolType}
              </p>
            </div>
          </a>

          <nav className="ml-auto hidden items-center gap-5 text-sm font-medium text-[#5f756b] lg:flex">
            <a href="#classes" className="transition hover:text-[#16845c]">Classes</a>
            <a href="#gallery" className="transition hover:text-[#16845c]">Gallery</a>
            <a href="#feedback" className="transition hover:text-[#16845c]">Feedback</a>
            <a href="#webinars" className="transition hover:text-[#16845c]">Webinars</a>
          </nav>

          <a href="#admission" className="btn btn-primary shrink-0 px-4 py-2.5 text-sm">
            Admission Inquiry
          </a>
        </div>

        <div className="border-t border-[#edf3ef] px-5 py-2 lg:hidden">
          <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto pb-1">
            {[
              ['#classes', 'Classes'],
              ['#gallery', 'Gallery'],
              ['#feedback', 'Feedback'],
              ['#webinars', 'Webinars'],
              ['#admission', 'Admissions'],
            ].map(([href, label]) => (
              <a
                key={href}
                href={href}
                className="whitespace-nowrap rounded-full bg-[#f2f8f4] px-3 py-1.5 text-xs font-semibold text-[#577268]"
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </header>

      <main id="top">
        <section className="relative overflow-hidden border-b border-[#dcebe2] bg-white">
          <div className="absolute -right-24 -top-28 h-80 w-80 rounded-full bg-[#e8f7ef]" />
          <div className="absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-[#f0faf4]" />

          <div className="relative mx-auto grid max-w-7xl gap-10 px-5 py-16 md:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:px-8">
            <div className="float-in self-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#c9e8d6] bg-[#eff9f3] px-3 py-1.5 text-xs font-bold text-[#21764f]">
                <span className="h-2 w-2 rounded-full bg-[#1fa774]" />
                {company.schoolType?.replace('-', ' ') || 'School'}
              </span>

              <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-[#76a18f]">
                Kinder Garden School
              </p>

              <h1 className="mt-3 max-w-3xl text-4xl font-black leading-[1.05] tracking-[-0.045em] text-[#17382b] md:text-6xl">
                {company.name}
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-7 text-[#6b7f76] md:text-lg">
                Discover classes, school activities, parent feedback and upcoming
                sessions — then send an admission inquiry directly to the school.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#admission" className="btn btn-primary px-5 py-3">
                  Start Admission Inquiry
                </a>
                <a href="#classes" className="btn btn-secondary px-5 py-3">
                  Explore Classes
                </a>
              </div>

              <div className="mt-8 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  ['Classes', classes.length],
                  ['Available', availableClasses.length],
                  ['Albums', gallery.length],
                  ['Sessions', upcoming.length],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-[#dcebe2] bg-white/80 p-3 shadow-[0_8px_25px_rgba(24,55,42,0.04)]"
                  >
                    <p className="text-xl font-bold text-[#1f6f52]">{value}</p>
                    <p className="mt-1 text-[11px] font-medium text-[#82948d]">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="float-in self-end">
              <div className="card overflow-hidden bg-[#eff9f3] p-0">
                <div className="border-b border-[#d0e8da] px-6 py-5">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#739a89]">
                    School details
                  </p>
                  <h2 className="mt-2 text-2xl font-bold text-[#234b3a]">
                    Everything families need
                  </h2>
                </div>

                <div className="space-y-4 p-6">
                  <div className="rounded-2xl bg-white/80 p-4">
                    <p className="text-xs text-[#82948d]">Location</p>
                    <p className="mt-1 text-sm font-semibold text-[#234b3a]">
                      {company.location || 'Not provided'}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white/80 p-4">
                    <p className="text-xs text-[#82948d]">School Type</p>
                    <p className="mt-1 text-sm font-semibold capitalize text-[#234b3a]">
                      {(company.schoolType || '').replace('-', ' ') || 'School'}
                    </p>
                  </div>

                  {company.upiId && (
                    <div className="rounded-2xl bg-white/80 p-4">
                      <p className="text-xs text-[#82948d]">Fee Payment UPI</p>
                      <p className="mt-1 break-all text-sm font-semibold text-[#234b3a]">
                        {company.upiId}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {message && (
          <div className="sticky top-[105px] z-30 px-5 pt-4 lg:top-[72px] lg:px-8">
            <div className="mx-auto max-w-7xl rounded-2xl border border-[#bfe4cf] bg-[#eaf8f0] px-4 py-3 text-sm font-semibold text-[#19734b] shadow-[0_12px_30px_rgba(31,167,116,0.08)]">
              {message}
            </div>
          </div>
        )}

        <section id="classes" className="scroll-mt-28 mx-auto max-w-7xl px-5 py-16 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#74a08f]">Classes</p>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.035em] text-[#193c2e]">
              Find the right learning group
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#71847a]">
              Browse the classes configured by the school with age group, capacity and annual fee information.
            </p>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {classes.map((item) => {
              const full = Number(item.studentsCount || 0) >= Number(item.capacity || 0);
              const remaining = Math.max(
                0,
                Number(item.capacity || 0) - Number(item.studentsCount || 0)
              );

              return (
                <article
                  key={item._id}
                  className="card group transition duration-200 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(24,55,42,0.1)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-lg font-bold text-[#234b3a]">{item.name}</p>
                      <p className="mt-1 text-sm text-[#7b8f86]">{item.ageGroup}</p>
                    </div>

                    <span className={full ? 'badge badge-red' : 'badge badge-green'}>
                      {full ? 'Full' : 'Available'}
                    </span>
                  </div>

                  <div className="mt-6 h-2 overflow-hidden rounded-full bg-[#e8f1eb]">
                    <div
                      className="h-full rounded-full bg-[#1fa774] transition-all"
                      style={{
                        width:
                          Math.min(
                            100,
                            Number(item.capacity)
                              ? (Number(item.studentsCount || 0) / Number(item.capacity)) * 100
                              : 0
                          ) + '%',
                      }}
                    />
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="text-[#82948d]">
                      {item.studentsCount || 0}/{item.capacity || 0} students
                    </span>
                    <span className="font-semibold text-[#397659]">
                      {full ? 'Currently full' : remaining + ' seats available'}
                    </span>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-[#f7fbf8] p-4">
                      <p className="text-xs text-[#82948d]">Age Group</p>
                      <p className="mt-1 text-sm font-semibold text-[#234b3a]">
                        {item.ageGroup || '-'}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-[#f7fbf8] p-4">
                      <p className="text-xs text-[#82948d]">Annual Fees</p>
                      <p className="mt-1 text-sm font-semibold text-[#234b3a]">
                        ₹{Number(item.feesAnnual || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}

            {classes.length === 0 && (
              <div className="rounded-3xl border border-dashed border-[#dcebe2] bg-white px-5 py-12 text-center">
                <p className="font-medium text-[#587068]">No public classes available</p>
              </div>
            )}
          </div>
        </section>

        <section id="gallery" className="scroll-mt-28 border-y border-[#dcebe2] bg-white">
          <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div className="max-w-2xl">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#74a08f]">Gallery</p>
                <h2 className="mt-2 text-3xl font-black tracking-[-0.035em] text-[#193c2e]">
                  Everyday school moments
                </h2>
                <p className="mt-3 text-sm leading-6 text-[#71847a]">
                  Explore public albums shared by the school.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {GALLERY_CATEGORIES.map((category) => (
                  <button
                    key={category.value}
                    className={
                      galleryCategory === category.value
                        ? 'btn btn-primary text-xs'
                        : 'btn btn-secondary text-xs'
                    }
                    onClick={() => setGalleryCategory(category.value)}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8 grid gap-5 lg:grid-cols-2">
              {gallery.map((album) => (
                <article
                  key={album._id}
                  className="card overflow-hidden p-0 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(24,55,42,0.09)]"
                >
                  <div className="border-b border-[#e5eee9] px-5 py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="truncate text-lg font-bold text-[#234b3a]">
                          {album.title}
                        </h3>
                        <p className="mt-1 text-xs uppercase tracking-[0.08em] text-[#82948d]">
                          {GALLERY_CATEGORIES.find((item) => item.value === album.category)?.label ||
                            album.category}
                          {album.eventDate
                            ? ' · ' + new Date(album.eventDate).toLocaleDateString()
                            : ''}
                        </p>
                      </div>

                      <span className="badge badge-gray shrink-0">
                        {album.images?.length || 0} images
                      </span>
                    </div>

                    {album.description && (
                      <p className="mt-3 text-sm leading-6 text-[#6f8279]">
                        {album.description}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-4 gap-2 bg-[#f4faf6] p-3">
                    {(album.images || []).slice(0, 4).map((image, index) => (
                      <div
                        key={index}
                        className="aspect-square overflow-hidden rounded-xl bg-[#eaf3ed]"
                      >
                        <img
                          src={API_HOST + image}
                          alt={album.title + ' ' + (index + 1)}
                          className="h-full w-full object-cover transition duration-500 hover:scale-110"
                        />
                      </div>
                    ))}
                  </div>

                  {album.images?.length > 4 && (
                    <div className="px-5 py-3 text-xs font-semibold text-[#71847a]">
                      +{album.images.length - 4} more photos in this album
                    </div>
                  )}
                </article>
              ))}

              {gallery.length === 0 && (
                <div className="rounded-3xl border border-dashed border-[#dcebe2] bg-[#f8fcfa] px-5 py-12 text-center">
                  <p className="font-medium text-[#587068]">No public albums available</p>
                </div>
              )}
            </div>
          </div>
        </section>

        <section id="feedback" className="scroll-mt-28 mx-auto max-w-7xl px-5 py-16 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_390px]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#74a08f]">Feedback</p>
              <h2 className="mt-2 text-3xl font-black tracking-[-0.035em] text-[#193c2e]">
                What parents are saying
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#71847a]">
                Approved public feedback is displayed here for families exploring the school.
              </p>

              <div className="mt-8 grid gap-4 md:grid-cols-2">
                {feedback.map((item) => (
                  <article key={item._id} className="card">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-lg tracking-[0.12em] text-[#d39a29]">
                        {'★'.repeat(Number(item.rating || 0))}
                        {'☆'.repeat(Math.max(0, 5 - Number(item.rating || 0)))}
                      </div>
                      <span className="text-xs text-[#879790]">{item.rating}/5</span>
                    </div>

                    <p className="mt-4 text-sm leading-6 text-[#4e655b]">
                      {item.message}
                    </p>

                    <p className="mt-5 text-xs font-semibold text-[#6e8378]">
                      {item.parentName}
                      {item.childName ? ' · Parent of ' + item.childName : ''}
                    </p>
                  </article>
                ))}

                {feedback.length === 0 && (
                  <div className="rounded-3xl border border-dashed border-[#dcebe2] bg-white px-5 py-12 text-center">
                    <p className="font-medium text-[#587068]">No public feedback yet</p>
                  </div>
                )}
              </div>
            </div>

            <div className="card h-fit bg-[#eff9f3]">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#739a89]">
                Share feedback
              </p>
              <h3 className="mt-2 text-xl font-bold text-[#234b3a]">
                Tell the school about your experience
              </h3>

              <form onSubmit={submitFeedback} className="mt-6 space-y-3">
                <input
                  className="input bg-white"
                  placeholder="Parent Name"
                  value={fbForm.parentName}
                  onChange={(e) => setFbForm({ ...fbForm, parentName: e.target.value })}
                  required
                />
                <input
                  className="input bg-white"
                  placeholder="Phone"
                  value={fbForm.parentPhone}
                  onChange={(e) => setFbForm({ ...fbForm, parentPhone: e.target.value })}
                />
                <input
                  className="input bg-white"
                  placeholder="Child Name"
                  value={fbForm.childName}
                  onChange={(e) => setFbForm({ ...fbForm, childName: e.target.value })}
                />
                <select
                  className="input bg-white"
                  value={fbForm.classId}
                  onChange={(e) => setFbForm({ ...fbForm, classId: e.target.value })}
                >
                  <option value="">Class</option>
                  {classes.map((item) => (
                    <option key={item._id} value={item._id}>{item.name}</option>
                  ))}
                </select>
                <select
                  className="input bg-white"
                  value={fbForm.rating}
                  onChange={(e) => setFbForm({ ...fbForm, rating: e.target.value })}
                >
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <option key={rating} value={rating}>{rating} Stars</option>
                  ))}
                </select>
                <textarea
                  className="input bg-white"
                  placeholder="Your feedback"
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

        <section id="webinars" className="scroll-mt-28 border-y border-[#dcebe2] bg-white">
          <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#74a08f]">Webinars</p>
              <h2 className="mt-2 text-3xl font-black tracking-[-0.035em] text-[#193c2e]">
                Upcoming parent sessions
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#71847a]">
                Register for parenting, child-development, nutrition, admission and activity sessions.
              </p>
            </div>

            <div className="mt-8 grid gap-4">
              {upcoming.map((item) => (
                <article
                  key={item._id}
                  className="card flex flex-col gap-5 md:flex-row md:items-center"
                >
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={item.status === 'live' ? 'badge badge-green' : 'badge badge-blue'}>
                        {item.status === 'live' ? 'Live Now' : 'Upcoming'}
                      </span>
                      <span className="badge badge-gray">
                        {topicLabels[item.topic] || item.topic}
                      </span>
                    </div>

                    <h3 className="mt-3 text-xl font-bold text-[#234b3a]">{item.title}</h3>

                    <p className="mt-2 text-sm text-[#6f8279]">
                      {item.eventDate
                        ? new Date(item.eventDate).toLocaleDateString()
                        : 'Date not set'}
                      {' · '}
                      {item.slot}
                      {' · '}
                      {item.durationMins} minutes
                    </p>

                    {item.description && (
                      <p className="mt-3 max-w-3xl text-sm leading-6 text-[#70837a]">
                        {item.description}
                      </p>
                    )}

                    <div className="mt-4 flex flex-wrap gap-2 text-xs text-[#80928a]">
                      <span className="rounded-full bg-[#f3f8f5] px-3 py-1.5">
                        Speaker: {item.speakerName || 'Not provided'}
                      </span>
                      <span className="rounded-full bg-[#f3f8f5] px-3 py-1.5">
                        {item.registeredCount}/{item.maxParticipants} registered
                      </span>
                    </div>
                  </div>

                  <button
                    className="btn btn-primary shrink-0 self-start md:self-center"
                    onClick={() => {
                      setSelectedWebinar(item);
                      setRegForm((current) => ({
                        ...current,
                        webinarId: item._id,
                      }));
                    }}
                  >
                    Register
                  </button>
                </article>
              ))}

              {upcoming.length === 0 && (
                <div className="rounded-3xl border border-dashed border-[#dcebe2] bg-[#f8fcfa] px-5 py-12 text-center">
                  <p className="font-medium text-[#587068]">No upcoming webinars</p>
                </div>
              )}
            </div>

            {selectedWebinar && (
              <div className="mt-6 max-w-2xl">
                <div className="card bg-[#eff9f3]">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#739a89]">
                        Webinar Registration
                      </p>
                      <h3 className="mt-1 text-xl font-bold text-[#234b3a]">
                        {selectedWebinar.title}
                      </h3>
                    </div>

                    <button
                      type="button"
                      className="text-xs font-semibold text-[#6d8178] underline underline-offset-4"
                      onClick={() => setSelectedWebinar(null)}
                    >
                      Close
                    </button>
                  </div>

                  <form onSubmit={submitRegistration} className="mt-6 grid gap-3 sm:grid-cols-2">
                    <input
                      className="input bg-white"
                      placeholder="Parent Name"
                      value={regForm.parentName}
                      onChange={(e) =>
                        setRegForm({ ...regForm, parentName: e.target.value })
                      }
                      required
                    />
                    <input
                      className="input bg-white"
                      placeholder="Phone"
                      value={regForm.parentPhone}
                      onChange={(e) =>
                        setRegForm({ ...regForm, parentPhone: e.target.value })
                      }
                      required
                    />
                    <input
                      className="input bg-white"
                      placeholder="Child Name"
                      value={regForm.childName}
                      onChange={(e) =>
                        setRegForm({ ...regForm, childName: e.target.value })
                      }
                    />
                    <input
                      className="input bg-white"
                      type="number"
                      min="1"
                      placeholder="Child Age"
                      value={regForm.childAge}
                      onChange={(e) =>
                        setRegForm({ ...regForm, childAge: e.target.value })
                      }
                    />
                    <input
                      className="input bg-white sm:col-span-2"
                      type="email"
                      placeholder="Email"
                      value={regForm.email}
                      onChange={(e) =>
                        setRegForm({ ...regForm, email: e.target.value })
                      }
                    />
                    <button type="submit" className="btn btn-primary sm:col-span-2">
                      Register for Session
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </section>

        <section id="admission" className="scroll-mt-28 mx-auto max-w-7xl px-5 py-16 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="self-start">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#74a08f]">Admissions</p>
              <h2 className="mt-2 text-3xl font-black tracking-[-0.035em] text-[#193c2e]">
                Start your admission inquiry
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-6 text-[#71847a]">
                Share the child and parent details requested by the school. The inquiry
                will enter the school admission workflow.
              </p>

              <div className="mt-8 rounded-3xl border border-[#dcebe2] bg-[#eff9f3] p-6">
                <p className="text-sm font-bold text-[#234b3a]">Choose an interested class</p>

                <div className="mt-4 space-y-2">
                  {classes.map((item) => {
                    const full =
                      Number(item.studentsCount || 0) >= Number(item.capacity || 0);

                    return (
                      <button
                        key={item._id}
                        type="button"
                        disabled={full}
                        className={
                          admForm.classId === item._id
                            ? 'btn btn-primary w-full justify-between'
                            : 'btn btn-secondary w-full justify-between'
                        }
                        onClick={() => setAdmForm({ ...admForm, classId: item._id })}
                      >
                        <span>{item.name}</span>
                        <span className="text-xs opacity-70">
                          {full
                            ? 'Full'
                            : Math.max(0, item.capacity - item.studentsCount) + ' seats'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="card">
              <div className="mb-5 rounded-2xl bg-[#f7fbf8] px-4 py-3 text-sm text-[#5f756b]">
                Please provide accurate contact details so the school can follow up with you.
              </div>

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
                  <label className="label">Child Age</label>
                  <input
                    className="input"
                    type="number"
                    min="1"
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
                  <label className="label">Interested Class</label>
                  <select
                    className="input"
                    value={admForm.classId}
                    onChange={(e) => setAdmForm({ ...admForm, classId: e.target.value })}
                  >
                    <option value="">Select a class</option>
                    {classes.map((item) => (
                      <option key={item._id} value={item._id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="label">Message</label>
                  <textarea
                    className="input"
                    rows={4}
                    placeholder="Any question or message for the school"
                    value={admForm.message}
                    onChange={(e) => setAdmForm({ ...admForm, message: e.target.value })}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="label">Child Photo</label>
                  <input
                    className="input"
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setAdmForm({
                        ...admForm,
                        photo: e.target.files?.[0] || null,
                      })
                    }
                  />
                </div>

                <button type="submit" className="btn btn-primary sm:col-span-2 py-3">
                  Submit Admission Inquiry
                </button>
              </form>

              {company.upiId && (
                <div className="mt-4 rounded-2xl border border-[#dcebe2] bg-[#f7fbf8] px-4 py-3 text-xs text-[#71847a]">
                  Fee payment UPI:{' '}
                  <span className="font-semibold text-[#416055]">{company.upiId}</span>
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
