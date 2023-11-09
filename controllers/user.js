const express = require('express');
const router = express.Router();
const middlewares = require('../middleware/userControllers')
const middleware2 = require('../middleware/userController2')
const {upload, banner} = require('../middleware/profilePicture')
const cartMiddlewares = require('../middleware/cartControllers')
const orderMiddleware = require('../middleware/orderMiddleware')
const auth = require('../middleware/auth')
const nocache = require('nocache')


router.use(nocache())

router.get('/',auth.userAuth,middlewares.userHome)

router.get('/login',middlewares.login)

router.get('/newUser',middlewares.signUp)

router.post('/login',middlewares.loginVerify)

router.post('/loginOtp',middlewares.otpVerify)

router.post('/signIn',middlewares.signUpVerify)

router.post('/otp',middlewares.otpVerify)

router.get('/games',auth.userAuth,middlewares.games)

router.post('/filter',middleware2.filter)

router.post('/paginate',middleware2.paginate)

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

router.post('/buynow',orderMiddleware.buyNow)

router.get('/checkout',auth.userAuth,cartMiddlewares.checkout)

router.post('/clearCart',cartMiddlewares.clearCart)

router.post('/buyall',orderMiddleware.buyall)

router.post('/couponVerify',middleware2.couponVerification)

router.post('/orderNow',orderMiddleware.createOrder)

router.post('/walletPurchase',orderMiddleware.payFromwallet)

router.get('/orders',auth.userAuth, orderMiddleware.orders)

router.post('/success',orderMiddleware.paymentSuccess)

router.post('/closedWindow',orderMiddleware.closedWindow)

router.post('/cancelOrder',orderMiddleware.orderCancel)

router.get('/orderDetails',auth.userAuth,middleware2.orderDetails)

router.get('/downloadPayment',auth.userAuth,middleware2.createPdf)

router.get('/downloadGame',middleware2.downloadGame)

module.exports = router;
