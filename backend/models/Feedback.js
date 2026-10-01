const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  parentName: { type: String, required: true },
  parentPhone: { type: String, default: '' },
  childName: { type: String, default: '' },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  rating: { type: Number, min: 1, max: 5, required: true },
  message: { type: String, default: '' },
  isPublic: { type: Boolean, default: false },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
