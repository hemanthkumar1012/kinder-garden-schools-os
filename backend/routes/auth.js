const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Company = require('../models/Company');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'kinder-garden-secret-key-2026';

function companySummary(company) {
  return {
    id: company._id,
    name: company.name,
    subdomain: company.subdomain,
    ownerEmail: company.ownerEmail,
    schoolType: company.schoolType,
    location: company.location,
    upiId: company.upiId,
    language: company.language,
    logoUrl: company.logoUrl,
    galleryEnabled: company.galleryEnabled,
    feedbackApprovalRequired: company.feedbackApprovalRequired,
  };
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, subdomain, ownerEmail, password, schoolType, location } = req.body;
    if (!name || !subdomain || !ownerEmail || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const existing = await Company.findOne({ $or: [{ subdomain: subdomain.toLowerCase() }, { ownerEmail }] });
    if (existing) {
      return res.status(400).json({ error: 'Subdomain or email already exists' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const company = await Company.create({
      name,
      subdomain: subdomain.toLowerCase(),
      ownerEmail,
      passwordHash,
      schoolType: schoolType || 'kinder-garden',
      location: location || '',
    });
    const token = jwt.sign({ id: company._id, subdomain: company.subdomain }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({
      token,
      company: companySummary(company),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { subdomain, email, password } = req.body;
    if (!subdomain || !email || !password) {
      return res.status(400).json({ error: 'Missing subdomain, email or password' });
    }
    const company = await Company.findOne({ subdomain: subdomain.toLowerCase(), ownerEmail: email });
    if (!company) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const match = await bcrypt.compare(password, company.passwordHash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: company._id, subdomain: company.subdomain }, JWT_SECRET, { expiresIn: '7d' });
    res.json({
      token,
      company: companySummary(company),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/me
router.get('/me', async (req, res) => {
  try {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ error: 'No token' });
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const company = await Company.findById(decoded.id).select('-passwordHash');
    if (!company) return res.status(401).json({ error: 'Invalid' });
    res.json({ company });
  } catch (err) {
    res.status(401).json({ error: 'Unauthorized' });
  }
});

module.exports = router;
