const express = require('express');
const Fee = require('../models/Fee');
const Student = require('../models/Student');
const Class = require('../models/Class');
const auth = require('../middleware/auth');
const router = express.Router();

// POST /api/fees/create
router.post('/create', auth, async (req, res) => {
  try {
    const { studentId, classId, totalFee, installments } = req.body;
    if (!studentId || !totalFee) {
      return res.status(400).json({ error: 'studentId and totalFee required' });
    }
    const student = await Student.findOne({ _id: studentId, companyId: req.companyId });
    if (!student) return res.status(404).json({ error: 'Student not found' });

    if (classId) {
      const cls = await Class.findOne({ _id: classId, companyId: req.companyId }).select('_id');
      if (!cls) return res.status(400).json({ error: 'Invalid class' });
    }

    const total = Number(totalFee);
    if (!Number.isFinite(total) || total <= 0) {
      return res.status(400).json({ error: 'Total fee must be greater than zero' });
    }

    let inst = [];
    if (installments) {
      try {
        inst = typeof installments === 'string' ? JSON.parse(installments) : installments;
      } catch (e) {
        inst = [];
      }
    }
    if (!Array.isArray(inst) || inst.length === 0) {
      inst = [{ amount: total, dueDate: new Date(), status: 'pending' }];
    }

    const normalized = inst.map(i => ({
      amount: Number(i.amount),
      dueDate: i.dueDate || null,
      status: 'pending',
    }));

    if (normalized.some(i => !Number.isFinite(i.amount) || i.amount <= 0)) {
      return res.status(400).json({ error: 'Every payment amount must be greater than zero' });
    }

    const scheduledTotal = normalized.reduce((sum, i) => sum + i.amount, 0);
    if (Math.abs(scheduledTotal - total) > 0.01) {
      return res.status(400).json({ error: 'Payment plan total must match the school fee' });
    }

    const fee = await Fee.create({
      companyId: req.companyId,
      studentId,
      classId: classId || student.classId || null,
      totalFee: total,
      paidAmount: 0,
      pendingAmount: total,
      installments: normalized,
    });
    res.status(201).json(fee);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/fees/list
router.get('/list', auth, async (req, res) => {
  try {
    const companyId = req.companyId;
    const filter = { companyId };
    if (req.query.pending === 'true') {
      filter.pendingAmount = { $gt: 0 };
    }
    const list = await Fee.find(filter)
      .populate('studentId', 'name admissionNo parentName parentPhone')
      .populate('classId', 'name')
      .sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/fees/pay
router.post('/pay', auth, async (req, res) => {
  try {
    const { feeId, amount, installmentIndex } = req.body;
    const fee = await Fee.findOne({ _id: feeId, companyId: req.companyId });
    if (!fee) return res.status(404).json({ error: 'Fee not found' });

    const payAmt = Number(amount);
    if (!Number.isFinite(payAmt) || payAmt <= 0) {
      return res.status(400).json({ error: 'Payment amount must be greater than zero' });
    }

    const actualAmount = Math.min(payAmt, fee.pendingAmount);
    if (actualAmount <= 0) {
      return res.status(400).json({ error: 'This fee is already fully paid' });
    }

    fee.paidAmount += actualAmount;
    fee.pendingAmount = Math.max(0, fee.totalFee - fee.paidAmount);

    if (typeof installmentIndex === 'number' && fee.installments[installmentIndex]) {
      fee.installments[installmentIndex].status = 'paid';
      fee.installments[installmentIndex].paidDate = new Date();
    } else {
      const pendingIdx = fee.installments.findIndex(i => i.status === 'pending');
      if (pendingIdx >= 0) {
        fee.installments[pendingIdx].status = 'paid';
        fee.installments[pendingIdx].paidDate = new Date();
      }
    }

    await fee.save();
    res.json(fee);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
