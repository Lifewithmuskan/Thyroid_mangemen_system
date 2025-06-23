const mongoose = require("mongoose")

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model("Admin", adminSchema)
