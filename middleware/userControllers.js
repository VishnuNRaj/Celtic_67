const bcrypt = require('bcryptjs')
const { log } = require('console')
const { User, Products, Category, Banner } = require('../model/Mongoose')
const { sentOtp } = require('../model/Mailer')
const { findUsingId, findUsingEmail, getData } = require('./commonFunctions')

const login = (req, res, next) => {
    try {
        if (req.session.blocked) {
            req.session.user = false;
            req.session.blocked = false;
            res.render('User/login', { err: "Sorry user Blocked" })
        } else if (req.session.deleted) {
            req.session.deleted = false;
            req.session.user = false;
            res.render('User/login', { err: "Sorry No User Found" })
        } else if (req.session.user) {
            res.redirect('/')
        } else if (req.session.otperror) {
            req.session.otperror = false
            res.render('User/login', { err: "Incorrect Otp" })
        } else if (req.session.otpTimeout) {
            req.session.otpTimeout = false
            res.render('User/login', { err: "Incorrect Otp" })
        } else {
            res.render('User/login', { err: "" })
        }
    } catch (e) {
        console.error(e);
        res.redirect('/login')
    }
}

const userHome = async (req, res, next) => {
    try {
        const featured = await getData(Products, { visible: true }, { _id: -1 }, 0, 4)
        const trending = await getData(Products, { visible: true }, { downloads: -1 }, 0, 4)
        const banners = await Banner.findOne({ page: 'home' })
        const userData = (req.session.user) ? await findUsingEmail(User, req.session.user) : ''
        if (req.session.user) {
            if (!userData) {
                req.session.deleted = true;
                return res.redirect('/login')
            } else if (!userData.status) {
                req.session.blocked = true;
                return res.redirect('/login')
            }
        }
        const userName = (userData) ? userData.name : ''
        res.render('User/userIndex', { Name: userName, featured, trending, banners })
    } catch (e) {
        console.error(e);
        res.redirect('/login')
    }
}

const signUp = (req, res, next) => {
    try {
        if (req.session.user) {
            res.redirect('/')
        } else if (req.session.otperror) {
            req.session.otperror = false
            res.render('User/signUp', { err: "Incorrect Otp" })
        } else if (req.session.otpTimeout) {
            req.session.otpTimeout = false
            res.render('User/signUp', { err: "Incorrect Otp" })
        } else {
            res.render('User/signUp', { err: "" })
        }
    } catch (e) {
        console.error(e);
        res.redirect('/newUser')
    }
}


const signUpVerify = async (req, res, next) => {
    try {
        let data = req.body
        let usernameVerification = await User.findOne({ username: data.username });
        let mailVerification = await User.findOne({ email: data.email })
        if (usernameVerification) {
            res.status(466).json({ status: true })
        }
        else if (mailVerification) {
            res.status(465).json({ status: true })
        } else {
            req.session.otp = sentOtp(data.email)
            otpNull(req, res, next)
            res.status(200).json({ status: true })
        }
    } catch (e) {
        console.error(e);
        res.redirect('/newUser')
    }
}



const otpVerify = async (req, res, next) => {
    try {
        let data = req.body
        log(req.body)
        if (req.body.signUpOtp) {
            if (req.session.otp != null) {
                if (req.session.otp === req.body.signUpOtp) {
                    data.password = await bcrypt.hash(data.password, 10)
                    req.session.user = req.body.email;
                    req.session.otp = null
                    res.status(200).json({ status: true })
                } else {
                    res.status(202).json({ status: true })
                }
            } else {
                res.status(203).json({ status: true })
            }
        } else if (data.loginOtp) {
            if (req.session.otp != null) {
                if (req.session.otp === data.loginOtp) {
                    req.session.otp = null
                    req.session.user = data.email
                    res.status(200).json({ status: true })
                } else {
                    res.status(202).json({ status: true })
                }
            } else {
                res.status(203).json({ status: true })
            }
        } else if (data.passwordOtp) {
            if (req.session.otp != null) {
                if (req.session.otp === data.passwordOtp) {
                    req.session.otp = null
                    res.redirect('/')
                } else {
                    res.status(468).json({ status: true })
                }
            } else {
                res.status(468).json({ status: true })
            }
        } else {
            res.status(467).json({ status: false });
        }
    } catch (e) {
        console.error(e);
        res.redirect('/login')
    }
}

const resendOtp = async (req, res, next) => {
    req.session.otp = null;
    req.session.otp = await sentOtp(req.body.email)
    otpNull(req, res, next)
    res.status(200).json({ status: true })
}

function otpNull(req, res, next) {
    try {
        setTimeout(() => {
            req.session.otp = null;
            console.log('null aakee');
        }, 120000)
    } catch (e) {
        res.redirect('/games')
    }
}

const loginVerify = async (req, res, next) => {
    try {
        let data = req.body
        let userData = await User.findOne({ email: data.email })
        if (!userData) {
            res.status(488).json({ status: false })
        } else {
            let passTrue = bcrypt.compare(data.password, userData.password);
            if (passTrue) {
                if (userData.status === true) {
                    req.session.otp = sentOtp(userData.email)
                    req.session.userInfo = userData
                    otpNull(req, res, next)
                    res.status(200).json({ status: true })
                } else {
                    req.session.blocked = true;
                    res.status(489).json({ status: false })
                }
            } else {
                res.status(468).json({ status: false })
            }
        }
    } catch (e) {
        console.error(e);
        res.redirect('/login')
    }
}


const searchMiddleware = (req, res, next) => {
    let data = req.body.searchKeyword
    if (data) {
        req.session.searchKeyword = data
        req.session.searched = true
        res.redirect('/games')
    } else {
        res.redirect('/games')
    }
}


const games = async (req, res, next) => {
    const filter = req.session.filter || { _id: 1 };
    const page = (req.session.page) ? req.session.page : 0
    const searchData = new RegExp('^' + req.session.searchKeyword, 'i');
    const genre = await getData(Category, {}, { _id: 1 }, 0, 0)
    let userName = (req.session.user) ? await User.findOne({ email: req.session.user }, { _id: 0, name: 1 }) : ''
    const featured = await getData(Products, { visible: true }, { downloads: -1 }, 0, 0)
    let gameData = []
    let length = 0
    let search = false
    if (req.session.searched) {
        let query = {
            visible: true,
            $or: [
                { name: { $regex: searchData } },
                { "description.production": { $regex: searchData } },
                { genre: { $regex: searchData } }
            ]
        }
        gameData = await getData(Products, query, filter, page, 6)
        length = (await getData(Products, query, filter, 0, 0)).length
        search = true
    } else if (req.session.genreSearch) {
        const products = await findUsingId(Category, req.session.genreSearch)
        const query = {
            visible: true,
            genre: products.genre
        }
        gameData = await getData(Products, query, filter, page, 6)
        length = (await getData(Products, query, filter, 0, 0)).length
        search = true
    } else {
        const query = {
            visible: true
        }
        gameData = await getData(Products, query, filter, page, 6)
        length = (await getData(Products, query, filter, 0, 0)).length
        search = false
    }
    res.render('User/games', {
        Name: userName,
        games: gameData,
        genres: genre,
        search,
        length,
        tagline: [(gameData.length > 0) ? 'Games' : 'No Games', 'Found'],
        filter: req.session.filterType || '',
        featured
    });
}


const profile = async (req, res, next) => {
    try {
        let userData = await findUsingEmail(User, req.session.user)
        res.render('User/profile', { Name: userData.name, data: userData })
    } catch (e) {
        console.error(e);
        res.redirect('/login')
    }
}


const editProfile = async (req, res, next) => {
    try {
        let data = req.body
        if (data.name && data.username) {
            let userData = await findUsingEmail(User, req.session.user)
            const update = null
            if (userData.name != data.name) {
                update = { name: data.name }
            } else if (userData.username !== data.username) {
                update = { username: data.username }
            }
            if (update != null) {
                await User.findByIdAndUpdate(userData._id, { $set: update }, { upsert: true })
            }
        }
        res.redirect('/profile')

    } catch (e) {
        console.error(e);
        res.redirect('/login')
    }
}

const afterUpload = (req, res, next) => {
    res.redirect('/profile')
}


const logOut = async (req, res, next) => {
    try {
        let id = req.query.id
        let userData = await findUsingId(User, id)
        if (userData && req.session.user === userData.email) {
            req.session.user = false
            res.redirect('/login')
        } else {
            res.redirect('/profile')
        }
    } catch (e) {
        console.error(e);
        res.redirect('/login')
    }
}

const mailVerify = async (req, res, next) => {
    try {
        let data = await findUsingEmail(User, req.body.email)
        if (data) {
            req.session.otp = await sentOtp(req.body.email)
            otpNull(req, res, next)
            res.status(200).json({ status: true })
        } else {
            res.status(467).json({ status: true })
        }
    } catch (e) {
        console.error(e);
        res.redirect('/login')
    }
}

const forgotPassword = (req, res, next) => {
    res.render('User/password')
}

const changePassword = async (req, res, next) => {
    try {
        let data = req.body
        let userData = await findUsingEmail(User, data.email)
        if (bcrypt.compare(data.password, userData.password)) {
            res.status(204).json({ status: true })
        } else {
            data.password = await bcrypt.hash(data.password, 10)
            userData.password = data.password
            userData.save()
            if (req.session.user) {
                res.status(202).json({ status: true })
            } else {
                res.status(203).json({ status: true })
            }
        }
    } catch (e) {
        console.error(e);
        res.redirect('/login')
    }
}






module.exports = {
    login, userHome, signUp, signUpVerify, otpVerify, loginVerify,
    games, profile, afterUpload, editProfile, logOut, mailVerify, resendOtp, forgotPassword, changePassword,
    searchMiddleware
}