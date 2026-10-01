const mongoose = require('mongoose');

const webinarRegistrationSchema = new mongoose.Schema({
  webinarId: { type: mongoose.Schema.Types.ObjectId, ref: 'Webinar', required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  parentName: { type: String, required: true },
  parentPhone: { type: String, required: true },
  childName: { type: String, default: '' },
  childAge: { type: Number },
  email: { type: String, default: '' },
  status: { type: String, enum: ['registered'], default: 'registered' },
}, { timestamps: true });

module.exports = mongoose.model('WebinarRegistration', webinarRegistrationSchema);
