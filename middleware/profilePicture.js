const multer = require('multer')
const { User, Banner } = require('../model/Mongoose');
const { findOneData } = require('./commonFunctions');

async function userDetails(user) {
    let data = await findOneData(User,{ email: user })
    return data._id
}
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'views/public/userProfile');
    },
    filename: async (req, file, cb) => {
        try {
            let userId = await userDetails(req.session.user);
            let filename = userId + ".jpg";
            await User.findByIdAndUpdate(userId, { $set: { image: "/userProfile/" + filename } });
            cb(null, filename);
        } catch (err) {
            console.error('Error saving image:', err);
            cb(err);
        }
    },
});

upload = multer({ storage: storage });

const bannerSave = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'views/public/banners');
    },
    filename: async (req, file, cb) => {
        try {
                const timestamp = Date.now();
                const randomString = Math.random().toString(36).substring(7);
                const filename = `${timestamp}-${randomString}.jpg`;
                if (!req.session.productCarousel) {
                    req.session.productCarousel = filename
                } else if (!req.session.comingSoon) {
                    req.session.comingSoon = filename
                } else {
                    req.session.offerBanner = filename
                }
                cb(null, filename);
        } catch (err) {
            console.error('Error saving image:', err);
            cb(err);
        }
    },
});

const banner = multer({ storage: bannerSave });

const bannerUpdate = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'views/public/banners');
    },
    filename: async (req, file, cb) => {
        try {
            cb(null,file.originalname)
        } catch (err) {
            console.error('Error saving image:', err);
            cb(err);
        }
    },
});

const bannerChange = multer({ storage: bannerUpdate });

const afterBanner = (req,res,next) => {
    res.redirect('/admin/banners')
}

const afterNewBanner = async (req,res,next) => {
    let {change} = req.body
    let bannerData = await findOneData(Banner,{page:req.body.page})
    if (change ==='comingSoon') {
        bannerData.comingSoon.push(req.session.productCarousel)
    } else if (change === 'productCarousel') {
        bannerData.productCarousel.push(req.session.productCarousel)
    }

    bannerData.save()
    req.session.productCarousel = null
    res.redirect('/admin/banners')
}



module.exports = { upload, banner, afterBanner , bannerChange, afterNewBanner }