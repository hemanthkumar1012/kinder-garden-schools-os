'use client';

import { useEffect, useState } from 'react';
import AuthGuard from '../../components/AuthGuard';
import { api, getCompany } from '../../lib/api';

const CLASS_NAMES = ['Playgroup', 'Nursery', 'Jr KG', 'Sr KG', 'Day Care'];

export default function ClassesPage() {
  const company = getCompany();
  const [list, setList] = useState([]);
  const [form, setForm] = useState({
    name: 'Playgroup',
    capacity: 20,
    classTeacher: '',
    ageGroup: '3-4 Years',
    feesAnnual: 25000,
  });
  const [loading, setLoading] = useState(false);

  const load = () => {
    if (!company?.id) return;
    api.listClasses(company.id).then(setList).catch(console.error);
  };

  useEffect(() => {
    load();
  }, []);

  const handle = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.createClass({
        ...form,
        capacity: Number(form.capacity),
        feesAnnual: Number(form.feesAnnual),
      });

      setForm({
        name: 'Playgroup',
        capacity: 20,
        classTeacher: '',
        ageGroup: '3-4 Years',
        feesAnnual: 25000,
      });

      load();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const totalCapacity = list.reduce((sum, item) => sum + Number(item.capacity || 0), 0);
  const totalStudents = list.reduce((sum, item) => sum + Number(item.studentsCount || 0), 0);
  const fullClasses = list.filter((item) => item.studentsCount >= item.capacity).length;

  return (
    <AuthGuard>
      <div>
        <div className="mb-7">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#74a08f]">Class setup</p>
          <h1 className="page-title mt-2 text-3xl font-bold">Classes</h1>
          <p className="page-subtitle mt-2 max-w-3xl text-sm">
            Set up each class with its available seats, teacher, age group and annual fee.
          </p>
        </div>

        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          <div className="card p-4">
            <p className="text-xs text-[#7b8f86]">Classes</p>
            <p className="mt-1 text-2xl font-bold text-[#234b3a]">{list.length}</p>
          </div>

          <div className="card p-4">
            <p className="text-xs text-[#7b8f86]">Students / Capacity</p>
            <p className="mt-1 text-2xl font-bold text-[#1f6f52]">
              {totalStudents}/{totalCapacity}
            </p>
          </div>

          <div className="card p-4">
            <p className="text-xs text-[#7b8f86]">Full Classes</p>
            <p className="mt-1 text-2xl font-bold text-[#a33c3c]">{fullClasses}</p>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
          <div className="card">
            <div className="mb-5">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#86a095]">Class details</p>
              <h2 className="mt-1 text-xl font-semibold text-[#193c2e]">Add Class</h2>
              <p className="mt-1 text-xs leading-5 text-[#7b8f86]">
                Create the class exactly as it should appear to staff and parents.
              </p>
            </div>

            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="label">Class Name</label>
                <select
                  className="input"
                  name="name"
                  value={form.name}
                  onChange={handle}
                >
                  {CLASS_NAMES.map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Number of Seats</label>
                <input
                  className="input"
                  type="number"
                  min="1"
                  name="capacity"
                  value={form.capacity}
                  onChange={handle}
                  required
                />
                <p className="mt-1 text-[11px] text-[#8a9b93]">
                  Example: 20 means this class can have up to 20 students.
                </p>
              </div>

              <div>
                <label className="label">Class Teacher</label>
                <input
                  className="input"
                  name="classTeacher"
                  value={form.classTeacher}
                  onChange={handle}
                  placeholder="Teacher name"
                />
              </div>

              <div>
                <label className="label">Age Group</label>
                <input
                  className="input"
                  name="ageGroup"
                  value={form.ageGroup}
                  onChange={handle}
                  placeholder="3-4 Years"
                />
              </div>

              <div>
                <label className="label">Annual Fees (₹)</label>
                <input
                  className="input"
                  type="number"
                  min="0"
                  name="feesAnnual"
                  value={form.feesAnnual}
                  onChange={handle}
                  required
                />
              </div>

              <div className="rounded-2xl border border-[#dcebe2] bg-[#f7fbf8] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#86a095]">
                  Preview
                </p>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-[#234b3a]">{form.name}</p>
                    <p className="mt-1 text-xs text-[#7b8f86]">{form.ageGroup}</p>
                  </div>
                  <span className="badge badge-green">Available</span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-white p-3">
                    <p className="text-[11px] text-[#83948c]">Seats</p>
                    <p className="mt-1 text-sm font-semibold text-[#34594a]">{form.capacity}</p>
                  </div>
                  <div className="rounded-xl bg-white p-3">
                    <p className="text-[11px] text-[#83948c]">Annual Fee</p>
                    <p className="mt-1 text-sm font-semibold text-[#34594a]">
                      ₹{Number(form.feesAnnual || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <button type="submit" className="btn btn-primary w-full py-3" disabled={loading}>
                {loading ? 'Adding Class...' : 'Add Class'}
              </button>
            </form>
          </div>

          <div className="card min-w-0">
            <div className="mb-5 flex flex-col gap-3 border-b border-[#e5eee9] pb-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#86a095]">School classes</p>
                <h2 className="mt-1 text-xl font-semibold text-[#193c2e]">All Classes</h2>
              </div>

              <span className="rounded-full bg-[#f1f7f3] px-3 py-1 text-xs font-medium text-[#587068]">
                {list.length} configured
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {list.map((item) => {
                const full = item.studentsCount >= item.capacity;
                const seatsLeft = Math.max(0, item.capacity - item.studentsCount);
                const fillPercent = item.capacity
                  ? Math.min(100, Math.round((item.studentsCount / item.capacity) * 100))
                  : 0;

                return (
                  <div key={item._id} className="card card-flat bg-[#fbfefc] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold text-[#234b3a]">{item.name}</h3>
                        <p className="mt-1 text-xs text-[#7b8f86]">{item.ageGroup}</p>
                      </div>

                      <span className={full ? 'badge badge-red' : 'badge badge-green'}>
                        {full ? 'Full' : 'Available'}
                      </span>
                    </div>

                    <div className="mt-5">
                      <div className="mb-2 flex items-center justify-between text-xs">
                        <span className="text-[#82948d]">Seats filled</span>
                        <span className="font-semibold text-[#456457]">
                          {item.studentsCount}/{item.capacity}
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-[#eaf1ed]">
                        <div
                          className={full ? 'h-full rounded-full bg-[#dc5a5a]' : 'h-full rounded-full bg-gradient-to-r from-[#1fa774] to-[#7dd0ab]'}
                          style={{ width: fillPercent + '%' }}
                        />
                      </div>

                      <p className="mt-2 text-[11px] text-[#8a9b93]">
                        {full ? 'No seats available' : seatsLeft + ' seat' + (seatsLeft === 1 ? '' : 's') + ' available'}
                      </p>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-2">
                      <div className="rounded-xl bg-white p-3">
                        <p className="text-[11px] text-[#83948c]">Teacher</p>
                        <p className="mt-1 truncate text-sm font-medium text-[#456457]">
                          {item.classTeacher || 'Not assigned'}
                        </p>
                      </div>

                      <div className="rounded-xl bg-white p-3">
                        <p className="text-[11px] text-[#83948c]">Annual Fee</p>
                        <p className="mt-1 text-sm font-medium text-[#456457]">
                          ₹{item.feesAnnual?.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}

              {list.length === 0 && (
                <div className="md:col-span-2 xl:col-span-3 rounded-2xl border border-dashed border-[#dcebe2] bg-[#f8fcfa] px-4 py-12 text-center">
                  <p className="font-medium text-[#587068]">No classes yet</p>
                  <p className="mt-1 text-xs text-[#8a9b93]">
                    Add Playgroup, Nursery, Jr KG, Sr KG or Day Care to get started.
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