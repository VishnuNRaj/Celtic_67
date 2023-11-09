const { User, Admin, Coupon, Category, Order, Message, Products, getDate, Banner } = require('../model/Mongoose')
const { log, error } = require('console')
const { refundOrder } = require('../model/payment')
const { isObjectIdOrHexString, Aggregate } = require('mongoose')

async function messageFetch() {
    try {
        const messages = await Message.find({ status: false }).sort({ _id: -1 });
        return messages;
    } catch (error) {
        console.error(error);
        throw error;
    }
}


const couponsPage = async (req, res, next) => {
    try {
        const adminData = await Admin.findOne({ email: req.session.admin })
        const categorys = await Category.find({})
        const coupons = await Coupon.find({})
        const messages = await messageFetch()
        res.render('Admin/coupons', { Name: adminData.name, Email: adminData.email, categorys, coupons, messages })

    } catch (e) {
        console.error(e);
        res.redirect('/admin')
    }
}

const newCoupon = async (req, res, next) => {
    try {
        let data = req.body
        data.name = data.name.toUpperCase()
        let couponData = await Coupon.findOne({ name: data.name })
        if (couponData) {
            res.redirect('/admin/coupons')
        } else {
            data.description = data.description.trim()
            await Coupon.insertMany([data])
            let coupon = await Coupon.findOne({ name: data.name })
            await User.updateMany({ status: true }, { $push: { coupons: coupon._id } })
            res.redirect('/admin/coupons')
        }
    } catch (e) {
        console.error(e);
        res.redirect('/admin')
    }
}

let deleteCoupon = async (req, res, next) => {
    let { id } = req.body
    await Coupon.findByIdAndDelete(id)
    let data = await User.findOne({ coupons: { $exists: true } })
    for (const coupon of data.coupons) {
        if (coupon.couponId === id) {
            data.coupons.splice(coupon)
        }
    }
    data.save()
    res.status(200).json({ status: true })
}

let updateCoupon = async (req, res, next) => {
    let data = req.body
    let couponData = await Coupon.findById(data.id)
    if (data.name != couponData.name) {
        couponData.name = toUpperCase(data.name)
        await couponData.save()
    } if (couponData.validity != data.validity) {
        couponData.validity = data.validity
        await couponData.save()
    } if (couponData.madeFor != data.madeFor) {
        couponData.madeFor = data.madeFor
        await couponData.save()
    } if (couponData.deduction != data.deduction) {
        couponData.deduction = data.deduction
        await couponData.save()
    } if (couponData.validFrom != data.validFrom) {
        couponData.validFrom = data.validFrom
        await couponData.save()
    }
    res.redirect('/admin/coupons')
}


let orderManagement = async (req, res, next) => {
    try {
        let orders = await Order.find({ status: 'Pending' }).sort({ _id: -1 })
        const messages = await messageFetch()
        let adminData = await Admin.findOne({ email: req.session.admin })
        res.render('Admin/orderManagement', { Name: adminData.name, Email: adminData.email, orders, messages })
    } catch (e) {
        error(e)
        res.redirect('/admin')
    }
}


let manageOrder = async (req, res, next) => {
    try {
        let { id, need, reason } = req.body
        log(req.body)
        let orderData = await Order.findById(id)
        if (need === 'cancel') {
            orderData.status = 'Cancelled'
            orderData.cancelDate = new Date()
            orderData.successDate = null
            orderData.reason = reason
            await User.findByIdAndUpdate(orderData.userId, { $inc: { wallet: orderData.total } })
            await orderData.save()
            res.status(200).json({ status: true })
        } else if (need === 'success') {
            orderData.status = 'Confirmed'
            orderData.cancelDate = null
            orderData.successDate = new Date()
            orderData.reason = 'Confirmed Order'
            for (const item of orderData.items) {
                await Products.findByIdAndUpdate(item.productId, { $inc: { downloads: item.quantity } })
            }
            await orderData.save()
            orderData.items.forEach(async (item) => {
                await Products.findByIdAndUpdate(item.productId, { $inc: { downloads: item.quantity } })
            })
            await User.findByIdAndUpdate(orderData.userId, { $inc: { purchase: orderData.items.length } })
            res.status(201).json({ status: true })
        } else {
            res.status(404).json({ status: true })
        }
    } catch (e) {
        error(e)
        res.status(404).json({ status: true })
    }
}


const orderDetails = async (req, res, next) => {
    try {
        const { id } = req.query
        const adminData = await Admin.findOne({ email: req.session.admin })
        if (isObjectIdOrHexString(id)) {
            const messages = await messageFetch()
            await Message.findOneAndUpdate({ id: id }, { $set: { status: false } })
            const canceltrue = await Message.findOneAndUpdate({ id: id, message: 'Cancel order' }, { $set: { status: false } })
            const order = await Order.findById(id)
            for (const item of order.items) {
                item.data = await Products.findById(item.productId)
            }
            const user = await User.findById(order.userId)
            let coupon = await Coupon.findById(order.coupons)
            res.render('admin/orderDetails', { Name: adminData.name, user, email: adminData.email, order, messages, canceltrue: (canceltrue) ? canceltrue : null, coupons: (coupon) ? coupon : null })
        } else {
            res.redirect('/admin/orders')
        }
    } catch (e) {
        error(e)
        res.status(404).json({ status: true })
    }

}

const markAsread = async (req, res, next) => {
    const { id } = req.body
    await Message.findByIdAndDelete(id)
    res.status(200).json({ status: true })

}

const salesData = async () => {
    try {
        const current = getDate(0, false)
        let orders = await Order.find({ status: 'Confirmed' })
        const filteredOrders = orders.filter(order => {
            const orderDate = order.orderDate;
            return orderDate == current;
        });
        let Daily = {}
        Daily.orders = filteredOrders
        Daily.startDate = current
        Daily.mostDownloaded = await Products.find({}).sort({ downloads: -1 }).limit(1)
        Daily.count = filteredOrders.length
        Daily.average = Daily.count / orders.length * 100
        Daily.users = (await User.find()).length
        Daily.total = 0
        Daily.products = 0
        filteredOrders.forEach(order => {
            Daily.total += order.total
            Daily.products += order.items.reduce((accumulator, item) => {
                return accumulator + item.quantity;
            }, 0);
        });
        Daily.totalproducts = (await Products.find()).length
        return Daily
    } catch (e) {
        return e
    }
}


async function monthly() {
    try {
        const currentDate = getDate(0, false)
        const lastMonth = getDate(-30, false)
        log(lastMonth, currentDate)
        const orders = await Order.find({
            status: 'Confirmed',
            paymentId: { $ne: 'Waiting for Payment' },
            orderDate: {
                $gte: lastMonth,
                $lt: currentDate,
            },
        });
        const userData = await User.find();
        let month = {};
        month.orders = orders
        month.startDate = lastMonth
        month.endDate = currentDate
        month.mostDownloaded = await Products.find({}).sort({ downloads: -1 }).limit(1)
        month.count = orders.length;
        month.average = (orders.length / userData.length) * 100;
        month.total = 0;
        month.products = 0;

        orders.forEach((order) => {
            month.total += order.total;
            month.products += order.items.reduce((accumulator, item) => {
                return accumulator + item.quantity;
            }, 0);
        });
        month.users = userData.length
        month.totalproducts = (await Products.find()).length
        return month;

    } catch (e) {
        return e;
    }
}


async function weekly() {
    try {
        const currentDate = getDate(0, false)
        const lastMonth = getDate(-7, false)
        log(lastMonth, currentDate)
        const orders = await Order.find({
            status: 'Confirmed',
            paymentId: { $ne: 'Waiting for Payment' },
            orderDate: {
                $gte: lastMonth,
                $lt: currentDate,
            },
        });
        const userData = await User.find();
        let month = {};
        month.orders = orders
        month.startDate = lastMonth
        month.endDate = currentDate
        month.mostDownloaded = await Products.find({}).sort({ downloads: -1 }).limit(1)
        month.count = orders.length;
        month.average = (orders.length / userData.length) * 100;
        month.total = 0;
        month.products = 0;

        orders.forEach((order) => {
            month.total += order.total;
            month.products += order.items.reduce((accumulator, item) => {
                return accumulator + item.quantity;
            }, 0);
        });
        month.users = userData.length
        month.totalproducts = (await Products.find()).length
        return month;

    } catch (e) {
        return e;
    }
}


async function Yearly() {
    try {
        const currentDate = getDate(0, false)
        const lastMonth = getDate(-365, false)
        log(lastMonth, currentDate)
        const orders = await Order.find({
            status: 'Confirmed',
            paymentId: { $ne: 'Waiting for Payment' },
            orderDate: {
                $gte: lastMonth,
                $lt: currentDate,
            },
        });
        const userData = await User.find();
        let month = {};
        month.orders = orders
        month.startDate = lastMonth
        month.endDate = currentDate
        month.mostDownloaded = await Products.find({}).sort({ downloads: -1 }).limit(1)
        month.count = orders.length;
        month.average = (orders.length / userData.length) * 100;
        month.total = 0;
        month.products = 0;

        orders.forEach((order) => {
            month.total += order.total;
            month.products += order.items.reduce((accumulator, item) => {
                return accumulator + item.quantity;
            }, 0);
        });
        month.users = userData.length
        month.totalproducts = (await Products.find()).length
        return month;

    } catch (e) {
        return e;
    }
}

const banners = async (req, res, next) => {
    const adminData = await Admin.findOne({ email: req.session.admin })
    const messages = await messageFetch()
    const banners = await Banner.find()
    res.render('Admin/banners', { Name: adminData.name, Email: adminData.email, banners, messages })
}

const addBanner = async (req,res,next) => {
    let data = {
        offerString1:req.body.offerString1,
        offerString2:req.body.offerString2,
        offerString3:req.body.offerString3,
        offerbanner:'/banners/'+ req.session.offerBanner,
        comingSoon:'/banners/'+ req.session.comingSoon,
        productCarousel:'/banners/'+ req.session.productCarousel,
        page:req.body.page
    }
    await Banner.insertMany([data])
    res.redirect('/admin/banners')
}


module.exports = { couponsPage, newCoupon, deleteCoupon, updateCoupon, orderManagement, manageOrder, orderDetails, markAsread, salesData, monthly, Yearly, weekly , banners, addBanner}