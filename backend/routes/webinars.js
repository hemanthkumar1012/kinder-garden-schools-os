const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Webinar = require('../models/Webinar');
const WebinarRegistration = require('../models/WebinarRegistration');
const Company = require('../models/Company');
const auth = require('../middleware/auth');
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/webinars');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-'));
  },
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// POST /api/webinars/create
router.post('/create', auth, (req, res, next) => {
  upload.single('thumbnail')(req, res, (err) => { next(); }); // ignore multer errors for JSON
}, async (req, res) => {
  try {
    const {
      title, topic, description, speakerName, speakerBio,
      eventDate, slot, durationMins, meetingLink, maxParticipants,
    } = req.body;
    if (!title || !eventDate) return res.status(400).json({ error: 'Title and eventDate required' });

    let thumbnailUrl = '';
    if (req.file) thumbnailUrl = `/uploads/webinars/${req.file.filename}`;

    const webinar = await Webinar.create({
      companyId: req.companyId,
      title,
      topic: topic || 'parenting',
      description: description || '',
      speakerName: speakerName || '',
      speakerBio: speakerBio || '',
      eventDate,
      slot: slot || '10:00-11:00',
      durationMins: durationMins ? Number(durationMins) : 60,
      meetingLink: meetingLink || '',
      maxParticipants: maxParticipants ? Number(maxParticipants) : 100,
      thumbnailUrl,
    });
    res.status(201).json(webinar);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/webinars/list
router.get('/list', auth, async (req, res) => {
  try {
    const companyId = req.query.companyId || req.companyId;
    const filter = { companyId };
    if (req.query.status) filter.status = req.query.status;
    const list = await Webinar.find(filter).sort({ eventDate: 1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/webinars/public
router.get('/public', async (req, res) => {
  try {
    const { subdomain } = req.query;
    if (!subdomain) return res.status(400).json({ error: 'subdomain required' });
    const company = await Company.findOne({ subdomain: subdomain.toLowerCase() });
    if (!company) return res.status(404).json({ error: 'School not found' });
    const list = await Webinar.find({
      companyId: company._id,
      status: { $ne: 'cancelled' },
    }).sort({ eventDate: 1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/webinars/register
router.post('/register', async (req, res) => {
  try {
    const { webinarId, companyId, parentName, parentPhone, childName, childAge, email } = req.body;
    if (!webinarId || !parentName || !parentPhone) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const webinar = await Webinar.findById(webinarId);
    if (!webinar) return res.status(404).json({ error: 'Webinar not found' });
    if (webinar.registeredCount >= webinar.maxParticipants) {
      return res.status(400).json({ error: 'Webinar is full' });
    }

    const reg = await WebinarRegistration.create({
      webinarId,
      companyId: companyId || webinar.companyId,
      parentName,
      parentPhone,
      childName: childName || '',
      childAge: childAge ? Number(childAge) : null,
      email: email || '',
    });

    await Webinar.findByIdAndUpdate(webinarId, { $inc: { registeredCount: 1 } });

    console.log(`[WhatsApp Marathi] Webinar registered: ${parentName} for ${webinar.title}, Link: ${webinar.meetingLink}`);
    res.status(201).json({ registration: reg, meetingLink: webinar.meetingLink });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/webinars/registrations
router.get('/registrations', auth, async (req, res) => {
  try {
    const { webinarId } = req.query;
    if (!webinarId) return res.status(400).json({ error: 'webinarId required' });
    const list = await WebinarRegistration.find({ webinarId }).sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/webinars/status
router.post('/status', auth, async (req, res) => {
  try {
    const { webinarId, status } = req.body;
    if (!['upcoming', 'live', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const webinar = await Webinar.findOneAndUpdate(
      { _id: webinarId, companyId: req.companyId },
      { status },
      { new: true }
    );
    if (!webinar) return res.status(404).json({ error: 'Not found' });
    res.json(webinar);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
