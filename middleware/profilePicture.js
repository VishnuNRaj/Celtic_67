const multer = require('multer')
const session = require('express-session')
const mongoose = require('mongoose')
const { User } = require('../model/Mongoose')

async function userDetails(user) {
    let data = await User.findOne({email:user})
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


module.exports = {upload }