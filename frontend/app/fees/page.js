'use client';

import { useEffect, useState } from 'react';
import AuthGuard from '../../components/AuthGuard';
import { api, getCompany } from '../../lib/api';

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function FeesPage() {
  const company = getCompany();
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [list, setList] = useState([]);
  const [form, setForm] = useState({
    studentId: '',
    classId: '',
    totalFee: 25000,
    installments: [{ amount: 25000, dueDate: today() }],
  });
  const [loading, setLoading] = useState(false);

  const load = () => {
    if (!company?.id) return;

    api
      .listAdmissions({ companyId: company.id, status: 'admitted' })
      .then(setStudents)
      .catch(() => {
        api.listAdmissions({ companyId: company.id }).then(setStudents);
      });

    api.listClasses(company.id).then(setClasses).catch(console.error);
    api.listFees({ companyId: company.id }).then(setList).catch(console.error);
  };

  useEffect(() => {
    load();
  }, []);

  const handle = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleInstallment = (index, field, value) => {
    setForm({
      ...form,
      installments: form.installments.map((installment, itemIndex) =>
        itemIndex === index
          ? { ...installment, [field]: field === 'amount' ? Number(value) : value }
          : installment
      ),
    });
  };

  const addInstallment = () => {
    setForm({
      ...form,
      installments: [
        ...form.installments,
        { amount: 0, dueDate: '' },
      ],
    });
  };

  const removeInstallment = (index) => {
    if (form.installments.length === 1) return;

    setForm({
      ...form,
      installments: form.installments.filter((_, itemIndex) => itemIndex !== index),
    });
  };

  const totalScheduled = form.installments.reduce(
    (sum, installment) => sum + Number(installment.amount || 0),
    0
  );

  const totalFee = Number(form.totalFee || 0);
  const difference = totalFee - totalScheduled;

  const submit = async (e) => {
    e.preventDefault();

    if (form.installments.length === 0) {
      alert('Add at least one payment installment.');
      return;
    }

    setLoading(true);

    try {
      await api.createFee({
        studentId: form.studentId,
        classId: form.classId || undefined,
        totalFee,
        installments: form.installments,
      });

      setForm({
        studentId: '',
        classId: '',
        totalFee: 25000,
        installments: [{ amount: 25000, dueDate: today() }],
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
      <div>
        <div className="mb-7">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#74a08f]">Payments</p>
          <h1 className="page-title mt-2 text-3xl font-bold">Fees</h1>
          <p className="page-subtitle mt-2 max-w-2xl text-sm">
            Create a simple payment plan for each admitted student and track what has been paid and what is still due.
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
          <div className="card">
            <div className="mb-5">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#86a095]">New record</p>
              <h2 className="mt-1 text-xl font-semibold text-[#193c2e]">Create Fee Record</h2>
              <p className="mt-1 text-xs leading-5 text-[#7b8f86]">
                Set the total school fee and choose when each payment is due.
              </p>
            </div>

            <form onSubmit={submit} className="space-y-5">
              <div>
                <label className="label">Student</label>
                <select
                  className="input"
                  name="studentId"
                  value={form.studentId}
                  onChange={handle}
                  required
                >
                  <option value="">Select student</option>
                  {students.map((student) => (
                    <option key={student._id} value={student._id}>
                      {student.name} ({student.admissionNo})
                    </option>
                  ))}
                </select>
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
                  {classes.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Total School Fee (₹)</label>
                <input
                  className="input"
                  type="number"
                  min="0"
                  name="totalFee"
                  value={form.totalFee}
                  onChange={handle}
                  required
                />
              </div>

              <div>
                <div className="mb-3 flex items-end justify-between gap-3">
                  <div>
                    <label className="label mb-0">Payment Plan</label>
                    <p className="text-xs text-[#83948c]">
                      Add the amount and due date for each installment.
                    </p>
                  </div>

                  <button
                    type="button"
                    className="btn btn-secondary shrink-0 px-3 py-2 text-xs"
                    onClick={addInstallment}
                  >
                    + Add Payment
                  </button>
                </div>

                <div className="space-y-3">
                  {form.installments.map((installment, index) => (
                    <div
                      key={index}
                      className="rounded-2xl border border-[#dcebe2] bg-[#f7fbf8] p-4"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <p className="text-sm font-semibold text-[#34594a]">
                          Payment {index + 1}
                        </p>

                        {form.installments.length > 1 && (
                          <button
                            type="button"
                            className="text-xs font-semibold text-[#b04747] hover:text-[#8f3636]"
                            onClick={() => removeInstallment(index)}
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <label className="label text-xs">Amount (₹)</label>
                          <input
                            className="input bg-white"
                            type="number"
                            min="0"
                            value={installment.amount}
                            onChange={(e) =>
                              handleInstallment(index, 'amount', e.target.value)
                            }
                            required
                          />
                        </div>

                        <div>
                          <label className="label text-xs">Due Date</label>
                          <input
                            className="input bg-white"
                            type="date"
                            value={installment.dueDate}
                            onChange={(e) =>
                              handleInstallment(index, 'dueDate', e.target.value)
                            }
                            required
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 rounded-2xl border border-[#dcebe2] bg-white p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#71847a]">Scheduled payments</span>
                    <span className="font-semibold text-[#234b3a]">
                      ₹{totalScheduled.toLocaleString()}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-[#71847a]">Total school fee</span>
                    <span className="font-semibold text-[#234b3a]">
                      ₹{totalFee.toLocaleString()}
                    </span>
                  </div>

                  {difference !== 0 && (
                    <div className="mt-3 rounded-xl bg-[#fff8e5] px-3 py-2 text-xs font-medium text-[#906a12]">
                      {difference > 0
                        ? '₹' + difference.toLocaleString() + ' is not yet included in the payment plan.'
                        : 'The payment plan is ₹' + Math.abs(difference).toLocaleString() + ' higher than the total fee.'}
                    </div>
                  )}

                  {difference === 0 && (
                    <div className="mt-3 rounded-xl bg-[#eaf8f0] px-3 py-2 text-xs font-medium text-[#19734b]">
                      Payment plan matches the total school fee.
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full py-3"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Fee Record'}
              </button>
            </form>
          </div>

          <div className="card">
            <div className="mb-5">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#86a095]">Records</p>
              <h2 className="mt-1 text-xl font-semibold text-[#193c2e]">Fee Records</h2>
            </div>

            <div className="space-y-4">
              {list.map((fee) => (
                <div
                  key={fee._id}
                  className="rounded-2xl border border-[#dcebe2] bg-[#fafdff] p-4 shadow-[0_8px_24px_rgba(24,55,42,0.04)]"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="font-semibold text-[#234b3a]">
                        {fee.studentId?.name || 'Student'}
                      </p>
                      <p className="mt-1 text-xs text-[#7b8f86]">
                        {fee.studentId?.admissionNo} · {fee.classId?.name || 'Class'}
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs md:min-w-[320px]">
                      <div className="rounded-xl bg-white p-3">
                        <p className="text-[#87988f]">Total</p>
                        <p className="mt-1 font-semibold text-[#234b3a]">
                          ₹{fee.totalFee?.toLocaleString()}
                        </p>
                      </div>

                      <div className="rounded-xl bg-[#eaf8f0] p-3">
                        <p className="text-[#4d7865]">Paid</p>
                        <p className="mt-1 font-semibold text-[#19734b]">
                          ₹{fee.paidAmount?.toLocaleString()}
                        </p>
                      </div>

                      <div className="rounded-xl bg-[#fff8e5] p-3">
                        <p className="text-[#95701a]">Pending</p>
                        <p className="mt-1 font-semibold text-[#a77708]">
                          ₹{fee.pendingAmount?.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 border-t border-[#e5eee9] pt-4">
                    <p className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-[#86a095]">
                      Payment schedule
                    </p>

                    <div className="grid gap-2 sm:grid-cols-2">
                      {(fee.installments || []).map((installment, index) => {
                        const overdue =
                          installment.status === 'pending' &&
                          installment.dueDate &&
                          new Date(installment.dueDate) < new Date();

                        return (
                          <div
                            key={index}
                            className={[
                              'rounded-2xl border p-3',
                              installment.status === 'paid'
                                ? 'border-[#bfe4cf] bg-[#eff9f3]'
                                : overdue
                                ? 'border-[#f0c9c9] bg-[#fff5f5]'
                                : 'border-[#dcebe2] bg-white',
                            ].join(' ')}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-xs font-semibold text-[#6f8279]">
                                  Payment {index + 1}
                                </p>
                                <p className="mt-1 text-base font-bold text-[#234b3a]">
                                  ₹{installment.amount?.toLocaleString()}
                                </p>
                                <p className="mt-1 text-xs text-[#81938b]">
                                  Due:{' '}
                                  {installment.dueDate
                                    ? new Date(installment.dueDate).toLocaleDateString()
                                    : '-'}
                                </p>
                              </div>

                              <span
                                className={
                                  installment.status === 'paid'
                                    ? 'badge badge-green'
                                    : overdue
                                    ? 'badge badge-red'
                                    : 'badge badge-yellow'
                                }
                              >
                                {overdue ? 'Overdue' : installment.status === 'paid' ? 'Paid' : 'Pending'}
                              </span>
                            </div>

                            {installment.status === 'pending' && (
                              <button
                                className="btn btn-secondary mt-3 w-full text-xs"
                                onClick={() => pay(fee._id, installment.amount, index)}
                              >
                                Mark Payment Received
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}

              {list.length === 0 && (
                <div className="rounded-2xl border border-dashed border-[#dcebe2] bg-[#f8fcfa] px-4 py-10 text-center text-sm text-[#8a9b93]">
                  No fee records yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
