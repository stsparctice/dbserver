const { read, readAll } = require('../services/sql/sql-operations');
const { checkObjRead, checkObjReadAll } = require('./check')
const MongoDBOperations = require('../services/mongoDB/mongo-operations');
const mongoCollection = MongoDBOperations;

async function getDetailsSql(obj) {
    let message = await checkObjRead(obj);
    if (message) {
        return message;
    }
    const list = await read(obj);
    return list;
};

async function getAllSql(obj) {
    let message = await checkObjReadAll(obj);
    if (message) {
        return message;
    }
    const list = await readAll(obj);
    return list;
};

async function getDetailsMng(obj) {
    mongoCollection.setCollection(obj.collection);
    const response = await mongoCollection.find(obj);
    return response;
};

async function getDetailsWithAggregateMng(obj) {
    mongoCollection.setCollection(obj.collection);
    const response = await mongoCollection.aggregate(obj.aggregate);
    return response;
};

async function getCountDocumentsMng(collection) {
    mongoCollection.setCollection(collection);
    const response = await mongoCollection.countDocuments();
    return response;
};

module.exports = { getDetailsSql, getAllSql, getDetailsMng, getDetailsWithAggregateMng, getCountDocumentsMng };
