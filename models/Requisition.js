const mongoose = require('mongoose');

const requisitionFormSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
  },
  tests: {
    type: [String],
    default: [],
  },
  ctDetails: {
    type: String,
    default: '',
  },
  fnacDetails: {
    type: String,
    default: '',
  },
  sampleCollector: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('RequisitionForm', requisitionFormSchema);
