const mongoose = require('mongoose')

const couponSchema = new mongoose.Schema({
    name: String,
    initialDate: {
      type: String,
      default: new Date()
    },
    validity: {
      type: String,
    },
    deduction: Number,
    description: String,
    validFrom: Number,
    madeFor: String,
  })

module.exports = {couponSchema}