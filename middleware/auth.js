const { User, Admin } = require('../model/Mongoose')

const userAuth = async (req, res, next) => {
    try {
        console.log(req.path);
        if (req.path === '/games' || req.path === '/') {
            if (req.path != '/games') {
                req.session.filter = false
                req.session.page = false
                req.session.genreSearch = false
                req.session.searched = false
            }
            next()
        } else {
            if (req.session.user) {
                req.session.userData = await User.findOne({ email: req.session.user })
                if (req.session.userData) {
                    if (req.session.userData.status === true) {
                        console.log(req.path);
                        if (req.path != '/checkout') {
                            req.session.coupon = null
                            req.session.need = null
                            req.session.amount = null
                        } else if (req.path != '/games') {
                            req.session.filter = false
                            req.session.page = false
                            req.session.genreSearch = false
                            req.session.searched = false
                        }
                        next()
                    } else if (req.session.userData.status === false) {
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

module.exports = { userAuth, adminAuth }