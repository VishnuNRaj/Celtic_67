const mongoose = require('mongoose')
const { Products, User, Cart, Order, Message } = require('../model/Mongoose')
const { log, error } = require('console')
const { generateOrder } = require('../model/payment')
const { findUsingId, findOneData, getData, inserter } = require('./commonFunctions')


let buyNow = async (req, res, next) => {
    try {
        let { productId, id, need } = req.body
        let productDetails = await findUsingId(Products,productId)
        req.session.coupon = null
        if (req.session.user) {
            if (need === 'one') {
                let cartDetails = await findOneData(Cart,{ userId: id, 'cartProducts.productId': productId })
                let cart = cartDetails.cartProducts.find((cart) => {
                    if (cart.productId === productId) {
                        return true
                    } else {
                        return false
                    }
                })
                req.session.amount = cart.price
                req.session.productId = cart.productId
                req.session.quantity = cart.quantity
                req.session.product = null
                req.session.need = need
                res.status(200).json({ status: true })
            } else if (need === 'single') {
                req.session.product = productDetails
                req.session.quantity = false
                req.session.productId = false
                req.session.need = need
                res.status(200).json({ status: true })
            }
        } else {
            res.status(467).json({ status: true })
        }
    } catch (e) {
        console.error(e);
        res.status(404).json({ status: true })
    }

}


let buyall = async (req, res, next) => {
    req.session.need = 'all'
    console.log(req.session.userInfo);
    let cart = await findOneData(Cart,{ userId: req.session.userInfo._id })
    cart.total = 0
    for (let i = cart.cartProducts.length - 1; i >= 0; i--) {
        const item = cart.cartProducts[i];
        let data = await findUsingId(Products,item.productId)
        if (data.visible === false) {
            cart.cartProducts.splice(i, 1);
        } else {
            cart.total+=data.price*item.quantity
        }
    }
    cart.save()
    if(cart.total > 0) {
        res.status(200).json({status:true})
    } else if (cart.total <= 0) {
        res.status(201).json({status:true})
    }
}


let orders = async (req, res, next) => {
    try {
        let userData = await findOneData(User,{ email: req.session.user })
        let order = await getData(Order,{ userId: userData._id },{ _id: -1 },0,0)
        res.render('User/orders', { Name: userData.name, userId: userData._id, orders: (order) ? order : '' })
    } catch (e) {
        error(e)
        res.redirect('/profile')
    }
}

let createOrder = async (req, res, next) => {
    try {
        const { userId, amount, productId, quantity, need, type } = req.body
        console.log(type);
        let userData = await findUsingId(User,userId)
        if (userData) {
            if (type === 'online') {
                if (productId === 'all' && quantity === 'all') {
                    let cartDetails = await findOneData(Cart,{ userId: userId })
                    let orders = {
                        userId: userId,
                        items: cartDetails.cartProducts,
                        coupons: (req.session.coupon) ? req.session.coupon._id : null,
                        total: amount,
                    }
                    let response = await inserter(Order,orders)
                    req.session.order = response[0]
                    response[0].total = response[0].total * 100
                    generateOrder(response[0]._id, response[0].total).then((order) => {
                        log(order)
                        res.status(200).json({ order: order })
                    })
                } else if (need === 'single') {
                    let productDetails = await findUsingId(Products,productId)
                    let orders = {
                        userId: userId,
                        items: [
                            {
                                productId: productId,
                                quantity: quantity,
                                price: productDetails.price * quantity,
                            }
                        ],
                        coupons: (req.session.coupon) ? req.session.coupon._id : null,
                        total: amount,
                    }
                    let response = await inserter(Order,orders) 
                    req.session.order = response[0]
                    response[0].total = response[0].total * 100
                    generateOrder(response[0]._id, response[0].total).then((order) => {
                        res.status(200).json({ order: order })
                    })
                } else {
                    res.status(468).json({ status: true })
                }
            } else if (type === 'wallet') {
                if (userData.wallet >= amount) {
                    res.status(202).json({ status: true })
                } else {
                    res.status(203).json({ status: true })
                }
            } else {
                res.status(467).json({ status: true })
            }
        } else {
            res.status(467).json({ status: true })
        }
    } catch (e) {
        error(e)
        res.status(404).json({ status: true })
    }
}

const payFromwallet = async (req, res, next) => {
    try {
        const { userId, amount, productId, quantity, need, type } = req.body
        const userData = await findUsingId(User,userId)
        if (userData.status) {
            if (productId === 'all' && quantity === 'all') {
                let cartDetails = await Cart.findOne({ userId: userId })
                let orders = {
                    userId: userId,
                    items: cartDetails.cartProducts,
                    coupons: (req.session.coupon) ? req.session.coupon._id : null,
                    total: amount,
                    paymentId: 'From Wallet'
                }
                await User.findByIdAndUpdate(userId, { $inc: { wallet: -orders.total } ,$pull:{coupons:req.session.coupon._id}})
                let response = await Order.insertMany([orders])
                req.session.order = response[0]
                await clear(req, res, next, productId, userId)
                res.status(200).json({ status: true })
            } else if (need === 'single') {
                let productDetails = await Products.findById(productId)
                let orders = {
                    userId: userId,
                    items: [
                        {
                            productId: productId,
                            quantity: quantity,
                            price: productDetails.price * quantity,
                        }
                    ],
                    coupons: (req.session.coupon) ? req.session.coupon._id : null,
                    total: amount,
                    paymentId: 'From Wallet'
                }
                await User.findByIdAndUpdate(userId, { $inc: { wallet: -orders.total },$pull:{coupons:req.session.coupon._id} })
                let response = await Order.insertMany([orders])
                req.session.order = response[0]
                await clear(req, res, next, productId, userId)
                res.status(200).json({ status: true })
            } else {
                res.status(468).json({ status: true })
            }
        } else {
            res.status(467).json({ status: true })
        }
    } catch (e) {
        error(e)
        res.status(404).json({ status: true })
    }
}

const clear = async (req, res, next, productId, userId) => {
    const message = {
        id: req.session.order._id,
        message: 'New Order Recieved',
        redirectTo: `/admin/orderDetails/?id=${req.session.order._id}`,
        reason: 'order'
    }
    await Message.insertMany([message])
    if (productId === 'all') {
        await Cart.deleteOne({ userId: userId })
    } else if (req.session.need === 'one') {
        const cartDetails = await Cart.findOne({ userId: userId });
        const data = cartDetails.cartProducts.find(cart => cart.productId === productId);
        if (data) {
            await Cart.updateOne({ userId: userId }, {
                $inc: { total: -data.price },
                $pull: { cartProducts: { productId: productId } }
            });
        }
    }
    req.session.need = false
    req.session.coupon = false
    return true
}

const paymentSuccess = async (req, res, next) => {
    try {
        let { productId, userId, response } = req.body
        let userData = await User.findById(userId)
        if (userData.status) {
            await Order.findByIdAndUpdate(req.session.order._id, { $set: { paymentId: response.razorpay_payment_id } ,$pull:{coupons:req.session.coupon._id}})
            await clear(req, res, next, productId, userId)
            res.status(200).json({ status: true })
        } else {
            res.status(467).json({ status: true })
        }
    } catch (e) {
        error(e)
        res.status(404).json({ status: true })
    }
}

let orderCancel = async (req, res, next) => {
    let { id, reason } = req.body
    const message = {
        id: id,
        message: 'Cancel order',
        reason: reason,
        redirectTo: `/admin/orderDetails/?id=${id}`
    }
    await Message.insertMany([message])
    res.status(200).json({ status: true })
}

let closedWindow = async (req, res, next) => {
    await Order.findByIdAndDelete(req.session.order._id)
    res.status(200).json({ status: true })
}

module.exports = { buyNow, buyall, orders, createOrder, payFromwallet, paymentSuccess, orderCancel, closedWindow }