const mongoose = require('mongoose');

const admissionSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  parentName: { type: String, required: true },
  parentPhone: { type: String, required: true },
  childName: { type: String, required: true },
  childAge: { type: Number },
  interestedClass: { type: String },
  message: { type: String, default: '' },
  source: { type: String, enum: ['Website', 'WhatsApp'], default: 'Website' },
  status: { type: String, enum: ['new', 'contacted', 'admitted', 'rejected'], default: 'new' },
}, { timestamps: true });

module.exports = mongoose.model('Admission', admissionSchema);
