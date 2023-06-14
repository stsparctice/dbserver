const { read, readAll, countRows, join } = require('../services/sql/sql-operations');
const MongoDBOperations = require('../services/mongoDB/mongo-operations');
const { readJoin } = require('./config/config');
const mongoCollection = MongoDBOperations;

async function getDetailsSql(obj) {
    const list = await read(obj);
    return list;
};

async function getAllSql(obj) {
    const list = await readAll(obj);
    return list;
};

async function readWithJoin(tableName, column) {

    const query = await readJoin(tableName, column);
    const result = await join(query);
    return result;
}

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

module.exports = { getDetailsSql, getAllSql, readJoin, countRowsSql, getDetailsMng, readWithJoin, getDetailsWithAggregateMng, getCountDocumentsMng };
