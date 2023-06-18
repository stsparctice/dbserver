const { read, readAll, countRows } = require('../services/sql/sql-operations');
const MongoDBOperations = require('../services/mongoDB/mongo-operations');
const mongoCollection = MongoDBOperations;

async function getDetailsSql(obj) {
    const list = await read(obj);
    return list;
};

async function getAllSql(obj) {
    const list = await readAll(obj);
    return list;
};

async function countRowsSql(obj) {
    const list = await countRows(obj);
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


module.exports = { getDetailsSql, getAllSql, countRowsSql, getDetailsMng, getDetailsWithAggregateMng, getCountDocumentsMng };
