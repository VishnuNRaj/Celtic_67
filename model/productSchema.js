const mongoose = require('mongoose')
const productSchema = new mongoose.Schema({
    name: String,
    genre: String,
    description: {
      version: String,
      production: String,
      release: String,
      minimumRequirements: {
        ram: String,
        storage: String,
        processor: String,
        gpu: String,
      },
      restriction: String,
    },
    withoutDiscount: Number,
    about: String,
    price: Number,
    image: {
      type: Array,
      default: null
    },
    poster: String,
    downloads: {
      type: Number,
      default: 0
    },
    visible: {
      type: Boolean,
      default: true
    },
    discount: {
      type: Number,
      default: 0
    },
  })

  module.exports = {productSchema}