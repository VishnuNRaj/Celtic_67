const bcrypt = require('bcryptjs')
const { log } = require('console')
const { User, Products, Category } = require('../model/Mongoose')
const { sentOtp } = require('../model/Mailer')

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
        const featured = await Products.find({visible:true}).sort({_id:-1}).limit(4)
        const trending = await Products.find({visible:true}).sort({downloads:-1}).limit(4)
        if (req.session.user) {
            const userData = await User.findOne({ email: req.session.user })
            if (userData) {
                if (userData.status === true) {
                    res.render('User/userIndex', { Name: userData.name , featured,trending})
                } else {
                    req.session.blocked = true;
                    res.redirect('/login')
                }
            } else {
                req.session.deleted = true;
                res.redirect('/login')
            }
        } else {
            res.render('User/userIndex', { Name: "",featured,trending })
        }
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
                    await User.insertMany(data);
                    req.session.otp = null
                    res.redirect('/');
                } else {
                    req.session.otperror = true;
                    res.redirect('/newUser')
                }
            } else {
                req.session.otpTimeout = true
                res.redirect('/newUser')
            }
        } else if (data.loginOtp) {
            if (req.session.otp != null) {
                if (req.session.otp === data.loginOtp) {
                    req.session.otp = null
                    req.session.user = data.email
                    res.redirect('/')
                } else {
                    req.session.otperror = true;
                    res.redirect('/login')
                }
            } else {
                req.session.otpTimeout = true;
                res.redirect('/login')
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
        }, 1000 * 60)
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
            let passTrue = await bcrypt.compare(data.password, userData.password);
            if (passTrue) {
                if (userData.status === true) {
                    req.session.otp = sentOtp(userData.email)
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

async function findUsingEmail(db, email) {
    try {
        let userData = await db.findOne({ email: email })
        return userData
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
    try {
        if (req.session.searched) {
            let searchData = new RegExp('^' + req.session.searchKeyword, 'i')
            req.session.searched = false;
            let gameData = await Products.find({
                $or: [
                    { name: { $regex: searchData } },
                    { "description.production": { $regex: searchData } },
                    { genre: { $regex: searchData } }
                ]
            });
            if (req.session.user) {
                let userData = await findUsingEmail(User, req.session.user)
                if (userData) {
                    res.render('User/games', { Name: userData.name, games: gameData, genres: await Category.find({}), search: true, tagline: [(gameData.length > 0) ? 'Games' : 'No Games', 'Found'] });
                } else {
                    req.session.deleted = true
                    res.redirect('/login')
                }
            } else {
                res.render('User/games', { Name: "", games: gameData, genres: await Category.find({}), search: true, tagline: [(gameData.length > 0) ? 'Games' : 'No Games', 'Found'] });
            }
        } else if (req.session.user) {
            let userData = await findUsingEmail(User, req.session.user)
            if (userData) {
                if (userData.status === true) {
                    if (req.session.genreSearch) {
                        let products = await Category.findById(req.session.genreSearch)
                        req.session.genreSearch = false
                        res.render('User/games', { Name: userData.name, games: await Products.find({ genre: products.genre }), genres: await Category.find({}), search: true, tagline: ['Top ' + products.genre, ' Games'] })
                    } else {
                        res.render('User/games', { Name: userData.name, games: await Products.find({}), genres: await Category.find({}), search: false })
                    }
                } else {
                    req.session.blocked = true;
                    res.redirect('/login')
                }
            } else {
                req.session.deleted = true;
                res.redirect('/login')
            }
        } else {
            console.log(req.session.genreSearch);
            if (req.session.genreSearch) {
                let products = await Category.findById(req.session.genreSearch)
                req.session.genreSearch = false
                res.render('User/games', { Name: "", games: await Products.find({ genre: products.genre }), genres: await Category.find({}), search: true, tagline: ['Top ' + products.genre, ' Games'] })
            } else {
                res.render('User/games', { Name: "", games: await Products.find({}), genres: await Category.find({}), search: false })
            }
        }
    } catch (e) {
        console.error(e);
        res.redirect('/games')
    }
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
            if (userData.name != data.name) {
                await User.findByIdAndUpdate(userData._id, { $set: { name: data.name } }, { upsert: true })
                res.redirect('/profile')
            } else if (userData.username !== data.username) {
                await User.findByIdAndUpdate(userData._id, { $set: { username: data.username } }, { upsert: true })
                res.redirect('/profile')
            } else {
                res.redirect('/profile')
            }
        }
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
        let userData = await User.findById(id)
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
        data.password = await bcrypt.hash(data.password, 10)
        await User.updateOne({ email: data.email }, { $set: { password: data.password } })
        if (req.session.user) {
            res.redirect('/profile')
        } else {
            res.redirect('/login')
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