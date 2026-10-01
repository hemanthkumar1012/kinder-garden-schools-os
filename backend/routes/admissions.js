const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Student = require('../models/Student');
const Admission = require('../models/Admission');
const Class = require('../models/Class');
const Company = require('../models/Company');
const auth = require('../middleware/auth');
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/students');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-'));
  },
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

function generateAdmissionNo() {
  const year = new Date().getFullYear();
  const suffix = String(Date.now()).slice(-6);
  return `ADM-${year}-${suffix}`;
}

// POST /api/admissions/create
router.post('/create', upload.single('photo'), async (req, res) => {
  try {
    const {
      companyId, classId, childName, dob, age, gender,
      parentName, parentPhone, parentEmail, address,
      interestedClass, message, source,
    } = req.body;

    if (!companyId || !childName || !parentName || !parentPhone) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    let photoUrl = '';
    if (req.file) {
      photoUrl = `/uploads/students/${req.file.filename}`;
    }

    const admissionNo = generateAdmissionNo();

    // Capacity check
    if (classId) {
      const cls = await Class.findById(classId);
      if (cls && cls.studentsCount >= cls.capacity) {
        return res.status(400).json({ error: 'Class is full' });
      }
    }

    const student = await Student.create({
      companyId,
      classId: classId || null,
      admissionNo,
      name: childName,
      dob: dob || null,
      age: age ? Number(age) : null,
      gender: gender || 'M',
      parentName,
      parentPhone,
      parentEmail: parentEmail || '',
      address: address || '',
      photoUrl,
      status: 'pending',
    });

    const admission = await Admission.create({
      companyId,
      studentId: student._id,
      classId: classId || null,
      parentName,
      parentPhone,
      childName,
      childAge: age ? Number(age) : null,
      interestedClass: interestedClass || '',
      message: message || '',
      source: source || 'Website',
      status: 'new',
    });

    if (classId) {
      await Class.findByIdAndUpdate(classId, { $inc: { studentsCount: 1 } });
    }

    // Mock WhatsApp log
    console.log(`[WhatsApp Marathi] Admission received: ${parentName}, child ${childName}, No: ${admissionNo}`);

    res.status(201).json({ student, admission, admissionNo });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admissions/list
router.get('/list', auth, async (req, res) => {
  try {
    const companyId = req.query.companyId || req.companyId;
    const filter = { companyId };
    if (req.query.status) filter.status = req.query.status;
    if (req.query.classId) filter.classId = req.query.classId;

    const students = await Student.find(filter)
      .populate('classId', 'name ageGroup feesAnnual capacity studentsCount')
      .sort({ createdAt: -1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admissions/inquiries
router.get('/inquiries', auth, async (req, res) => {
  try {
    const companyId = req.query.companyId || req.companyId;
    const inquiries = await Admission.find({
      companyId,
      status: { $in: ['new', 'contacted'] },
    }).populate('classId', 'name').sort({ createdAt: -1 });
    res.json(inquiries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admissions/stats
router.get('/stats', auth, async (req, res) => {
  try {
    const companyId = req.query.companyId || req.companyId;
    const total = await Student.countDocuments({ companyId });
    const pending = await Student.countDocuments({ companyId, status: 'pending' });
    const admitted = await Student.countDocuments({ companyId, status: 'admitted' });
    const inquiries = await Admission.countDocuments({ companyId, status: 'new' });
    res.json({ total, pending, admitted, inquiries });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admissions/status
router.post('/status', auth, async (req, res) => {
  try {
    const { studentId, status } = req.body;
    if (!['admitted', 'rejected', 'waitlist'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const student = await Student.findByIdAndUpdate(studentId, { status }, { new: true });
    if (!student) return res.status(404).json({ error: 'Student not found' });

    if (status === 'admitted') {
      await Admission.findOneAndUpdate({ studentId }, { status: 'admitted' });
    } else if (status === 'rejected') {
      await Admission.findOneAndUpdate({ studentId }, { status: 'rejected' });
      // optionally decrement class count if was counted
    }

    console.log(`[WhatsApp] Status update ${status} for ${student.admissionNo}`);
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
