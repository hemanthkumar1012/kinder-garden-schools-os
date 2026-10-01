const mongoose = require('mongoose');

// PDF: name, subdomain unique, ownerEmail, passwordHash, schoolType,
// location, upiId, language Marathi
// Settings: WhatsApp Token, Razorpay Key, School Logo, Gallery toggle, Feedback approval toggle
const companySchema = new mongoose.Schema({
  name: { type: String, required: true },
  subdomain: { type: String, required: true, unique: true, lowercase: true },
  ownerEmail: { type: String, required: true },
  passwordHash: { type: String, required: true },
  schoolType: {
    type: String,
    enum: ['kinder-garden', 'play-school', 'pre-school'],
    default: 'kinder-garden',
  },
  location: { type: String, default: '' },
  upiId: { type: String, default: '' },
  language: { type: String, enum: ['Marathi', 'Hindi', 'English'], default: 'Marathi' },
  whatsappToken: { type: String, default: '' },
  razorpayKey: { type: String, default: '' },
  logoUrl: { type: String, default: '' },
  galleryEnabled: { type: Boolean, default: true },
  feedbackApprovalRequired: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Company', companySchema);
