'use client';

import { useEffect, useMemo, useState } from 'react';
import AuthGuard from '../../components/AuthGuard';
import { api, getCompany, setAuth } from '../../lib/api';

const LANGUAGE_OPTIONS = ['Marathi', 'Hindi', 'English'];

const SCHOOL_TYPES = [
  { value: 'kinder-garden', label: 'Kinder Garden' },
  { value: 'play-school', label: 'Play School' },
  { value: 'pre-school', label: 'Pre School' },
];

export default function SettingsPage() {
  const company = getCompany();
  const [form, setForm] = useState({
    name: '',
    ownerEmail: '',
    schoolType: 'kinder-garden',
    location: '',
    upiId: '',
    language: 'Marathi',
    whatsappToken: '',
    razorpayKey: '',
    galleryEnabled: true,
    feedbackApprovalRequired: true,
    schoolLogo: null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [logoUrl, setLogoUrl] = useState('');

  useEffect(() => {
    api.getSettings()
      .then((data) => {
        setForm((current) => ({
          ...current,
          name: data.name || '',
          ownerEmail: data.ownerEmail || '',
          schoolType: data.schoolType || 'kinder-garden',
          location: data.location || '',
          upiId: data.upiId || '',
          language: data.language || 'Marathi',
          whatsappToken: data.whatsappToken || '',
          razorpayKey: data.razorpayKey || '',
          galleryEnabled: data.galleryEnabled !== false,
          feedbackApprovalRequired: data.feedbackApprovalRequired !== false,
        }));
        setLogoUrl(data.logoUrl || '');
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const previewUrl = useMemo(
    () => (form.schoolLogo ? URL.createObjectURL(form.schoolLogo) : ''),
    [form.schoolLogo]
  );

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const update = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    setMessage('');
    setError('');
  };

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const data = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value !== null && value !== '') data.append(key, value);
      });

      const result = await api.updateSettings(data);
      setLogoUrl(result.company.logoUrl || '');
      setForm((current) => ({ ...current, schoolLogo: null }));

      const savedCompany = {
        ...(company || {}),
        id: company?.id || result.company._id,
        name: result.company.name,
        ownerEmail: result.company.ownerEmail,
        subdomain: result.company.subdomain,
        schoolType: result.company.schoolType,
        location: result.company.location,
        upiId: result.company.upiId,
        language: result.company.language,
        logoUrl: result.company.logoUrl,
        galleryEnabled: result.company.galleryEnabled,
        feedbackApprovalRequired: result.company.feedbackApprovalRequired,
      };

      if (typeof window !== 'undefined') {
        setAuth(localStorage.getItem('token'), savedCompany);
      }

      setMessage('School settings saved successfully.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const mediaUrl =
    logoUrl && logoUrl.startsWith('http')
      ? logoUrl
      : logoUrl
        ? (process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000') + logoUrl
        : '';

  return (
    <AuthGuard>
      <div>
        <div className="mb-7">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#74a08f]">School control</p>
          <h1 className="page-title mt-2 text-3xl font-bold">Settings</h1>
          <p className="page-subtitle mt-2 max-w-3xl text-sm">
            Update the school information and communication settings used across the workspace.
          </p>
        </div>

        {loading ? (
          <div className="card py-16 text-center text-sm text-[#80928a]">Loading school settings...</div>
        ) : (
          <form onSubmit={save} className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-6">
              <section className="card">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#86a095]">School profile</p>
                <h2 className="mt-1 text-xl font-semibold text-[#193c2e]">Basic information</h2>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="label">School Name</label>
                    <input className="input" value={form.name} onChange={(e) => update('name', e.target.value)} required />
                  </div>

                  <div>
                    <label className="label">Owner Email</label>
                    <input className="input" type="email" value={form.ownerEmail} onChange={(e) => update('ownerEmail', e.target.value)} required />
                  </div>

                  <div>
                    <label className="label">School Type</label>
                    <select className="input" value={form.schoolType} onChange={(e) => update('schoolType', e.target.value)}>
                      {SCHOOL_TYPES.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="label">Language</label>
                    <select className="input" value={form.language} onChange={(e) => update('language', e.target.value)}>
                      {LANGUAGE_OPTIONS.map((language) => <option key={language} value={language}>{language}</option>)}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="label">Location</label>
                    <input className="input" value={form.location} onChange={(e) => update('location', e.target.value)} placeholder="School location" />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="label">UPI ID</label>
                    <input className="input" value={form.upiId} onChange={(e) => update('upiId', e.target.value)} placeholder="school@upi" />
                  </div>
                </div>
              </section>

              <section className="card">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#86a095]">Communication & payments</p>
                <h2 className="mt-1 text-xl font-semibold text-[#193c2e]">Service connections</h2>

                <div className="mt-5 space-y-4">
                  <div>
                    <label className="label">WhatsApp Token</label>
                    <input className="input" type="password" value={form.whatsappToken} onChange={(e) => update('whatsappToken', e.target.value)} placeholder="Enter WhatsApp token" />
                    <p className="mt-1 text-xs text-[#82948d]">Stored for this school and used by the WhatsApp workflow.</p>
                  </div>

                  <div>
                    <label className="label">Razorpay Key</label>
                    <input className="input" type="password" value={form.razorpayKey} onChange={(e) => update('razorpayKey', e.target.value)} placeholder="Enter Razorpay key" />
                    <p className="mt-1 text-xs text-[#82948d]">Stored for this school payment configuration.</p>
                  </div>
                </div>
              </section>

              <section className="card">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#86a095]">School logo</p>
                <h2 className="mt-1 text-xl font-semibold text-[#193c2e]">Brand image</h2>

                <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-3xl border border-[#dcebe2] bg-[#eff9f3] text-2xl font-black text-[#1fa774]">
                    {previewUrl || mediaUrl ? (
                      <img src={previewUrl || mediaUrl} alt="School logo" className="h-full w-full object-cover" />
                    ) : (
                      'K'
                    )}
                  </div>

                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#34594a]">Upload school logo</p>
                    <p className="mt-1 text-xs leading-5 text-[#82948d]">Image only, up to 5 MB.</p>
                    <input
                      className="mt-3 block w-full text-sm text-[#62776d]"
                      type="file"
                      accept="image/*"
                      onChange={(e) => update('schoolLogo', e.target.files?.[0] || null)}
                    />
                  </div>
                </div>
              </section>
            </div>

            <div className="space-y-6">
              <section className="card bg-[#eff9f3]">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#86a095]">Public website</p>
                <h2 className="mt-1 text-xl font-semibold text-[#193c2e]">Visibility controls</h2>

                <div className="mt-5 space-y-3">
                  <ToggleRow
                    title="Gallery"
                    description="Show public gallery albums on the school website."
                    checked={form.galleryEnabled}
                    onChange={(value) => update('galleryEnabled', value)}
                  />

                  <ToggleRow
                    title="Feedback approval"
                    description="Require school approval before parent feedback becomes public."
                    checked={form.feedbackApprovalRequired}
                    onChange={(value) => update('feedbackApprovalRequired', value)}
                  />
                </div>
              </section>

              <section className="card">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#86a095]">School access</p>
                <h2 className="mt-1 text-xl font-semibold text-[#193c2e]">Public page</h2>

                <div className="mt-5 rounded-2xl bg-[#f7fbf8] p-4">
                  <p className="text-xs text-[#82948d]">School subdomain</p>
                  <p className="mt-1 font-semibold text-[#34594a]">/{company?.subdomain || 'school'}</p>
                </div>
              </section>

              {message && (
                <div className="rounded-2xl border border-[#bfe4cf] bg-[#eaf8f0] px-4 py-3 text-sm font-semibold text-[#19734b]">
                  {message}
                </div>
              )}

              {error && (
                <div className="rounded-2xl border border-[#f0c9c9] bg-[#fff5f5] px-4 py-3 text-sm font-medium text-[#a33c3c]">
                  {error}
                </div>
              )}

              <button type="submit" className="btn btn-primary w-full py-3" disabled={saving}>
                {saving ? 'Saving Settings...' : 'Save Settings'}
              </button>
            </div>
          </form>
        )}
      </div>
    </AuthGuard>
  );
}

function ToggleRow({ title, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-[#d5e9dd] bg-white/75 p-4">
      <div>
        <p className="text-sm font-semibold text-[#34594a]">{title}</p>
        <p className="mt-1 text-xs leading-5 text-[#82948d]">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={
          checked
            ? 'relative h-7 w-12 shrink-0 rounded-full bg-[#1fa774] transition'
            : 'relative h-7 w-12 shrink-0 rounded-full bg-[#cbd9d2] transition'
        }
      >
        <span
          className={
            checked
              ? 'absolute left-[26px] top-1 h-5 w-5 rounded-full bg-white shadow transition'
              : 'absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow transition'
          }
        />
      </button>
    </div>
  );
}
