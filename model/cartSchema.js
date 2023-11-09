const mongoose = require('mongoose')

const cartSchema = new mongoose.Schema({
    userId: String,
    cartProducts: [
      {
        productId: String,
        quantity: {
          type: Number,
          default: 1,
        },
        price: Number,
        dateAdded: {
          type: Date,
          default: Date.now(),
        },
      },
    ],
    total: Number
  
  
  });

  module.exports = {cartSchema}