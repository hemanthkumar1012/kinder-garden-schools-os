'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, setAuth } from '../../lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({
    name: '', subdomain: '', ownerEmail: '', password: '', schoolType: 'kinder-garden', location: '',
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-slate-100 p-4">
      <div className="card w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-teal-700">Kinder Garden Schools OS</h1>
          <p className="text-sm text-slate-500 mt-1">Admission · Gallery · Feedback · Webinars</p>
        </div>
        <div className="flex gap-2 mb-6">
          <button
            type="button"
            className={`flex-1 py-2 rounded-lg text-sm font-medium ${mode === 'login' ? 'bg-teal-600 text-white' : 'bg-slate-100'}`}
            onClick={() => setMode('login')}
          >
            Login
          </button>
          <button
            type="button"
            className={`flex-1 py-2 rounded-lg text-sm font-medium ${mode === 'register' ? 'bg-teal-600 text-white' : 'bg-slate-100'}`}
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
            <div className="flex items-center gap-1">
              <input className="input" name="subdomain" value={form.subdomain} onChange={handle} required placeholder="myschool" />
              <span className="text-slate-400 text-sm whitespace-nowrap">.school</span>
            </div>
          </div>
          <div>
            <label className="label">Owner Email</label>
            <input className="input" type="email" name={mode === 'login' ? 'email' : 'ownerEmail'} value={mode === 'login' ? form.email : form.ownerEmail} onChange={handle} required />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input" type="password" name="password" value={form.password} onChange={handle} required minLength={6} />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create School'}
          </button>
        </form>
      </div>
    </div>
  );
}
