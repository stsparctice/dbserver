const mongo = require('./mongo-operations')
const mongoCollection = mongo

async function dropMongoDBCollection() {
    mongoCollection.setCollection('areas')
    _ = await mongoCollection.dropCollection()
}


function convertToMongoFilter(condition) {
    let filter = {}
    for (let key in condition) {
        if (condition[key] instanceof Array) {
            filter[`$${key.toLowerCase()}`] = condition[key].map(o => convertToMongoFilter(o))
        }
        else {
            filter[key] = condition[key]
        }
    }
    return filter
}

function geoNearPoint(condition){
    
}
module.exports = { dropMongoDBCollection , convertToMongoFilter}
