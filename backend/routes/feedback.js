const express = require('express');
const Feedback = require('../models/Feedback');
const Company = require('../models/Company');
const auth = require('../middleware/auth');
const router = express.Router();

// POST /api/feedback/create
router.post('/create', async (req, res) => {
  try {
    const { companyId, parentName, parentPhone, childName, classId, rating, message } = req.body;
    if (!companyId || !parentName || !rating) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const company = await Company.findById(companyId);
    if (!company) return res.status(404).json({ error: 'School not found' });

    const requiresApproval = company.feedbackApprovalRequired !== false;

    const feedback = await Feedback.create({
      companyId,
      parentName,
      parentPhone: parentPhone || '',
      childName: childName || '',
      classId: classId || null,
      rating: Number(rating),
      message: message || '',
      status: requiresApproval ? 'pending' : 'approved',
      isPublic: !requiresApproval,
    });

    console.log(`[WhatsApp] Feedback thanks to ${parentName} rating ${rating}`);
    res.status(201).json(feedback);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/feedback/list
router.get('/list', auth, async (req, res) => {
  try {
    const companyId = req.query.companyId || req.companyId;
    const filter = { companyId };
    if (req.query.status) filter.status = req.query.status;
    const list = await Feedback.find(filter)
      .populate('classId', 'name')
      .sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/feedback/public
router.get('/public', async (req, res) => {
  try {
    const { subdomain } = req.query;
    if (!subdomain) return res.status(400).json({ error: 'subdomain required' });
    const company = await Company.findOne({ subdomain: subdomain.toLowerCase() });
    if (!company) return res.status(404).json({ error: 'School not found' });
    const list = await Feedback.find({
      companyId: company._id,
      status: 'approved',
      isPublic: true,
    })
      .populate('classId', 'name')
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/feedback/status
router.post('/status', auth, async (req, res) => {
  try {
    const { feedbackId, status, isPublic } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const update = { status };
    if (typeof isPublic === 'boolean') update.isPublic = isPublic;
    if (status === 'approved' && isPublic === undefined) update.isPublic = true;
    const feedback = await Feedback.findOneAndUpdate(
      { _id: feedbackId, companyId: req.companyId },
      update,
      { new: true }
    );
    if (!feedback) return res.status(404).json({ error: 'Not found' });
    res.json(feedback);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/feedback/stats
router.get('/stats', auth, async (req, res) => {
  try {
    const companyId = req.query.companyId || req.companyId;
    const total = await Feedback.countDocuments({ companyId });
    const approved = await Feedback.countDocuments({ companyId, status: 'approved' });
    const pending = await Feedback.countDocuments({ companyId, status: 'pending' });
    const avgResult = await Feedback.aggregate([
      { $match: { companyId: new (require('mongoose').Types.ObjectId)(String(companyId)), status: 'approved' } },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } },
    ]);
    const avgRating = avgResult[0] ? Math.round(avgResult[0].avgRating * 10) / 10 : 0;
    res.json({ total, approved, pending, avgRating });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
