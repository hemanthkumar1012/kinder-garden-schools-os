'use client';
import { useEffect, useState } from 'react';
import AuthGuard from '../../components/AuthGuard';
import { api, getCompany } from '../../lib/api';

const CATEGORIES = ['classroom', 'activity', 'event', 'festival', 'annual-day', 'sports'];

export default function GalleryPage() {
  const company = getCompany();
  const [list, setList] = useState([]);
  const [form, setForm] = useState({
    title: '', category: 'event', eventDate: '', description: '', isPublic: true, images: [],
  });
  const [loading, setLoading] = useState(false);

  const load = () => {
    if (!company?.id) return;
    api.listGallery({ companyId: company.id }).then(setList).catch(console.error);
  };
  useEffect(() => { load(); }, []);

  const handle = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (files) setForm({ ...form, images: Array.from(files) });
    else if (type === 'checkbox') setForm({ ...form, [name]: checked });
    else setForm({ ...form, [name]: value });
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('category', form.category);
      fd.append('description', form.description);
      if (form.eventDate) fd.append('eventDate', form.eventDate);
      fd.append('isPublic', form.isPublic);
      form.images.forEach((f) => fd.append('images', f));
      await api.createGallery(fd);
      setForm({ title: '', category: 'event', eventDate: '', description: '', isPublic: true, images: [] });
      load();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const del = async (id) => {
    if (!confirm('Delete this album?')) return;
    await api.deleteGallery(id);
    load();
  };

  return (
    <AuthGuard>
      <h1 className="text-2xl font-bold mb-6">Gallery</h1>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="card">
          <h2 className="font-semibold mb-4">Create Album</h2>
          <form onSubmit={submit} className="space-y-3">
            <div>
              <label className="label">Title *</label>
              <input className="input" name="title" value={form.title} onChange={handle} required placeholder="Annual Day 2026" />
            </div>
            <div>
              <label className="label">Category</label>
              <select className="input" name="category" value={form.category} onChange={handle}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Event Date</label>
              <input className="input" type="date" name="eventDate" value={form.eventDate} onChange={handle} />
            </div>
            <div>
              <label className="label">Description</label>
              <textarea className="input" name="description" value={form.description} onChange={handle} rows={2} />
            </div>
            <div>
              <label className="label">Images (up to 20)</label>
              <input className="input" type="file" name="images" accept="image/*" multiple onChange={handle} />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="isPublic" checked={form.isPublic} onChange={handle} />
              Public on Website
            </label>
            <button type="submit" className="btn btn-primary w-full" disabled={loading}>Create Album</button>
          </form>
        </div>
        <div className="lg:col-span-2">
          <div className="grid sm:grid-cols-2 gap-4">
            {list.map((g) => (
              <div key={g._id} className="card">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold">{g.title}</h3>
                    <span className="badge badge-blue text-xs">{g.category}</span>
                    {g.isPublic && <span className="badge badge-green text-xs ml-1">Public</span>}
                  </div>
                  <button className="text-red-500 text-xs" onClick={() => del(g._id)}>Delete</button>
                </div>
                <p className="text-xs text-slate-500 mb-2">{g.eventDate ? new Date(g.eventDate).toLocaleDateString() : ''} · {g.images?.length || 0} images</p>
                <p className="text-sm text-slate-600 line-clamp-2 mb-2">{g.description}</p>
                <div className="flex gap-1 flex-wrap">
                  {(g.images || []).slice(0, 4).map((img, i) => (
                    <img key={i} src={`http://localhost:5000${img}`} alt="" className="w-14 h-14 object-cover rounded" />
                  ))}
                  {(g.images?.length || 0) > 4 && (
                    <span className="w-14 h-14 bg-slate-100 rounded flex items-center justify-center text-xs text-slate-500">
                      +{g.images.length - 4}
                    </span>
                  )}
                </div>
              </div>
            ))}
            {list.length === 0 && <p className="text-slate-400 col-span-2 text-center py-8">No albums yet</p>}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
