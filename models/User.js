const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  cryptoData: {
    type: Object
  },
  subCategory: {
    type: String,
    default: null
  }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
