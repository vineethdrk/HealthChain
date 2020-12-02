const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema({
  blockData: {
    type: Object
  },
  blockHash:{
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
},{ strict: false });

const PatientBlock = mongoose.model('PatientBlock', PatientSchema);

module.exports = PatientBlock;
