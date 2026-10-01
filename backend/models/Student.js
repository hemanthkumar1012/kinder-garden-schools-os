const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  admissionNo: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  dob: { type: Date },
  age: { type: Number },
  gender: { type: String, enum: ['M', 'F', 'O'], default: 'M' },
  parentName: { type: String, required: true },
  parentPhone: { type: String, required: true },
  parentEmail: { type: String, default: '' },
  address: { type: String, default: '' },
  photoUrl: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'admitted', 'rejected', 'waitlist'], default: 'pending' },
  admissionDate: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
