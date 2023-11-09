const mongoose = require('mongoose')

const bannerSchema = new mongoose.Schema({
    page:String,
    offerString1:String,
    offerString2:String,
    offerString3:String,
    offerbanner:String,
    comingSoon:Array,
    productCarousel:Array,
})

module.exports = {bannerSchema}