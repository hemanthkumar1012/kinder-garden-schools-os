const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  title: { type: String, required: true },
  category: { type: String, enum: ['classroom', 'activity', 'event', 'festival', 'annual-day', 'sports'], default: 'event' },
  images: [{ type: String }],
  videoUrl: { type: String, default: '' },
  description: { type: String, default: '' },
  eventDate: { type: Date },
  isPublic: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Gallery', gallerySchema);
