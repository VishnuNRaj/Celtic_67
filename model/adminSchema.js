const mongoose = require('mongoose')

const adminSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    isAdmin: {
      type: Boolean,
      default: true
    },
  })

  module.exports = {adminSchema}