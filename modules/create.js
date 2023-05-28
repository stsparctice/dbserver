const { create } = require('../services/sql/sql-operations');
// const { checkObjCreate } = require('./check')
const MongoDBOperations = require('../services/mongoDB/mongo-operations');
const mongoCollection = MongoDBOperations;

async function createSql(obj) {
    // let message = await checkObjCreate(obj);
    // if (message) {
    //     return message;
    // }
    const result = await create(obj);
    return result;
};

async function createMng(obj) {
    mongoCollection.setCollection(obj.collection);
    const response = await mongoCollection.insertOne(obj.data);
    return response;
};

module.exports = { createSql, createMng };
