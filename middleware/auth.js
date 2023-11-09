const { User, Admin } = require('../model/Mongoose')

const userAuth = async (req, res, next) => {
    try {
        if (req.session.user) {
            let userData = await User.findOne({ email: req.session.user })
            if (userData) {
                if (userData.status === true) {
                    console.log(req.path);
                    if(req.path!='/checkout') {
                        req.session.coupon = null
                        req.session.need = null
                        req.session.amount = null
                    }
                    next()
                } else if (userData.status === false) {
                    req.session.blocked = true
                    res.redirect('/login')
                }
            } else {
                req.session.deleted = true
                res.redirect('/login')
            }
        } else {
            res.redirect('/login')
        }
    } catch (e) {
        console.error(e);
        res.redirect('/')
    }
}

const adminAuth = async (req, res, next) => {
    try {
        if (req.session.admin) {
            let adminData = await Admin.findOne({ email: req.session.admin })
            if (adminData) {
                next()
            } else {
                req.session.deleted = true
                res.redirect('/admin/login')
            }
        } else {
            res.redirect('/admin/login')
        }
    } catch (e) {
        console.error(e);
        res.redirect('/admin')
    }
}

module.exports = { userAuth , adminAuth}