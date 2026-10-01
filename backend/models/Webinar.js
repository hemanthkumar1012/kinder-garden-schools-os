const mongoose = require('mongoose');

const webinarSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  title: { type: String, required: true },
  topic: { type: String, enum: ['parenting', 'child-development', 'nutrition', 'admission-info', 'activity-demo'], default: 'parenting' },
  description: { type: String, default: '' },
  speakerName: { type: String, default: '' },
  speakerBio: { type: String, default: '' },
  eventDate: { type: Date, required: true },
  slot: { type: String, default: '10:00-11:00' },
  durationMins: { type: Number, default: 60 },
  meetingLink: { type: String, default: '' },
  maxParticipants: { type: Number, default: 100 },
  registeredCount: { type: Number, default: 0 },
  status: { type: String, enum: ['upcoming', 'live', 'completed', 'cancelled'], default: 'upcoming' },
  thumbnailUrl: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Webinar', webinarSchema);
