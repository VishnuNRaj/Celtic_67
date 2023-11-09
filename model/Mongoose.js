const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

const { userSchema } = require('./userSchema')
const { productSchema } = require('./productSchema')
const { categorySchema } = require('./categorySchema')
const { adminSchema } = require('./adminSchema')
const { cartSchema } = require('./cartSchema')
const { wishlistScehma } = require('./wishlistSchema')
const { couponSchema } = require('./couponSchema')
const { orderSchema } = require('./orderSchema')
const { notificationSchema } = require('./messageSchema')
const { bannerSchema } = require('./bannerSchema')
const getDate = require('./date')



const User = mongoose.model('users', userSchema);
const Admin = mongoose.model('admins', adminSchema);
const Products = mongoose.model('products', productSchema);
const Category = mongoose.model('categorys', categorySchema)
const Wishlist = mongoose.model('wishlists', wishlistScehma)
const Cart = mongoose.model('carts', cartSchema)
const Coupon = mongoose.model('coupons', couponSchema)
const Order = mongoose.model('orders', orderSchema)
const Message = mongoose.model('messages', notificationSchema)
const Banner = mongoose.model('banners', bannerSchema)

module.exports = { User, Admin, Products, Category, Cart, Wishlist, Coupon, Order, Message, Banner, getDate };
