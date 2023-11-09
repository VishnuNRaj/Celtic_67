const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema({
    genre: String,
    gamesInTotal: {
      type: Number,
      default: 0
    },
    visible: {
      type: Boolean,
      default: true
    }
  })

module.exports = {categorySchema}