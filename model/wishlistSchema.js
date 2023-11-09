const mongoose = require('mongoose')

const wishlistScehma = new mongoose.Schema({
    userId: String,
    productDetails: [
      {
        productId: String,
      },
    ],
  })

module.exports = {wishlistScehma}