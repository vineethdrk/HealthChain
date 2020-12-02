const mongoose = require('mongoose');

const DoctorSchema = new mongoose.Schema({
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

const DoctorBlock = mongoose.model('DoctorBlock', DoctorSchema);

module.exports = DoctorBlock;
