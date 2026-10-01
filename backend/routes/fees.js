const express = require('express');
const Fee = require('../models/Fee');
const Student = require('../models/Student');
const auth = require('../middleware/auth');
const router = express.Router();

// POST /api/fees/create
router.post('/create', auth, async (req, res) => {
  try {
    const { studentId, classId, totalFee, installments } = req.body;
    if (!studentId || !totalFee) {
      return res.status(400).json({ error: 'studentId and totalFee required' });
    }
    const total = Number(totalFee);
    let inst = [];
    if (installments) {
      try {
        inst = typeof installments === 'string' ? JSON.parse(installments) : installments;
      } catch (e) {
        inst = [];
      }
    }
    if (inst.length === 0) {
      inst = [{ amount: total, dueDate: new Date(), status: 'pending' }];
    }

    const fee = await Fee.create({
      companyId: req.companyId,
      studentId,
      classId: classId || null,
      totalFee: total,
      paidAmount: 0,
      pendingAmount: total,
      installments: inst.map(i => ({
        amount: Number(i.amount),
        dueDate: i.dueDate || null,
        status: 'pending',
      })),
    });
    res.status(201).json(fee);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/fees/list
router.get('/list', auth, async (req, res) => {
  try {
    const companyId = req.query.companyId || req.companyId;
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
    fee.paidAmount += payAmt;
    fee.pendingAmount = Math.max(0, fee.totalFee - fee.paidAmount);

    if (typeof installmentIndex === 'number' && fee.installments[installmentIndex]) {
      fee.installments[installmentIndex].status = 'paid';
      fee.installments[installmentIndex].paidDate = new Date();
    } else {
      // mark first pending
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
