async function getData(db, query, filter, skip, limit) {
    try {
        let response = (limit > 0) ? await db.find(query).sort(filter).skip(skip).limit(limit) : await db.find(query).sort(filter).skip(skip)
        return response
    } catch (e) {
        console.log(e);
    }
}


async function findUsingId(db, id) {
    try {
        let userData = await db.findById(id)
        return userData
    } catch (e) {
        console.error(e);
        res.redirect('/login')
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

async function findOneData(db, query) {
    try {
        let response = await db.findOne(query)
        return response
    } catch (e) {
        console.error(e);
    }
}

async function findAndUpdate(db, id, update) {
    try {
        await db.findByIdAndUpdate(id, update)
        return true
    } catch (e) {
        console.error(e);
    }

}

async function inserter(db, data) {
    try {
        let response = await db.insertMany([data])
        return response
    } catch (e) {
        console.error(e);
    }

}

async function findData(db,query) {
    let data = await db.find(query)
    return data
}

module.exports = { findUsingEmail, findUsingId, getData, findOneData, findAndUpdate,inserter,findData }