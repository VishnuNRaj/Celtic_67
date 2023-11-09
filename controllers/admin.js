const express = require('express');
const router = express.Router();
const middlewares = require('../middleware/adminControllers')
const productManagement = require('../middleware/productManagement')
const {upload,posterUpdate} =require('../middleware/productManagement')
const auth = require('../middleware/auth')
const pdfs = require('../middleware/createPdf')
const managements = require('../middleware/managements')
const nocache = require('nocache');
const { banner, afterBanner, bannerChange, bannerName, afterNewBanner } = require('../middleware/profilePicture');
router.use(nocache())

router.get('/', middlewares.adminHome)

router.get('/login', middlewares.adminLogin)

router.post('/adminVerify', middlewares.adminVerification)

router.post('/', middlewares.otpVerify)

router.get('/users',auth.adminAuth, middlewares.userManagement)

router.post('/add', upload.fields([{ name: 'poster', maxCount: 1 }, { name: 'images' }]), productManagement.saveProduct);

router.get('/products',auth.adminAuth, middlewares.productsPage)

router.get('/add-product', auth.adminAuth,productManagement.addProduct)

router.get('/update-product', auth.adminAuth,productManagement.updatePage)

router.post('/update', posterUpdate.fields([{name:'image',maxCount:5}]), productManagement.afterSave)

router.post('/update-category', productManagement.updateCategory)

router.get('/updateStatus', middlewares.updateUser)

router.post('/resend', middlewares.resendOtp)

router.post('/searchProducts', productManagement.productSearch)

router.get('/coupons',auth.adminAuth ,managements.couponsPage )

router.post('/newCoupon',managements.newCoupon)

router.post('/deleteCoupon',managements.deleteCoupon)

router.post('/updateCoupon',managements.updateCoupon)

router.get('/orders',auth.adminAuth,managements.orderManagement)

router.post('/manageOrder',managements.manageOrder)

router.get('/logout',middlewares.logout)

router.post('/markAsRead',managements.markAsread)

router.get('/orderDetails',auth.adminAuth,managements.orderDetails)

router.get('/monthly',pdfs.createMonthly)

router.get('/daily',pdfs.Daily)

router.get('/yearly',pdfs.yearly)

router.get('/weekly',pdfs.Weekly)

router.get('/banners',auth.adminAuth,managements.banners)

router.post('/banners',banner.fields([{name:'productCarousel',maxCount:1},{name:'comingSoon',maxCount:1},{name:'offerBanner',maxCount:1}]),managements.addBanner)

router.post('/updateBanner',bannerChange.fields([{name:'image',maxCount:1}]), afterBanner);

router.post('/newBanner',banner.single('image'),afterNewBanner)


module.exports = router;
