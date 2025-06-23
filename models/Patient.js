// models/patient.js
const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  registrationNo: {
    type: String,
    unique: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  age: {
    type: Number,
    required: true,
    min: 0,
    max: 150,
  },
  sex: {
    type: String,
    required: true,
    enum: ['Male', 'Female', 'Other'],
  },
  contact: {
    type: String,
    required: true,
    trim: true,
  },
  address: {
    type: String,
    required: true,
    trim: true,
  },
  numberOfVisits: {
  type: Number,
  default: 1,
},

  appointmentDate: {
    type: Date,
    required: true,
  },
  registeredDate: {
    type: Date,
    default: Date.now,
  },
  aadharNo: {
    type: String,
    required: true,
  },
  numberOfVisits: {
    type: Number,
    default: 0,
  }
});

// Pre-save hook
patientSchema.pre('save', async function (next) {
  // Auto-generate registration number if not present
  if (!this.registrationNo) {
    const now = new Date();
    const datePart = `${String(now.getDate()).padStart(2, '0')}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getFullYear()).slice(-2)}`;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const count = await mongoose.model('Patient').countDocuments({
      registeredDate: { $gte: todayStart, $lte: todayEnd }
    });

    const serial = String(count + 1).padStart(2, '0');
    this.registrationNo = datePart + serial;
  }

  // Increment numberOfVisits on every save
  if (!this.isNew) {
    this.numberOfVisits += 1;
  }

  next();
});

module.exports = mongoose.model('Patient', patientSchema);
