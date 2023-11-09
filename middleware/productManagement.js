const { Products, Category, Admin, Message } = require('../model/Mongoose')


const productSearch = (req, res, next) => {
    let { searchdata } = req.body
    if (searchdata != "") {
        req.session.searched = '^' + searchdata
        res.redirect('/admin/products')
    } else {
        res.redirect('/admin/products')
    }
}

const saveProduct = async (req, res) => {
    try {
        const product = {
            name: req.body.name,
            genre: req.body.genre,
            about: req.body.about,
            description: {
                version: req.body.version,
                production: req.body.production,
                release: req.body.release,
                minimumRequirements: {
                    ram: req.body.ram,
                    storage: req.body.storage,
                    processor: req.body.processor,
                    gpu: req.body.gpu,
                },
                restriction: req.body.restriction,
            },
            price: req.body.price,
            poster: `/products/${req.session.productNames[0]}`,
            image: [
                `/products/${req.session.productNames[1]}`,
                `/products/${req.session.productNames[2]}`,
                `/products/${req.session.productNames[3]}`,
                `/products/${req.session.productNames[4]}`,
            ]
        }
        await Products.insertMany([product]);
        req.session.productNames = false
        let categoryDetails = await Category.findOne({ genre: product.genre })
        if (categoryDetails) {
            await Category.findByIdAndUpdate(categoryDetails._id, { $inc: { gamesInTotal: 1 } });
            res.redirect('/admin/products');
        } else {
            let inserted = {
                genre: product.genre,
                gamesInTotal: 1
            }
            await Category.insertMany([inserted])
            res.redirect('/admin/products');
        }

    } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).send('Error adding product');
    }
}

const multer = require('multer')
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'views/public/products/');
    },
    filename: async (req, file, cb) => {

        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(7);
        const filename = `${timestamp}-${randomString}.jpg`;
        req.body.imageName = filename
        if (!req.session.productNames) {
            req.session.productNames = []
        }
        req.session.productNames.push(filename)
        console.log(req.session.productNames);

        cb(null, filename);
    }
});

upload = multer({ storage: storage })


const savePoster = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'views/public/products/')
    },
    filename: async (req, file, cb) => {
        let gamePoster = await Products.findById(req.body.id)
        let id = gamePoster.poster
        let filename = id.split('/products/')
        cb(null, filename[1])
    }
})


posterUpdate = multer({ storage: savePoster })



const afterSave = async (req, res, next) => {
    try {
        let gameDetails = await Products.findById(req.body.id)
        if (gameDetails.genre != req.body.genre) {
            await Category.updateOne({ genre: gameDetails.genre }, { $inc: { gamesInTotal: -1 } }, { upsert: true })
            let categoryDetails = await Category.findOne({ genre: req.body.genre })
            if (categoryDetails) {
                await Category.findByIdAndUpdate(categoryDetails._id, { $inc: { gamesInTotal: 1 } })
            } else if (!categoryDetails) {
                let data = {
                    genre: req.body.genre,
                    gamesInTotal: 1
                }
                await Category.insertMany([data])
            }
        }
        const product = {
            name: req.body.name,
            genre: req.body.genre,
            about: req.body.about,
            visible: (req.body.visible === 'true') ? true : false,
            description: {
                version: req.body.version,
                production: req.body.production,
                release: req.body.release,
                minimumRequirements: {
                    ram: req.body.ram,
                    storage: req.body.storage,
                    processor: req.body.processor,
                    gpu: req.body.gpu,
                },
                restriction: req.body.restriction,
            },
            price: req.body.price,

        }

        await Products.findByIdAndUpdate(req.body.id, { $set: product }, { upsert: true })
        res.redirect('/admin/products')

    } catch (e) {
        console.error(e);
        res.redirect('/admin/products')
    }
}

const updateCategory = async (req, res, next) => {
    try {
        let { need } = req.body
        if (need === 'update') {
            let { id, data } = req.body
            let categoryDetails = await Category.findById(id)
            if (categoryDetails) {
                await Products.updateMany({ genre: categoryDetails.genre }, { $set: { genre: data } }, { upsert: true })
                await Category.findByIdAndUpdate(id, { $set: { genre: data } }, { upsert: true })
                res.status(200).json({ status: true })
            } else {
                res.status(456).json({ status: true })
            }
        } else if (need === 'remove') {
            let { id } = req.body
            let categoryDetails = await Category.findById(id)
            if (categoryDetails.visible === true) {
                await Category.findByIdAndUpdate(id, { $set: { visible: false } })
                await Products.updateMany({ genre: categoryDetails.genre }, { $set: { visible: false } }, { upsert: true })
                res.status(201).json({ status: true })
            } else if (categoryDetails.visible === false) {
                await Products.updateMany({ genre: categoryDetails.genre }, { $set: { visible: true } })
                await Category.findByIdAndUpdate(id, { $set: { visible: true } }, { upsert: true })
                res.status(200).json({ status: true })
            } else {
                res.status(499).json({ status: true })
            }
        } else {
            res.status(407).json({ status: false })
        }
    } catch (e) {
        console.error(e);
        res.redirect('/admin/products')
    }
}

async function messageFetch() {
    try {
        const messages = await Message.find({ status: false }).sort({ _id: -1 });
        return messages;
    } catch (error) {
        console.error(error);
        throw error;
    }
}


const addProduct = async (req, res, next) => {
    let adminData = await findUsingEmail(Admin, req.session.admin)
    if (adminData) {
        const messages = await messageFetch()
        res.render('Admin/addProduct', { Name: adminData.name, Email: adminData.email, products: Products.find({}), games: null,messages })
    } else {
        req.session.adminnotfound = true
        res.redirect('/admin/login')
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

const updatePage = async (req, res, next) => {
    try {
        let adminData = await findUsingEmail(Admin, req.session.admin)
        req.session.gameId = req.query.id
        if (req.session.gameId) {
            let gameData = await Products.findById(req.session.gameId)
            if (gameData) {
                const messages = await messageFetch()
                res.render('Admin/addProduct', { Name: adminData.name, Email: adminData.email, games: gameData,messages })
            } else {
                res.redirect('/admin/products')
            }
        }
    } catch (e) {
        console.error(e);
        res.redirect('/admin/products')
    }
}


module.exports = { upload, saveProduct, posterUpdate, afterSave, updateCategory, productSearch, updatePage, addProduct }