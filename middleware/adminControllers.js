const bcrypt = require('bcryptjs')
const { User, Admin, Products, Category, Message } = require('../model/Mongoose')
const { sentOtp } = require('../model/Mailer');
const { salesData, monthly, Yearly, weekly } = require('./managements');


async function messageFetch() {
    try {
        const messages = await Message.find({ status: false }).sort({ _id: -1 });
        return messages;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

const adminHome = async (req, res, next) => {
    console.log(req.session.admin);
    console.log('vannu');
    if (req.session.admin) {
        console.log('ivedind');
        let adminData = await findUsingEmail(Admin, req.session.admin)
        if (adminData) {
            const messages = await messageFetch()
            const order = await salesData()
            const month = await monthly()
            const yearly = await Yearly()
            const Weekly = await weekly()
            delete order.orders
            delete order.mostDownloaded
            delete Weekly.orders
            delete Weekly.mostDownloaded
            delete yearly.orders
            delete yearly.mostDownloaded
            delete month.orders
            delete month.mostDownloaded
            console.log(Weekly);
            res.render('Admin/adminIndex', { Name: adminData.name, Email: adminData.email, messages, order, month, yearly, Weekly })
        } else {
            req.session.adminnotfound = true
            res.redirect('/admin/login')
        }
    } else {
        res.redirect('/admin/login')
    }
}

const adminLogin = (req, res, next) => {
    if (req.session.adminnotfound) {
        req.session.admin = false;
        req.session.adminnotfound = false;
        res.render('Admin/adminLogin', { err: "Admin not found" })
    } else if (req.session.admin) {
        res.redirect('/admin')
    } else if (req.session.otpError) {
        res.render('Admin/adminLogin', { err: "Incorrect Otp" })
    } else if (req.session.otpExpired) {
        req.session.otpExpired = false
        res.render('Admin/adminLogin', { err: "Otp Expired" })
    } else {
        res.render('Admin/adminLogin', { err: "" })
    }
}

function otpNull(req, res, next) {
    try {
        setTimeout(() => {
            console.log("Null aakeee");
            req.session.otp = null;
        }, 120000)
    } catch (e) {
        console.error(e);
        res.redirect('/admin')
    }
}


const adminVerification = async (req, res, next) => {
    let data = req.body
    console.log(await Admin.find())
    let adminData = await Admin.findOne({ email: data.email })
    console.log(adminData)
    if (adminData) {
        let passTrue = await bcrypt.compare(data.password, adminData.password)
        if (passTrue) {
            req.session.otp = sentOtp(data.email)
            otpNull(req, res, next)
            res.status(200).json({ status: true })
        } else {
            res.status(467).json({ status: false })
        }
    } else {
        res.status(465).json({ status: false })
    }
}


const otpVerify = async (req, res, next) => {
    let data = req.body
    console.log(typeof data.otp);
    if (req.session.otp != null) {
        console.log('keriee');
        if (req.session.otp === data.otp) {
            console.log('ethieee',data.email);
            req.session.admin = data.email
            console.log(req.session.admin);
            res.redirect('/admin/')
        } else {
            req.session.otpError = true
            res.redirect('/admin/login')
        }
    } else {
        req.session.otpExpired = true
        res.redirect('/admin/login')
    }
}



const userManagement = async (req, res, next) => {
    try {
        const adminData = await findUsingEmail(Admin, req.session.admin)
        const userData = await User.find({})
        const messages = await messageFetch()
        res.render('Admin/userManagement', { Name: adminData.name, Email: adminData.email, userDetails: userData, messages })
    } catch (e) {
        console.error(e);
        res.redirect('/admin')
    }
}



async function findUsingId(db, id) {
    let userData = await db.findById(id)
    return userData
}

async function findUsingEmail(db, email) {
    try {
        let userData = await db.findOne({ email: email })
        return userData
    } catch (e) {
        console.error(e);
        res.redirect('/admin/login')
    }
}

const updateUser = async (req, res, next) => {
    if (req.session.admin) {
        let { id, need } = req.query
        if (need === "Delete") {
            let data = await findUsingId(User, id)
            let adminData = await findUsingId(Admin, id)
            if (data) {
                await User.findByIdAndDelete(data._id)
            } if (adminData) {
                await Admin.findByIdAndDelete(adminData._id)
            }
            res.redirect('/admin')
        } else if (need === "Block") {
            let data = await findUsingId(User, id)
            if (data.status === true) {
                await User.findByIdAndUpdate(data._id, { $set: { status: false } }, { upsert: true })
                res.status(201).json({ status: true })
            } else {
                await User.findByIdAndUpdate(data._id, { $set: { status: true } }, { upsert: true })
                res.status(200).json({ status: true })
            }
        } else if (need === "Admin") {
            let data = await findUsingId(User, id)
            if (data.isAdmin === false) {
                await User.findByIdAndUpdate(data._id, { $set: { isAdmin: true } }, { upsert: true })
                data.isAdmin = true
                await Admin.insertMany([data])
                res.status(200).json({ status: true })
            } else {
                await User.findByIdAndUpdate(data._id, { $set: { isAdmin: false } }, { upsert: true })
                data.isAdmin = false
                await Admin.deleteOne({ _id: data._id });
                res.status(201).json({ status: true })
            }
        }
    }
}


const productsPage = async (req, res, next) => {
    try {
        let adminData = await findUsingEmail(Admin, req.session.admin)
        const messages = await messageFetch()
        if (req.session.searched) {
            let searchData = new RegExp(req.session.searched, 'i')
            req.session.searched = false
            let gameData = await Products.find({
                $or: [
                    { name: { $regex: searchData } },
                    { "description.production": { $regex: searchData } },
                    { genre: { $regex: searchData } }
                ]
            })
            if (gameData) {
                let categories = []
                for (const product of gameData) {
                    const category = await Category.findOne({ genre: product.genre });
                    if (category && !categories.some(cat => cat._id.equals(category._id))) {
                        categories.push(category);
                    }
                }
                res.render('Admin/productManagement', { Name: adminData.name, Email: adminData.email, products: gameData, category: categories, search: true, tagline: 'Search Results', messages })
            } else if (!gameData) {
                res.render('Admin/productManagement', { Name: adminData.name, Email: adminData.email, products: null, category: null, search: true, tagline: 'Search Results', messages })
            }


        } else {
            res.render('Admin/productManagement', { Name: adminData.name, Email: adminData.email, products: await Products.find({}), category: await Category.find({}), search: false, tagline: 'Categories', messages })
        }
    } catch (e) {
        console.error(e);
        res.redirect('/admin/products')
    }
}

const resendOtp = async (req, res, next) => {
    req.session.otp = null;
    req.session.otp = await sentOtp(req.body.email)
    otpNull(req, res, next)
    res.status(200).json({ status: true })
}


const logout = (req, res, next) => {
    req.session.admin = false
    res.redirect('/admin')
}


module.exports = {
    adminHome, adminLogin, adminVerification, otpVerify, userManagement,
    updateUser, productsPage, resendOtp, logout
}