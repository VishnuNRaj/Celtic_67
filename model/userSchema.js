const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    username: {
        type: String,
    },
    password: String,
    status: {
        type: Boolean,
        default: true
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    purchase: {
        type: Number,
        default: 0
    },
    image: String,
    coupons: {
        type: [String],
        default:[]
    },
    wallet: {
        type: Number,
        default: 0
    },
});


module.exports = {userSchema}