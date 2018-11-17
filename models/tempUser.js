const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TempUserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: [true, 'That email already exists'],
    lowercase: true
  },
  username: {
    type: String,
    required: [true, 'That username already exists'],
    unique: true,
    lowercase: true
  },
  isVerified: {
    type: Boolean,
    required: true,
    default: false
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
    expires: 604800
  }
});

module.exports = mongoose.model('TempUser', TempUserSchema);