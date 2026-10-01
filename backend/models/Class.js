const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  name: { type: String, enum: ['Playgroup', 'Nursery', 'Jr KG', 'Sr KG', 'Day Care'], required: true },
  capacity: { type: Number, required: true, default: 20 },
  studentsCount: { type: Number, default: 0 },
  classTeacher: { type: String, default: '' },
  ageGroup: { type: String, default: '3-4 Years' },
  feesAnnual: { type: Number, default: 25000 },
}, { timestamps: true });

module.exports = mongoose.model('Class', classSchema);
