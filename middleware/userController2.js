let mongoose = require('mongoose')
const { User, Products, Category, Wishlist, Cart, Coupon, Order, Message } = require('../model/Mongoose')
let { sentOtp } = require('../model/Mailer')
const PDFDocument = require('pdfkit-table')
const { findUsingId, findUsingEmail, getData, findOneData } = require('./commonFunctions')
const fs = require('fs')
const path = require('path')
const { error } = require('console')
const { log } = require('console')


const genresearch = async (req, res, next) => {
    if (req.body.id != 'all') {
        const genreData = await findUsingId(Category, req.body.id)
        if (genreData.visible === true) {
            req.session.genreSearch = genreData._id
            res.status(200).json({ status: true })
        } else {
            res.status(452).json({ status: true })
        }
    } else {
        req.session.genreSearch = false
        req.session.searched = false
        res.status(200).json({ status: true })
    }
}

const filter = (req, res, next) => {
    try {
        const filterMap = {
            low: { price: 1 },
            high: { price: -1 },
            A: { name: 1 },
            Z: { name: -1 },
            relevance: { price: 0 },
            popular: { downloads: -1 },
            new: { _id: -1 }
        };

        const filterType = req.body.filter;
        const filterValue = filterMap[filterType];

        if (filterValue) {
            req.session.filterType = filterType;
            req.session.filter = filterValue;
            res.status(200).json({ status: true });
        } else {
            res.status(400).json({ status: true });
        }
    } catch (e) {
        console.error(e);
        res.status(500).json({ status: false });
    }
}



const paginate = async (req, res, next) => {
    req.session.page = req.body.page
    res.status(200).json({ status: true })
}


const details = async (req, res, next) => {
    try {
        let id = req.query.id
        log(mongoose.isObjectIdOrHexString(id))
        if (mongoose.isObjectIdOrHexString(id)) {
            let gameDetails = await findUsingId(Products, id)
            if (gameDetails) {
                let userData = await findUsingEmail(User,req.session.user)
                let cart = false
                let already = false
                let userId = ''
                let Name = ''
                if (req.session.user) {
                    if (userData) {
                        let query = [{
                            userId: userData._id,
                            'productDetails.productId': id
                        },
                        {
                            userId: userData._id,
                            'cartProducts.productId': id
                        }
                        ]
                        let wishDetails = await findOneData(Wishlist, query[0]);
                        let cartDetails = await findOneData(Cart, query[1])
                        cart = (cartDetails) ? true : false
                        already = (wishDetails) ? true : false
                        userId = (userData) ? userData._id : ""
                        Name = (userData) ? userData.name : ""
                    } else {
                        return res.redirect('/games')
                    }
                }
                res.render('User/productDetails', { Name, games: gameDetails, userId, already, cart })
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





const couponVerification = async (req, res, next) => {
    try {
        const query = { name: req.body.coupon }
        let couponData = await findOneData(Coupon, query)
        if (couponData) {
            let userCoupons = await findUsingId(User, req.body.id)
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
            let userData = await findUsingEmail(User,req.session.user)
            let order = await findUsingId(Order,id)
            const canceltrue = await findOneData(Message,{ id: id, message: 'Cancel order' })
            for (const item of order.items) {
                item.data = await findUsingId(Products,item.productId)
            }
            let coupon = await findUsingId(Coupon,order.coupons)
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
        let orderDetails = await findUsingId(Order,id);
        const userData = await findUsingId(User,orderDetails.userId)
        for (const item of orderDetails.items) {
            item.data = await findUsingId(Products,item.productId);
        }
        const coupon = (orderDetails.coupons != null) ? await findUsingId(Coupon,orderDetails.coupons) : null
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
        doc.fontSize(10).text('Order Date & Time : ' + orderDetails.orderDate.toString())
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


const downloadGame = async (req,res,next) => {
    try {
        let {id} = req.query
    const filename = 'Torrent file.torrent'
    const filePath = path.join(__dirname, '/download', filename);
    if (fs.existsSync(filePath)) {
        res.setHeader('Content-disposition', 'attachment; filename=' + filename);
        res.setHeader('Content-type', 'application/octet-stream');
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
    } else {
        res.redirect('/orders')
    }
    } catch (e) {
        error(e)
        res.redierect('/orders')
    }
}



module.exports = { genresearch, details, couponVerification, orderDetails, createPdf, filter, paginate, downloadGame, }