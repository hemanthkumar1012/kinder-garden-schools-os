const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Gallery = require('../models/Gallery');
const Company = require('../models/Company');
const auth = require('../middleware/auth');
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/gallery');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1e6) + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 20,
  },
});

// POST /api/gallery/create
router.post('/create', auth, (req, res, next) => {
  upload.array('images', 20)(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    next();
  });
}, async (req, res) => {
  try {
    const { title, category, description, eventDate, isPublic } = req.body;
    if (!title) return res.status(400).json({ error: 'Title required' });

    const images = (req.files || []).map(f => `/uploads/gallery/${f.filename}`);
    const gallery = await Gallery.create({
      companyId: req.companyId,
      title,
      category: category || 'event',
      images,
      description: description || '',
      eventDate: eventDate || null,
      isPublic: isPublic === 'true' || isPublic === true,
    });
    res.status(201).json(gallery);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/gallery/list
router.get('/list', auth, async (req, res) => {
  try {
    const companyId = req.companyId;
    const filter = { companyId };
    if (req.query.category) filter.category = req.query.category;
    const list = await Gallery.find(filter).sort({ eventDate: -1, createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/gallery/public
router.get('/public', async (req, res) => {
  try {
    const { subdomain, category } = req.query;
    if (!subdomain) return res.status(400).json({ error: 'subdomain required' });
    const company = await Company.findOne({ subdomain: subdomain.toLowerCase() });
    if (!company) return res.status(404).json({ error: 'School not found' });
    if (company.galleryEnabled === false) return res.json([]);

    const filter = { companyId: company._id, isPublic: true };
    if (category) filter.category = category;
    const list = await Gallery.find(filter).sort({ eventDate: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/gallery/delete
router.post('/delete', auth, async (req, res) => {
  try {
    const { galleryId } = req.body;
    const gallery = await Gallery.findOneAndDelete({ _id: galleryId, companyId: req.companyId });
    if (!gallery) return res.status(404).json({ error: 'Not found' });
    // optionally delete files
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
