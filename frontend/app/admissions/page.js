'use client';
import { useEffect, useState } from 'react';
import AuthGuard from '../../components/AuthGuard';
import { api, getCompany } from '../../lib/api';

const GENDERS = ['M', 'F', 'O'];
const API_HOST = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';

export default function AdmissionsPage() {
  const company = getCompany();
  const [classes, setClasses] = useState([]);
  const [list, setList] = useState([]);
  const [form, setForm] = useState({
    childName: '', age: '', gender: 'M', dob: '', parentName: '', parentPhone: '',
    parentEmail: '', address: '', classId: '', message: '', photo: null,
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const load = () => {
    if (!company?.id) return;
    api.listClasses(company.id).then(setClasses).catch(console.error);
    api.listAdmissions({ companyId: company.id }).then(setList).catch(console.error);
  };

  useEffect(() => { load(); }, []);

  const handle = (e) => {
    const { name, value, files } = e.target;
    if (files) setForm({ ...form, [name]: files[0] });
    else setForm({ ...form, [name]: value });
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    try {
      const fd = new FormData();
      fd.append('companyId', company.id);
      Object.entries(form).forEach(([k, v]) => {
        if (v !== null && v !== '') fd.append(k, v);
      });
      const res = await api.createAdmission(fd);
      // WhatsApp Marathi admission-received
      await api.sendWhatsApp({
        type: 'admission-received',
        phone: form.parentPhone,
        language: company.language || 'Marathi',
        name: form.parentName,
        childName: form.childName,
        admissionNo: res.admissionNo,
        className: classes.find((c) => c._id === form.classId)?.name || '',
      }).catch(() => {});
      setMsg(`Admission created: ${res.admissionNo}`);
      setForm({
        childName: '', age: '', gender: 'M', dob: '', parentName: '', parentPhone: '',
        parentEmail: '', address: '', classId: '', message: '', photo: null,
      });
      load();
    } catch (err) {
      setMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (student, status) => {
    try {
      await api.updateAdmissionStatus({ studentId: student._id, status });
      if (status === 'admitted') {
        await api.sendWhatsApp({
          type: 'admission-confirmed',
          phone: student.parentPhone,
          language: company.language || 'Marathi',
          name: student.parentName,
          childName: student.name,
          admissionNo: student.admissionNo,
          className: student.classId?.name || '',
          upiId: company.upiId || '',
        }).catch(() => {});
      }
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  const sendWA = async (student, type) => {
    try {
      await api.sendWhatsApp({
        type,
        phone: student.parentPhone,
        language: company.language || 'Marathi',
        name: student.parentName,
        childName: student.name,
        admissionNo: student.admissionNo,
        className: student.classId?.name || '',
        upiId: company.upiId || '',
      });
      alert('WhatsApp sent (mock)');
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <AuthGuard>
      <h1 className="text-2xl font-bold mb-6">Admissions</h1>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-1">
          <h2 className="font-semibold mb-4">New Admission</h2>
          <form onSubmit={submit} className="space-y-3">
            <div>
              <label className="label">Child Name *</label>
              <input className="input" name="childName" value={form.childName} onChange={handle} required />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="label">Age</label>
                <input className="input" type="number" name="age" value={form.age} onChange={handle} />
              </div>
              <div>
                <label className="label">Gender</label>
                <select className="input" name="gender" value={form.gender} onChange={handle}>
                  {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="label">DOB</label>
              <input className="input" type="date" name="dob" value={form.dob} onChange={handle} />
            </div>
            <div>
              <label className="label">Parent Name *</label>
              <input className="input" name="parentName" value={form.parentName} onChange={handle} required />
            </div>
            <div>
              <label className="label">Parent Phone *</label>
              <input className="input" name="parentPhone" value={form.parentPhone} onChange={handle} required placeholder="9876543210" />
            </div>
            <div>
              <label className="label">Parent Email</label>
              <input className="input" type="email" name="parentEmail" value={form.parentEmail} onChange={handle} />
            </div>
            <div>
              <label className="label">Address</label>
              <input className="input" name="address" value={form.address} onChange={handle} />
            </div>
            <div>
              <label className="label">Class</label>
              <select className="input" name="classId" value={form.classId} onChange={handle}>
                <option value="">Select class</option>
                {classes.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} ({c.studentsCount}/{c.capacity}) · {c.ageGroup} · ₹{c.feesAnnual}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Message / Special Needs</label>
              <textarea className="input" name="message" value={form.message} onChange={handle} rows={2} />
            </div>
            <div>
              <label className="label">Photo</label>
              <input className="input" type="file" name="photo" accept="image/*" onChange={handle} />
            </div>
            {msg && <p className="text-sm text-teal-700">{msg}</p>}
            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
              {loading ? 'Creating...' : 'Create Admission'}
            </button>
          </form>
        </div>

        <div className="card lg:col-span-2">
          <h2 className="font-semibold mb-4">Admissions List</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b">
                  <th className="pb-2">No / Photo</th>
                  <th className="pb-2">Child</th>
                  <th className="pb-2">Class</th>
                  <th className="pb-2">Parent</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map((s) => (
                  <tr key={s._id} className="border-b border-slate-100">
                    <td className="py-2">
                      <div className="font-mono text-xs">{s.admissionNo}</div>
                      {s.photoUrl && (
                        <img
                          src={`${API_HOST}${s.photoUrl}`}
                          alt=""
                          className="w-10 h-10 rounded-full object-cover mt-1"
                        />
                      )}
                    </td>
                    <td className="py-2">
                      <div className="font-medium">{s.name}</div>
                      <div className="text-xs text-slate-500">{s.gender} · {s.age} yrs</div>
                    </td>
                    <td className="py-2">
                      {s.classId?.name || '-'}
                      <br />
                      <span className="text-xs text-slate-400">{s.classId?.ageGroup}</span>
                    </td>
                    <td className="py-2">
                      {s.parentName}
                      <br />
                      <span className="text-xs">{s.parentPhone}</span>
                    </td>
                    <td className="py-2">
                      <span
                        className={`badge ${
                          s.status === 'admitted'
                            ? 'badge-green'
                            : s.status === 'pending'
                            ? 'badge-yellow'
                            : s.status === 'rejected'
                            ? 'badge-red'
                            : 'badge-gray'
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="py-2">
                      <div className="flex flex-wrap gap-1">
                        {s.status === 'pending' && (
                          <>
                            <button
                              className="btn btn-success text-xs py-1 px-2"
                              onClick={() => updateStatus(s, 'admitted')}
                            >
                              Admit + UPI
                            </button>
                            <button
                              className="btn btn-danger text-xs py-1 px-2"
                              onClick={() => updateStatus(s, 'rejected')}
                            >
                              Reject
                            </button>
                          </>
                        )}
                        <button
                          className="btn btn-secondary text-xs py-1 px-2"
                          onClick={() => sendWA(s, 'admission-received')}
                        >
                          WA Received
                        </button>
                        <button
                          className="btn btn-secondary text-xs py-1 px-2"
                          onClick={() => sendWA(s, 'admission-confirmed')}
                        >
                          WA Confirmed + UPI
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {list.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-400">
                      No admissions
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
