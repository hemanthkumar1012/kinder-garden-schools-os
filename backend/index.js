require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const cron = require('node-cron');

const authRoutes = require('./routes/auth');
const classesRoutes = require('./routes/classes');
const admissionsRoutes = require('./routes/admissions');
const galleryRoutes = require('./routes/gallery');
const feedbackRoutes = require('./routes/feedback');
const webinarsRoutes = require('./routes/webinars');
const feesRoutes = require('./routes/fees');
const whatsappRoutes = require('./routes/whatsapp');

const Webinar = require('./models/Webinar');
const WebinarRegistration = require('./models/WebinarRegistration');
const Student = require('./models/Student');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/kinder-garden-os';

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/classes', classesRoutes);
app.use('/api/admissions', admissionsRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/webinars', webinarsRoutes);
app.use('/api/fees', feesRoutes);
app.use('/api/whatsapp', whatsappRoutes);

// Cron 0 8 * * * — tomorrow webinars reminder + pending admissions > 3 days
cron.schedule('0 8 * * *', async () => {
  console.log('[CRON] Daily 8 AM jobs');
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);

    const webinars = await Webinar.find({
      status: 'upcoming',
      eventDate: { $gte: tomorrow, $lt: dayAfter },
    });
    for (const w of webinars) {
      const regs = await WebinarRegistration.find({ webinarId: w._id });
      for (const r of regs) {
        console.log(`[WhatsApp Marathi] Reminder ${r.parentPhone} | ${w.title} | ${w.meetingLink}`);
      }
    }

    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const pending = await Student.countDocuments({
      status: 'pending',
      createdAt: { $lt: threeDaysAgo },
    });
    if (pending > 0) {
      console.log(`[CRON] ${pending} admissions pending > 3 days`);
    }
  } catch (err) {
    console.error('[CRON]', err.message);
  }
});

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });
