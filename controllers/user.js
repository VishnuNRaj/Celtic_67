const express = require('express');
const router = express.Router();
const middlewares = require('../middleware/userControllers')
const middleware2 = require('../middleware/userController2')
const {upload} = require('../middleware/profilePicture')
const cartMiddlewares = require('../middleware/cartControllers')
const auth = require('../middleware/auth')
const nocache = require('nocache')


router.use(nocache())

router.get('/',middlewares.userHome)

router.get('/login',middlewares.login)

router.get('/newUser',middlewares.signUp)

router.post('/login',middlewares.loginVerify)

router.post('/loginOtp',middlewares.otpVerify)

router.post('/signIn',middlewares.signUpVerify)

router.post('/otp',middlewares.otpVerify)

router.get('/games',middlewares.games)

router.get('/logout',middlewares.logOut)

router.get('/profile',auth.userAuth,middlewares.profile)

router.post('/editProfile',auth.userAuth,middlewares.editProfile)

router.post('/profilePic',upload.single('image'),middlewares.afterUpload)

router.post('/forgotMail',middlewares.mailVerify)

router.get('/password',middlewares.forgotPassword)

router.get('/details',middleware2.details)

router.post('/changePassword',middlewares.changePassword)

router.post('/resend',middlewares.resendOtp)

router.post('/searchGames',middlewares.searchMiddleware)

router.post('/genreSearch',middleware2.genresearch)

router.post('/wishlist',cartMiddlewares.addToWishlist)

router.get('/wishlist',auth.userAuth,cartMiddlewares.wishlistPage)

router.post('/wishRemove',cartMiddlewares.wishRemove)

router.post('/addtoCart',cartMiddlewares.addtoCart)

router.get('/cart',auth.userAuth,cartMiddlewares.cartPage)

router.post('/quantity',cartMiddlewares.cartQuantity)

router.post('/buynow',cartMiddlewares.buyNow)

router.get('/checkout',auth.userAuth,cartMiddlewares.checkout)

router.post('/clearCart',cartMiddlewares.clearCart)

router.post('/buyall',cartMiddlewares.buyall)

router.post('/couponVerify',middleware2.couponVerification)

router.post('/orderNow',cartMiddlewares.createOrder)

router.get('/orders',auth.userAuth, cartMiddlewares.orders)

router.post('/success',cartMiddlewares.paymentSuccess)

router.post('/closedWindow',cartMiddlewares.closedWindow)

router.post('/cancelOrder',cartMiddlewares.orderCancel)

router.get('/orderDetails',auth.userAuth,middleware2.orderDetails)

router.get('/downloadPayment',auth.userAuth,middleware2.createPdf)

module.exports = router;
