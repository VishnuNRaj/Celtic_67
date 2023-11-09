let mongoose = require('mongoose')
const { User, Products, Category, Wishlist, Cart, Coupon, Order, Message } = require('../model/Mongoose')
let { sentOtp } = require('../model/Mailer')
const PDFDocument = require('pdfkit-table')

let genresearch = async (req, res, next) => {
    let genreData = await Category.findById(req.body.id)
    if (genreData.visible === true) {
        req.session.genreSearch = genreData._id
        res.status(200).json({ status: true })
    } else {
        res.status(452).json({ status: true })
    }
}

const details = async (req, res, next) => {
    try {
        let id = req.query.id
        if (id) {
            let gameDetails = await findUsingId(Products, id)
            if (gameDetails) {
                if (req.session.user) {
                    let userData = await findUsingEmail(User, req.session.user)
                    if (userData) {
                        let wishDetails = await Wishlist.findOne({
                            userId: userData._id,
                            'productDetails.productId': id
                        });
                        let cartDetails = await Cart.findOne({
                            userId: userData._id,
                            'cartProducts.productId': id
                        })
                        let cart = (cartDetails) ? true : false
                        let already = (wishDetails) ? true : false
                        let userId = (userData) ? userData._id : ""
                        let Name = (userData) ? userData.name : ""
                        res.render('User/productDetails', { Name, games: gameDetails, userId, already, cart })
                    } else {
                        res.redirect('/games')
                    }
                } else {
                    res.render('User/productDetails', { Name: "", games: gameDetails, userId: "", already: false, cart: false })
                }
            } else {
                res.redirect('/games')
            }
        } else {
            res.redirect('/games')
        }
    } catch (e) {
        console.error(e);
        res.redirect('/games')
    }
}


async function findUsingId(db, id) {
    try {
        let userData = await db.findById(id)
        return userData
    } catch (e) {
        console.error(e);
        res.redirect('/login')
    }
}

async function findUsingEmail(db, email) {
    try {
        let userData = await db.findOne({ email: email })
        return userData
    } catch (e) {
        console.error(e);
        res.redirect('/login')
    }
}


let couponVerification = async (req, res, next) => {
    try {
        let couponData = await Coupon.findOne({ name: req.body.coupon })
        if (couponData) {
            let userCoupons = await User.findById(req.body.id)
            let userData = userCoupons.coupons.find((coupon) => {
                if (coupon === couponData._id + "") {
                    return true
                } else {
                    return false
                }
            })
            if (userData) {
                if (couponData.validFrom < req.body.price) {
                    req.session.coupon = couponData
                    res.status(200).json({ status: true })
                } else {
                    res.status(203).json({ status: true })
                }
            } else {
                res.status(202).json({ status: true })
            }
        } else {
            res.status(201).json({ status: true })
        }
    } catch (e) {
        console.error(e);
        res.status(404).json({ status: true })
    }
}


const orderDetails = async (req, res, next) => {
    let { id } = req.query
    try {
        if (mongoose.isObjectIdOrHexString(id)) {
            let userData = await User.findOne({ email: req.session.user })
            let order = await Order.findById(id)
            const canceltrue = await Message.findOne({ id: id, message: 'Cancel order' })
            for (const item of order.items) {
                item.data = await Products.findById(item.productId)
            }
            let coupon = await Coupon.findById(order.coupons)
            console.log(order);
            res.render('User/orderDetails', { Name: userData.name, user: userData, order, coupons: (order.coupons != null) ? coupon : null, canceltrue })
        }
    } catch (e) {
        console.error(e)
        res.redirect('/orders')
    }
}

const createPdf = async (req, res, next) => {
    try {
        const { id } = req.query;
        let orderDetails = await Order.findById(id);
        const userData = await User.findById(orderDetails.userId);
        console.log(req.body, userData, orderDetails);
        for (const item of orderDetails.items) {
            item.data = await Products.findById(item.productId);
        }
        const coupon = (orderDetails.coupons != null) ? await Coupon.findById(orderDetails.coupons) : null
        const dc = (coupon != null) ? Math.floor((orderDetails.total / (1 - (coupon.deduction / 100)))) : null

        const doc = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="purchase.pdf"');
        doc.pipe(res);

        doc.fontSize(20).text('Purchase Details', { align: 'center' });
        doc.moveDown();

        doc.fontSize(14).text('User Details', { align: 'center' });
        doc.moveDown();

        doc.fontSize(10).text('Buyer Name: ' + userData.name);
        doc.fontSize(10).text('Email : ' + userData.email)
        doc.moveDown();


        doc.fontSize(10).text('Seller Details: EndGame Gaming');
        doc.moveDown();

        doc.fontSize(14).text('Order Details', { align: 'center' });
        doc.moveDown();

        doc.fontSize(10).text('Order Id: ' + orderDetails._id.toString());
        doc.moveDown();

        const table = {
            headers: ['Name', 'Developed by', 'Quantity', 'Price', 'Total'],
            rows: orderDetails.items.map((item) => [
                item.data.name,
                item.data.description.production,
                item.quantity.toString(),
                item.data.price.toString(),
                item.price.toString(),
            ]),
        };
        doc.moveDown();
        doc.table(table, {
            width: 600,
            height: 400,
            headerLines: true,
            align: 'center',
            valign: 'middle',
        });
        doc.moveDown();
        doc.fontSize(10).text('Order Date & Time : ' + orderDetails.orderDate.toString() )
        doc.fontSize(10).text('Confirm Date & Time : ' + orderDetails.successDate.toString())

        doc.moveDown();

        doc.fontSize(14).text('Payment Details', { align: 'center' });
        doc.moveDown();

        doc.fontSize(10).text('Payment Reference : ' + orderDetails.paymentId.toString())
        doc.fontSize(10).text('Coupons : ' + ((orderDetails.coupons != null) ? coupon.name : 'None'))
        if (coupon != null) {
            doc.text('Total Price : ' + dc + ' /-')
            doc.text('Discount : ' + coupon.deduction + ' %')
        }
        doc.moveDown();

        doc.fontSize(10).text('Grand Total : ' + orderDetails.total + ' /-')
        doc.moveDown();

        doc.fontSize(12).text('...Thank you for purchasing...', { align: 'center' })
        doc.moveDown();

        doc.end();
    } catch (e) {
        console.error(e)
        res.redirect('/orders')
    }
};




module.exports = { genresearch, details, couponVerification, orderDetails, createPdf }