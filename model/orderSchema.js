const mongoose = require('mongoose')
const getDate = require('./date')
const orderSchema = new mongoose.Schema({
    userId: String,
    items: [
      {
        productId: String,
        quantity: Number,
        price: Number
      },
    ],
    total: Number,
    coupons: {
      type: String,
      default: null,
    },
    paymentId: {
      type: String,
      default: 'Waiting for Payment'
    },
    status: {
      type: String,
      default: 'Pending'
    },
    orderDate: {
      type: String,
      default: getDate(0, false),
    },
    successDate: {
      type: String,
      default: 'Pending'
    },
    cancelDate: {
      type: String,
      default: 'Pending'
    },
    reason: String,
})

module.exports = {orderSchema}