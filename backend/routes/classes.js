const express = require('express');
const Class = require('../models/Class');
const Company = require('../models/Company');
const auth = require('../middleware/auth');
const router = express.Router();

// POST /api/classes/create
router.post('/create', auth, async (req, res) => {
  try {
    const { name, capacity, classTeacher, ageGroup, feesAnnual } = req.body;
    if (!name) return res.status(400).json({ error: 'Class name required' });
    const cls = await Class.create({
      companyId: req.companyId,
      name,
      capacity: capacity || 20,
      classTeacher: classTeacher || '',
      ageGroup: ageGroup || '3-4 Years',
      feesAnnual: feesAnnual || 25000,
    });
    res.status(201).json(cls);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/classes/list?companyId=
router.get('/list', auth, async (req, res) => {
  try {
    const companyId = req.query.companyId || req.companyId;
    const classes = await Class.find({ companyId }).sort({ createdAt: -1 });
    res.json(classes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/classes/public?subdomain=
router.get('/public', async (req, res) => {
  try {
    const { subdomain } = req.query;
    if (!subdomain) return res.status(400).json({ error: 'subdomain required' });
    const company = await Company.findOne({ subdomain: subdomain.toLowerCase() });
    if (!company) return res.status(404).json({ error: 'School not found' });
    const classes = await Class.find({ companyId: company._id });
    res.json({
      company: {
        _id: company._id,
        name: company.name,
        location: company.location,
        schoolType: company.schoolType,
        upiId: company.upiId,
        language: company.language,
        logoUrl: company.logoUrl,
        galleryEnabled: company.galleryEnabled,
        feedbackApprovalRequired: company.feedbackApprovalRequired,
      },
      classes,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
