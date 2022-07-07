const mongoose = require('mongoose')

const fileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  downloadCount: {
    type: Number,
    required: true,
    default: 0
  },
  owner: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sharedWith: {
    type: [{ type: mongoose.Types.ObjectId, ref: 'User' }]
  }
}, { timestamps: true })

module.exports = mongoose.model('File', fileSchema)
