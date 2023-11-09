const mongoose = require('mongoose')
const notificationSchema = new mongoose.Schema({
    id: {
      type: String,
    },
    message: String,
    status: {
      type: Boolean,
      default: false
    },
    reason: String,
    redirectTo: String,
    from: {
      type: String,
      default: 'User'
    }
  })
module.exports = {notificationSchema}