'use client';
import { useEffect, useState } from 'react';
import AuthGuard from '../../components/AuthGuard';
import { api, getCompany } from '../../lib/api';

const CLASS_NAMES = ['Playgroup', 'Nursery', 'Jr KG', 'Sr KG', 'Day Care'];

export default function ClassesPage() {
  const company = getCompany();
  const [list, setList] = useState([]);
  const [form, setForm] = useState({
    name: 'Playgroup', capacity: 20, classTeacher: '', ageGroup: '3-4 Years', feesAnnual: 25000,
  });
  const [loading, setLoading] = useState(false);

  const load = () => {
    if (!company?.id) return;
    api.listClasses(company.id).then(setList).catch(console.error);
  };
  useEffect(() => { load(); }, []);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.createClass({
        ...form,
        capacity: Number(form.capacity),
        feesAnnual: Number(form.feesAnnual),
      });
      setForm({ name: 'Playgroup', capacity: 20, classTeacher: '', ageGroup: '3-4 Years', feesAnnual: 25000 });
      load();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard>
      <h1 className="text-2xl font-bold mb-6">Classes</h1>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="card">
          <h2 className="font-semibold mb-4">Add Class</h2>
          <form onSubmit={submit} className="space-y-3">
            <div>
              <label className="label">Class Name</label>
              <select className="input" name="name" value={form.name} onChange={handle}>
                {CLASS_NAMES.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Capacity</label>
              <input className="input" type="number" name="capacity" value={form.capacity} onChange={handle} />
            </div>
            <div>
              <label className="label">Class Teacher</label>
              <input className="input" name="classTeacher" value={form.classTeacher} onChange={handle} />
            </div>
            <div>
              <label className="label">Age Group</label>
              <input className="input" name="ageGroup" value={form.ageGroup} onChange={handle} placeholder="3-4 Years" />
            </div>
            <div>
              <label className="label">Annual Fees (₹)</label>
              <input className="input" type="number" name="feesAnnual" value={form.feesAnnual} onChange={handle} />
            </div>
            <button type="submit" className="btn btn-primary w-full" disabled={loading}>Add Class</button>
          </form>
        </div>
        <div className="card lg:col-span-2">
          <h2 className="font-semibold mb-4">All Classes</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b">
                  <th className="pb-2">Name</th>
                  <th className="pb-2">Age Group</th>
                  <th className="pb-2">Capacity</th>
                  <th className="pb-2">Teacher</th>
                  <th className="pb-2">Fees</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {list.map((c) => {
                  const full = c.studentsCount >= c.capacity;
                  return (
                    <tr key={c._id} className="border-b border-slate-100">
                      <td className="py-2 font-medium">{c.name}</td>
                      <td className="py-2">{c.ageGroup}</td>
                      <td className="py-2">{c.studentsCount}/{c.capacity}</td>
                      <td className="py-2">{c.classTeacher || '-'}</td>
                      <td className="py-2">₹{c.feesAnnual?.toLocaleString()}</td>
                      <td className="py-2">
                        <span className={`badge ${full ? 'badge-red' : 'badge-green'}`}>
                          {full ? 'Full' : 'Available'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {list.length === 0 && <tr><td colSpan={6} className="py-6 text-center text-slate-400">No classes yet</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
