'use client';
import { useEffect, useState } from 'react';
import AuthGuard from '../../components/AuthGuard';
import { api, getCompany } from '../../lib/api';

export default function FeesPage() {
  const company = getCompany();
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [list, setList] = useState([]);
  const [form, setForm] = useState({
    studentId: '', classId: '', totalFee: 25000, installments: '[{"amount":12500,"dueDate":"2026-04-01"},{"amount":12500,"dueDate":"2026-08-01"}]',
  });
  const [loading, setLoading] = useState(false);

  const load = () => {
    if (!company?.id) return;
    api.listAdmissions({ companyId: company.id, status: 'admitted' }).then(setStudents).catch(() => {
      api.listAdmissions({ companyId: company.id }).then(setStudents);
    });
    api.listClasses(company.id).then(setClasses).catch(console.error);
    api.listFees({ companyId: company.id }).then(setList).catch(console.error);
  };
  useEffect(() => { load(); }, []);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.createFee({
        studentId: form.studentId,
        classId: form.classId || undefined,
        totalFee: Number(form.totalFee),
        installments: form.installments,
      });
      load();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const pay = async (feeId, amount, installmentIndex) => {
    try {
      await api.payFee({ feeId, amount, installmentIndex });
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <AuthGuard>
      <h1 className="text-2xl font-bold mb-6">Fees</h1>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="card">
          <h2 className="font-semibold mb-4">Create Fee Record</h2>
          <form onSubmit={submit} className="space-y-3">
            <div>
              <label className="label">Student</label>
              <select className="input" name="studentId" value={form.studentId} onChange={handle} required>
                <option value="">Select student</option>
                {students.map(s => (
                  <option key={s._id} value={s._id}>{s.name} ({s.admissionNo})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Class</label>
              <select className="input" name="classId" value={form.classId} onChange={handle}>
                <option value="">Select class</option>
                {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Total Fee (₹)</label>
              <input className="input" type="number" name="totalFee" value={form.totalFee} onChange={handle} />
            </div>
            <div>
              <label className="label">Installments (JSON)</label>
              <textarea className="input font-mono text-xs" name="installments" value={form.installments} onChange={handle} rows={3} />
            </div>
            <button type="submit" className="btn btn-primary w-full" disabled={loading}>Create Fee</button>
          </form>
        </div>
        <div className="card lg:col-span-2">
          <h2 className="font-semibold mb-4">Fee Records</h2>
          <div className="space-y-4">
            {list.map((f) => (
              <div key={f._id} className="border border-slate-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium">{f.studentId?.name || 'Student'}</p>
                    <p className="text-xs text-slate-500">{f.studentId?.admissionNo} · {f.classId?.name}</p>
                  </div>
                  <div className="text-right text-sm">
                    <p>Total: ₹{f.totalFee?.toLocaleString()}</p>
                    <p className="text-emerald-600">Paid: ₹{f.paidAmount?.toLocaleString()}</p>
                    <p className={f.pendingAmount > 0 ? 'text-amber-600' : 'text-slate-400'}>Pending: ₹{f.pendingAmount?.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(f.installments || []).map((inst, idx) => {
                    const overdue = inst.status === 'pending' && inst.dueDate && new Date(inst.dueDate) < new Date();
                    return (
                      <div key={idx} className={`text-xs px-2 py-1 rounded border ${
                        inst.status === 'paid' ? 'bg-emerald-50 border-emerald-200' :
                        overdue ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'
                      }`}>
                        ₹{inst.amount} · {inst.dueDate ? new Date(inst.dueDate).toLocaleDateString() : '-'} · {inst.status}
                        {overdue && ' (overdue)'}
                        {inst.status === 'pending' && (
                          <button className="ml-2 text-teal-600 underline" onClick={() => pay(f._id, inst.amount, idx)}>Pay</button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            {list.length === 0 && <p className="text-center text-slate-400 py-6">No fee records</p>}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
