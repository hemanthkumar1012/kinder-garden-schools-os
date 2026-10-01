'use client';

import { useEffect, useState } from 'react';
import AuthGuard from '../../components/AuthGuard';
import { api, getCompany } from '../../lib/api';

const GENDERS = [
  { value: 'M', label: 'Male' },
  { value: 'F', label: 'Female' },
  { value: 'O', label: 'Other' },
];

const API_HOST = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';

function statusClass(status) {
  if (status === 'admitted') return 'badge-green';
  if (status === 'pending') return 'badge-yellow';
  if (status === 'rejected') return 'badge-red';
  return 'badge-gray';
}

export default function AdmissionsPage() {
  const company = getCompany();
  const [classes, setClasses] = useState([]);
  const [list, setList] = useState([]);
  const [form, setForm] = useState({
    childName: '',
    age: '',
    gender: 'M',
    dob: '',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    address: '',
    classId: '',
    message: '',
    photo: null,
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const load = () => {
    if (!company?.id) return;

    api.listClasses(company.id).then(setClasses).catch(console.error);
    api.listAdmissions({ companyId: company.id }).then(setList).catch(console.error);
  };

  useEffect(() => {
    load();
  }, []);

  const handle = (e) => {
    const { name, value, files } = e.target;

    if (files) {
      setForm({ ...form, [name]: files[0] });
      return;
    }

    setForm({ ...form, [name]: value });
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');

    try {
      const fd = new FormData();
      fd.append('companyId', company.id);

      Object.entries(form).forEach(([key, value]) => {
        if (value !== null && value !== '') {
          fd.append(key, value);
        }
      });

      const result = await api.createAdmission(fd);

      await api.sendWhatsApp({
        type: 'admission-received',
        phone: form.parentPhone,
        language: company.language || 'Marathi',
        name: form.parentName,
        childName: form.childName,
        admissionNo: result.admissionNo,
        className: classes.find((item) => item._id === form.classId)?.name || '',
      }).catch(() => {});

      setMsg('Admission created successfully. Admission No: ' + result.admissionNo);

      setForm({
        childName: '',
        age: '',
        gender: 'M',
        dob: '',
        parentName: '',
        parentPhone: '',
        parentEmail: '',
        address: '',
        classId: '',
        message: '',
        photo: null,
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
      await api.updateAdmissionStatus({
        studentId: student._id,
        status,
      });

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

      alert('WhatsApp message prepared (mock).');
    } catch (err) {
      alert(err.message);
    }
  };

  const selectedClass = classes.find((item) => item._id === form.classId);
  const pendingCount = list.filter((item) => item.status === 'pending').length;
  const admittedCount = list.filter((item) => item.status === 'admitted').length;
  const rejectedCount = list.filter((item) => item.status === 'rejected').length;

  return (
    <AuthGuard>
      <div>
        <div className="mb-7">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#74a08f]">Student admissions</p>
          <h1 className="page-title mt-2 text-3xl font-bold">Admissions</h1>
          <p className="page-subtitle mt-2 max-w-3xl text-sm">
            Register a child, select the class, save the required parent details and keep the admission status moving through the school workflow.
          </p>
        </div>

        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          <div className="card p-4">
            <p className="text-xs text-[#7b8f86]">All Admissions</p>
            <p className="mt-1 text-2xl font-bold text-[#234b3a]">{list.length}</p>
          </div>
          <div className="card p-4">
            <p className="text-xs text-[#7b8f86]">Waiting for Review</p>
            <p className="mt-1 text-2xl font-bold text-[#a77708]">{pendingCount}</p>
          </div>
          <div className="card p-4">
            <p className="text-xs text-[#7b8f86]">Admitted</p>
            <p className="mt-1 text-2xl font-bold text-[#19734b]">{admittedCount}</p>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[470px_1fr]">
          <div className="card">
            <div className="mb-5">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#86a095]">New application</p>
              <h2 className="mt-1 text-xl font-semibold text-[#193c2e]">Create Admission</h2>
              <p className="mt-1 text-xs leading-5 text-[#7b8f86]">
                Enter the child and parent details used by the admission workflow.
              </p>
            </div>

            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="label">Child Name *</label>
                <input
                  className="input"
                  name="childName"
                  value={form.childName}
                  onChange={handle}
                  placeholder="Enter child's full name"
                  required
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="label">Age</label>
                  <input
                    className="input"
                    type="number"
                    min="0"
                    name="age"
                    value={form.age}
                    onChange={handle}
                    placeholder="Age"
                  />
                </div>

                <div>
                  <label className="label">Gender</label>
                  <select className="input" name="gender" value={form.gender} onChange={handle}>
                    {GENDERS.map((gender) => (
                      <option key={gender.value} value={gender.value}>
                        {gender.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="label">Date of Birth</label>
                <input
                  className="input"
                  type="date"
                  name="dob"
                  value={form.dob}
                  onChange={handle}
                />
              </div>

              <div className="rounded-2xl border border-[#dcebe2] bg-[#f7fbf8] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#86a095]">
                  Parent / Guardian
                </p>

                <div className="mt-3 space-y-3">
                  <div>
                    <label className="label">Parent Name *</label>
                    <input
                      className="input bg-white"
                      name="parentName"
                      value={form.parentName}
                      onChange={handle}
                      placeholder="Parent or guardian name"
                      required
                    />
                  </div>

                  <div>
                    <label className="label">Parent Phone *</label>
                    <input
                      className="input bg-white"
                      name="parentPhone"
                      value={form.parentPhone}
                      onChange={handle}
                      placeholder="9876543210"
                      required
                    />
                  </div>

                  <div>
                    <label className="label">Parent Email</label>
                    <input
                      className="input bg-white"
                      type="email"
                      name="parentEmail"
                      value={form.parentEmail}
                      onChange={handle}
                      placeholder="parent@example.com"
                    />
                  </div>

                  <div>
                    <label className="label">Address</label>
                    <input
                      className="input bg-white"
                      name="address"
                      value={form.address}
                      onChange={handle}
                      placeholder="Home address"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="label">Class</label>
                <select
                  className="input"
                  name="classId"
                  value={form.classId}
                  onChange={handle}
                >
                  <option value="">Select class</option>
                  {classes.map((item) => {
                    const full = item.studentsCount >= item.capacity;

                    return (
                      <option key={item._id} value={item._id} disabled={full}>
                        {item.name} · {item.studentsCount}/{item.capacity} · {item.ageGroup} · ₹{item.feesAnnual}
                        {full ? ' · Full' : ''}
                      </option>
                    );
                  })}
                </select>

                {selectedClass && (
                  <div className="mt-2 rounded-xl bg-[#eaf8f0] px-3 py-2 text-xs text-[#4d7865]">
                    {selectedClass.studentsCount}/{selectedClass.capacity} seats filled · {selectedClass.ageGroup} · ₹
                    {selectedClass.feesAnnual?.toLocaleString()} annual fee
                  </div>
                )}
              </div>

              <div>
                <label className="label">Message / Special Needs</label>
                <textarea
                  className="input"
                  name="message"
                  value={form.message}
                  onChange={handle}
                  rows={3}
                  placeholder="Add any relevant note for the school"
                />
              </div>

              <div>
                <label className="label">Child Photo</label>
                <input
                  className="input"
                  type="file"
                  name="photo"
                  accept="image/*"
                  onChange={handle}
                />
                <p className="mt-1 text-[11px] text-[#8a9b93]">Photo is optional.</p>
              </div>

              {msg && (
                <div className="rounded-2xl border border-[#bfe4cf] bg-[#eaf8f0] px-3 py-2.5 text-sm font-medium text-[#19734b]">
                  {msg}
                </div>
              )}

              <button type="submit" className="btn btn-primary w-full py-3" disabled={loading}>
                {loading ? 'Creating Admission...' : 'Create Admission'}
              </button>
            </form>
          </div>

          <div className="card min-w-0">
            <div className="mb-5 flex flex-col gap-3 border-b border-[#e5eee9] pb-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#86a095]">Admission records</p>
                <h2 className="mt-1 text-xl font-semibold text-[#193c2e]">Current Applications</h2>
              </div>

              <div className="flex gap-2 text-xs">
                <span className="badge badge-green">Admitted {admittedCount}</span>
                <span className="badge badge-yellow">Pending {pendingCount}</span>
                <span className="badge badge-red">Rejected {rejectedCount}</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] text-sm">
                <thead>
                  <tr className="border-b border-[#e5eee9] text-left text-xs uppercase tracking-[0.08em] text-[#86988f]">
                    <th className="pb-3 font-semibold">Admission</th>
                    <th className="pb-3 font-semibold">Child</th>
                    <th className="pb-3 font-semibold">Class</th>
                    <th className="pb-3 font-semibold">Parent</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {list.map((student) => (
                    <tr key={student._id} className="table-row border-b border-[#edf3ef]">
                      <td className="py-4">
                        <p className="font-mono text-xs font-semibold text-[#517167]">
                          {student.admissionNo}
                        </p>

                        {student.photoUrl && (
                          <img
                            src={API_HOST + student.photoUrl}
                            alt={student.name}
                            className="mt-2 h-10 w-10 rounded-xl object-cover"
                          />
                        )}
                      </td>

                      <td className="py-4">
                        <p className="font-semibold text-[#234b3a]">{student.name}</p>
                        <p className="mt-1 text-xs text-[#7b8f86]">
                          {student.gender} · {student.age || '-'} years
                        </p>
                        <p className="mt-1 text-xs text-[#8a9b93]">
                          {student.dob ? new Date(student.dob).toLocaleDateString() : 'DOB not provided'}
                        </p>
                      </td>

                      <td className="py-4">
                        <p className="font-medium text-[#34594a]">{student.classId?.name || '-'}</p>
                        <p className="mt-1 text-xs text-[#8a9b93]">{student.classId?.ageGroup || ''}</p>
                      </td>

                      <td className="py-4">
                        <p className="font-medium text-[#34594a]">{student.parentName}</p>
                        <p className="mt-1 text-xs text-[#71847a]">{student.parentPhone}</p>
                      </td>

                      <td className="py-4">
                        <span className={'badge ' + statusClass(student.status)}>
                          {student.status === 'pending'
                            ? 'Pending'
                            : student.status === 'admitted'
                            ? 'Admitted'
                            : student.status === 'rejected'
                            ? 'Rejected'
                            : 'Waitlisted'}
                        </span>
                      </td>

                      <td className="py-4">
                        <div className="flex max-w-[250px] flex-wrap gap-2">
                          {student.status === 'pending' && (
                            <>
                              <button
                                className="btn btn-success px-3 py-1.5 text-xs"
                                onClick={() => updateStatus(student, 'admitted')}
                              >
                                Admit & Notify
                              </button>

                              <button
                                className="btn btn-danger px-3 py-1.5 text-xs"
                                onClick={() => updateStatus(student, 'rejected')}
                              >
                                Reject
                              </button>
                            </>
                          )}

                          <button
                            className="btn btn-secondary px-3 py-1.5 text-xs"
                            onClick={() => sendWA(student, 'admission-received')}
                          >
                            Send Received Message
                          </button>

                          <button
                            className="btn btn-secondary px-3 py-1.5 text-xs"
                            onClick={() => sendWA(student, 'admission-confirmed')}
                          >
                            Send Confirmation + Fee Info
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {list.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center">
                        <p className="font-medium text-[#587068]">No admissions yet</p>
                        <p className="mt-1 text-xs text-[#8a9b93]">
                          New admission records will appear here.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}