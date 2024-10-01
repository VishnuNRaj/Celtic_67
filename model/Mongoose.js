const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MONGO || "").then(()=>{ 
  console.log('Connected to MongoDB');
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



const User = mongoose.model('users', userSchema, 'users');
const Admin = mongoose.model('ams', adminSchema, 'ams');
const Products = mongoose.model('products', productSchema, 'products');
const Category = mongoose.model('categorys', categorySchema, 'categorys');
const Wishlist = mongoose.model('wishlists', wishlistScehma, 'wishlists');
const Cart = mongoose.model('carts', cartSchema, 'carts');
const Coupon = mongoose.model('coupons', couponSchema, 'coupons');
const Order = mongoose.model('orders', orderSchema, 'orders');
const Message = mongoose.model('messages', notificationSchema, 'messages');
const Banner = mongoose.model('banners', bannerSchema, 'banners');
// async function getData() {
//   const users = await Admin.find()
//   console.log(users)
// } 
// getData()
module.exports = { User, Admin, Products, Category, Cart, Wishlist, Coupon, Order, Message, Banner, getDate };
