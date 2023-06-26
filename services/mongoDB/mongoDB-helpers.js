const mongo = require('./mongo-operations')
const mongoCollection = mongo;
async function dropMongoDBCollection() {
    mongoCollection.setCollection('Areas');
    _ = await mongoCollection.dropCollection();
}

module.exports = { dropMongoDBCollection };