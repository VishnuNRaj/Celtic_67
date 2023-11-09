const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

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
  downloads: {
    type: Number,
    default: 0
  },
  image: String,
  coupons: {
    type: [String],
    default: []
  },
  wallet:{
    type:Number,
    default:0
  },
});

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
  gameType: String,
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

const adminSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  isAdmin: {
    type: Boolean,
    default: true
  },
})


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


const wishlistScehma = new mongoose.Schema({
  userId: String,
  productDetails: [
    {
      productId: String,
    },
  ],
})

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
    default: getDate(0, false)
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
  refundId: {
    type: String,
    default: null
  }
})

function getDate(date, fullDay) {
  let currentDate = (!fullDay) ? new Date() : new Date(fullDay);
  currentDate.setDate(currentDate.getDate() + date);
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, '0');
  const day = String(currentDate.getDate()).padStart(2, '0');
  return `${ year }-${ month }-${ day }`;
}

let notificationSchema = new mongoose.Schema({
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


const User = mongoose.model('users', userSchema);
const Admin = mongoose.model('admins', adminSchema);
const Products = mongoose.model('products', productSchema);
const Category = mongoose.model('categorys', categorySchema)
const Wishlist = mongoose.model('wishlists', wishlistScehma)
const Cart = mongoose.model('carts', cartSchema)
const Coupon = mongoose.model('coupons', couponSchema)
const Order = mongoose.model('orders', orderSchema)
const Message = mongoose.model('messages', notificationSchema)

module.exports = { User, Admin, Products, Category, Cart, Wishlist, Coupon, Order, Message , getDate };
