'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, setAuth } from '../../lib/api';

const features = [
  'Admissions and student records',
  'Classes, capacity and annual fees',
  'Gallery albums and parent feedback',
  'Webinars, registrations and fee tracking',
];

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({
    name: '',
    subdomain: '',
    ownerEmail: '',
    password: '',
    schoolType: 'kinder-garden',
    location: '',
    email: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'register') {
        const data = await api.register({
          name: form.name,
          subdomain: form.subdomain,
          ownerEmail: form.ownerEmail,
          password: form.password,
          schoolType: form.schoolType,
          location: form.location,
        });
        setAuth(data.token, data.company);
      } else {
        const data = await api.login({
          subdomain: form.subdomain,
          email: form.email || form.ownerEmail,
          password: form.password,
        });
        setAuth(data.token, data.company);
      }

      router.push('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6faf8] px-4 py-8 md:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl overflow-hidden rounded-[30px] border border-[#dcebe2] bg-white shadow-[0_28px_80px_rgba(24,55,42,0.10)] lg:grid-cols-[0.92fr_1.08fr]">
        <section className="relative hidden overflow-hidden bg-[#eff9f3] p-10 lg:flex lg:flex-col">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#d9f2e4]" />
          <div className="absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-[#e4f7ec]" />

          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1fa774] text-lg font-bold text-white shadow-[0_12px_24px_rgba(31,167,116,0.22)]">
                K
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#74a08f]">School OS</p>
                <h1 className="font-bold text-[#17382b]">Kinder Garden Schools OS</h1>
              </div>
            </div>

            <div className="mt-16 max-w-md">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#5b8c77]">Welcome back</p>
              <h2 className="mt-3 text-4xl font-bold leading-tight tracking-[-0.03em] text-[#17382b]">
                A calm workspace for your school operations.
              </h2>
              <p className="mt-5 text-sm leading-6 text-[#617970]">
                Manage the modules defined for your school: admissions, classes, gallery, feedback, webinars and fees.
              </p>
            </div>

            <div className="mt-10 space-y-3">
              {features.map((feature) => (
                <div key={feature} className="flex items-center gap-3 rounded-2xl border border-white/80 bg-white/75 p-3 text-sm text-[#456457]">
                  <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#e1f6e9] text-[#1f8d60]">✓</span>
                  {feature}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="flex items-center p-6 md:p-10">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-8 text-center lg:text-left">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#74a08f]">Secure school access</p>
              <h2 className="mt-2 text-3xl font-bold tracking-[-0.03em] text-[#17382b]">
                {mode === 'login' ? 'Sign in to your workspace' : 'Register your school'}
              </h2>
              <p className="mt-2 text-sm text-[#7a8c84]">
                {mode === 'login'
                  ? 'Enter your school subdomain and owner account details.'
                  : 'Create the school workspace and continue to your dashboard.'}
              </p>
            </div>

            <div className="mb-7 grid grid-cols-2 rounded-2xl bg-[#f1f7f3] p-1">
              <button
                type="button"
                className={mode === 'login'
                  ? 'rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#16845c] shadow-[0_6px_18px_rgba(24,55,42,0.08)]'
                  : 'rounded-xl px-4 py-2.5 text-sm font-semibold text-[#71847a] transition'}
                onClick={() => setMode('login')}
              >
                Login
              </button>
              <button
                type="button"
                className={mode === 'register'
                  ? 'rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#16845c] shadow-[0_6px_18px_rgba(24,55,42,0.08)]'
                  : 'rounded-xl px-4 py-2.5 text-sm font-semibold text-[#71847a] transition'}
                onClick={() => setMode('register')}
              >
                Register School
              </button>
            </div>

            <form onSubmit={submit} className="space-y-4">
              {mode === 'register' && (
                <>
                  <div>
                    <label className="label">School Name</label>
                    <input className="input" name="name" value={form.name} onChange={handle} required />
                  </div>

                  <div>
                    <label className="label">School Type</label>
                    <select className="input" name="schoolType" value={form.schoolType} onChange={handle}>
                      <option value="kinder-garden">Kinder Garden</option>
                      <option value="play-school">Play School</option>
                      <option value="pre-school">Pre School</option>
                    </select>
                  </div>

                  <div>
                    <label className="label">Location</label>
                    <input className="input" name="location" value={form.location} onChange={handle} />
                  </div>
                </>
              )}

              <div>
                <label className="label">Subdomain</label>
                <div className="flex items-center gap-2">
                  <input
                    className="input"
                    name="subdomain"
                    value={form.subdomain}
                    onChange={handle}
                    required
                    placeholder="myschool"
                  />
                  <span className="rounded-xl bg-[#f1f7f3] px-3 py-2.5 text-sm text-[#7b8f86]">.school</span>
                </div>
              </div>

              <div>
                <label className="label">Owner Email</label>
                <input
                  className="input"
                  type="email"
                  name={mode === 'login' ? 'email' : 'ownerEmail'}
                  value={mode === 'login' ? form.email : form.ownerEmail}
                  onChange={handle}
                  required
                />
              </div>

              <div>
                <label className="label">Password</label>
                <input
                  className="input"
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handle}
                  required
                  minLength={6}
                />
              </div>

              {error && (
                <div className="rounded-xl border border-[#f2cccc] bg-[#fff1f1] px-3 py-2.5 text-sm text-[#a33c3c]">
                  {error}
                </div>
              )}

              <button type="submit" className="btn btn-primary w-full py-3" disabled={loading}>
                {loading ? 'Please wait...' : mode === 'login' ? 'Enter Dashboard' : 'Create School'}
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}