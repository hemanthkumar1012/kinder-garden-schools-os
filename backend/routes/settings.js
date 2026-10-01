const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Company = require('../models/Company');
const auth = require('../middleware/auth');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/settings');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(
      null,
      Date.now() +
        '-' +
        Math.round(Math.random() * 1e6) +
        path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('School logo must be an image'));
  },
});

// GET /api/settings
router.get('/', auth, async (req, res) => {
  try {
    const company = await Company.findById(req.companyId).select('-passwordHash');
    if (!company) return res.status(404).json({ error: 'School not found' });
    res.json({
      name: company.name,
      subdomain: company.subdomain,
      ownerEmail: company.ownerEmail,
      schoolType: company.schoolType,
      location: company.location,
      upiId: company.upiId,
      language: company.language,
      whatsappToken: company.whatsappToken,
      razorpayKey: company.razorpayKey,
      logoUrl: company.logoUrl,
      galleryEnabled: company.galleryEnabled,
      feedbackApprovalRequired: company.feedbackApprovalRequired,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/settings/update
router.post('/update', auth, (req, res, next) => {
  upload.single('schoolLogo')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    next();
  });
}, async (req, res) => {
  try {
    const allowedLanguages = ['Marathi', 'Hindi', 'English'];
    const allowedSchoolTypes = ['kinder-garden', 'play-school', 'pre-school'];

    const updates = {
      name: req.body.name || '',
      ownerEmail: req.body.ownerEmail || '',
      schoolType: allowedSchoolTypes.includes(req.body.schoolType)
        ? req.body.schoolType
        : 'kinder-garden',
      location: req.body.location || '',
      upiId: req.body.upiId || '',
      language: allowedLanguages.includes(req.body.language)
        ? req.body.language
        : 'Marathi',
      whatsappToken: req.body.whatsappToken || '',
      razorpayKey: req.body.razorpayKey || '',
      galleryEnabled: req.body.galleryEnabled === 'true' || req.body.galleryEnabled === true,
      feedbackApprovalRequired:
        req.body.feedbackApprovalRequired === 'true' ||
        req.body.feedbackApprovalRequired === true,
    };

    if (req.file) {
      updates.logoUrl = '/uploads/settings/' + req.file.filename;
    }

    const company = await Company.findByIdAndUpdate(
      req.companyId,
      updates,
      { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!company) return res.status(404).json({ error: 'School not found' });

    res.json({
      message: 'Settings saved',
      company,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
