'use client';

import { useEffect, useMemo, useState } from 'react';
import AuthGuard from '../../components/AuthGuard';
import { api, getCompany } from '../../lib/api';

const CATEGORIES = [
  { value: 'classroom', label: 'Classroom' },
  { value: 'activity', label: 'Activity' },
  { value: 'event', label: 'Event' },
  { value: 'festival', label: 'Festival' },
  { value: 'annual-day', label: 'Annual Day' },
  { value: 'sports', label: 'Sports' },
];

const API_HOST = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';

export default function GalleryPage() {
  const company = getCompany();
  const [list, setList] = useState([]);
  const [form, setForm] = useState({
    title: '',
    category: 'event',
    eventDate: '',
    description: '',
    isPublic: true,
    images: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    if (!company?.id) return;
    api.listGallery({ companyId: company.id }).then(setList).catch(console.error);
  };

  useEffect(() => {
    load();
  }, []);

  const previews = useMemo(
    () =>
      form.images.map((file) => ({
        name: file.name,
        url: URL.createObjectURL(file),
      })),
    [form.images]
  );

  useEffect(() => {
    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [previews]);

  const handle = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (files) {
      const selected = Array.from(files).slice(0, 20);
      setForm({ ...form, images: selected });
      setError(
        files.length > 20
          ? 'Only the first 20 images were selected because an album supports up to 20 images.'
          : ''
      );
      return;
    }

    if (type === 'checkbox') {
      setForm({ ...form, [name]: checked });
      return;
    }

    setForm({ ...form, [name]: value });
    setError('');
  };

  const removeSelectedImage = (index) => {
    setForm({
      ...form,
      images: form.images.filter((_, itemIndex) => itemIndex !== index),
    });
  };

  const submit = async (e) => {
    e.preventDefault();

    if (form.images.length > 20) {
      setError('An album can contain up to 20 images.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('category', form.category);
      fd.append('description', form.description);

      if (form.eventDate) {
        fd.append('eventDate', form.eventDate);
      }

      fd.append('isPublic', form.isPublic);

      form.images.forEach((file) => {
        fd.append('images', file);
      });

      await api.createGallery(fd);

      setForm({
        title: '',
        category: 'event',
        eventDate: '',
        description: '',
        isPublic: true,
        images: [],
      });

      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const del = async (id) => {
    if (!confirm('Delete this gallery album?')) return;

    try {
      await api.deleteGallery(id);
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  const publicCount = list.filter((album) => album.isPublic).length;
  const totalImages = list.reduce((sum, album) => sum + (album.images?.length || 0), 0);

  return (
    <AuthGuard>
      <div>
        <div className="mb-7">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#74a08f]">School memories</p>
          <h1 className="page-title mt-2 text-3xl font-bold">Gallery</h1>
          <p className="page-subtitle mt-2 max-w-3xl text-sm">
            Create photo albums for classroom moments, activities, events, festivals, annual day and sports.
          </p>
        </div>

        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          <div className="card p-4">
            <p className="text-xs text-[#7b8f86]">Albums</p>
            <p className="mt-1 text-2xl font-bold text-[#234b3a]">{list.length}</p>
          </div>

          <div className="card p-4">
            <p className="text-xs text-[#7b8f86]">Public Albums</p>
            <p className="mt-1 text-2xl font-bold text-[#19734b]">{publicCount}</p>
          </div>

          <div className="card p-4">
            <p className="text-xs text-[#7b8f86]">Images Stored</p>
            <p className="mt-1 text-2xl font-bold text-[#1f6f52]">{totalImages}</p>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[450px_1fr]">
          <div className="card">
            <div className="mb-5">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#86a095]">New album</p>
              <h2 className="mt-1 text-xl font-semibold text-[#193c2e]">Create Album</h2>
              <p className="mt-1 text-xs leading-5 text-[#7b8f86]">
                Add up to 20 photos and decide whether families can see the album on the public school page.
              </p>
            </div>

            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="label">Album Title *</label>
                <input
                  className="input"
                  name="title"
                  value={form.title}
                  onChange={handle}
                  required
                  placeholder="Annual Day 2026"
                />
              </div>

              <div>
                <label className="label">Category</label>
                <select className="input" name="category" value={form.category} onChange={handle}>
                  {CATEGORIES.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Event Date</label>
                <input
                  className="input"
                  type="date"
                  name="eventDate"
                  value={form.eventDate}
                  onChange={handle}
                />
              </div>

              <div>
                <label className="label">Description</label>
                <textarea
                  className="input"
                  name="description"
                  value={form.description}
                  onChange={handle}
                  rows={3}
                  placeholder="Tell parents what this album is about"
                />
              </div>

              <div>
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <label className="label mb-0">Photos</label>
                    <p className="mt-1 text-[11px] text-[#8a9b93]">
                      Up to 20 images per album.
                    </p>
                  </div>

                  <span className="rounded-full bg-[#e9f8f0] px-3 py-1 text-xs font-semibold text-[#19734b]">
                    {form.images.length}/20
                  </span>
                </div>

                <label className="mt-3 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[#acd8c0] bg-[#f7fbf8] px-5 py-8 text-center transition hover:-translate-y-0.5 hover:border-[#71c19b] hover:bg-[#eff9f3]">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e2f6ea] text-[#1fa774]">
                    +
                  </span>
                  <span className="mt-3 text-sm font-semibold text-[#34594a]">Choose photos</span>
                  <span className="mt-1 text-xs text-[#82948d]">Select multiple images at once</span>
                  <input
                    className="hidden"
                    type="file"
                    name="images"
                    accept="image/*"
                    multiple
                    onChange={handle}
                  />
                </label>

                {form.images.length > 0 && (
                  <div className="mt-3 grid grid-cols-4 gap-2">
                    {previews.map((preview, index) => (
                      <div key={preview.name + index} className="group relative overflow-hidden rounded-xl">
                        <img
                          src={preview.url}
                          alt={preview.name}
                          className="aspect-square w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeSelectedImage(index)}
                          className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-xs text-white opacity-0 transition group-hover:opacity-100"
                          title="Remove photo"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <label className="flex items-start gap-3 rounded-2xl border border-[#dcebe2] bg-[#f7fbf8] p-4">
                <input
                  className="mt-1"
                  type="checkbox"
                  name="isPublic"
                  checked={form.isPublic}
                  onChange={handle}
                />
                <span>
                  <span className="block text-sm font-semibold text-[#34594a]">Show on public school website</span>
                  <span className="mt-1 block text-xs leading-5 text-[#7b8f86]">
                    Turn this off when the album should stay inside the school dashboard.
                  </span>
                </span>
              </label>

              {error && (
                <div className="rounded-2xl border border-[#f0c9c9] bg-[#fff5f5] px-3 py-2.5 text-sm text-[#a33c3c]">
                  {error}
                </div>
              )}

              <button type="submit" className="btn btn-primary w-full py-3" disabled={loading}>
                {loading ? 'Creating Album...' : 'Create Album'}
              </button>
            </form>
          </div>

          <div className="card min-w-0">
            <div className="mb-5 flex flex-col gap-3 border-b border-[#e5eee9] pb-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#86a095]">Album library</p>
                <h2 className="mt-1 text-xl font-semibold text-[#193c2e]">Gallery Albums</h2>
              </div>

              <span className="rounded-full bg-[#f1f7f3] px-3 py-1 text-xs font-medium text-[#587068]">
                {list.length} albums
              </span>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {list.map((album) => (
                <article key={album._id} className="card card-flat group bg-[#fbfefc] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-lg font-semibold text-[#234b3a]">{album.title}</h3>

                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <span className="badge badge-blue">{album.category}</span>
                        {album.isPublic ? (
                          <span className="badge badge-green">Public</span>
                        ) : (
                          <span className="badge badge-gray">Dashboard only</span>
                        )}
                      </div>
                    </div>

                    <button
                      className="rounded-lg px-2 py-1 text-xs font-semibold text-[#b04747] transition hover:bg-[#fff0f0]"
                      onClick={() => del(album._id)}
                    >
                      Delete
                    </button>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-[#82948d]">
                    <span>
                      {album.eventDate ? new Date(album.eventDate).toLocaleDateString() : 'No event date'}
                    </span>
                    <span>{album.images?.length || 0} images</span>
                  </div>

                  {album.description && (
                    <p className="mt-3 line-clamp-2 text-sm leading-5 text-[#6f8279]">
                      {album.description}
                    </p>
                  )}

                  <div className="mt-4 grid grid-cols-4 gap-2">
                    {(album.images || []).slice(0, 4).map((image, index) => (
                      <div
                        key={index}
                        className="aspect-square overflow-hidden rounded-xl bg-[#edf6f0]"
                      >
                        <img
                          src={API_HOST + image}
                          alt={album.title}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                        />
                      </div>
                    ))}

                    {(album.images?.length || 0) === 0 && (
                      <div className="col-span-4 flex aspect-[4/1] items-center justify-center rounded-xl bg-[#f1f7f3] text-xs text-[#8a9b93]">
                        No images in this album
                      </div>
                    )}
                  </div>

                  {(album.images?.length || 0) > 4 && (
                    <div className="mt-3 text-xs font-semibold text-[#587068]">
                      +{album.images.length - 4} more photos
                    </div>
                  )}
                </article>
              ))}

              {list.length === 0 && (
                <div className="md:col-span-2 rounded-2xl border border-dashed border-[#dcebe2] bg-[#f8fcfa] px-4 py-12 text-center">
                  <p className="font-medium text-[#587068]">No albums yet</p>
                  <p className="mt-1 text-xs text-[#8a9b93]">
                    Create your first school gallery album to start collecting memories.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}