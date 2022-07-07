const mongoose = require('mongoose')
const File = require('./fileModel')

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  name: {
    first: {
      type: String,
      required: true
    },
    last: {
      type: String,
      required: true
    }
  },
  password: {
    type: String,
    required: true
  },
  files: {
    type: [mongoose.Types.ObjectId],
    ref: 'File',
    default: []
  },
  sharedFiles: {
    type: [mongoose.Types.ObjectId],
    ref: 'File',
    default: []
  },
  profileType: {
    type: String, // 'PERSONAL' or 'BUSINESS'
    required: true
  },
  status: {
    type: String,
    default: 'NEW'
  }
}, { timestamps: true })

module.exports = mongoose.model('User', userSchema)
