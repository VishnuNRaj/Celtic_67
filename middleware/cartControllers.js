const mongoose = require('mongoose')
const { Products, Wishlist, Category, User, Admin, Cart, Orders, Order, Message } = require('../model/Mongoose')
const { log, error } = require('console')
const addToWishlist = async (req, res, next) => {
    try {
        if (req.session.user) {
            let { id, gameId } = req.body
            let userData = await User.findOne({ email: req.session.user })
            if (userData.status === true) {
                let wishDetails = await Wishlist.findOne({ userId: id })
                if (wishDetails) {
                    let Result = await wishDetails.productDetails.find((data) => {
                        if (data.productId === gameId) {
                            return true
                        } else {
                            return false
                        }
                    })
                    if (!Result) {
                        let productToAdd = {
                            productId: gameId,
                        };
                        await Wishlist.findByIdAndUpdate(wishDetails._id, { $push: { productDetails: productToAdd } })
                        res.redirect('/games');
                    } else if (Result) {
                        await Wishlist.findByIdAndUpdate(wishDetails._id, { $pull: { productDetails: { productId: gameId } } })
                        res.status(201).json({ status: true });
                    }

                } else {
                    let data = {
                        userId: id,
                        productDetails: [
                            {
                                productId: gameId
                            }
                        ]
                    }
                    log(data)
                    await Wishlist.insertMany([data])
                    res.redirect('/games')
                }
            } else {
                res.status(467).json({ status: true })
            }
        }
    } catch (e) {
        console.error(e);
        res.redirect('/games');
    }
}

const wishlistPage = async (req, res, next) => {
    try {
        let userData = await User.findOne({ email: req.session.user })
        let wishDetails = await Wishlist.findOne({ userId: userData._id })
        if (wishDetails) {
            wishDetails = wishDetails.productDetails
            let productDetails = []
            for (const product of wishDetails) {
                const data = await Products.findOne({ _id: new mongoose.Types.ObjectId(product.productId) });
                if (data) {
                    productDetails.push(data)
                }
            }
            let games = (productDetails.length > 0) ? productDetails : ""
            res.render('User/wishlist', { Name: userData.name, user: userData, games })
        } else {
            res.render('User/wishlist', { Name: userData.name, user: userData, games: "" })
        }
    } catch (e) {
        console.error(e);
        res.redirect('/')
    }
}

const wishRemove = async (req, res, next) => {
    try {
        let { id, userId } = req.body
        let userData = await User.findOne({ _id: new mongoose.Types.ObjectId(userId) })
        if (userData) {
            await Wishlist.updateOne({ userId: userId }, { $pull: { productDetails: { productId: id } } })
            res.status(200).json({ status: true })
        } else {
            res.status(467).json({ status: true })
        }
    } catch (e) {
        console.error(e);
        res.status(201).json({ status: true })
    }
}
const addtoCart = async (req, res, next) => {
    try {
        let { id, productId } = req.body;

        if (req.session.user) {
            let cartDetails = await Cart.findOne({ userId: id });

            if (cartDetails) {
                let productDetails = cartDetails.cartProducts.find((product) => {
                    return product.productId === productId;
                });

                if (productDetails) {
                    res.status(201).json({ status: true });
                } else {
                    if (cartDetails.cartProducts.length < 10) {
                        let details = await Products.findOne({ _id: new mongoose.Types.ObjectId(productId) })
                        if (details) {
                            let insertDetails = {
                                productId: productId,
                                quantity: 1,
                                price: details.price
                            };
                            await Cart.updateOne({ userId: id }, { $push: { cartProducts: insertDetails }, $inc: { total: details.price } });
                            res.status(200).json({ Status: true });
                        } else {
                            res.status(467).json({ status: true })
                        }
                    } else {
                        res.status(202).json({ status: true })
                    }
                }
            } else {
                let details = await Products.findOne({ _id: new mongoose.Types.ObjectId(productId) })
                if (details) {
                    let insertDetails = {
                        userId: id,
                        cartProducts: [
                            {
                                productId: productId,
                                quantity: 1,
                                price: details.price
                            },
                        ],
                        total: details.price
                    };
                    await Cart.insertMany([insertDetails]);
                    res.status(200).json({ status: true });
                } else {
                    res.status(467).json({ status: true })
                }
            }
        } else {
            res.status(467).json({ status: true });
        }
    } catch (e) {
        error(e);
        res.redirect('/games');
    }
};

const cartPage = async (req, res, next) => {
    try {
        let userData = await User.findOne({ email: req.session.user });
        let cartDetails = await Cart.findOne({ userId: userData._id });
        if (cartDetails) {
            let cart = cartDetails.cartProducts.length > 0 ? cartDetails : "";
            let games = cart.cartProducts
            if (games) {
                for (const id of games) {
                    let data = await Products.findOne({ _id: new mongoose.Types.ObjectId(id.productId) })
                    if (data) {
                        id.data = data
                    }
                }
                cartDetails.total = games.reduce((a,item)=>{
                    item.price = item.data.price*item.quantity
                    return a+item.data.price*item.quantity
                },0)
                console.log(cartDetails.total);
                cartDetails.save()
                res.render('User/cart', { Name: userData.name, userId: userData._id, cart, games });
            } else {
                res.render('User/cart', { Name: userData.name, userId: userData._id, cart: "", games: "" });
            }
        } else {
            res.render('User/cart', { Name: userData.name, userId: userData._id, cart: "", games: "" });
        }
    } catch (e) {
        error(e);
        res.redirect('/');
    }
};

const cartQuantity = async (req, res, next) => {
    if (req.session.user) {
        let { productId, id, need } = req.body;

        try {
            let productDetails = await Products.findOne({ _id: new mongoose.Types.ObjectId(productId) });

            if (!productDetails) {
                return res.status(404).json({ status: false, message: 'Product not found' });
            }

            let cartDetails = await Cart.findOne({ userId: id, 'cartProducts.productId': productId });

            if (need === 'add') {
                if (cartDetails) {
                    let amount = 0
                    for (const price of cartDetails.cartProducts) {
                        amount += price.price
                    }
                    if (amount < 100000) {
                        cartDetails.cartProducts.forEach((cart) => {
                            if (cart.productId === productId) {
                                cart.quantity += 1;
                                cart.price += productDetails.price;
                            }
                        });
                        cartDetails.total = amount + productDetails.price
                        await cartDetails.save();
                        return res.status(200).json({ status: true });
                    } else {
                        return res.status(202).json({ status: true });
                    }
                }
            } else if (need === 'minus') {
                if (cartDetails) {
                    cartDetails.cartProducts.forEach((cart, index) => {
                        if (cart.productId === productId) {
                            if (cart.quantity > 1) {
                                cart.quantity -= 1;
                                cart.price -= productDetails.price;
                            } else if (cart.quantity === 1) {
                                cartDetails.cartProducts.splice(index, 1);
                            }
                        }
                    });
                    cartDetails.total -= productDetails.price

                    await cartDetails.save();
                    return res.status(201).json({ status: true });
                }
            }
        } catch (error) {
            console.error(error);
            return res.status(500).json({ status: false, message: 'Internal server error' });
        }
    } else {
        return res.status(467).json({ status: false, message: 'User not logged in' });
    }
};


let checkout = async (req, res, next) => {
    try {
        let userData = await User.findOne({ email: req.session.user })
        log(req.session.need)
        if (req.session.need === 'one') {
            let productDetails = await Products.findOne({ _id: new mongoose.Types.ObjectId(req.session.productId) })
            let amount = 0
            if (req.session.coupon) {
                amount = req.session.amount - (req.session.amount / req.session.coupon.deduction)
            } else {
                amount = req.session.amount
            }
            res.render('User/checkout', { user: userData, amount, games: productDetails, quantity: req.session.quantity, multi: false, coupon: (req.session.coupon) ? req.session.coupon : '', odd: false })
        } else if (req.session.need === 'single') {
            let amount = 0
            if (req.session.coupon) {
                amount = req.session.product.price - (req.session.product.price / req.session.coupon.deduction)
            } else {
                amount = req.session.product.price
            }
            res.render('User/checkout', { user: userData, amount, games: req.session.product, quantity: 1, multi: false, coupon: (req.session.coupon) ? req.session.coupon : '', odd: false })
        } else if (req.session.need === 'all') {
            let cartDetails = await Cart.findOne({ userId: userData._id })
            let games = cartDetails.cartProducts
            for (const id of games) {
                let data = await Products.findOne({ _id: new mongoose.Types.ObjectId(id.productId)})
                if (data) {
                    id.data = data
                }
            }
            let amount = 0
            log(req.session.coupon)
            if (req.session.coupon) {
                amount = cartDetails.total - (cartDetails.total * req.session.coupon.deduction / 100)
            } else {
                amount = cartDetails.total
            }
            if (amount > 0) {
                res.render('User/checkout', { user: userData, amount, games, quantity: "", multi: true, coupon: (req.session.coupon) ? req.session.coupon : '', odd: (games.length % 2 == 0) ? false : true })
            } else if (amount <= 0) {
                res.redierct('/cart')
            }
        } else {
            res.redirect('/cart')
        }

    } catch (e) {
        error(e);
        res.redirect('/')
    }
}


const clearCart = async (req, res, next) => {
    try {
        let { id } = req.body
        await Cart.updateOne({ userId: id }, { $set: { cartProducts: [] } });
        res.status(200).json({ status: true })
    } catch (e) {
        error(e);
        res.redirect('/')
    }
}

module.exports = {
    addToWishlist, wishlistPage, wishRemove, addtoCart, cartPage, cartQuantity,
    checkout, clearCart,
}